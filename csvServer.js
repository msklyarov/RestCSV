const csv = require('ya-csv');
const config = require('./config');
const Promise = require('bluebird');
const mongoClient = Promise.promisifyAll(require('mongodb').MongoClient);

// temporary
const fs = require('fs');
const reader = csv.createCsvFileReader(config.csvFileUrl);

let firstLine = true;
let bulk = col.initializeUnorderedBulkOp();
let counter = 0;
reader.addListener('data', (data) => {
  if (firstLine) {
    firstLine = false;
  } else {
    counter++;
    console.log(getStructureFromCsvRecord(data));
    bulk.insert(getStructureFromCsvRecord(data));

    if (counter % config.bulkRecordsLimit === 0) {
      bulk.execute();
      counter = 0;
      bulk = db.collection.initializeUnorderedBulkOp();
    }
  }
});

bulk.execute()
  .then(() => {
    console.log('Ok');
  })
  .catch((err) => {
    console.error(err);
  });


getStructureFromCsvRecord = (data) => {
  return {
    'LoanId': data[0],
    'NoteId': data[1],
    'OrderId': data[2],
    'OutstandingPrincipal': data[3],
    'AccruedInterest': data[4],
    'Status': data[5],
    'AskPrice': data[6],
    'Markup/Discount': data[7],
    'YTM': data[8],
    'DaysSinceLastPayment': data[9],
    'CreditScoreTrend': data[10],
    'FICO End Range': data[11],
    'Date/Time Listed': data[12],
    'NeverLate': data[13],
    'Loan Class': data[14],
    'Loan Maturity': data[15],
    'Original Note Amount': data[16],
    'Interest Rate': data[17],
    'Remaining Payments': data[18],
    'Principal + Interest': data[19],
    'Application Type': data[10]
  };
};