const csv = require('ya-csv');
const config = require('./config');

// temporary
const fs = require('fs');
const reader = csv.createCsvFileReader(config.csvFileUrl);

let firstLine = true;
// reader.addListener('data', (data) => {
//   if (firstLine) {
//     firstLine = false;
//   } else {
//     //console.log(data);
//   }
// });
