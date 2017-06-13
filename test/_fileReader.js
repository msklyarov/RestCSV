module.exports = function (options = {}) {
  const config = options.config
  const csv = options.csv || require('ya-csv')
  const EventEmitter = options.EventEmitter || require('events')

  class Downloader extends EventEmitter {
    constructor () {
      super()
    }

    start () {
      const csvReader = csv.createCsvFileReader(config.path, { columnsFromHeader: true });
      csvReader.on('data', this.emit.bind(this, 'data'))
      csvReader.on('error', this.emit.bind(this, 'error'))
      csvReader.on('end', this.emit.bind(this, 'end'))
    }
  }

  return Downloader
}
