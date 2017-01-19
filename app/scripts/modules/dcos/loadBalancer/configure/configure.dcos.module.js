'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.loadBalancer.configure.dcos', [
  require('core/account/account.module.js'),
  require('./wizard/upsert.controller.js'),
  require('./wizard/resources.controller.js'),
  require('./wizard/ports.controller.js'),
]);
