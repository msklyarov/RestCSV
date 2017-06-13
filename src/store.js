'use strict'

const Promise = require('bluebird')

module.exports = function (options = {})  {
  const config = options.config
  const mongo = options.mongo || require('mongodb')
  const EventEmitter = options.EventEmitter || require('events')

  const mongoClient = mongo.MongoClient
  Promise.promisifyAll(mongoClient)

  class Store extends EventEmitter {
    async init() {
      this._db = await mongoClient.connectAsync(config.db.url)
      this._col = this._db.collection(config.db.tmpCollectionName)
      this._col.createIndex({Status: 1})
      this._col.createIndex({_fico: 1})
      this._col.createIndex({'Loan Maturity': 1})
      this._col.createIndex({CreditScoreTrend: 1})
      this._col.createIndex({'Markup/Discount': 1})
      this._col.createIndex({DaysSinceLastPayment: 1})
      this._col.createIndex({NeverLate: 1})
      this._col.createIndex({YTM: 1})
      this._in = this._db.collection(config.db.workingCollectionName)
      this._createNewBulk()
    }

    _createNewBulk () {
      this._bulk = this._col.initializeUnorderedBulkOp()
      this._recordsInserted = 0
    }

    insert (data) {
      if (this._error) {
        return
      }

      this._bulk.insert(data)
      this._recordsInserted++
      if (this._recordsInserted >= config.db.bulkRecordsLimit) {
        this._executeBulk()
      }
    }

    async _executeBulk () {
      const inserted = this._recordsInserted
      console.log(`Comitting ${inserted} records`)
      const bulk = this._bulk
      this._createNewBulk()
      try {
        console.log(`Inserted records: ${inserted}`);
        await bulk.execute()
      } catch (e) {
        this._error = e
      }
    }

    async commit () {
      if (this._error) {
        throw this._error
      }

      if (this._recordsInserted) {
        await this._executeBulk()
        if (this._error) {
          throw this._error
        }
      }

      console.log('Swap DB collections')
      this.emit('updating_db')
      try {
        await this._db.collection(config.db.workingCollectionName)
          .rename(config.db.oldCollectionName, { dropTarget: true })
        console.log('Moved to old')
      } catch (e) {
        if (e instanceof mongo.MongoError && e.code === 26) {
          console.log('First iteration')
        } else {
          throw e // rethrow
        }
      }

      await this._db.collection(config.db.tmpCollectionName)
        .rename(config.db.workingCollectionName, { dropTarget:true })
      this.emit('db_updated')
      console.log('All done')
    }

    async dismiss () {
      delete this._error
      this._createNewBulk()
      return Promise.promisify(this._db.close, {context: this._db})()
    }
  }

  return Store
}
