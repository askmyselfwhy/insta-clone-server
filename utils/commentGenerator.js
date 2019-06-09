const UsersModel = require('../models/users');
const PostsModel = require('../models/posts');
const CommentsModel = require('../models/comments');
var ObjectID = require('mongodb').ObjectID;

const goodMessages = [
  'Cool photo, bro',
  'Very beautiful picture',
  'Your photo so cool, check my photos too!',
  'It\'s a damn good, keep up the good work',
  'Damn it is cool',
];

const badMessages = [
  'It sucks :/',
  'My little brother makes better photos!',
  'Bad work, very bad :|'
];

const allMessages = [
  ...goodMessages,
  ...badMessages
];

exports.generateComments = function(postId, userId) {
  const maximumComments = 10;
  const maximumCommentIndex = goodMessages.length + badMessages.length;
  const numberOfComments = Math.floor(Math.random() * maximumComments);
  let likes = 0;
  return UsersModel.find({}, function(err, users) {
    if (!users) return;
    const numberOfUsers = users.length;
    for (let i = 0; i < numberOfComments;) {
      const generatedUserIndex = Math.floor(Math.random() * numberOfUsers);
      const generatedCommentIndex = Math.floor(Math.random() * maximumCommentIndex);
      const user = users[generatedUserIndex];
      if (ObjectID(user._doc._id) === userId) continue;
      likes += generatedCommentIndex < goodMessages.length
        ? 1
        : 0;
      CommentsModel.create({
        post_id: postId,
        user_id: user._id,
        message: allMessages[generatedCommentIndex],
        created_at: new Date()
      });
      i++;
    }
    PostsModel.updateOne({ _id: postId }, {
      meta: {
        likes,
        comments: numberOfComments
      }
    }, function(err, doc) {
      console.log('updated')
    });
  })
}