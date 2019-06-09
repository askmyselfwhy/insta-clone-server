const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types
var CollectionNames = require('../constants/collectionNames')

const collectionName = CollectionNames.IMAGES

var Model = mongoose.model('Image', new Schema({
    image: Types.Mixed,
    image_path: String
  }),
  collectionName
);

module.exports = Model