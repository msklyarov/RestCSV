'use strict'

module.exports = function (options = {}) {
  const config = options.config
  const request = options.request || require('request')
  const EventEmitter = options.EventEmitter || require('events')
  const csv = options.csv || require('ya-csv')

  class Downloader extends EventEmitter {
    start () {
      const downloadOptions = {
        url: config.source.url,
        encoding: config.source.encoding
      }

      const webStream = request.get(downloadOptions)
      const csvReader = new csv.CsvReader(webStream, { columnsFromHeader: true })
      csvReader.on('data', this.emit.bind(this, 'data'))
      csvReader.on('error', this.emit.bind(this, 'error'))
      csvReader.on('end', this.emit.bind(this, 'end'))
    }
  }

  return Downloader
}
