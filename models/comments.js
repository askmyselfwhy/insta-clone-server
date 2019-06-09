const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types
var CollectionNames = require('../constants/collectionNames')

const collectionName = CollectionNames.COMMENTS

var Model = mongoose.model('Comment', new Schema({
    post_id: Types.ObjectId,
    user_id: Types.ObjectId,
    message: String,
    created_at: Date,
    avatar: String,
  }),
  collectionName
);

module.exports = Model