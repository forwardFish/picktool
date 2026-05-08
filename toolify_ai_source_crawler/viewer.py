#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import os
import sqlite3
from typing import Any, Dict, List
from flask import Flask, request, g, render_template_string, abort

DB_PATH = os.environ.get("TOOLIFY_DB", "data/toolify.sqlite")
app = Flask(__name__)


def get_db():
    if "db" not in g:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        g.db = conn
    return g.db


@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def jload(value, default):
    try:
        return json.loads(value or "")
    except Exception:
        return default


def stats():
    db = get_db()
    total_tools = db.execute("SELECT COUNT(*) c FROM tools").fetchone()["c"]
    total_categories = db.execute("SELECT COUNT(*) c FROM categories").fetchone()["c"]
    total_skipped = db.execute("SELECT COUNT(*) c FROM skipped_items").fetchone()["c"]
    with_intro = db.execute("SELECT COUNT(*) c FROM tools WHERE length(coalesce(introduction,'')) > 0").fetchone()["c"]
    with_traffic = db.execute("SELECT COUNT(*) c FROM tools WHERE monthly_visitors_num IS NOT NULL").fetchone()["c"]
    with_external = db.execute("SELECT COUNT(*) c FROM tools WHERE length(coalesce(external_url,'')) > 0").fetchone()["c"]
    last_run = db.execute("SELECT * FROM crawl_runs ORDER BY id DESC LIMIT 1").fetchone()
    top_cats = []
    rows = db.execute("SELECT categories_json FROM tools WHERE categories_json IS NOT NULL").fetchall()
    counter = {}
    for row in rows:
        for c in jload(row["categories_json"], []):
            counter[c] = counter.get(c, 0) + 1
    for k, v in sorted(counter.items(), key=lambda x: x[1], reverse=True)[:12]:
        top_cats.append({"name": k, "count": v})
    return {
        "total_tools": total_tools,
        "total_categories": total_categories,
        "total_skipped": total_skipped,
        "with_intro": with_intro,
        "with_traffic": with_traffic,
        "with_external": with_external,
        "last_run": dict(last_run) if last_run else None,
        "top_cats": top_cats,
    }


BASE_CSS = """
<style>
:root{--bg:#f6f7fb;--card:#fff;--ink:#111827;--muted:#667085;--line:#e5e7eb;--blue:#2563eb;--soft:#eef2ff;}
*{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--ink);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,"PingFang SC","Microsoft YaHei",sans-serif;}
a{color:inherit;text-decoration:none}.wrap{max-width:1280px;margin:0 auto;padding:28px}.hero{display:flex;justify-content:space-between;gap:18px;align-items:flex-end;margin-bottom:22px}.hero h1{font-size:34px;margin:0 0 8px;letter-spacing:-.04em}.hero p{margin:0;color:var(--muted)}.btn{border:1px solid var(--line);background:white;padding:10px 14px;border-radius:12px;color:#111827}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.metric{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:18px;box-shadow:0 8px 22px rgba(15,23,42,.04)}.metric .label{color:var(--muted);font-size:13px}.metric .num{font-size:28px;font-weight:800;margin-top:8px}.panel{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:18px;margin-top:16px;box-shadow:0 8px 22px rgba(15,23,42,.04)}.filters{display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:10px;margin-bottom:14px}.filters input,.filters select{height:42px;border:1px solid var(--line);border-radius:12px;padding:0 12px;background:white}.filters button{height:42px;border:0;border-radius:12px;background:var(--blue);color:white;padding:0 18px;font-weight:700}.tools{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.tool{border:1px solid var(--line);border-radius:18px;padding:16px;background:#fff;min-height:210px;display:flex;flex-direction:column}.tool h3{font-size:18px;margin:0 0 8px}.intro{color:#475467;line-height:1.5;font-size:14px;min-height:62px}.tags{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.tag{font-size:12px;background:var(--soft);color:#3730a3;border-radius:999px;padding:5px 8px}.meta{margin-top:auto;display:flex;justify-content:space-between;color:var(--muted);font-size:13px;border-top:1px solid var(--line);padding-top:12px}.bar{display:flex;align-items:center;gap:10px;margin:9px 0}.bar span:first-child{width:220px;color:#344054;font-size:14px}.bar .track{flex:1;height:10px;background:#eef2f7;border-radius:20px;overflow:hidden}.bar .fill{height:100%;background:#2563eb;border-radius:20px}.small{font-size:13px;color:var(--muted)}.detail{display:grid;grid-template-columns:2fr 1fr;gap:18px}.section h2{font-size:18px;margin:0 0 10px}.section p{line-height:1.7;color:#344054}.list{padding-left:18px;color:#344054;line-height:1.7}.empty{padding:42px;text-align:center;color:var(--muted)}
@media(max-width:980px){.grid{grid-template-columns:repeat(2,1fr)}.tools{grid-template-columns:1fr}.filters{grid-template-columns:1fr}.detail{grid-template-columns:1fr}.hero{display:block}}
</style>
"""

