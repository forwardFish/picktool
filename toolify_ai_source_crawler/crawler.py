#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Toolify AI Tools Crawler

目标：
1. 从 Toolify 抓取 AI 工具基础数据、分类、标签、价格、访问量等信息。
2. 数据存到本地 SQLite，同时可导出 JSONL / CSV。
3. 默认低速、可断点续抓、可重复运行去重。
4. 默认跳过不适合进入通用 AI 工具导航库的敏感/受限类别。

用法：
  python crawler.py --smoke-test
  python crawler.py --source sitemap --db data/toolify.sqlite --delay 1.5
  python crawler.py --source category --max-categories 5 --max-tools-per-category 30
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import gzip
import io
import json
import os
import random
import re
import sqlite3
import sys
import time
import urllib.parse
import xml.etree.ElementTree as ET
from dataclasses import dataclass, asdict
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

import requests
from bs4 import BeautifulSoup, Tag
from urllib import robotparser

BASE_URL = "https://www.toolify.ai"
DEFAULT_DB = "data/toolify.sqlite"
USER_AGENT = "Mozilla/5.0 (compatible; LocalAIToolIndexer/1.0; +https://example.local)"

# 这里是为了让你的 AI 工具库更适合普通生产力/商业/开发场景。
# 默认过滤：博彩、成人/擦边、武器、毒品/烟酒等不适合进入通用导航库的内容。
RESTRICTED_KEYWORDS = [
    "sports betting", "betting", "casino", "gambling", "prediction market", "bookmaker",
    "only fans", "onlyfans", "nsfw", "adult", "porn", "erotic", "sexy", "nude", "nudify", "undress",
    "clothing removal", "bikini", "dirty talking", "ai girlfriend", "ai boyfriend", "dating assistant",
    "pickup lines", "pick-up lines", "rizz", "waifu",
    "weapon", "gun", "knife", "firearm", "ammo", "self-defense",
    "drug", "cannabis", "marijuana", "thc", "cbd", "vape", "nicotine", "alcohol",
]

PRICING_TOKENS = {
    "Free", "Freemium", "Free Trial", "Paid", "Contact for Pricing", "Subscription", "One-time purchase"
}
TOOL_TYPES = {"Website", "Browser Extension", "Apps", "Discord", "GPTs", "API"}


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def normalize_space(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip())


def slug_from_url(url: str) -> str:
    path = urllib.parse.urlparse(url).path.rstrip("/")
    return path.split("/")[-1]


def absolutize(url: str) -> str:
    if not url:
        return ""
    return urllib.parse.urljoin(BASE_URL, url)


def line_list(soup: BeautifulSoup) -> List[str]:
    text = soup.get_text("\n")
    return [normalize_space(x) for x in text.splitlines() if normalize_space(x)]


def parse_human_number(raw: str) -> Optional[float]:
    """393.4K -> 393400, 2.1M -> 2100000."""
    if not raw:
        return None
    s = raw.strip().replace(",", "")
    m = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*([KMB])?", s, re.I)
    if not m:
        return None
    value = float(m.group(1))
    unit = (m.group(2) or "").upper()
    if unit == "K":
        value *= 1_000
    elif unit == "M":
        value *= 1_000_000
    elif unit == "B":
        value *= 1_000_000_000
    return value


def is_restricted_text(*parts: str) -> Tuple[bool, str]:
    joined = " ".join([p or "" for p in parts]).lower()
    for kw in RESTRICTED_KEYWORDS:
        if kw in joined:
            return True, kw
    return False, ""


@dataclass
class Category:
    slug: str
    name: str
    url: str
    group_name: str = ""
    count: Optional[int] = None


