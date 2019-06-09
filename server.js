var express = require('express');
const bodyParser = require('body-parser');
var webpush = require('web-push');
var omit = require('ramda').omit
var jwt = require('jsonwebtoken');
var cors = require('cors');
var app = express();
var db = require('./db');
var keys = require('./keys');
var postsController = require('./controllers/posts');

const UsersModel = require('./models/users')
const passwords = require('./utils/password')

var users = require('./routes/users');
var posts = require('./routes/posts');
var subscriptions = require('./routes/subscriptions');

const privateKey = `somePrivatKey`;
const algorithm = 'HS256';

webpush.setVapidDetails(
  'mailto:test@test.com',
  keys.publicVapidKey,
  keys.privateVapidKey,
);

app.use(cors());
// Creating new post have a special treatment
// because no need to parse json
app.post('/posts', postsController.insert)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.post('/login', function(req, res) {
  const { password, username } = req.body;
  UsersModel
    .findOne({ username })
    .then(doc => {
      if (doc) {
        const passwordsEqual = passwords.compare(password, doc.hash)
        if (passwordsEqual) {
          return res.send({
            user: omit(['hash'], doc),
            token: jwt.sign({
              data: username,
              exp: 24 * (Math.floor(Date.now() / 1000) + (60 * 60)), // Expires next day
            }, privateKey, { algorithm })
          })
        }
      }
      return res.sendStatus(404)
    })
    .catch(err => console.error(err))
})
app.post('/register', function(req, res) {
  const { username, password, first_name, last_name } = req.body;
  const hash = passwords.generateHash(password);
  UsersModel.create({
    first_name,
    last_name,
    hash,
    username,
  })
  .then(doc => {
    const token = jwt.sign({
      data: username,
      exp: 24 * (Math.floor(Date.now() / 1000) + (60 * 60)), // Expires next day
    }, privateKey, { algorithm })
    return res.send({
      user: omit(['hash'], doc),
      token
    })
  })
  .catch(err => console.error(err))
})
// Middleware to check the validaty of the token for all above request
app.use(function(req, res, next) {
  const token = req.headers.authorization;
  if (jwt.verify(token, privateKey)) {
    next();
  } else {
    res.sendStatus(403)
  }
})

app.use('/users', users);
app.use('/posts', posts);
app.use('/subscribe', subscriptions);

db.connect('mongodb://localhost:27017/myapi', function(err) {
  if (err) {
    return console.log(err);
  }
  app.listen(3012, function() {
    console.log('API app started');
  })
})

