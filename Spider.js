const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const { promisify } = require('util');
const fs = require('fs');
const makeDir = require('make-dir');
const writeFile = promisify(fs.writeFile);
const iPhone = devices['iPhone 6'];


function SpiderBuilder(browser) {
  return class Spider {
    constructor(taskConfig){
      this._init(taskConfig);
      this.uid = [];
    }
    async _init(taskConfig){
      const { cookies } = taskConfig;
      const page = this.page = await browser.newPage();
      await page.emulate(iPhone);
      await page.setCookie(...cookies);
    }
    async searchUid(){
      this.uid = await this.onceTask(async (json) => {
        if (/^https:\/\/mobile\.qzone\.qq\.com\/friend\/mfriend_list?/.test(json._url)){
          const data = await json.json();
          console.log(data);
          return data;
        }
      });
    }
    onceTask(asyncCallback) {
      return new Promise((r1, r2) => {
        this.page.on('response', async (req) => {
          const json = await req;
          return asyncCallback(json);
        })
      })
    }
    async beginTask(taskUrl, asyncTaskCallback){
      const { page } = this;
      await page.goto(taskUrl);
      page.on('response', async (req) => {
        const json = await req;
        const isOver = await asyncTaskCallback(json);
        if (isOver){

        }else {

        }
      })
    }
  }
}
