'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.dcos', [
  require('core/account/account.module.js'),
  require('./configuration.service.js'),
  require('./CommandBuilder.js'),
  require('./wizard/basicSettings.controller.js'),
  require('./wizard/Clone.controller.js'),
  require('./wizard/containerSettings.controller.js'),
  require('./wizard/healthChecks.controller.js'),
  require('./wizard/network.controller.js'),
  require('./wizard/templateSelection.controller.js'),
  require('./wizard/volumes.controller.js'),
]);