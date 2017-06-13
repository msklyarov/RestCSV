const config = require('../config1')

const Web = require('../src/web')({
  config
})
const web = new Web()
web.init()
