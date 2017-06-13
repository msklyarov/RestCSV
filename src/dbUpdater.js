'use strict'

const Promise = require('bluebird')

module.exports = function (options = {}) {
  const config = options.config
  const EventEmitter = options.EventEmitter || require('events')
  const Downloader = options.Downloader || require('./downloader')({
    config
  })
  const Store = options.Store || require('./store')({
    config
  })

  class DbUpdater extends EventEmitter {
    init() {
      this._schedule(0) // update right now
    }

    dismiss () {
      if (this._timer) {
        clearTimeout(this._timer)
        this._timer = undefined
      }
    }

    _schedule (delay) {
      console.log(`Next upate scheduled in ${Math.round(delay / 1000)}sec.`)
      this._timer = setTimeout(this._tick.bind(this), delay)
    }

    static ParseCSV (data) {
      return Object.assign({}, data, {
        _fico: parseInt(data['FICO End Range'].split('-').shift()),
        'Markup/Discount': parseFloat(data['Markup/Discount']),
        DaysSinceLastPayment: parseInt(data.DaysSinceLastPayment),
        NeverLate: data.NeverLate.toLowerCase() === 'true' ? true : false,
        YTM: parseFloat(data.YTM)
      })
    }

    async _tick () {
      this._timer = undefined
      const updateStarted = (new Date()).getTime()
      try {

        const downloader = new Downloader()
        const store = new Store()

        store.on('updating_db', this.emit.bind(this, 'updating_db'))
        store.on('db_updated', this.emit.bind(this, 'db_updated'))

        await store.init()
        downloader.on('data', data => store.insert(DbUpdater.ParseCSV(data)))

        const update = new Promise((resolve, reject) => {
          downloader.once('end', async function () {
            try {
              await store.commit()
              await store.dismiss()
              resolve()
            } catch (e) {
              reject(e)
            }
          })

          downloader.once('error', async function (err) {
            await store.dismiss()
            reject(err)
          })
        })

        downloader.start()
        await update
      } catch (e) {
        console.error(`Update failed: ${e.message}`)
        console.error(e)
      }

      const updateFinished = (new Date()).getTime()
      const diff = Math.max(updateFinished - updateStarted, 0) // prevent negative values which can occur due to time shift
      const delay = Math.max(config.updater.interval - diff, 0) // how much time remained from 10 minutes interval
      this._schedule(delay)
    }
  }

  return DbUpdater
}
