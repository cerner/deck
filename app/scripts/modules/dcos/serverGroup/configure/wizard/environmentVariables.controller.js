'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.dcos.environmentVariables', [
  require('angular-ui-router'),
  require('angular-ui-bootstrap'),
])
  .controller('dcosServerGroupEnvironmentVariablesController', function($scope) {

    $scope.command.env = [];
    $scope.command.secrets = {};

    this.addEnvironmentVariable = function() {
      $scope.command.env.push({
        name: null,
        value: null,
        isSecret: false
      });
    };

    this.removeEnvironmentVariable = function(index) {
      $scope.command.env.splice(index, 1);
    };

    this.updateValue = function(index) {
      if ($scope.command.env[index].secret === true) {
        $scope.command.secrets['secret' + index].source = $scope.command.env[index].rawValue;
      } else {
        $scope.command.env[index].value = $scope.command.env[index].rawValue;
      }
    };

    this.updateSecret = function(index, state) {
      // this is the previous state before the update is applied
      if (state !== true) {
        this.addSecret(index);
      } else {
        this.removeSecret(index);
      }
    };

    this.addSecret = function(index) {
      $scope.command.secrets['secret' + index] = {
          'source': $scope.command.env[index].value
      };

      $scope.command.env[index].value = {
        'secret': 'secret' + index
      };
    };

    this.removeSecret = function(index) {
      $scope.command.env[index].value =
        $scope.command.secrets['secret' + index].source;

        delete $scope.command.secrets['secret' + index];
    };
  });
