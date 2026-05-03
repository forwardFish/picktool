<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Tool Decision Assistant</title>
  <style>
    :root {
      --page-w: 1024px;
      --page-h: 1365px;
      --blue: #56c7ff;
      --purple: #b452ff;
      --text: #ffffff;
      --muted: rgba(255,255,255,.68);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      background: #020612;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      color: white;
      overflow-x: hidden;
    }

    .screen {
      position: relative;
      width: 100%;
      min-height: 100vh;
      overflow: hidden;
      background:
        radial-gradient(circle at 50% 91%, rgba(171, 73, 255, .52) 0 2.2%, transparent 11%),
        radial-gradient(circle at 29% 47%, rgba(53, 142, 255, .14), transparent 17%),
        radial-gradient(circle at 72% 43%, rgba(153, 73, 255, .18), transparent 17%),
        linear-gradient(180deg, #020511 0%, #04091a 45%, #050a22 100%);
      isolation: isolate;
    }

    /* page reference grid: keeps the hero composition close to the design image */
    .stage {
      position: relative;
      width: min(100%, var(--page-w));
      min-height: var(--page-h);
      margin: 0 auto;
      padding: 38px 30px 0;
    }

    .star-layer,
    .star-layer::before,
    .star-layer::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: -10;
    }

    .star-layer {
      background-image:
        radial-gradient(circle, rgba(255,255,255,.95) 0 1px, transparent 1.7px),
        radial-gradient(circle, rgba(116,171,255,.7) 0 .8px, transparent 1.5px),
        radial-gradient(circle, rgba(190,93,255,.6) 0 .8px, transparent 1.4px);
      background-size: 96px 96px, 137px 137px, 181px 181px;
      background-position: 18px 12px, 44px 55px, 11px 22px;
      opacity: .58;
    }

    .star-layer::before {
      background-image:
        radial-gradient(circle, rgba(255,255,255,.44) 0 .9px, transparent 1.4px),
        radial-gradient(circle, rgba(91,132,255,.42) 0 .8px, transparent 1.3px);
      background-size: 52px 52px, 74px 74px;
      background-position: 8px 0, 37px 23px;
      opacity: .52;
    }

    .star-layer::after {
      background:
        radial-gradient(ellipse at 76% 7%, rgba(97, 103, 255, .42), transparent 18%),
        radial-gradient(ellipse at 78% 7%, rgba(186, 75, 255, .30), transparent 7%),
        radial-gradient(ellipse at 90% 45%, rgba(127, 75, 255, .24), transparent 10%);
      filter: blur(2px);
      opacity: .82;
    }

    header {
      height: 58px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 3;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 25px;
      font-weight: 760;
      letter-spacing: -0.045em;
      text-shadow: 0 0 18px rgba(255,255,255,.18);
    }

    .brand svg {
      width: 48px;
      height: 48px;
      filter: drop-shadow(0 0 14px rgba(101, 110, 255, .85));
      flex: 0 0 auto;
    }

    .login {
      width: 128px;
      height: 57px;
      border: 1px solid rgba(64, 134, 255, .78);
      border-radius: 14px;
      background: rgba(3, 10, 29, .58);
      color: white;
      font-size: 19px;
      font-weight: 720;
      letter-spacing: -.02em;
      box-shadow: inset 0 0 15px rgba(82, 137, 255, .08), 0 0 18px rgba(57, 119, 255, .16);
      backdrop-filter: blur(14px);
      cursor: pointer;
    }

    .hero {
      position: relative;
      z-index: 2;
      width: 100%;
      margin-top: 187px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    h1 {
      width: 940px;
      max-width: 100%;
      font-size: 88px;
      line-height: 1.05;
      font-weight: 880;
      letter-spacing: -0.067em;
      text-shadow: 0 7px 22px rgba(0,0,0,.52), 0 0 1px rgba(255,255,255,.55);
    }

    .line { display: block; }

    .gradient {
      display: inline-block;
      background: linear-gradient(90deg, #45bbff 0%, #5d95ff 33%, #846dff 67%, #bd55ff 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .dot { color: #a95cff; }

    .subtitle {
      margin-top: 28px;
      color: var(--muted);
      font-size: 24px;
      line-height: 1.55;
      font-weight: 500;
      letter-spacing: -0.037em;
      text-shadow: 0 2px 12px rgba(0,0,0,.46);
    }

    .search-shell {
      width: 880px;
      height: 122px;
      max-width: calc(100vw - 68px);
      margin-top: 59px;
      padding: 2px;
      border-radius: 28px;
      background: linear-gradient(90deg, rgba(90, 206, 255, .95), rgba(88, 129, 255, .82) 58%, rgba(181, 70, 255, .98));
      box-shadow:
        0 0 33px rgba(72, 177, 255, .43),
        0 0 42px rgba(172, 72, 255, .35),
        inset 0 0 17px rgba(255,255,255,.26);
    }

    .search-box {
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: 86px 1fr 254px;
      align-items: center;
      border-radius: 26px;
      overflow: hidden;
      background: rgba(3, 9, 27, .91);
      backdrop-filter: blur(18px);
      box-shadow: inset 0 0 34px rgba(60, 126, 255, .13);
    }

    .magnify {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .placeholder {
      text-align: left;
      color: rgba(255,255,255,.48);
      font-size: 22px;
      font-weight: 500;
      letter-spacing: -0.04em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cta {
      height: 108px;
      margin-right: 10px;
      border: 0;
      border-radius: 18px;
      background: linear-gradient(135deg, #4fb9ff 0%, #686bff 47%, #c155ff 100%);
      color: white;
      font-size: 21px;
      font-weight: 760;
      letter-spacing: -0.034em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      cursor: pointer;
      box-shadow: inset 0 0 20px rgba(255,255,255,.22), 0 14px 30px rgba(111, 85, 255, .28);
    }

    .cta svg { width: 34px; height: 34px; filter: drop-shadow(0 0 10px rgba(255,255,255,.4)); }

    .chips {
      width: 960px;
      max-width: calc(100vw - 60px);
      display: grid;
      grid-template-columns: 183px 174px 178px 203px 172px;
      gap: 14px;
      margin-top: 60px;
      align-items: center;
      justify-content: center;
    }

    .chip {
      height: 64px;
      border: 1px solid rgba(156, 178, 233, .22);
      border-radius: 999px;
      background: rgba(10, 17, 42, .64);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 11px;
      font-size: 15px;
      font-weight: 680;
      letter-spacing: -0.038em;
      box-shadow: inset 0 0 20px rgba(96, 116, 255, .07), 0 11px 27px rgba(0,0,0,.22);
      backdrop-filter: blur(16px);
      white-space: nowrap;
    }

    .chip svg {
      width: 34px;
      height: 34px;
      color: #9c50ff;
      filter: drop-shadow(0 0 11px rgba(142, 79, 255, .36));
      flex: 0 0 auto;
    }

    .earth {
      position: absolute;
      left: 50%;
      bottom: -178px;
      width: 1120px;
      height: 405px;
      transform: translateX(-50%);
      border-radius: 50% 50% 0 0 / 100% 100% 0 0;
      z-index: -2;
      overflow: hidden;
      background:
        radial-gradient(ellipse at 50% 1%, rgba(255,255,255,1) 0 2.7%, rgba(184,87,255,.84) 4.4%, transparent 9.4%),
        radial-gradient(ellipse at 50% 5%, rgba(72,158,255,.45), transparent 24%),
        radial-gradient(ellipse at 48% 32%, rgba(38, 80, 181, .96), rgba(8, 21, 61, .98) 55%, #020713 100%);
      box-shadow:
        0 -12px 28px rgba(76, 177, 255, .72),
        0 -4px 9px rgba(189, 78, 255, .90),
        inset 0 39px 78px rgba(94, 67, 255, .28);
    }

    .earth::before {
      content: "";
      position: absolute;
      left: 7%;
      right: 7%;
      top: 104px;
      height: 170px;
      opacity: .82;
      background-image:
        radial-gradient(circle, rgba(255, 177, 70, .98) 0 1.2px, transparent 1.75px),
        radial-gradient(circle, rgba(255, 217, 112, .75) 0 .9px, transparent 1.45px),
        linear-gradient(14deg, transparent 0 42%, rgba(255, 178, 68, .20) 43%, transparent 48% 100%),
        linear-gradient(-10deg, transparent 0 38%, rgba(255, 206, 88, .16) 39%, transparent 44% 100%);
      background-size: 33px 24px, 57px 42px, 360px 170px, 300px 140px;
      background-position: 3px 3px, 18px 11px, 25px 12px, 105px 23px;
      mask-image: radial-gradient(ellipse at 50% 0, black 0 53%, transparent 88%);
    }

    .earth::after {
      content: "";
      position: absolute;
      left: -1%;
      right: -1%;
      top: -4px;
      height: 41px;
      border-radius: 50%;
      background: linear-gradient(90deg, rgba(85, 198, 255, .95), rgba(99, 119, 255, .86) 50%, rgba(205, 83, 255, .9));
      filter: blur(2.8px);
      opacity: .95;
    }

    .bottom-glow {
      position: absolute;
      left: 50%;
      bottom: 114px;
      width: 360px;
      height: 230px;
      transform: translateX(-50%);
      background: radial-gradient(ellipse at center, rgba(255,255,255,.85) 0 4%, rgba(190,86,255,.58) 9%, rgba(83,137,255,.22) 31%, transparent 72%);
      filter: blur(12px);
      z-index: -1;
      pointer-events: none;
    }

    @media (max-width: 920px) {
      :root { --page-h: 1180px; }
      .stage { padding: 28px 22px 0; }
      .brand { font-size: 19px; gap: 10px; }
      .brand svg { width: 38px; height: 38px; }
      .login { width: 100px; height: 50px; font-size: 16px; }
      .hero { margin-top: 145px; }
      h1 { font-size: clamp(50px, 10.2vw, 78px); }
      .subtitle { font-size: 19px; margin-top: 22px; }
      .search-shell { margin-top: 42px; height: auto; }
      .search-box { grid-template-columns: 64px 1fr; grid-template-rows: 82px 76px; }
      .placeholder { font-size: 17px; padding-right: 16px; }
      .cta { grid-column: 1 / -1; height: 66px; margin: 0 9px 10px; font-size: 18px; }
      .chips { grid-template-columns: repeat(2, minmax(145px, 1fr)); gap: 12px; margin-top: 36px; }
      .chip { height: 58px; font-size: 14px; }
      .earth { width: 1080px; bottom: -210px; }
      .bottom-glow { bottom: 76px; }
    }
  </style>
</head>
<body>
  <div class="screen">
    <div class="stage">
      <div class="star-layer" aria-hidden="true"></div>
      <div class="bottom-glow" aria-hidden="true"></div>
      <div class="earth" aria-hidden="true"></div>

      <header>
        <div class="brand">
          <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 2L39.5 24.5L62 32L39.5 39.5L32 62L24.5 39.5L2 32L24.5 24.5L32 2Z" fill="url(#brandGradient)"/>
            <path d="M32 16.5L35.9 28.1L47.5 32L35.9 35.9L32 47.5L28.1 35.9L16.5 32L28.1 28.1L32 16.5Z" fill="white"/>
            <defs>
              <linearGradient id="brandGradient" x1="7" y1="7" x2="57" y2="57" gradientUnits="userSpaceOnUse">
                <stop stop-color="#59D4FF"/>
                <stop offset="0.45" stop-color="#736DFF"/>
                <stop offset="1" stop-color="#C24FFF"/>
              </linearGradient>
            </defs>
          </svg>
          <span>AI Tool Decision Assistant</span>
        </div>
        <button class="login">Log in</button>
      </header>

      <main class="hero">
        <h1>
          <span class="line">Make better</span>
          <span class="line gradient">AI tool decisions</span>
          <span class="line">for every task<span class="dot">.</span></span>
        </h1>

        <p class="subtitle">
          Describe what you want to do. We’ll show which<br />
          AI tools to use, which to skip, and how to get started.
        </p>

        <section class="search-shell" aria-label="Decision search">
          <div class="search-box">
            <div class="magnify" aria-hidden="true">
              <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="21" cy="21" r="13" stroke="currentColor" stroke-width="4"/>
                <path d="M31.5 31.5L41 41" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="placeholder">I want to create a product promo video for TikTok.</div>
            <button class="cta">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M32 5L38.1 25.9L59 32L38.1 38.1L32 59L25.9 38.1L5 32L25.9 25.9L32 5Z" fill="white"/>
              </svg>
              Get Decision
            </button>
          </div>
        </section>

        <nav class="chips" aria-label="Common tasks">
          <button class="chip">
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M5 12H27V26H5V12Z" stroke="currentColor" stroke-width="2.3"/><path d="M8 12L11 6M14 12L17 6M20 12L23 6" stroke="currentColor" stroke-width="2.3"/><path d="M14 16L20 19L14 22V16Z" fill="currentColor"/></svg>
            Product video
          </button>
          <button class="chip">
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M9 4H20L25 9V28H9V4Z" stroke="currentColor" stroke-width="2.3"/><path d="M20 4V10H26" stroke="currentColor" stroke-width="2.3"/><path d="M13 16H22M13 21H22" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/></svg>
            PDF to slides
          </button>
          <button class="chip">
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="5" y="7" width="22" height="19" rx="2" stroke="currentColor" stroke-width="2.3"/><path d="M5 13H27M12 13V26" stroke="currentColor" stroke-width="2.3"/><circle cx="10" cy="10" r="1.3" fill="currentColor"/><circle cx="15" cy="10" r="1.3" fill="currentColor"/></svg>
            Landing page
          </button>
          <button class="chip">
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="5" y="6" width="22" height="20" rx="3" stroke="currentColor" stroke-width="2.3"/><path d="M8.5 22L14 16.5L18 20.5L20.5 18L24 22" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="21" cy="12" r="2" fill="currentColor"/></svg>
            Instagram carousel
          </button>
          <button class="chip">
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="11" r="5" stroke="currentColor" stroke-width="2.3"/><path d="M7 27C7.7 21.8 11 19 16 19C21 19 24.3 21.8 25 27" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/></svg>
            AI avatar video
          </button>
        </nav>
      </main>
    </div>
  </div>
</body>
</html>
