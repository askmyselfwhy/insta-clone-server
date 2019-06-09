var generators = require('../utils/controllerGenerators')
var CollectionNames = require('../constants/collectionNames')
var config = require('../db-config')
var Model = require('../models/users')

const methodsToExport = config[CollectionNames.USERS].reduce((allMethods, methodName) => ({
  ...allMethods,
  [methodName]: generators[methodName](Model)
}), {})

module.exports = {
  ...methodsToExport,
}