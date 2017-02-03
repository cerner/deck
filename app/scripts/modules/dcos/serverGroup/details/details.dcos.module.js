'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.details.dcos', [
  require('core/account/account.module.js'),
  require('./details.controller.js'),
  require('./resize/resize.controller.js'),
]);