HOME_TMPL = """
<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>AI 工具数据看板</title>{{css|safe}}</head><body><div class="wrap">
  <div class="hero"><div><h1>AI 工具来源数据看板</h1><p>本地 SQLite 数据库：{{db_path}}。用于检查爬取数量、分类、访问量、字段完整度和样本质量。</p></div><a class="btn" href="/api/stats">API Stats</a></div>
  <div class="grid">
    <div class="metric"><div class="label">已入库工具</div><div class="num">{{s.total_tools}}</div></div>
    <div class="metric"><div class="label">分类数量</div><div class="num">{{s.total_categories}}</div></div>
    <div class="metric"><div class="label">有访问量字段</div><div class="num">{{s.with_traffic}}</div></div>
    <div class="metric"><div class="label">过滤/失败记录</div><div class="num">{{s.total_skipped}}</div></div>
  </div>
  <div class="panel"><h2>分类分布</h2>
    {% if s.top_cats %}{% set maxc = s.top_cats[0].count %}{% for c in s.top_cats %}<div class="bar"><span>{{c.name}}</span><div class="track"><div class="fill" style="width:{{(c.count/maxc*100)|round(0)}}%"></div></div><b>{{c.count}}</b></div>{% endfor %}{% else %}<div class="empty">还没有分类数据。先运行：python crawler.py --smoke-test</div>{% endif %}
  </div>
  <div class="panel"><h2>工具列表</h2>
    <form class="filters" method="get">
      <input name="q" value="{{q}}" placeholder="搜索工具名 / 简介 / 分类，例如 video、SEO、coding">
      <input name="category" value="{{category}}" placeholder="分类包含">
      <select name="pricing"><option value="">全部价格</option>{% for p in pricing_options %}<option value="{{p}}" {% if pricing==p %}selected{% endif %}>{{p}}</option>{% endfor %}</select>
      <input name="min_visitors" value="{{min_visitors}}" placeholder="最低月访问量，例如 100000">
      <button>筛选</button>
    </form>
    {% if tools %}<div class="tools">{% for t in tools %}<a class="tool" href="/tool/{{t.id}}"><h3>{{t.name}}</h3><div class="intro">{{t.introduction or t.product_info[:150] or '暂无介绍'}}</div><div class="tags">{% for c in t.categories[:4] %}<span class="tag">{{c}}</span>{% endfor %}</div><div class="meta"><span>{{t.pricing_model or '-'}}</span><span>月访 {{t.monthly_visitors_raw or '-'}}</span></div></a>{% endfor %}</div>{% else %}<div class="empty">没有匹配数据。</div>{% endif %}
  </div>
</div></body></html>
"""

