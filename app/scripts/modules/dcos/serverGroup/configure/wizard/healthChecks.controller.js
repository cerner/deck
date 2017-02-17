'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.dcos.healthChecks', [
])
  .controller('dcosServerGroupHealthChecksController', function($scope) {

    $scope.command.healthChecks = [];
    $scope.command.healthCheckProtocols = ['HTTP', 'Command', 'TCP'];
    $scope.command.healthCheckPortTypes = ['Port Index', 'Port Number'];

    this.addHealthCheck = function() {
      $scope.command.healthChecks.push({
        protocol: $scope.command.healthCheckProtocols[0],
        path: null,
        command: null,
        gracePeriodSeconds: null,
        intervalSeconds: null,
        timeoutSeconds: null,
        maxConsecutiveFailures: null,
        portType: $scope.command.healthCheckPortTypes[0],
        port: null,
        ignoreHttp1xx: false,
      });
    };

    this.removeHealthCheck = function(index) {
      $scope.command.healthChecks.splice(index, 1);
    };
  });
