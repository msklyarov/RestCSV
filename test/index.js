const config = require('../config1')
config.updater.interval = 15*1000
config.db.bulkRecordsLimit = 2

const FileReader = require('./_fileReader.js')({
  config: {
    path: './1.csv'
  }
})

const DbUpdater = require('../src/dbUpdater')({
  config,
  Downloader: FileReader
})

const updater = new DbUpdater()
updater.on('updating_db', () => {
  console.log('updating_db')
})
updater.on('db_updated', () => {
  console.log('db_updated')
})

updater.init()
