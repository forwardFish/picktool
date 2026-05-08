#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Toolify Browser Crawler

用途：
- 当 requests 直接访问 Toolify 返回 403 时，使用本机浏览器打开公开页面并解析页面内容。
- 不使用代理、不绕过验证码、不绕过登录、不破解访问控制。
- 如果浏览器页面显示 Cloudflare/Access Denied/验证码，请停止，不要继续自动化。

安装：
  pip install -r requirements.txt
  pip install -r requirements_browser.txt
  python -m playwright install chromium

用法：
  python browser_crawler.py --max-categories 3 --max-tools-per-category 20 --category-pages 1 --delay 2 --export --headed
  python viewer.py
"""
from __future__ import annotations

import argparse
import random
import re
import time
import urllib.parse
from typing import Iterable, List, Tuple

from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

from crawler import (
    BASE_URL,
    DEFAULT_DB,
    Store,
    absolutize,
    is_restricted_text,
    normalize_space,
    slug_from_url,
    ToolifyCrawler,
    export_data,
)
from generate_report import generate_report

BLOCK_TEXT_PATTERNS = [
    "access denied",
    "forbidden",
    "verify you are human",
    "checking your browser",
    "captcha",
    "cloudflare",
]


def looks_blocked(html: str) -> bool:
    text = BeautifulSoup(html or "", "lxml").get_text(" ").lower()
    return any(p in text for p in BLOCK_TEXT_PATTERNS)


class BrowserCrawler:
    def __init__(
        self,
        db_path: str = DEFAULT_DB,
        delay: float = 2.0,
        timeout_ms: int = 45000,
        headed: bool = False,
        resume: bool = True,
    ):
        self.store = Store(db_path)
        # 复用 crawler.py 里面成熟的解析逻辑，只替换 fetch 方式。
        self.parser = ToolifyCrawler(db_path=db_path, delay=delay, resume=resume)
        self.delay = delay
        self.timeout_ms = timeout_ms
        self.headed = headed
        self.resume = resume
        self.playwright = None
        self.browser = None
        self.page = None

    def __enter__(self):
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(
            headless=not self.headed,
            args=["--disable-blink-features=AutomationControlled"],
        )
        context = self.browser.new_context(
            viewport={"width": 1365, "height": 900},
            locale="en-US",
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
        )
        self.page = context.new_page()
        return self

    def __exit__(self, exc_type, exc, tb):
        try:
            if self.browser:
                self.browser.close()
        finally:
            if self.playwright:
                self.playwright.stop()

    def _sleep(self) -> None:
        time.sleep(self.delay + random.uniform(0.2, min(1.2, self.delay)))

    def fetch(self, url: str) -> str:
        assert self.page is not None
        url = absolutize(url)
        print(f"[browser] open {url}")
        try:
            response = self.page.goto(url, wait_until="domcontentloaded", timeout=self.timeout_ms)
            status = response.status if response else None
            # 给前端渲染一点时间，不做高频请求。
            self.page.wait_for_timeout(1500)
            html = self.page.content()
        except PlaywrightTimeoutError as e:
            raise RuntimeError(f"Browser timeout: {url}: {e}") from e

        if status in (401, 403, 429):
            raise RuntimeError(f"Browser got HTTP {status}: {url}")
        if looks_blocked(html):
            raise RuntimeError(
                "Browser page looks blocked/challenged. Stop crawling. "
                "Do not bypass CAPTCHA, login wall, or access-control challenge."
            )
        return html

    def parse_categories(self, html: str):
        return self.parser.parse_categories(html)

    def discover_category_tool_urls(self, category_url: str, max_pages: int = 1) -> List[str]:
        urls: List[str] = []
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
                full_url = absolutize(href.split("?")[0])
                parsed_path = urllib.parse.urlparse(full_url).path
                if parsed_path.startswith("/tool/"):
                    text = normalize_space(a.get_text(" "))
                    restricted, kw = is_restricted_text(text, full_url)
                    if restricted:
                        self.store.save_skipped("tool_url", full_url, text or slug_from_url(full_url), f"restricted_keyword:{kw}")
                        continue
                    if full_url not in seen:
                        seen.add(full_url)
                        urls.append(full_url)
                # 同一分类下翻页。不同页面结构可能是 ?page=2 或 /page/2，这里只接受仍然在 /category/ 下的链接。
                if "/category/" in href and ("page=" in href or re.search(r"/page/\d+", href)):
                    full = absolutize(href)
                    if full not in seen:
                        seen.add(full)
                        to_visit.append(full)
            self._sleep()
        return urls

    def crawl_tool_urls(self, urls: Iterable[str], max_tools: int = 0, source: str = "toolify_browser") -> Tuple[int, int, int]:
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
                record = self.parser.parse_tool_detail(html, url, source=source)
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
            print(f"[discover] tool urls in category={len(urls)}")
            if max_tools_per_category:
                urls = urls[:max_tools_per_category]
            seen, saved, skipped = self.crawl_tool_urls(urls, source=f"category_browser:{c.slug}")
            total_seen += seen
            total_saved += saved
            total_skipped += skipped
        return total_seen, total_saved, total_skipped

    def crawl_from_category_slugs(self, category_slugs: List[str], max_tools_per_category: int = 30, category_pages: int = 1) -> Tuple[int, int, int]:
        html = self.fetch(f"{BASE_URL}/category")
        cats = self.parse_categories(html)
        print(f"[discover] categories={len(cats)}")
        for c in cats:
            self.store.save_category(c)

        by_slug = {c.slug: c for c in cats}
        selected = []
        for slug in category_slugs:
            slug = slug.strip()
            if not slug:
                continue
            category = by_slug.get(slug)
            if category is None:
                print(f"[category-missing] {slug}; using direct URL fallback")
                category = type("CategoryRef", (), {
                    "slug": slug,
                    "name": slug.replace("-", " "),
                    "url": f"{BASE_URL}/category/{slug}",
                })()
            selected.append(category)

        total_seen = total_saved = total_skipped = 0
        for idx, c in enumerate(selected, 1):
            print(f"\n[category] {idx}/{len(selected)} {c.name} {c.url}")
            urls = self.discover_category_tool_urls(c.url, max_pages=category_pages)
            print(f"[discover] tool urls in category={len(urls)}")
            if max_tools_per_category:
                urls = urls[:max_tools_per_category]
            seen, saved, skipped = self.crawl_tool_urls(urls, source=f"category_browser:{c.slug}")
            total_seen += seen
            total_saved += saved
            total_skipped += skipped
        return total_seen, total_saved, total_skipped


def main() -> None:
    ap = argparse.ArgumentParser(description="Toolify browser-mode crawler for 403 cases")
    ap.add_argument("--db", default=DEFAULT_DB)
    ap.add_argument("--delay", type=float, default=2.0)
    ap.add_argument("--max-categories", type=int, default=3)
    ap.add_argument("--max-tools-per-category", type=int, default=20)
    ap.add_argument("--category-pages", type=int, default=1)
    ap.add_argument("--category-slugs", default="", help="Comma-separated category slugs to crawl before broad category order.")
    ap.add_argument("--headed", action="store_true", help="显示浏览器窗口，方便你判断页面是否被挑战/验证码拦截")
    ap.add_argument("--no-resume", action="store_true")
    ap.add_argument("--export", action="store_true")
    args = ap.parse_args()

    with BrowserCrawler(
        db_path=args.db,
        delay=args.delay,
        headed=args.headed,
        resume=not args.no_resume,
    ) as crawler:
        category_slugs = [slug.strip() for slug in args.category_slugs.split(",") if slug.strip()]
        if category_slugs:
            seen, saved, skipped = crawler.crawl_from_category_slugs(
                category_slugs=category_slugs,
                max_tools_per_category=args.max_tools_per_category,
                category_pages=args.category_pages,
            )
        else:
            seen, saved, skipped = crawler.crawl_from_categories(
                max_categories=args.max_categories,
                max_tools_per_category=args.max_tools_per_category,
                category_pages=args.category_pages,
            )
        print(f"\n[done] seen={seen} saved={saved} skipped={skipped} db={args.db}")

    if args.export:
        export_data(args.db, "data/export")
        generate_report(args.db, "data/report.html")
        print("[export] data/export/toolify_tools.jsonl")
        print("[export] data/export/toolify_tools.csv")
        print("[report] data/report.html")


if __name__ == "__main__":
    main()
