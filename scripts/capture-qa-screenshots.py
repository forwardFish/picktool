import asyncio
import shutil
import subprocess
import sys
import time
from pathlib import Path
from urllib.request import urlopen

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'qa-screenshots'
PORT = 3118
BASE = f'http://127.0.0.1:{PORT}'
ROUTES = [
    ('home-desktop.png', '/', {'width': 1440, 'height': 1000}),
    ('home-mobile.png', '/', {'width': 390, 'height': 900, 'is_mobile': True}),
    ('result-desktop.png', '/results?task=I%20want%20to%20create%20a%20product%20promo%20video%20for%20TikTok.', {'width': 1440, 'height': 1100}),
    ('result-mobile.png', '/results?task=I%20want%20to%20create%20a%20product%20promo%20video%20for%20TikTok.', {'width': 390, 'height': 1000, 'is_mobile': True}),
    ('tool-capcut-desktop.png', '/tools/capcut', {'width': 1440, 'height': 1100}),
    ('setup-tiktok-desktop.png', '/setups/tiktok-product-promo-video', {'width': 1440, 'height': 1100}),
]

def wait_for_server():
    deadline = time.time() + 45
    while time.time() < deadline:
        try:
            with urlopen(BASE + '/', timeout=2) as response:
                if response.status == 200:
                    return
        except Exception:
            time.sleep(1)
    raise RuntimeError('Next server did not become ready')

def stop(proc):
    if proc.poll() is not None:
        return
    if sys.platform.startswith('win'):
        subprocess.run(['taskkill', '/pid', str(proc.pid), '/t', '/f'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        proc.terminate()

async def capture():
    OUT.mkdir(parents=True, exist_ok=True)
    pnpm = shutil.which('pnpm') or shutil.which('pnpm.cmd')
    if not pnpm:
        raise RuntimeError('pnpm command not found')

    proc = subprocess.Popen(
        [pnpm, 'exec', 'next', 'start', '-p', str(PORT), '-H', '127.0.0.1'],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    try:
        wait_for_server()
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            for filename, path, viewport in ROUTES:
                page = await browser.new_page(viewport={'width': viewport['width'], 'height': viewport['height']}, is_mobile=viewport.get('is_mobile', False))
                await page.goto(BASE + path, wait_until='domcontentloaded')
                await page.wait_for_load_state('networkidle')
                await page.wait_for_function("document.styleSheets.length > 0 && getComputedStyle(document.body).fontFamily.includes('Arial')", timeout=10000)
                await page.screenshot(path=str(OUT / filename), full_page=True)
                await page.close()
            await browser.close()
    finally:
        stop(proc)

asyncio.run(capture())
print('Captured screenshots:')
for item in ROUTES:
    print(f'- docs/qa-screenshots/{item[0]}')
