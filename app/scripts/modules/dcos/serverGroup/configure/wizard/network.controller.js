'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.dcos.network', [
])
  .controller('dcosServerGroupNetworkController', function($scope) {

    this.networkTypes = [{
        type: 'HOST',
        name: 'Host'
      }, {
        type: 'BRIDGE',
        name: 'Bridge'
      }, {
        type: 'USER',
        name: 'Virtual'
    }];

    this.serviceEndpointProtocols = ['tcp', 'udp', 'udp,tcp'];

    this.addServiceEndpoint = function() {
      $scope.command.serviceEndpoints.push({
        networkType: $scope.command.networkType,
        port: null,
        name: null,
        protocol: this.serviceEndpointProtocols[0],
        loadBalanced: false,
        exposeToHost: false,
      });
    };

    this.removeServiceEndpoint = function(index) {
      $scope.command.serviceEndpoints.splice(index, 1);
    };

    this.changeNetworkType = function() {
      $scope.command.serviceEndpoints.forEach (function(endpoint) {
        endpoint.networkType = $scope.command.networkType;
      });
    };
  });
