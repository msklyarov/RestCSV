const csv = require('ya-csv');
const config = require('./config');
const Promise = require('bluebird');
const mongoClient = Promise.promisifyAll(require('mongodb').MongoClient);

// temporary
const fs = require('fs');
const reader = csv.createCsvFileReader(config.csvFileUrl);

let firstLine = true;
reader.addListener('data', (data) => {
  if (firstLine) {
    firstLine = false;
  } else {
    console.log(data);
  }
});

getStructureFromCsvRecord = (data) => {
  return {
    'LoanId',
    'NoteId',
    'OrderId',
    'OutstandingPrincipal',
    'AccruedInterest',
    'Status',
    'AskPrice',
    'Markup-Discount',
    'YTM',
    'DaysSinceLastPayment',
    'CreditScoreTrend','FICO End Range','Date/Time Listed','NeverLate','Loan Class','Loan Maturity','Original Note Amount','Interest Rate','Remaining Payments','Principal + Interest','Application Type'
  };
};