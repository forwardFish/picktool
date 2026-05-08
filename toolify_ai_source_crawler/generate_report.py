#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations
import argparse, json, os, sqlite3, html

CSS = """
body{margin:0;background:#f6f7fb;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,'Microsoft YaHei',sans-serif;color:#111827}.wrap{max-width:1180px;margin:0 auto;padding:32px}h1{font-size:34px;margin:0 0 8px;letter-spacing:-.04em}p{color:#667085}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:24px 0}.card{background:white;border:1px solid #e5e7eb;border-radius:22px;padding:18px;box-shadow:0 8px 22px rgba(15,23,42,.04)}.num{font-size:30px;font-weight:800}.label{font-size:13px;color:#667085}.tools{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.tool{background:white;border:1px solid #e5e7eb;border-radius:18px;padding:16px}.tool h3{margin:0 0 8px}.intro{font-size:14px;color:#475467;line-height:1.5;min-height:65px}.tag{display:inline-block;font-size:12px;background:#eef2ff;color:#3730a3;border-radius:999px;padding:5px 8px;margin:4px 4px 0 0}.meta{border-top:1px solid #e5e7eb;margin-top:12px;padding-top:10px;color:#667085;font-size:13px;display:flex;justify-content:space-between}.bar{display:flex;align-items:center;gap:10px;margin:10px 0}.bar span:first-child{width:230px}.track{flex:1;background:#eef2f7;height:10px;border-radius:20px;overflow:hidden}.fill{background:#2563eb;height:100%}@media(max-width:980px){.grid,.tools{grid-template-columns:1fr}}
"""

def jload(x, default):
    try: return json.loads(x or "")
    except Exception: return default

def generate_report(db: str = "data/toolify.sqlite", out: str = "data/report.html"):
    conn = sqlite3.connect(db); conn.row_factory = sqlite3.Row
    total = conn.execute("select count(*) c from tools").fetchone()["c"]
    cats = conn.execute("select count(*) c from categories").fetchone()["c"]
    skipped = conn.execute("select count(*) c from skipped_items").fetchone()["c"]
    traffic = conn.execute("select count(*) c from tools where monthly_visitors_num is not null").fetchone()["c"]
    rows = conn.execute("select * from tools order by monthly_visitors_num desc nulls last, id desc limit 36").fetchall()
    counter = {}
    for row in conn.execute("select categories_json from tools").fetchall():
        for c in jload(row["categories_json"], []): counter[c]=counter.get(c,0)+1
    top = sorted(counter.items(), key=lambda x:x[1], reverse=True)[:12]
    maxc = top[0][1] if top else 1
    body = [f"<html><head><meta charset='utf-8'><title>AI工具数据报告</title><style>{CSS}</style></head><body><div class='wrap'>"]
    body.append("<h1>AI 工具来源数据报告</h1><p>用于快速检查：爬取数量、字段完整度、分类分布、Top 工具样本。</p>")
    body.append("<div class='grid'>")
    for label,num in [("已入库工具",total),("分类数量",cats),("有访问量字段",traffic),("过滤/失败记录",skipped)]:
        body.append(f"<div class='card'><div class='label'>{label}</div><div class='num'>{num}</div></div>")
    body.append("</div><div class='card'><h2>分类分布</h2>")
    for name,count in top:
        pct = round(count/maxc*100)
        body.append(f"<div class='bar'><span>{html.escape(name)}</span><div class='track'><div class='fill' style='width:{pct}%'></div></div><b>{count}</b></div>")
    body.append("</div><h2>Top 工具样本</h2><div class='tools'>")
    for r in rows:
        cats = jload(r["categories_json"], [])[:4]
        body.append("<div class='tool'>")
        body.append(f"<h3>{html.escape(r['name'] or '')}</h3><div class='intro'>{html.escape((r['introduction'] or r['product_info'] or '')[:180])}</div><div>")
        for c in cats: body.append(f"<span class='tag'>{html.escape(c)}</span>")
        body.append(f"</div><div class='meta'><span>{html.escape(r['pricing_model'] or '-')}</span><span>月访 {html.escape(r['monthly_visitors_raw'] or '-')}</span></div></div>")
    body.append("</div></div></body></html>")
    os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
    open(out,'w',encoding='utf-8').write(''.join(body))
    print(out)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default="data/toolify.sqlite")
    ap.add_argument("--out", default="data/report.html")
    args = ap.parse_args()
    generate_report(args.db, args.out)
if __name__ == '__main__': main()
