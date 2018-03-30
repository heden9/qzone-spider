const path = require('path');
const USERID = '1003986591';
module.exports = {
  store_url: path.resolve(__dirname, '../store'),
  USERID,
  m_url: `https://h5.qzone.qq.com/mqzone/profile#${USERID}/friend`,
  s_url: (id) => `https://user.qzone.qq.com/${id}/311`,
  config_url: path.resolve(__dirname, '../config/user.json')
}
