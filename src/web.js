const Promise = require('bluebird')
const app = require('express')()
const json2csv = require('json2csv')
const Err = require('./error')

module.exports = function (options = {}) {
  const config = options.config
  const Store = options.Store || require('./store')({
    config
  })

  const fieldColumns = [
    'LoanId',
    'NoteId',
    'OrderId',
    'OutstandingPrincipal',
    'AccruedInterest',
    'Status',
    'AskPrice',
    'Markup/Discount',
    'YTM',
    'DaysSinceLastPayment',
    'CreditScoreTrend',
    'FICO End Range',
    'Date/Time Listed',
    'NeverLate',
    'Loan Class',
    'Loan Maturity',
    'Original Note Amount',
    'Interest Rate',
    'Remaining Payments',
    'Principal + Interest',
    'Application Type'
  ]

  class Web {
    constructor () {
      this._store = new Store()
    }

    async init () {
      await this._store.init()
      return new Promise ((resolve, reject) => {
        app.get(config.server.route, this._handleRoute.bind(this))
        app.listen(config.server.port, function() {
          console.log(`Listening on port ${config.server.port}`);
          resolve()
        })
      })
    }

    static ToJson (data) {
      return JSON.stringify(data)
    }

    static ToCsv (data) {
      return json2csv({ data: data, fields: fieldColumns })
    }

    async _handleRoute (req, res) {
      const formatter = req.query.format && req.query.format.toLowerCase() === 'json' ? Web.ToJson : Web.ToCsv
      try {
        const dbQuery = Web.DbQueryFromReq(req.query)
        const result = await this._store.get(dbQuery)
        console.log('done', result.length)
        res.send(formatter(result)).status(200)
      } catch (e) {
        if (e instanceof Err.TooManyRows) {
          res.send('Too many rows returned, please refine your search').status(400)
          return
        }
        console.error(e)
        res.sendStatus(500)
      }
    }

    static DbQueryFromReq (query) {
      let dbQuery = {};

      if (query['Status']) {
        dbQuery['Status'] = query['Status'];
      }

      if (query['Loan Maturity']) {
        dbQuery['Loan Maturity'] = query['Loan Maturity'];
      }

      if (query['CreditScoreTrend']) {
        dbQuery['CreditScoreTrend'] = query['CreditScoreTrend'];
      }

      if (query['Markup/Discount']) {
        dbQuery['Markup/Discount'] = {
          $lt: parseFloat(query['Markup/Discount'])
        }
      }

      if (query['DaysSinceLastPayment']) {
        dbQuery['DaysSinceLastPayment'] = {
          $lt: parseInt(query['DaysSinceLastPayment'])
        }
      }

      if (query['NeverLate'] && query['NeverLate'].toLowerCase() === 'true') {
        dbQuery['NeverLate'] = true;
      }

      if (query['YTM']) {
        dbQuery['YTM'] = {
          $gt: parseFloat(query['YTM'])
        }
      }

      if (query['FICO End Range']) {
        const ficoMatch = query['FICO End Range'].match(/(>=|<=)(\d+)/)
        if (ficoMatch) {
          const op = ficoMatch[1] === '<=' ? '$lte' : '$gte'
          const val = parseInt(ficoMatch[2])
          dbQuery['_fico'] = {
            [op]: val
          }
        }
      }

      return dbQuery;
    }
  }

  return Web
}
