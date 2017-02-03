'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.dcos.network', [
  require('angular-ui-router'),
  require('angular-ui-bootstrap'),
])
  .controller('dcosServerGroupNetworkController', function($scope) {

    $scope.command.networkTypes = [{
        type: 'HOST',
        name: 'Host'
      }, {
        type: 'BRIDGE',
        name: 'Bridge'
      }, {
        type: 'USER',
        name: 'Virtual'
      }];
    $scope.command.serviceEndpointProtocols = ['tcp', 'udp', 'udp,tcp'];
    $scope.command.networkType = $scope.command.networkTypes[0];

    this.addServiceEndpoint = function() {
      $scope.command.serviceEndpoints.push({
        networkType: $scope.command.networkType,
        port: null,
        name: null,
        protocol: $scope.command.serviceEndpointProtocols[0],
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