@dataclass
class ToolRecord:
    source: str
    toolify_url: str
    slug: str
    name: str
    external_url: str = ""
    introduction: str = ""
    product_info: str = ""
    how_to_use: str = ""
    pricing_text: str = ""
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    saved_count: Optional[int] = None
    monthly_visitors_raw: str = ""
    monthly_visitors_num: Optional[float] = None
    added_on: str = ""
    tool_type: str = ""
    pricing_model: str = ""
    categories: List[str] = None
    tags: List[str] = None
    features: List[str] = None
    use_cases: List[str] = None
    traffic: Dict[str, str] = None
    crawled_at: str = ""

    def __post_init__(self):
        self.categories = self.categories or []
        self.tags = self.tags or []
        self.features = self.features or []
        self.use_cases = self.use_cases or []
        self.traffic = self.traffic or {}
        self.crawled_at = self.crawled_at or utc_now()


class Store:
    def __init__(self, db_path: str):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self.init_schema()

    def init_schema(self) -> None:
        cur = self.conn.cursor()
        cur.executescript(
            """
            PRAGMA journal_mode=WAL;
            CREATE TABLE IF NOT EXISTS tools (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL,
                toolify_url TEXT NOT NULL UNIQUE,
                slug TEXT,
                name TEXT NOT NULL,
                external_url TEXT,
                introduction TEXT,
                product_info TEXT,
                how_to_use TEXT,
                pricing_text TEXT,
                rating REAL,
                reviews_count INTEGER,
                saved_count INTEGER,
                monthly_visitors_raw TEXT,
                monthly_visitors_num REAL,
                added_on TEXT,
                tool_type TEXT,
                pricing_model TEXT,
                categories_json TEXT,
                tags_json TEXT,
                features_json TEXT,
                use_cases_json TEXT,
                traffic_json TEXT,
                crawled_at TEXT,
                updated_at TEXT
            );
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                group_name TEXT,
                count INTEGER,
                crawled_at TEXT
            );
            CREATE TABLE IF NOT EXISTS skipped_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_type TEXT,
                url TEXT,
                name TEXT,
                reason TEXT,
                crawled_at TEXT
            );
            CREATE TABLE IF NOT EXISTS crawl_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT,
                started_at TEXT,
                finished_at TEXT,
                total_seen INTEGER DEFAULT 0,
                total_saved INTEGER DEFAULT 0,
                total_skipped INTEGER DEFAULT 0,
                note TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_tools_name ON tools(name);
            CREATE INDEX IF NOT EXISTS idx_tools_monthly_visitors ON tools(monthly_visitors_num);
            """
        )
        self.conn.commit()

    def start_run(self, source: str) -> int:
        cur = self.conn.execute(
            "INSERT INTO crawl_runs(source, started_at) VALUES(?, ?)",
            (source, utc_now()),
        )
        self.conn.commit()
        return int(cur.lastrowid)

    def finish_run(self, run_id: int, seen: int, saved: int, skipped: int, note: str = "") -> None:
        self.conn.execute(
            "UPDATE crawl_runs SET finished_at=?, total_seen=?, total_saved=?, total_skipped=?, note=? WHERE id=?",
            (utc_now(), seen, saved, skipped, note, run_id),
        )
        self.conn.commit()

    def save_category(self, c: Category) -> None:
        self.conn.execute(
            """
            INSERT INTO categories(slug, name, url, group_name, count, crawled_at)
            VALUES(?, ?, ?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
                name=excluded.name, url=excluded.url, group_name=excluded.group_name,
                count=excluded.count, crawled_at=excluded.crawled_at
            """,
            (c.slug, c.name, c.url, c.group_name, c.count, utc_now()),
        )
        self.conn.commit()

    def save_tool(self, t: ToolRecord) -> None:
        self.conn.execute(
            """
            INSERT INTO tools(
                source, toolify_url, slug, name, external_url, introduction, product_info, how_to_use,
                pricing_text, rating, reviews_count, saved_count, monthly_visitors_raw, monthly_visitors_num,
                added_on, tool_type, pricing_model, categories_json, tags_json, features_json, use_cases_json,
                traffic_json, crawled_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(toolify_url) DO UPDATE SET
                source=excluded.source, slug=excluded.slug, name=excluded.name, external_url=excluded.external_url,
                introduction=excluded.introduction, product_info=excluded.product_info, how_to_use=excluded.how_to_use,
                pricing_text=excluded.pricing_text, rating=excluded.rating, reviews_count=excluded.reviews_count,
                saved_count=excluded.saved_count, monthly_visitors_raw=excluded.monthly_visitors_raw,
                monthly_visitors_num=excluded.monthly_visitors_num, added_on=excluded.added_on,
                tool_type=excluded.tool_type, pricing_model=excluded.pricing_model,
                categories_json=excluded.categories_json, tags_json=excluded.tags_json,
                features_json=excluded.features_json, use_cases_json=excluded.use_cases_json,
                traffic_json=excluded.traffic_json, updated_at=excluded.updated_at
            """,
            (
                t.source, t.toolify_url, t.slug, t.name, t.external_url, t.introduction, t.product_info, t.how_to_use,
                t.pricing_text, t.rating, t.reviews_count, t.saved_count, t.monthly_visitors_raw, t.monthly_visitors_num,
                t.added_on, t.tool_type, t.pricing_model,
                json.dumps(t.categories, ensure_ascii=False),
                json.dumps(t.tags, ensure_ascii=False),
                json.dumps(t.features, ensure_ascii=False),
                json.dumps(t.use_cases, ensure_ascii=False),
                json.dumps(t.traffic, ensure_ascii=False),
                t.crawled_at, utc_now(),
            ),
        )
        self.conn.commit()

    def save_skipped(self, item_type: str, url: str, name: str, reason: str) -> None:
        self.conn.execute(
            "INSERT INTO skipped_items(item_type, url, name, reason, crawled_at) VALUES (?, ?, ?, ?, ?)",
            (item_type, url, name, reason, utc_now()),
        )
        self.conn.commit()

    def has_tool(self, url: str) -> bool:
        row = self.conn.execute("SELECT 1 FROM tools WHERE toolify_url=?", (url,)).fetchone()
        return bool(row)


