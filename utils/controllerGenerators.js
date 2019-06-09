
exports.all = function(Model) {
  return function(req, res) {
    Model.find({}, function(err, docs) {
      if (err)   return res.sendStatus(500);
      if (!docs) return res.sendStatus(404);
      return res.send(docs);
    })
  }
}

exports.findById = function(Model) {
  return function(req, res) {
    Model.findById( req.params.id, function(err, doc) {
      if (err)  return res.sendStatus(500);
      if (!doc) return res.sendStatus(404);
      return res.send(doc);
    })
  }
}

exports.update = function(Model) {
  return function(req, res) {
    Model.updateOne({ _id: req.params.id},
      req.body,
      function(err, doc) {
        if (err)  return res.sendStatus(500);
        if (!doc) return res.sendStatus(404);
        return res.sendStatus(200);
      }
    )
  }
}

exports.delete = function(Model) {
  return function(req, res) {
    Model.delete({ _id: req.params.id },
      function(err, doc) {
      if (err)  return res.sendStatus(500);
      if (!doc) return res.sendStatus(404);
      return res.sendStatus(200);
    })
  }
}

exports.insert = function(Model) {
  return function(req, res) {
    Model.create(req.body,
      function(err, doc) {
        if (err)  return res.sendStatus(500);
        if (!doc) return res.sendStatus(404);
        return res.send(doc);
      }
    )
  }
}
