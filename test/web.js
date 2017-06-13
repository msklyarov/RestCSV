const config = require('../config')

const Web = require('../src/web')({
  config
})
const web = new Web()
web.init()
