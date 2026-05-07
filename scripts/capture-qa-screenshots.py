import asyncio
import shutil
import subprocess
import sys
import time
from pathlib import Path
from urllib.request import urlopen

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'qa-screenshots-v2'
PORT = 3118
BASE = f'http://127.0.0.1:{PORT}'

def wait_for_server():
    deadline = time.time() + 45
    while time.time() < deadline:
        try:
            with urlopen(BASE + '/api/health', timeout=2) as response:
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

async def capture_page(browser, filename, path, viewport, wait_text=None):
    page = await browser.new_page(viewport={'width': viewport['width'], 'height': viewport['height']}, is_mobile=viewport.get('is_mobile', False))
    await page.goto(BASE + path, wait_until='domcontentloaded')
    await page.wait_for_load_state('networkidle')
    if wait_text:
        await page.get_by_text(wait_text, exact=False).first.wait_for(timeout=15000)
    await page.screenshot(path=str(OUT / filename), full_page=True)
    await page.close()

async def capture_copilot_full(browser):
    page = await browser.new_page(viewport={'width': 1440, 'height': 1200})
    start = await page.request.post(BASE + '/api/copilot/start', data={'input': '我有一个毕业设计，想用 AI 帮我剪辑展示视频。'})
    started = await start.json()
    session_id = started['sessionId']

    await page.goto(BASE + f'/copilot?sessionId={session_id}', wait_until='domcontentloaded')
    await page.wait_for_load_state('networkidle')
    await page.get_by_text('基础够用方案', exact=False).first.wait_for(timeout=15000)
    await page.screenshot(path=str(OUT / 'copilot-initial-desktop.png'), full_page=True)

    await page.request.post(BASE + '/api/copilot/option', data={'sessionId': session_id, 'optionKey': 'professional'})
    await page.goto(BASE + f'/copilot?sessionId={session_id}', wait_until='domcontentloaded')
    await page.wait_for_load_state('networkidle')
    await page.get_by_text('Canva', exact=False).first.wait_for(timeout=15000)
    await page.screenshot(path=str(OUT / 'copilot-professional-desktop.png'), full_page=True)

    await page.request.post(BASE + '/api/copilot/generate-full-plan', data={'sessionId': session_id})
    await page.goto(BASE + f'/copilot?sessionId={session_id}', wait_until='domcontentloaded')
    await page.wait_for_load_state('networkidle')
    await page.get_by_text('执行步骤', exact=False).first.wait_for(timeout=15000)
    await page.screenshot(path=str(OUT / 'copilot-full-plan-desktop.png'), full_page=True)
    await page.close()

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
            await capture_page(browser, 'home-desktop.png', '/', {'width': 1440, 'height': 1000}, 'Get a simple')
            await capture_page(browser, 'home-mobile.png', '/', {'width': 390, 'height': 900, 'is_mobile': True}, 'Get a simple')
            await capture_copilot_full(browser)
            await capture_page(browser, 'archive-empty-desktop.png', '/archive', {'width': 1440, 'height': 1000}, 'Saved workflow archive')
            await browser.close()
    finally:
        stop(proc)

asyncio.run(capture())
print('Captured screenshots:')
for filename in [
    'home-desktop.png',
    'home-mobile.png',
    'copilot-initial-desktop.png',
    'copilot-professional-desktop.png',
    'copilot-full-plan-desktop.png',
    'archive-empty-desktop.png',
]:
    print(f'- docs/qa-screenshots-v2/{filename}')

