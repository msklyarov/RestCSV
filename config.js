module.exports = {
  csvFileUrl: './3.csv',
  // csvFileUrl: 'https://resources.lendingclub.com/SecondaryMarketAllNotes.csv',
  mongoUrl: 'mongodb://192.168.99.100:27017/SecondaryMarketAllNotes',
  collectionName: 'csv_data',
  tmpCollectionName: 'csv_data_tmp',
  oldCollectionName: 'csv_data_old',
  readInterval: 10 * 60 * 1000,
  bulkRecordsLimit: 500,
  httpRoute: '/',
  httpPort: 8080,
};
