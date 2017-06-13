const port = process.env.PORT || 3000

module.exports = {
  source: {
    url: 'https://resources.lendingclub.com/SecondaryMarketAllNotes.csv',
    encoding: 'utf-8'
  },
  db: {
    url: 'mongodb://localhost:27017/SecondaryMarketAllNotes',
    workingCollectionName: 'csv_data',
    oldCollectionName: 'csv_data_old',
    tmpCollectionName: 'csv_data_tmp',
    bulkRecordsLimit: 500
  },
  updater: {
    interval: 10 * 60 * 1000 // 10 minutes
  },
  server: {
    port,
    route: '/'
  }
}
