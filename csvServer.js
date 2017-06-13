const request = require('request');
const csv = require('ya-csv');
const Promise = require('bluebird');
const mongoClient = Promise.promisifyAll(require('mongodb').MongoClient);
const config = require('./config');
const app = require('express')();

// const strm = request
//   .get({
//     url: 'https://resources.lendingclub.com/SecondaryMarketAllNotes.csv',
//     encoding: 'utf-8'
//   });

// temporary
const fs = require('fs');

//const reader = new csv.CsvReader(strm, {columnsFromHeader: true});
const reader = csv.createCsvFileReader(config.csvFileUrl, {columnsFromHeader: true});

let firstLine = true;
//let bulk = col.initializeUnorderedBulkOp();
let counter = 0;
reader.on('data', (data) => {
  if (firstLine) {
    firstLine = false;
  } else {
    counter++;
    console.log(data);
    // bulk.insert(data);
    //
    // if (counter % config.bulkRecordsLimit === 0) {
    //   bulk.execute();
    //   counter = 0;
    //   bulk = db.collection.initializeUnorderedBulkOp();
    // }
  }
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

insertFromCvsToMongoDb = (tmpCollectionName, collectionName) => {
  // logic here


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