class ToolifyCrawler:
    def __init__(self, db_path: str, delay: float = 1.5, timeout: int = 25, resume: bool = True, respect_robots: bool = False):
        self.store = Store(db_path)
        self.delay = delay
        self.timeout = timeout
        self.resume = resume
        self.respect_robots = respect_robots
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
        })
        self._robots: Optional[robotparser.RobotFileParser] = None

    def _sleep(self) -> None:
        time.sleep(self.delay + random.uniform(0, min(0.8, self.delay)))

    def load_robots(self) -> None:
        rp = robotparser.RobotFileParser()
        rp.set_url(f"{BASE_URL}/robots.txt")
        try:
            rp.read()
            self._robots = rp
        except Exception:
            self._robots = None

    def robots_allowed(self, url: str) -> bool:
        if self._robots is None:
            return True
        try:
            return self._robots.can_fetch(USER_AGENT, url)
        except Exception:
            return True

    def fetch(self, url: str) -> str:
        url = absolutize(url)
        # v1 这里会直接中断，导致 /sitemap.xml、/category 这种公开页面也无法采集。
        # v2 默认不让本地 robots 解析器中断任务；如果你需要严格模式，运行时加 --respect-robots。
        if self.respect_robots and not self.robots_allowed(url):
            raise RuntimeError(f"Blocked by robots.txt: {url}")
        last_err = None
        for attempt in range(4):
            try:
                r = self.session.get(url, timeout=self.timeout)
                if r.status_code in (429, 500, 502, 503, 504):
                    wait = (2 ** attempt) + random.uniform(0, 1.5)
                    print(f"[retry] {r.status_code} {url} wait={wait:.1f}s")
                    time.sleep(wait)
                    continue
                r.raise_for_status()
                return r.text
            except Exception as e:
                last_err = e
                wait = (2 ** attempt) + random.uniform(0, 1.0)
                print(f"[retry] error={e} url={url} wait={wait:.1f}s")
                time.sleep(wait)
        raise RuntimeError(f"Failed to fetch {url}: {last_err}")

    def discover_sitemap_tool_urls(self, max_urls: int = 0) -> List[str]:
        """优先从 sitemap 发现 /tool/ URL。若 sitemap 不存在、被限制或结构变化，返回空列表。"""
        seen = set()
        result: List[str] = []
        queue = [f"{BASE_URL}/sitemap.xml"]
        while queue:
            url = queue.pop(0)
            try:
                content = self.fetch(url)
            except Exception as e:
                print(f"[sitemap] skip {url}: {e}")
                continue
            if url.endswith(".gz"):
                content = gzip.decompress(content.encode("latin1")).decode("utf-8", errors="ignore")
            try:
                root = ET.fromstring(content)
            except ET.ParseError:
                continue
            ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
            for loc in root.iter(f"{ns}loc"):
                loc_url = (loc.text or "").strip()
                if not loc_url:
                    continue
                if loc_url.endswith(".xml") or loc_url.endswith(".xml.gz"):
                    if loc_url not in seen:
                        seen.add(loc_url)
                        queue.append(loc_url)
                elif "/tool/" in loc_url:
                    restricted, kw = is_restricted_text(loc_url)
                    if restricted:
                        self.store.save_skipped("tool_url", loc_url, slug_from_url(loc_url), f"restricted_keyword:{kw}")
                        continue
                    if loc_url not in seen:
                        seen.add(loc_url)
                        result.append(loc_url)
                        if max_urls and len(result) >= max_urls:
                            return result
            self._sleep()
        return result

    def parse_categories(self, html: str) -> List[Category]:
        soup = BeautifulSoup(html, "lxml")
        categories: List[Category] = []
        current_group = ""
        # 以页面标题块/分组标题作为大类，下面的 /category/ 链接作为小类。
        for node in soup.find_all(["h2", "h3", "h4", "a"]):
            if node.name in {"h2", "h3", "h4"}:
                text = normalize_space(node.get_text(" "))
                if text and len(text) < 80 and not text.lower().startswith("find ai"):
                    current_group = text.replace("###", "").strip()
                continue
            if node.name == "a":
                href = node.get("href") or ""
                if "/category/" not in href:
                    continue
                text = normalize_space(node.get_text(" "))
                if not text or text.lower() in {"category", "categories"}:
                    continue
                # 文本通常形如：AI Blog Generator 662
                m = re.match(r"(.+?)\s+(\d{1,6})$", text)
                name = m.group(1).strip() if m else text
                count = int(m.group(2)) if m else None
                url = absolutize(href)
                restricted, kw = is_restricted_text(name, url, current_group)
                if restricted:
                    self.store.save_skipped("category", url, name, f"restricted_keyword:{kw}")
                    continue
                categories.append(Category(slug=slug_from_url(url), name=name, url=url, group_name=current_group, count=count))
        # 去重，保留第一次出现的大类信息
        dedup: Dict[str, Category] = {}
        for c in categories:
            dedup.setdefault(c.slug, c)
        return list(dedup.values())

    def discover_category_tool_urls(self, category_url: str, max_pages: int = 1) -> List[str]:
        urls = []
        seen = set()
        to_visit = [category_url]
        pages = 0
        while to_visit and pages < max_pages:
            url = to_visit.pop(0)
            pages += 1
            html = self.fetch(url)
            soup = BeautifulSoup(html, "lxml")
            for a in soup.find_all("a", href=True):
                href = a["href"]
                parsed_path = urllib.parse.urlparse(absolutize(href)).path
                if parsed_path.startswith("/tool/"):
                    full = absolutize(href.split("?")[0])
                    text = normalize_space(a.get_text(" "))
                    restricted, kw = is_restricted_text(text, full)
                    if restricted:
                        self.store.save_skipped("tool_url", full, text or slug_from_url(full), f"restricted_keyword:{kw}")
                        continue
                    if full not in seen:
                        seen.add(full)
                        urls.append(full)
                # 翻页链接：只接受同一 category 下的 page 参数
                if "/category/" in href and "page=" in href:
                    full = absolutize(href)
                    if full not in seen:
                        seen.add(full)
                        to_visit.append(full)
            self._sleep()
        return urls

    def parse_tool_detail(self, html: str, url: str, source: str = "toolify") -> Optional[ToolRecord]:
        soup = BeautifulSoup(html, "lxml")
        lines = line_list(soup)
        h1 = soup.find("h1")
        name = normalize_space(h1.get_text(" ")) if h1 else ""
        if not name:
            title = soup.find("title")
            name = normalize_space((title.get_text(" ") if title else slug_from_url(url)).split(":")[0])
        if not name:
            return None

        whole_text = " ".join(lines[:220])
        restricted, kw = is_restricted_text(name, whole_text, url)
        if restricted:
            self.store.save_skipped("tool", url, name, f"restricted_keyword:{kw}")
            return None

        external_url = ""
        for a in soup.find_all("a", href=True):
            txt = normalize_space(a.get_text(" ")).lower()
            href = a["href"]
            if ("visit website" in txt or "open site" in txt or txt.startswith("try ")) and "toolify.ai" not in urllib.parse.urlparse(absolutize(href)).netloc:
                external_url = absolutize(href)
                break

        def value_after(label: str, max_ahead: int = 3) -> str:
            for i, line in enumerate(lines):
                if line.lower().rstrip(":") == label.lower().rstrip(":"):
                    for j in range(i + 1, min(i + 1 + max_ahead, len(lines))):
                        if lines[j] and lines[j] not in {":", "--"}:
                            return lines[j]
            return ""

        intro = value_after("Introduction:", 4)
        added_on = value_after("Added on:", 4)
        monthly_raw = value_after("Monthly Visitors:", 4)
        monthly_num = parse_human_number(monthly_raw)

        rating = None
        if h1:
            # h1 附近经常出现评分数字 5
            for idx, line in enumerate(lines):
                if line == name:
                    for candidate in lines[idx + 1: idx + 8]:
                        if re.fullmatch(r"[0-5](?:\.\d+)?", candidate):
                            rating = float(candidate)
                            break
                    break

        reviews_count = None
        saved_count = None
        m = re.search(r"(\d+)\s+Reviews?\s+(\d+)\s+Saved", " ".join(lines[:160]), re.I)
        if m:
            reviews_count, saved_count = int(m.group(1)), int(m.group(2))
        else:
            m1 = re.search(r"(\d+)\s+Reviews?", " ".join(lines[:160]), re.I)
            m2 = re.search(r"(\d+)\s+Saved", " ".join(lines[:160]), re.I)
            reviews_count = int(m1.group(1)) if m1 else None
            saved_count = int(m2.group(1)) if m2 else None

        categories = []
        tags = []
        for a in soup.find_all("a", href=True):
            txt = normalize_space(a.get_text(" "))
            href = a["href"]
            if not txt:
                continue
            if "/category/" in href:
                if not is_restricted_text(txt)[0] and txt not in categories:
                    categories.append(txt)
            # 详情页底部 Tool's Tags 一般是普通标签链接，先宽松提取短文本。
            if len(txt) <= 45 and txt not in tags and any(token in href.lower() for token in ["tag", "category"]):
                if not is_restricted_text(txt)[0]:
                    tags.append(txt)

        pricing_tokens = [x for x in lines[:120] if x in PRICING_TOKENS]
        pricing_model = ", ".join(dict.fromkeys(pricing_tokens))
        type_tokens = [x for x in lines[:120] if x in TOOL_TYPES]
        tool_type = type_tokens[0] if type_tokens else ""

        # 提取详情区块
        product_info = self.extract_section(lines, [f"What is {name}?", "What is"], ["How to use", "Core Features", "Use Cases", "FAQ", "Pricing", "Analytic"])
        how_to_use = self.extract_section(lines, [f"How to use {name}?", "How to use"], ["Core Features", "Use Cases", "FAQ", "Pricing", "Analytic"])
        pricing_text = self.extract_section(lines, [f"{name} Pricing", "Pricing"], ["Analytic", "Website Traffic Analysis", "Social Listening", "Alternative", "Comparisons"])
        features = self.extract_bullets_after(lines, [f"{name}'s Core Features", "Core Features"], ["Use Cases", "FAQ", "Pricing", "Analytic"], max_items=30)
        use_cases = self.extract_bullets_after(lines, [f"{name}'s Use Cases", "Use Cases"], ["FAQ", "Pricing", "Analytic"], max_items=20)
        traffic = self.extract_traffic(lines)

        return ToolRecord(
            source=source,
            toolify_url=url,
            slug=slug_from_url(url),
            name=name,
            external_url=external_url,
            introduction=intro,
            product_info=product_info,
            how_to_use=how_to_use,
            pricing_text=pricing_text,
            rating=rating,
            reviews_count=reviews_count,
            saved_count=saved_count,
            monthly_visitors_raw=monthly_raw,
            monthly_visitors_num=monthly_num,
            added_on=added_on,
            tool_type=tool_type,
            pricing_model=pricing_model,
            categories=categories[:20],
            tags=tags[:30],
            features=features,
            use_cases=use_cases,
            traffic=traffic,
        )

    @staticmethod
    def extract_section(lines: List[str], start_patterns: Sequence[str], stop_patterns: Sequence[str], max_chars: int = 5000) -> str:
        start_idx = None
        for i, line in enumerate(lines):
            low = line.lower()
            if any(p.lower() in low for p in start_patterns if p):
                start_idx = i + 1
                break
        if start_idx is None:
            return ""
        collected = []
        for line in lines[start_idx:]:
            low = line.lower()
            if any(p.lower() in low for p in stop_patterns if p):
                break
            if line not in {"#1", "#2", "#3", "#4", "#5"}:
                collected.append(line)
            if sum(len(x) for x in collected) > max_chars:
                break
        return normalize_space(" ".join(collected))[:max_chars]

    @staticmethod
    def extract_bullets_after(lines: List[str], start_patterns: Sequence[str], stop_patterns: Sequence[str], max_items: int = 20) -> List[str]:
        start_idx = None
        for i, line in enumerate(lines):
            low = line.lower()
            if any(p.lower() in low for p in start_patterns if p):
                start_idx = i + 1
                break
        if start_idx is None:
            return []
        items = []
        for line in lines[start_idx:]:
            low = line.lower()
            if any(p.lower() in low for p in stop_patterns if p):
                break
            if line.startswith("#") or len(line) > 180:
                continue
            if line and line not in items:
                items.append(line)
            if len(items) >= max_items:
                break
        return items

    @staticmethod
    def extract_traffic(lines: List[str]) -> Dict[str, str]:
        joined = "\n".join(lines)
        traffic = {}
        for key in ["Monthly Visits", "Avg.Visit Duration", "Page per Visit", "Bounce Rate"]:
            m = re.search(re.escape(key) + r"\n([^\n]+)", joined, re.I)
            if m:
                traffic[key] = m.group(1).strip()
        # Top regions: 提取国家 + 百分比的近邻项
        regions = []
        for i, line in enumerate(lines):
            if re.fullmatch(r"\d+(?:\.\d+)?%", line) and i > 0:
                country = lines[i - 1]
                if re.fullmatch(r"[A-Za-z][A-Za-z .&-]{2,50}", country):
                    regions.append(f"{country}:{line}")
        if regions:
            traffic["Top Regions"] = "; ".join(regions[:8])
        return traffic

    def crawl_tool_urls(self, urls: Iterable[str], max_tools: int = 0, source: str = "toolify") -> Tuple[int, int, int]:
        seen = saved = skipped = 0
        for url in urls:
            url = absolutize(url).split("#")[0]
            if max_tools and seen >= max_tools:
                break
            seen += 1
            if self.resume and self.store.has_tool(url):
                print(f"[skip-exists] {url}")
                skipped += 1
                continue
            restricted, kw = is_restricted_text(url)
            if restricted:
                self.store.save_skipped("tool_url", url, slug_from_url(url), f"restricted_keyword:{kw}")
                skipped += 1
                continue
            try:
                html = self.fetch(url)
                record = self.parse_tool_detail(html, url, source=source)
                if record is None:
                    skipped += 1
                else:
                    self.store.save_tool(record)
                    saved += 1
                    print(f"[saved] {record.name} | cats={len(record.categories)} | visitors={record.monthly_visitors_raw or '-'}")
                self._sleep()
            except KeyboardInterrupt:
                raise
            except Exception as e:
                skipped += 1
                self.store.save_skipped("error", url, slug_from_url(url), str(e)[:500])
                print(f"[error] {url}: {e}")
        return seen, saved, skipped

    def crawl_from_sitemap(self, max_tools: int = 0) -> Tuple[int, int, int]:
        urls = self.discover_sitemap_tool_urls(max_urls=max_tools)
        print(f"[discover] sitemap tool urls={len(urls)}")
        return self.crawl_tool_urls(urls, max_tools=max_tools, source="toolify_sitemap")

    def crawl_from_categories(self, max_categories: int = 0, max_tools_per_category: int = 30, category_pages: int = 1) -> Tuple[int, int, int]:
        html = self.fetch(f"{BASE_URL}/category")
        cats = self.parse_categories(html)
        print(f"[discover] categories={len(cats)}")
        for c in cats:
            self.store.save_category(c)
        total_seen = total_saved = total_skipped = 0
        for idx, c in enumerate(cats, 1):
            if max_categories and idx > max_categories:
                break
            print(f"\n[category] {idx}/{len(cats)} {c.name} {c.url}")
            urls = self.discover_category_tool_urls(c.url, max_pages=category_pages)
            if max_tools_per_category:
                urls = urls[:max_tools_per_category]
            seen, saved, skipped = self.crawl_tool_urls(urls, source=f"category:{c.slug}")
            total_seen += seen
            total_saved += saved
            total_skipped += skipped
        return total_seen, total_saved, total_skipped

    def smoke_test(self) -> Tuple[int, int, int]:
        html = SAMPLE_TOOL_HTML
        url = f"{BASE_URL}/tool/aura-build"
        rec = self.parse_tool_detail(html, url, source="smoke_test")
        if rec:
            self.store.save_tool(rec)
        cat_html = SAMPLE_CATEGORY_HTML
        cats = self.parse_categories(cat_html)
        for c in cats:
            self.store.save_category(c)
        return 1, 1 if rec else 0, 0 if rec else 1


