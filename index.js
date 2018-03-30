const puppeteer = require('puppeteer')
const { SpiderBuilder } = require('./Spider');
const { m_url, config_url } = require('./config/config');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const Spider = SpiderBuilder(browser);
  const oneTask = new Spider();
  await oneTask._init({
    cookies: require(config_url)
  });
  await oneTask.searchUid(m_url);
  await oneTask.mapUidToSearch();
})()
