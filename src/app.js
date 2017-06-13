const config = require('../config1')

const Downloader = require('./downloader')({
  config
})

const DbUpdater = require('./dbUpdater')({
  config
})

const updater = new DbUpdater()
updater.init()
