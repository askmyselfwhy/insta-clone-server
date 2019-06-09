const mongoose = require('mongoose');
const dbName = "insta-clone-db";
const name = "admin";
const password = "GJWNFCugKHnEPeq2";
const uri = `mongodb+srv://${name}:${password}@cluster0-q2mrs.mongodb.net/test?retryWrites=true&w=majority`;
var state = {
  db: null
};

exports.connect = function(done) {
  if (state.db) return done();
  mongoose.connect(uri, {
    useNewUrlParser: true,
    dbName
  })
  .then(() => {state.db = mongoose.connection; done();})
  .catch(() => console.error.bind(console, 'connection error:'))
}

exports.get = function() {
  return state.db;
}