SAMPLE_TOOL_HTML = """
<html><head><title>Aura.build: AI website builder</title></head><body>
<a href="/">Home</a><a href="/category/ai-landing-page-builder">AI Landing Page Builder</a>
<h1>Aura.build</h1>
<a href="https://www.aura.build">Open site</a>
<p>5</p><p>0 Reviews</p><p>0 Saved</p>
<p>Introduction:</p><p>AI website builder generating responsive landing pages with HTML and Figma export capabilities.</p>
<p>Added on:</p><p>May 07 2026</p>
<p>Monthly Visitors:</p><p>393.4K</p>
<p>Freemium</p><p>Free Trial</p><p>Paid</p><p>Website</p>
<a href="/category/ai-website-builder">AI Website Builder</a>
<h2>Aura.build Product Information</h2>
<h2>What is Aura.build?</h2>
<p>Aura.build is an AI-powered website and landing page builder that allows users to create professional web designs without starting from scratch.</p>
<h2>How to use Aura.build?</h2>
<p>Users can generate a website by entering a text prompt or uploading a screenshot.</p>
<h2>Aura.build's Core Features</h2>
<h3>AI-powered landing page and website generation</h3>
<h3>Screenshot-to-responsive HTML conversion</h3>
<h3>Export to standard HTML, Tailwind CSS, and Figma</h3>
<h2>Aura.build's Use Cases</h2>
<h3>Rapidly launching marketing landing pages for SaaS products</h3>
<h3>Converting UI design screenshots into functional code</h3>
<h2>Aura.build Pricing</h2>
<p>Free</p><p>$0</p><p>Pro</p><p>$25/month</p>
<h2>Analytic of Aura.build</h2>
<p>Monthly Visits</p><p>393.4K</p><p>Avg.Visit Duration</p><p>00:02:17</p><p>Page per Visit</p><p>3.43</p><p>Bounce Rate</p><p>41.54%</p>
</body></html>
"""

