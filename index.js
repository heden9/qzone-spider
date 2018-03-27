const puppeteer = require('puppeteer');
const { getPageUserHref, interceptResponse } = require('./utils/tool');
const { USERID, m_url } = require('./config/config');
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];


async function init(browser) {
  const page = await browser.newPage();
  await page.emulate(iPhone);
  await page.setCookie(...require('./config/wbj'));
  await page.goto(m_url);
  return page;
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await init(browser);
  interceptResponse(page, async () => {
    await browser.close();
    console.log('正在退出...');
    process.exit();
  });

})()
