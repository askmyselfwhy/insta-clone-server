var webpush = require('web-push');
var express = require('express');
var router = express.Router();
var SubscriptionsModel = require('../models/subscriptions');

// Subscribe
router.post('/', function(req, res) {
  const subscription = req.body;
  SubscriptionsModel.create(subscription, function(err, doc) {
    res.sendStatus(201);
  })
  const payload = JSON.stringify({
    title: 'You have successfully subscribed!',
    description: 'You have successfully subscribed to the notification system!',
    tag: 'subscribe'
  });
  webpush.sendNotification(subscription, payload);
})

router.put('/', function(req, res) {
  const subscription = req.body;
  SubscriptionsModel.deleteOne({ endpoint: subscription.endpoint }, function(err) {
    res.sendStatus(200);
  });
})

module.exports = router;



