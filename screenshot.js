const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 960, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: '/tmp/v2-dashboard.png' });

  await page.click('#nav-activity');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: '/tmp/v2-transactions.png' });

  await page.evaluate(() => switchScreen('send'));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: '/tmp/v2-send.png' });

  await page.click('#nav-cards');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: '/tmp/v2-cards.png' });

  await browser.close();
  console.log('done');
})();
