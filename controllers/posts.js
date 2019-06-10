var webpush = require('web-push');
var ObjectID = require('mongodb').ObjectID;
var generators = require('../utils/controllerGenerators');
var commentGenerator = require('../utils/commentGenerator');
var CollectionNames = require('../constants/collectionNames');
var config = require('../db-config');
var PostsModel = require('../models/posts');
var CommentsModel = require('../models/comments');
var SubscriptionsModel = require('../models/subscriptions');
var UsersModel = require('../models/users');
var ImagesModel = require('../models/images');
var UUID = require("uuid-v4");
var multiparty = require('multiparty');
var admin = require("firebase-admin");

var serviceAccount = require("../firebase-service-account.json");
const projectId = 'insta-clone-243118';

var gcconfig = {
  projectId: projectId,
  keyFilename: "firebase-service-account.json"
};

const gcs = require('@google-cloud/storage')(gcconfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${projectId}.firebaseio.com/`
});

const methodsToExport = config[CollectionNames.POSTS].reduce((allMethods, methodName) => ({
  ...allMethods,
  [methodName]: generators[methodName](PostsModel)
}), {})

module.exports = {
  ...methodsToExport,
  all: function(_req, res) {
    PostsModel.find({}, async function(err, docs) {
      if (err)   return res.sendStatus(500);
      if (!docs) return res.sendStatus(404);
      const docsWithImages = docs.map(async doc => {
        const result = await ImagesModel.findById(doc.image_id)
        if (result) {
          return {
            ...doc._doc,
            image_url: result.image
          }
        }
        return doc._doc
      })
      Promise.all(docsWithImages).then(results => res.send(results))
    })
  },
  findById: function(req, res) {
    const postId = req.params.id
    PostsModel.findById(postId, function(err, doc) {
      if (err)  return res.sendStatus(500);
      if (!doc) return res.sendStatus(404);
      ImagesModel.findById(doc.image_id, function(imageDocErr, imageDoc) {
        if (imageDocErr) return res.sendStatus(500);
        if (!imageDoc)   return res.sendStatus(404);
        return res.send({
          ...doc._doc,
          image_url: imageDoc._doc.image
        });
      })
    })
  },
  getComments: function(req, res) {
    const postId = req.params.id
    CommentsModel.find({}, function(err, docs) {
      if (err)   return res.sendStatus(500);
      if (!docs) return res.sendStatus(404);
      const comments = docs.filter(comment => ObjectID(comment.post_id).equals(ObjectID(postId)))
      UsersModel.find({}, function(usersAllErr, usersDocs) {
        if (usersAllErr) return res.sendStatus(500);
        if (!usersDocs)  return res.sendStatus(404);
        res.send(comments.map(comment => {
          const user = usersDocs.find(user => ObjectID(user._id).equals(ObjectID(comment.user_id)))
          return !user
            ? comment
            : {
              ...comment._doc,
              avatar: user._doc.avatar,
              first_name: user.first_name,
              last_name: user.last_name
            }
        }))
      })
    })
  },
  insert: function(req, res) {
    var uuid = UUID();
    var form = new multiparty.Form();
    form.parse(req, function(_err, fields, files) {
      Object.keys(files).forEach(function(name) {
        const file = files[name];
        for (let fileFields of file) {
  
          const filePath = fileFields.path;
          const fileName = fileFields.originalFilename;
          const headers  = fileFields.headers;

          var bucket = gcs.bucket(`${projectId}.appspot.com`);
          bucket.upload(
            filePath,
            {
              uploadType: "media",
              destination: '/' + fileName,
              metadata: {
                metadata: {
                  contentType: headers['content-type'],
                  firebaseStorageDownloadTokens: uuid
                }
              }
            },
            function(err, uploadedFile) {
              const image_url = "https://firebasestorage.googleapis.com/v0/b/" +
                bucket.name +
                "/o/" +
                encodeURIComponent(uploadedFile.name) +
                "?alt=media&token=" +
                uuid
              if (!err) {
                return ImagesModel.create({
                  image: image_url,
                  image_path: '/' + uploadedFile.name,
                })
                .then(imageDoc => {
                  PostsModel.create({
                    title: fields.title[0],
                    description: fields.description[0],
                    image_id: ObjectID(imageDoc._id),
                    location_coordinates: fields.locationCoordinates[0],
                    location: fields.location[0],
                    user_id: ObjectID(fields.user_id[0]),
                    created_at: new Date(),
                    meta: {
                      likes: 0,
                      comments: 0
                    }
                  }, function(createPostErr, postDoc) {
                    if (createPostErr) res.sendStatus(503)
                    // Generate comments (just for testing purpose)
                    commentGenerator.generateComments(postDoc._id, ObjectID(postDoc.user_id));
                    // Notify all subscribed users about new post
                    SubscriptionsModel.find({}, function(_err, subscriptions) {
                      subscriptions.forEach(function(sub) {
                        var pushConfig = {
                          endpoint: sub.endpoint,
                          keys: {
                            auth: sub.keys.auth,
                            p256dh: sub.keys.p256dh
                          }
                        };
                        webpush
                          .sendNotification(
                            pushConfig,
                            JSON.stringify({
                              title: "New Post",
                              content: "New Post added!",
                              openUrl: `/post/${postDoc._id}`,
                              tag: 'new-post'
                            })
                          )
                          .catch((err) => console.log(err))
                      });
                    })
                    return res.json({ id: fields.id[0] })
                  })
                })
                .catch(_err => res.sendStatus(502))
              } else {
                console.log(err);
              }
            }
          );
        }
        console.log('got file named ' + name);
      });
    });
  },
  delete: function(req, res) {
    const _id = req.params.id;
    var bucket = gcs.bucket(`${projectId}.appspot.com`);
    PostsModel
      .findById(_id, function(err, doc) {
        if (err)  return res.sendStatus(500);
        if (!doc) return res.sendStatus(404);
        const imageId  = doc.image_id;
        ImagesModel.findById(imageId, function(imageFindErr, imageDoc) {
          if (imageFindErr)  return res.sendStatus(500);
          if (!imageDoc)     return res.sendStatus(404);
          const pathname = imageDoc.image_path;
          const file     = bucket.file(pathname);
          file
            .delete()
            .then(() => {
              // Image successfully deleted from cloud storage
              ImagesModel.deleteOne({ _id: imageId }, function(imageDeleteError) {
                if (imageDeleteError)  return res.sendStatus(500);
                CommentsModel.deleteMany({ post_id: ObjectID(_id) }, function(deleteCommentsErr) {
                  if (deleteCommentsErr) return res.sendStatus(500);
                  PostsModel.deleteOne({ _id: ObjectID(_id) }, function(postDeleteError) {
                    if (postDeleteError) return res.sendStatus(500);
                    res.sendStatus(200);
                  })
                })
              })
            }).catch(_err => res.sendStatus(500));
        })
      })
  }
}
