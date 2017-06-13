const request = require('request');
const csv = require('ya-csv');
const Promise = require('bluebird');
const mongoClient = Promise.promisifyAll(require('mongodb').MongoClient);
const app = require('express')();
const config = require('./config');
// temporary
const fs = require('fs');

setInterval(fetchFromCvsToMongoDb, config.readInterval);

fetchFromCvsToMongoDb = () => {
  const csvStream = request
    .get({
      url: config.csvFileUrl,
      encoding: 'utf-8'
    });

//const reader = new csv.CsvReader(csvStream, { columnsFromHeader: true });
  const reader = csv.createCsvFileReader(config.csvFileUrl, { columnsFromHeader: true });

//let bulk = col.initializeUnorderedBulkOp();
  let counter = 0;
  reader.on('data', (data) => {
    counter++;
    console.log(data);
    // bulk.insert(data);
    //
    // if (counter % config.bulkRecordsLimit === 0) {
    //   bulk.execute();
    //   counter = 0;
    //   bulk = db.collection.initializeUnorderedBulkOp();
    // }
  });

  reader.on('end', function() {
    console.log('reader.end()');
    //db.tmpCollectionName.renameCollection(collectionName, true);
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

app.get('/', function(req, res) {
  console.log(req.body);
});
