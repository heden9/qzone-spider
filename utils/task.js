function onceTask(page, asyncCallback) {
  return new Promise((r1, r2) => {
    page.on('response', async (req) => {
      const json = await req;
      const res = await asyncCallback(json);
      if (res !== undefined){
        r1(res);
      }
    })
  })
}

function uidToMap(data) {
  const map = data.reduce((_map, item) => {
    if (!_map.get(item.uin)){
      _map.set(item.uin, 0);
    }
    return _map;
  }, new Map());
  return map;
}

function dataReducer({ vFeeds=[]}) {
  return vFeeds.map(item => ({
    comment: item.comment && item.comment,
    like: item.like && item.like.num,
    summary: item.summary && item.summary.summary,
    timeline: item.timeline && item.timeline.timestr,
    nickname: item.userinfo.user.nickname
  }))
}

async function loop2(asyncFunc, arr) {
  for(const i of arr){
    await asyncFunc(i);
  }
  console.log('done');
}
module.exports = {
  onceTask,
  uidToMap,
  loop: loop2,
  dataReducer
}
