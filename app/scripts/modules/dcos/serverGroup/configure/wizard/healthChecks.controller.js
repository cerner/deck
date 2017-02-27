'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.dcos.healthChecks', [
])
  .controller('dcosServerGroupHealthChecksController', function($scope) {

    this.healthCheckProtocols = ['HTTP', 'COMMAND', 'TCP'];
    this.healthCheckPortTypes = ['Port Index', 'Port Number'];

    $scope.command.healthChecks.forEach((hc) => {
      hc.portType = hc.port ? this.healthCheckPortTypes[1] : this.healthCheckPortTypes[0];
    });

    // TODO can be smarter about this based on current ports defined
    this.addHealthCheck = function() {
      $scope.command.healthChecks.push({
        protocol: this.healthCheckProtocols[0],
        path: null,
        command: null,
        gracePeriodSeconds: null,
        intervalSeconds: null,
        timeoutSeconds: null,
        maxConsecutiveFailures: null,
        portType: this.healthCheckPortTypes[0],
        port: null,
        portIndex: null,
        ignoreHttp1xx: false,
      });
    };

    this.removeHealthCheck = function(index) {
      $scope.command.healthChecks.splice(index, 1);
    };
  });
