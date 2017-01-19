'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.instance.details.dcos', [
  require('core/account/account.module.js'),
  require('./details.controller.js'),
]);
