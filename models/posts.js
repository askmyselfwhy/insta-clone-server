const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;
var CollectionNames = require('../constants/collectionNames');

const collectionName = CollectionNames.POSTS;

var Model = mongoose.model('Post', new Schema({
    name: String,
    user_id: Types.ObjectId,
    title: String,
    description: String,
    meta: {
      likes: Number,
      comments: Number,
    },
    image_id: String,
    created_at: Date,
    location: {
      country: String,
      city: String,
    },
    location_coordinates: {
      lat: Number,
      lng: Number
    }
  }),
  collectionName
);

module.exports = Model
