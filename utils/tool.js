
const { promisify } = require('util');
const fs = require('fs');
const { store_url, USERID } = require('../config/config');
const makeDir = require('make-dir');
const writeFile = promisify(fs.writeFile);

/**
 * 自动执行n次异步函数
 * @param {*} asyncFunc
 * @param {*} n
 */
function loop(asyncFunc, n = 1){
  let i = 0;
  return async function _loop(...arg){
    await asyncFunc(...arg);
    i ++;
    if (i < n){
      await _loop(...arg);
    }
  }
}

/**
 * 获取页面中所有的用户说说链接
 * @param {} page
 */
function getPageUserHref(page) {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href^="http://user.qzone.qq.com/"]')).map(item => item.href + '/311').filter((item) => {
      return /http:\/\/user\.qzone\.qq\.com\/([1-9][0-9]{4,9})\/311/.test(item);
    })
  });
}


// function interceptResponse(page) {
//   return new Promise((r1, r2) => {
//     page.on('response', async (req) => {
//       const json = await req;
//       if (/^https\:\/\/mobile\.qzone\.qq\.com\/list\?/.test(json._url)){
//         const data = await json.json();
//         console.log(data);
//         r1(data);
//       }
//     })
//   })
// }
function interceptResponse(page, asyncCb) {
  page.on('response', async (req) => {
    const json = await req;
    if (/^https\:\/\/mobile\.qzone\.qq\.com\/list\?/.test(json._url)){
      const { data } = await json.json();
      if (data){
        const path = await makeDir(`${store_url}/${USERID}`);
        await writeFile(`${path}/${data.attach_info}.json`, JSON.stringify(data), 'utf8');
        const isOver = await page.$eval('.ui-loading.J_list_getmore.J_loading', e => e.innerText != '查看更多')
        if (isOver){
          await asyncCb();
        }else {
          await page.waitFor(300);
          await page.tap('.ui-loading.J_list_getmore.J_loading');
        }
      }else {
        console.log('访问受限');
        await asyncCb();
      }

    }
  })
}
module.exports = {
  getPageUserHref,
  interceptResponse
}
