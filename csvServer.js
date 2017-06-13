const request = require('request');
const csv = require('ya-csv');
const Promise = require('bluebird');
const mongoClient = Promise.promisifyAll(require('mongodb').MongoClient);
const app = require('express')();
const config = require('./config');
// temporary
const fs = require('fs');

let mongoDb;
mongoClient
  .connectAsync(config.mongoUrl)
  .then((db) => {
    mongoDb = db;
  })
  .then(() => {
    // fetchFromCvsToMongoDb();
    //setInterval(fetchFromCvsToMongoDb, config.readInterval);
    app.listen(config.httpPort, function() {
      console.log('Example app listening on port %s!', config.httpPort);
    });
  });


app.get(config.httpRoute, function(req, res) {
  let outFormat = (req.query.format &&
    req.query.format.toLocaleString() === 'json') ?
      'json' : 'csv';

  console.log(req.query);
  let dbQuery = getDbQueryFromHttp(req.query);

  console.log(mongoDb.collection(config.collectionName)
    .find({ YTM: 80.27 }));

  console.log(dbQuery);
});

fetchFromCvsToMongoDb = () => {

  //   const csvStream = request
//     .get({
//       url: config.csvFileUrl,
//       encoding: 'utf-8'
//     });

//const reader = new csv.CsvReader(csvStream, { columnsFromHeader: true });
  const reader = csv.createCsvFileReader(config.csvFileUrl, { columnsFromHeader: true });

  let tmpCol = mongoDb.collection(config.tmpCollectionName);
  let bulk = tmpCol.initializeUnorderedBulkOp();
  let counter = 0;
  let isRecordInserted = false;
  reader.on('data', (data) => {
    counter++;

    bulk.insert(parseCSV(data));
    isRecordInserted = true;
    //console.log(parseCSV(data));

    if (counter % config.bulkRecordsLimit === 0) {
      bulk.execute()
        .then(() => {
          console.log(`Inserted records: ${counter}`);
        })
        .catch((err) => {
          console.error(err);
        });

      isRecordInserted = false;
      bulk = mongoDb.collection.initializeUnorderedBulkOp();
    }
  });

  reader.on('end', function() {
    if (isRecordInserted) {
      bulk.execute()
        .then(() => {
          console.log(`Inserted records: ${counter}`);
        })
        .catch((err) => {
          console.error(err);
        });
    }
    console.log('.csv file end was reached');
    mongoDb.collection(config.collectionName)
      .rename(config.oldCollectionName, { dropTarget: true })
      .then(() => {
        mongoDb.collection(config.tmpCollectionName)
          .rename(config.collectionName, { dropTarget:true })
          .then(() => {
            return mongoDb.collection;
            // remove lock from server
          });
      });
  });
};

parseCSV = (data) => {
  return Object.assign({}, data, {
    _fico: parseInt(data['FICO End Range'].split('-').shift()),
    'Markup/Discount': parseFloat(data['Markup/Discount']),
    DaysSinceLastPayment: parseInt(data.DaysSinceLastPayment),
    NeverLate: data.NeverLate.toLowerCase() === 'true' ? true : false,
    YTM: parseFloat(data.YTM)
  })
};

getDbQueryFromHttp = (query) => {
  let dbQuery = {};

  if (query.status) {
    dbQuery['Status'] = query.status;
  }

  //TODO: FICO End Range

  if (query.loan_maturity) {
    dbQuery['Loan Maturity'] = query.loan_maturity;
  }

  if (query.credit_score_trend) {
    dbQuery['CreditScoreTrend'] = query.credit_score_trend;
  }

  if (query.markup_discount) {
    dbQuery['Markup/Discount'] = parseFloat(query.markup_discount);
  }

  if (query.days_since_last_payment) {
    dbQuery['DaysSinceLastPayment'] = parseInt(query.days_since_last_payment);
  }

  if (query.never_late &&
    query.never_late.toLowerCase() === 'true') {
    dbQuery['NeverLate'] = true;
  }

  if (query.ytm) {
    dbQuery['YTM'] = parseFloat(query.ytm);
  }

  return dbQuery;
};