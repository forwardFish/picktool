# Toolify AI 工具来源爬虫 + 本地数据看板

这个项目用于给你的 AI 工具导航 / AI 决策导航产品补足“工具来源数据”。

## 你会得到什么

- `data/toolify.sqlite`：本地 SQLite 数据库，最适合 MVP 直接读取。
- `data/export/toolify_tools.jsonl`：一行一个工具，方便导入向量库、RAG、Supabase、PostgreSQL。
- `data/export/toolify_tools.csv`：方便人工检查。
- 本地查看页面：搜索、分类筛选、价格筛选、月访问量排序、工具详情页。
- 默认过滤不适合通用 AI 工具库的敏感/受限类别，避免把博彩、成人擦边、武器、毒品烟酒等内容混进产品。

## 安装

```bash
cd toolify_ai_source_crawler
python -m venv .venv
# Windows PowerShell
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
```

## 先跑一个本地冒烟测试

这个不会访问外网，只验证解析、入库、看板是否正常。

```bash
python crawler.py --smoke-test --db data/toolify.sqlite --export
python generate_report.py --db data/toolify.sqlite --out data/report.html
python viewer.py
```

浏览器打开：

```text
http://127.0.0.1:7860
```

## 小规模真实抓取测试

先抓几个分类，确认字段质量。

```bash
python crawler.py \
  --source category \
  --db data/toolify.sqlite \
  --max-categories 5 \
  --max-tools-per-category 20 \
  --delay 1.8 \
  --export

python viewer.py
```

## 尽量完整抓取

优先从 sitemap 发现所有 `/tool/` 详情页；如果 sitemap 不可用，会自动回退到分类页发现。

```bash
python crawler.py \
  --source sitemap \
  --db data/toolify.sqlite \
  --delay 1.8 \
  --export
```

建议第一次先限制数量：

```bash
python crawler.py --source sitemap --max-tools 300 --delay 1.8 --export
```

确认数据质量后，再放开 `--max-tools`。

## 字段说明

核心字段：

- `name`：工具名
- `toolify_url`：Toolify 详情页
- `external_url`：工具官网
- `introduction`：一句话介绍
- `product_info`：产品长说明
- `how_to_use`：使用方式
- `pricing_text`：价格文本
- `monthly_visitors_raw` / `monthly_visitors_num`：月访问量
- `rating` / `reviews_count` / `saved_count`：评分、评论、收藏
- `categories_json`：分类数组
- `tags_json`：标签数组
- `features_json`：核心功能数组
- `use_cases_json`：使用场景数组
- `traffic_json`：流量概况

## 给你的产品怎么用

MVP 阶段最推荐：

1. 爬虫把数据写入 `SQLite`。
2. 你的 Next.js / API 服务读取 SQLite 或导出的 JSONL。
3. 后续如果要部署到 Vercel，不要在 Vercel Function 里跑爬虫；把爬虫放在本地电脑、服务器、GitHub Actions、云主机或定时任务里跑。
4. 生产环境可以把 JSONL 导入 Supabase/PostgreSQL。

## 质量检查标准

打开看板重点看：

- 总工具数量是否持续增加。
- 有 `introduction` 的比例是否高。
- 有 `monthly_visitors` 的比例是否高。
- 分类是否够多、是否有你要做的主赛道：开发、营销、视频、写作、设计、生产力。
- Top 工具是否明显是正常 AI 工具，而不是广告或无效页面。

## 注意

- 请低频抓取，不要高并发冲击对方网站。
- 如果对方页面结构变化，优先改 `parse_tool_detail()` 和 `parse_categories()`。
- 这个脚本默认过滤敏感/受限内容，适合做通用 AI 工具导航库。

---

## v2 修复说明：robots.txt 本地误判导致中断

如果你看到：

```text
RuntimeError: Blocked by robots.txt: https://www.toolify.ai/category
```

这是 v1 的本地 `robotparser` 检查过于严格造成的中断。v2 默认不再让这个检查直接中断任务；如果你自己需要严格阻断模式，再手动加：

```bash
python crawler.py --source category --respect-robots
```

建议先用小批量验证：

```bash
python crawler.py --source category --max-categories 3 --max-tools-per-category 20 --category-pages 1 --delay 2 --export
python viewer.py
```

确认没问题后扩大：

```bash
python crawler.py --source category --max-categories 30 --max-tools-per-category 50 --category-pages 2 --delay 2 --export
```

如果 `sitemap` 入口仍然失败，不影响，直接使用 `category` 模式。

## 遇到 403 怎么办

如果运行：

```bash
python crawler.py --source category --max-categories 3 --max-tools-per-category 20 --category-pages 1 --delay 2 --export
```

出现 `403 Client Error: Forbidden`，说明 Toolify 服务端拒绝普通 Python requests 请求。不要继续高频重试。

可以使用浏览器模式，它只打开公开网页，不使用代理、不绕过验证码、不绕过登录墙：

```bash
pip install -r requirements_browser.txt
python -m playwright install chromium
python browser_crawler.py --max-categories 3 --max-tools-per-category 20 --category-pages 1 --delay 2 --export --headed
python viewer.py
```

如果浏览器窗口里出现验证码、Access Denied、Cloudflare 挑战或登录墙，请停止任务，不要绕过。建议改用官方授权、合作 API、手工导入、或建立自己的 AI 工具提交入口。

扩大采集：

```bash
python browser_crawler.py --max-categories 30 --max-tools-per-category 50 --category-pages 2 --delay 2.5 --export --headed
```
