'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.loadBalancer.details.dcos', [
  require('core/account/account.module.js'),
  require('./details.controller.js'),
]);