DETAIL_TMPL = """
<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>{{t.name}}</title>{{css|safe}}</head><body><div class="wrap">
  <div class="hero"><div><a class="small" href="/">← 返回看板</a><h1>{{t.name}}</h1><p>{{t.introduction}}</p></div><div>{% if t.external_url %}<a class="btn" href="{{t.external_url}}" target="_blank">打开官网</a>{% endif %}</div></div>
  <div class="grid">
    <div class="metric"><div class="label">月访问量</div><div class="num">{{t.monthly_visitors_raw or '-'}}</div></div>
    <div class="metric"><div class="label">评分</div><div class="num">{{t.rating or '-'}}</div></div>
    <div class="metric"><div class="label">收藏</div><div class="num">{{t.saved_count if t.saved_count is not none else '-'}}</div></div>
    <div class="metric"><div class="label">价格模型</div><div class="num" style="font-size:20px">{{t.pricing_model or '-'}}</div></div>
  </div>
  <div class="detail">
    <div>
      <div class="panel section"><h2>产品说明</h2><p>{{t.product_info or t.introduction or '暂无'}}</p></div>
      <div class="panel section"><h2>使用方式</h2><p>{{t.how_to_use or '暂无'}}</p></div>
      <div class="panel section"><h2>价格信息</h2><p>{{t.pricing_text or '暂无'}}</p></div>
    </div>
    <div>
      <div class="panel section"><h2>分类</h2><div class="tags">{% for c in t.categories %}<span class="tag">{{c}}</span>{% endfor %}</div></div>
      <div class="panel section"><h2>核心功能</h2><ul class="list">{% for x in t.features %}<li>{{x}}</li>{% endfor %}</ul></div>
      <div class="panel section"><h2>使用场景</h2><ul class="list">{% for x in t.use_cases %}<li>{{x}}</li>{% endfor %}</ul></div>
      <div class="panel section"><h2>流量</h2><ul class="list">{% for k,v in t.traffic.items() %}<li><b>{{k}}</b>：{{v}}</li>{% endfor %}</ul></div>
    </div>
  </div>
</div></body></html>
"""


@app.route("/")
def home():
    db = get_db()
    q = request.args.get("q", "").strip()
    category = request.args.get("category", "").strip()
    pricing = request.args.get("pricing", "").strip()
    min_visitors = request.args.get("min_visitors", "").strip()
    sql = "SELECT * FROM tools WHERE 1=1"
    params: List[Any] = []
    if q:
        sql += " AND (name LIKE ? OR introduction LIKE ? OR product_info LIKE ? OR categories_json LIKE ?)"
        like = f"%{q}%"
        params.extend([like, like, like, like])
    if category:
        sql += " AND categories_json LIKE ?"
        params.append(f"%{category}%")
    if pricing:
        sql += " AND pricing_model LIKE ?"
        params.append(f"%{pricing}%")
    if min_visitors:
        try:
            sql += " AND monthly_visitors_num >= ?"
            params.append(float(min_visitors))
        except ValueError:
            pass
    sql += " ORDER BY monthly_visitors_num DESC NULLS LAST, id DESC LIMIT 60"
    rows = db.execute(sql, params).fetchall()
    tools = []
    for r in rows:
        d = dict(r)
        d["categories"] = jload(d.get("categories_json"), [])
        d["tags"] = jload(d.get("tags_json"), [])
        tools.append(d)
    return render_template_string(
        HOME_TMPL,
        css=BASE_CSS,
        s=stats(),
        tools=tools,
        db_path=DB_PATH,
        q=q,
        category=category,
        pricing=pricing,
        min_visitors=min_visitors,
        pricing_options=["Free", "Freemium", "Free Trial", "Paid"],
    )


@app.route("/tool/<int:tool_id>")
def tool_detail(tool_id: int):
    db = get_db()
    row = db.execute("SELECT * FROM tools WHERE id=?", (tool_id,)).fetchone()
    if not row:
        abort(404)
    t = dict(row)
    for key, default in [
        ("categories", []), ("tags", []), ("features", []), ("use_cases", []), ("traffic", {})
    ]:
        json_key = key + "_json" if key != "traffic" else "traffic_json"
        t[key] = jload(t.get(json_key), default)
    return render_template_string(DETAIL_TMPL, css=BASE_CSS, t=t)


@app.route("/api/stats")
def api_stats():
    return stats()


@app.route("/api/tools")
def api_tools():
    db = get_db()
    limit = min(int(request.args.get("limit", 100)), 500)
    rows = db.execute("SELECT * FROM tools ORDER BY monthly_visitors_num DESC NULLS LAST LIMIT ?", (limit,)).fetchall()
    return {"items": [dict(r) for r in rows]}


if __name__ == "__main__":
    if not os.path.exists(DB_PATH):
        print(f"数据库不存在：{DB_PATH}")
        print("先运行：python crawler.py --smoke-test")
    app.run(host="127.0.0.1", port=7860, debug=True)
