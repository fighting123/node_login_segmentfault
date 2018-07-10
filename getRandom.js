var cheerio = require('cheerio')
function getRandom(s) {
  let $ = cheerio.load(s)
  let script = $('script').eq(8).html()
  let fn = new Function('window', script + ';return window.SF.token')
  let token = fn({})
  $ = null
  return token
}

exports.getRandom = getRandom