const config = require('../config')

const Downloader = require('./downloader')({
  config
})

const DbUpdater = require('./dbUpdater')({
  config
})

const Web = require('./web')({
  config
})

const updater = new DbUpdater()
const web = new Web()

updater.init()
web.init()
