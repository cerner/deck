'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.dcos.healthChecks', [
])
  .controller('dcosServerGroupHealthChecksController', function($scope) {

    var HTTP_PROTOCOL = 'HTTP';
    var COMMAND_PROTOCOL = 'COMMAND';
    var TCP_PROTOCOL = 'TCP';

    this.healthCheckProtocols = [HTTP_PROTOCOL, COMMAND_PROTOCOL, TCP_PROTOCOL];
    this.healthCheckPortTypes = ['Port Index', 'Port Number'];

    this.isHealthChecksValid = function(healthChecks) {
      return !(typeof healthChecks === 'string' || healthChecks instanceof String);
    };

    if (this.isHealthChecksValid($scope.command.healthChecks)) {
      $scope.command.healthChecks.forEach((hc) => {
        hc.portType = hc.port ? this.healthCheckPortTypes[1] : this.healthCheckPortTypes[0];
      });
    }

    this.isHttpProtocol = function(healthCheck) {
      return healthCheck.protocol === HTTP_PROTOCOL;
    };

    this.isCommandProtocol = function(healthCheck) {
      return healthCheck.protocol === COMMAND_PROTOCOL;
    };

    this.isTcpProtocol = function(healthCheck) {
      return healthCheck.protocol === TCP_PROTOCOL;
    };

    // TODO can be smarter about this based on current ports defined
    this.addHealthCheck = function() {
      if (!this.isHealthChecksValid($scope.command.healthChecks)) {
        $scope.command.healthChecks = [];
      }

      $scope.command.healthChecks.push({
        protocol: HTTP_PROTOCOL,
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
