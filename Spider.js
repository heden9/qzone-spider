const devices = require('puppeteer/DeviceDescriptors');
const schedule = require('node-schedule');
const { promisify } = require('util');
const fs = require('fs');
const makeDir = require('make-dir');
const writeFile = promisify(fs.writeFile);
const iPhone = devices['iPhone 6'];
const { onceTask, uidToMap } = require('./utils/task');
const { store_url, s_url, config_url } = require('./config/config');

function SpiderBuilder(browser) {
  return class Spider {
    constructor(taskConfig){
      this.uid = new Map();
      this.page = null;
      this.currentUid = null;
      this.event = null;
      this.recordLength = 0;
      this.findTaskPage = this.findTaskPage.bind(this);
      this.recurrenceRule = this.recurrenceRule.bind(this);
    }
    async updateCookies(){
      const res = await this.page.cookies();
      console.log(res);
      if (res.length !== 0){
        await writeFile(config_url, JSON.stringify(res), 'utf8');
      }else {
        console.log('cookies is empty!');
      }
    }
    recurrenceRule(){
      this.event = schedule.scheduleJob("*/5 * * * *", () => {
        console.log('update cookies!');
        this.updateCookies();
      });
    }
    async _init(taskConfig = {}){
      const { cookies = [] } = taskConfig;
      const page = this.page = await browser.newPage();
      await page.emulate(iPhone);
      await page.setCookie(...cookies);
      this.recurrenceRule();
    }
    async searchUid(m_url){
      await this.page.goto(m_url);
      this.uid = await onceTask(this.page, async (json) => {
        if (/^https:\/\/mobile\.qzone\.qq\.com\/friend\/mfriend_list?/.test(json._url)){
          const { data } = await json.json();
          console.log(data);
          return uidToMap(data.list);
        }
      });
      console.log(this.uid);
    }
    async pageGoUid ({ value: uid, done }){
      if (done){
        await browser.close();
        console.log(`收录完毕，共${this.recordLength}条记录。`);
        process.exit();
      }
      this.currentUid = uid;
      await this.page.goto(s_url(uid));
    }
    async hahha (){
      const keys = this.uid.keys();
      await this.pageGoUid(keys.next())
      const page = this.page;
      let timer;
      page.on('response', async (req) => {
        const json = await req;
        if (/^https\:\/\/mobile\.qzone\.qq\.com\/list\?/.test(json._url)){
          const { data } = await json.json();
          clearTimeout(timer);
          if (data){
            const path = await makeDir(`${store_url}/${this.currentUid}`);
            this.recordLength += data.vFeeds.length;
            await writeFile(`${path}/${data.attach_info}.json`, JSON.stringify((data)), 'utf8');
            let isOver = false;
            try {
              isOver = await page.$eval('.ui-loading.J_list_getmore.J_loading', e => e.innerText != '查看更多');
            }catch(e){
              console.warn(e);
              isOver = true;
            }
            if (isOver){
              await this.pageGoUid(keys.next());
            }else {
              await page.waitFor(100);
              await page.tap('.ui-loading.J_list_getmore.J_loading');
              timer = setTimeout(async () => {
                await this.pageGoUid(keys.next());
              }, 3000); // 三秒超时，防止点了之后没反应的情况
            }
          }else {
            console.log('访问受限');
            await this.pageGoUid(keys.next());
          }
        }
      })
    }
    async findTaskPage(uid){
      const page = this.page;
      const keys = this.uid.keys();
      await this.hahha(keys);
    }
    mapUidToSearch() {
      this.hahha();
    }
  }
}

module.exports = {
  SpiderBuilder
}
