var express = require('express');
var router = express.Router();
var usersController = require('../controllers/users')

// Return list of users
router.get('/', usersController.all)
// Return user by id
router.get('/:id', usersController.findById)
// Change user info
router.put('/:id', usersController.update)

module.exports = router;

