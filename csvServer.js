const request = require('request');
const csv = require('ya-csv');
const Promise = require('bluebird');
const mongoClient = Promise.promisifyAll(require('mongodb').MongoClient);
const app = require('express')();
const config = require('./config');
// temporary
const fs = require('fs');

let is

let mongoDb;
mongoClient
  .connectAsync(config.mongoUrl)
  .then((db) => {
    mongoDb = db;
  })
  .then(() => {
    fetchFromCvsToMongoDb();
    //setInterval(fetchFromCvsToMongoDb, config.readInterval);
    // app.listen(config.port, function() {
    //   console.log('Example app listening on port %s!', config.port);
    // });
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

    bulk.insert(parse(data));
    isRecordInserted = true;
    console.log(parse(data));

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
    mongoDb.collection(config.tmpCollectionName)
      .rename(config.collectionName, true)
      .then(() => {
        console.log('!!!!!')
      });
  });

// bulk.execute()
//   .then(() => {
//     console.log('Ok');
//   })
//   .catch((err) => {
//     console.error(err);
//   });


};

parse = (data) => {
  return Object.assign({}, data, {
    _fico: parseInt(data['FICO End Range'].split('-').shift()),
    'Markup/Discount': parseFloat(data['Markup/Discount']),
    DaysSinceLastPayment: parseInt(data.DaysSinceLastPayment),
    NeverLate: data.NeverLate.toLowerCase() === 'true' ? true : false,
    YTM: parseFloat(data.YTM)
  })
};


//setInterval(fetchFromCvsToMongoDb, config.readInterval);
// fetchFromCvsToMongoDb();

app.get('/', function(req, res) {
  console.log(req.body);
});
