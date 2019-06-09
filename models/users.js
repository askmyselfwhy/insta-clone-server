const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var CollectionNames = require('../constants/collectionNames')

const collectionName = CollectionNames.USERS

var Model = mongoose.model('User', new Schema({
    first_name: String,
    last_name: String,
    hash: String,
    username: String,
  }),
  collectionName
);

module.exports = Model