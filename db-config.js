var CollectionNames = require('./constants/collectionNames')
// This config consists of mapping between collection name
// and array of methods names that should be present in controller & model
module.exports = {
  [CollectionNames.USERS]:    ['all', 'update', 'findById'],
  [CollectionNames.POSTS]:    ['all', 'update', 'findById', 'delete', 'insert'],
  [CollectionNames.COMMENTS]: ['all', 'update', 'findById', 'delete', 'insert'],
  [CollectionNames.IMAGES]:   ['findById', 'delete', 'insert']
}