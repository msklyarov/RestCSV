module.exports = {
  csvFileUrl: './1.csv',
  // csvFileUrl: 'https://resources.lendingclub.com/SecondaryMarketAllNotes.csv',
  mongoUrl: 'mongodb://192.168.99.100:27017/SecondaryMarketAllNotes',
  collectionName: 'csv_data',
  tmpCollectionName: 'csv_data_tmp',
  readInterval: 10 * 60 * 1000,
  bulkRecordsLimit: 500
};
