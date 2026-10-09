import { chromium } from 'playwright';
const origin = 'http://localhost:8791/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(origin, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const shell = page.locator('.spotify-surface');
const button = name => shell.getByRole('button', { name, exact: true });

await button('Player settings').click();
await page.getByLabel('Player style', { exact: true }).selectOption('blue-dap');
await page.locator('[data-style=blue-dap]').waitFor();
await page.keyboard.press('Escape');
await page.waitForTimeout(200);

// on mode at 340
await shell.screenshot({ path: '/tmp/dap-el-on-340.png' });
console.log('el on 340');

// off mode
await button('Player settings').click();
await page.getByRole('radio', { name: 'Transport only', exact: true }).click();
await page.waitForTimeout(150);
await shell.screenshot({ path: '/tmp/dap-el-off-340.png' });
console.log('el off 340');

// mini
await button('Player settings').click();
await page.getByRole('radio', { name: 'Compact mini', exact: true }).click();
await page.waitForTimeout(150);
await shell.screenshot({ path: '/tmp/dap-el-mini-340.png' });
console.log('el mini 340');

// back to on, narrow width 234
await button('Player settings').click();
await page.getByRole('radio', { name: 'Full player', exact: true }).click();
await page.keyboard.press('Escape');
await page.locator('.product').evaluate(e => e.style.width = '234px');
await page.waitForTimeout(300);
await shell.screenshot({ path: '/tmp/dap-el-on-234.png' });
console.log('el on 234');

await browser.close();
