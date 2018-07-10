// 这个代码是之前以为登录成功后访问接口返回not found的原因是没有sf_remember这个cookie，然后费劲心思拿到的sf_remember
// 无意间发现删除sr_remember这个cookie，过一会浏览器会自动访问这个接口,并且会返回set-cookie还包含sf_remember

// 最终才发现不是fs_remember的问题，只是因为没有设置header，加上之前文章的影响，我就一直把问题往这个上靠，浪费一天时间，sb了
// 目前还不知道这个参数的作用和具体来源
// 虽然现在用不到，但是还是先留着，万一以后用得着
const superagent = require('superagent')
const async = require('async')
const getRandom = require('./getRandom')
let random = ''
let cookie = ''
let header = {}
let fsRemember = ''
async.series([
  (cb) => {
    superagent
      .get('https://segmentfault.com')
      .end((err, res) => {
        if (err) console.log(err)
        cookie = res.headers['set-cookie'].join(',').split(';')[0]
        random = getRandom.getRandom(res.text)
        header = {
          'accept': '*/*',
          'accept-encoding': 'gzip, deflate, br',
          'accept-language': 'zh-CN,zh;q=0.9',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'cookie': `PHPSESSID=${cookie};`,
          'origin': 'https://segmentfault.com',
          'referer': 'https://segmentfault.com/',
          'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
          'x-requested-with': 'XMLHttpRequest'
        }
        cb(null)
      })
  },
  (cb) => {
    const username = process.argv[2]
    const password = process.argv[3]
    console.log(cookie)
    console.log(random)
    superagent
      .post(`https://segmentfault.com/api/user/login`)
      .query({'_': random})
      .set(header)
      .type('form')
      .send({
        username: username,
        password: password,
        remember: 1
      })
      .end(function(err, res) {
        if (err) {
          console.log(err.status);
        } else {
          console.log('返回cookie： ' +  res.cookies)
          console.log('返回状态码： ' +  res.status)
          cb(null)
        }
      })
  },
  (cb) => {
   // 拿到sf_remember
    superagent
      .get('https://segmentfault.com/api/activity/index/recommend')
      .query({'_': random})
      .set(header)
      .end((err, res) => {
        if (err) throw err
        console.log(res.headers)
        fsRemember = res.headers['set-cookie'][0]
        console.log(res.headers['set-cookie'][0])
      })
    cb(null, fsRemember)
  },
  (cb) => {
    superagent
    // 编辑右上角个人说明
      .post('https://segmentfault.com/api/user/homepage/description/edit')
      .query({'_': random})
      .set(header)
      .set({'cookie': `PHPSESSID=${cookie};sf_remember=${fsRemember}`})
      .type('form')
      .send({
        description: '努力coding的喵~~~'
      })
      .end((err, res) => {
        if(err) throw err
        if (res.status === 200) {
          console.log('编辑成功：' + res.status)
        } else {
          console.log('编辑失败：' + res.text)
        }
      })
    cb(null, 1)
  }
])