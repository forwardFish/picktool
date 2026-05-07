# v2 UI Reference Inventory

Source folder: `docs/pic`  
Purpose: UI/page/component references only. No image-generation, image-to-image, `/api/image/generate`, or image provider work was implemented.

| Image file | Appears to represent | Key layout details | Key visual details | Production route/component mapping | Implementation status |
|---|---|---|---|---|---|
| `首页.png` | Marketing homepage hero for task input. | Header with brand/login; centered oversized hero; large prompt input with right CTA; scenario chips below. | Dark star/planet background; neon blue/purple borders; glowing gradient CTA; focused single-task entry. | `/`; `components/copilot/CopilotStartForm.tsx`; shared site chrome. | Implemented with v2 brand, PRD headline, task input, CTA, and example chips. |
| `详情页.png` | Tool detail / directory-style informational page. | Full nav; tool hero; tabs; long sections for overview, use, features, pricing, alternatives, footer. | Dark SaaS cards, restrained blue/purple accents, large media panel. | Existing compatibility route `/tools/[toolId]`; `components/picktool/tool-detail.tsx`. | Preserved as v1.2 compatibility/SEO page; not primary v2 workflow. |
| `搜索结果-1.png` | Copilot result step 1: initial good-enough plan. | Left current-plan sidebar; chat main area; recommendation card; upgrade chips; full plan collapsed below. | Deep panels, purple highlight card, green status card, chat bubbles. | `/copilot`; `CopilotPageClient`, `CurrentPlanSidebar`, `ChatPanel`, `FullPlanAccordion`. | Implemented: basic plan starts with `ChatGPT / Claude + 剪映 / CapCut`; full plan stays collapsed. |
| `搜索结果-2.png` | Step 2: more professional upgrade. | Same two-column layout; new user selection; upgraded card; sidebar shows added Canva; full plan ready/collapsed. | Purple upgrade card; green upgraded status; Canva emphasized. | `/copilot` option flow; `POST /api/copilot/option` with `professional`. | Implemented: professional plan adds Canva and updates sidebar/status/messages. |
| `搜索结果-3.png` | Step 3: more automated branch with collapsed sidebar. | Narrow icon rail; wider chat area; automation recommendation; option buttons. | Single focused card; InVideo plus optional Canva; compact rail icons. | `CurrentPlanSidebar` collapsed state; `automated` option flow. | Implemented: sidebar collapse on desktop, automated plan uses `ChatGPT / Claude + InVideo（Canva 可选）`. |
| `搜索结果-4.png` | Step 4: full execution plan expanded. | Chat summary above; full plan panel below with 4 columns: recommendation, execution steps, outputs, cautions; CTA action bar. | Higher information density in cards; numbered columns; large next-step buttons. | `FullPlanAccordion`; `POST /api/copilot/generate-full-plan`. | Implemented: full plan generated only after user action and rendered in 4-column responsive grid. |
| `搜索结果-5.png` | Step 5: continue refining plan after full plan completion. | Sidebar switches to refinement modules; main area shows four module cards; lower completed plan and generation prompt. | Module-specific colored cards; completed state; workbench feel. | `FullPlanAccordion` refinement chips; `POST /api/copilot/refine`; generated output messages. | Implemented: script, materials, subtitles/cover, and delivery-check refinements with completed state. |

## Overall mapping

- Primary v2 experience: `/` -> `/copilot` -> save/archive.
- Compatibility pages retained: `/results`, `/tools/capcut`, `/setups/tiktok-product-promo-video`.
- UI references were translated into React/Tailwind components rather than used as generated images.