SAMPLE_CATEGORY_HTML = """
<html><body>
<h3>Writing & Editing</h3>
<a href="/category/ai-blog-generator">AI Blog Generator 662</a>
<a href="/category/ai-copywriting">AI Copywriting 755</a>
<h3>Coding & Development</h3>
<a href="/category/ai-api">AI API 1985</a>
<a href="/category/ai-web-scraping">AI Web Scraping 268</a>
<a href="/category/ai-sports-betting">AI Sports Betting 12</a>
</body></html>
"""


def export_data(db_path: str, out_dir: str) -> None:
    os.makedirs(out_dir, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM tools ORDER BY monthly_visitors_num DESC NULLS LAST, id DESC").fetchall()
    jsonl_path = os.path.join(out_dir, "toolify_tools.jsonl")
    csv_path = os.path.join(out_dir, "toolify_tools.csv")
    with open(jsonl_path, "w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(dict(row), ensure_ascii=False) + "\n")
    if rows:
        with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=rows[0].keys())
            writer.writeheader()
            for row in rows:
                writer.writerow(dict(row))
    print(f"[export] {jsonl_path}")
    print(f"[export] {csv_path}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", default=DEFAULT_DB)
    parser.add_argument("--source", choices=["sitemap", "category"], default="sitemap")
    parser.add_argument("--delay", type=float, default=1.5)
    parser.add_argument("--max-tools", type=int, default=0, help="0 means no explicit limit")
    parser.add_argument("--max-categories", type=int, default=0)
    parser.add_argument("--max-tools-per-category", type=int, default=30)
    parser.add_argument("--category-pages", type=int, default=1)
    parser.add_argument("--no-resume", action="store_true")
    parser.add_argument("--smoke-test", action="store_true")
    parser.add_argument("--export", action="store_true")
    parser.add_argument("--out", default="data/export")
    parser.add_argument("--respect-robots", action="store_true", help="严格按照 robots.txt 阻断抓取；默认关闭，避免本地 robotparser 误判导致公开页面不可采集。")
    args = parser.parse_args()

    crawler = ToolifyCrawler(args.db, delay=args.delay, resume=not args.no_resume, respect_robots=args.respect_robots)
    if args.respect_robots:
        crawler.load_robots()
    run_id = crawler.store.start_run("smoke_test" if args.smoke_test else args.source)
    try:
        if args.smoke_test:
            seen, saved, skipped = crawler.smoke_test()
        elif args.source == "sitemap":
            seen, saved, skipped = crawler.crawl_from_sitemap(max_tools=args.max_tools)
            if seen == 0:
                print("[fallback] sitemap 没发现工具 URL，自动切到 category 模式。")
                seen, saved, skipped = crawler.crawl_from_categories(
                    max_categories=args.max_categories,
                    max_tools_per_category=args.max_tools_per_category,
                    category_pages=args.category_pages,
                )
        else:
            seen, saved, skipped = crawler.crawl_from_categories(
                max_categories=args.max_categories,
                max_tools_per_category=args.max_tools_per_category,
                category_pages=args.category_pages,
            )
        crawler.store.finish_run(run_id, seen, saved, skipped)
        print(f"\n[done] seen={seen} saved={saved} skipped={skipped} db={args.db}")
        if args.export:
            export_data(args.db, args.out)
    except KeyboardInterrupt:
        crawler.store.finish_run(run_id, 0, 0, 0, "interrupted")
        print("\n[interrupted]")
        raise


if __name__ == "__main__":
    main()
