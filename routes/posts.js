var express = require('express');
var router = express.Router();
var postsController = require('../controllers/posts')

// Return list of posts
router.get('/', postsController.all)
router.post('/', postsController.insert)
// Return post by id
router.get('/:id', postsController.findById)
// Change post info
router.put('/:id', postsController.update)
// Delete the post
router.delete('/:id', postsController.delete)
// Get the comments for post
router.get('/:id/comments', postsController.getComments)

module.exports = router;
