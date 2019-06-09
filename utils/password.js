const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(saltRounds));
}

exports.compare = function(password, hash) {
  return bcrypt.compareSync(password, hash);
}