const superagent = require('superagent')
const async = require('async')
const getRandom = require('./getRandom')
let random = ''
let cookie = ''
let header = {}
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
          console.log('返回状态码： ' +  res.status)
          cb(null)
        }
      })
  },
  (cb) => {
    superagent
      // 编辑右上角个人说明
      .post('https://segmentfault.com/api/user/homepage/description/edit')
      .query({'_': random})
      .set(header)
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