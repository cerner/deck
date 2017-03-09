'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.dcos.environmentVariables', [
])
  .controller('dcosServerGroupEnvironmentVariablesController', function($scope) {

    $scope.command.viewModel.env = [];

    // init from the model
    if ($scope.command.env) {
      Object.keys($scope.command.env).forEach((key) => {

        let val = $scope.command.env[key];
        let secretSource = null;
        if (val.secret) {
          secretSource = $scope.command.secrets[val.secret].source;
        }

        $scope.command.viewModel.env.push({
          name: key,
          value: val,
          rawValue: secretSource || val,
          isSecret: secretSource != null
        });
      });
    }

    this.addEnvironmentVariable = function() {
      $scope.command.viewModel.env.push({
        name: null,
        value: null,
        isSecret: false
      });
    };

    this.removeEnvironmentVariable = function(index) {
      $scope.command.viewModel.env.splice(index, 1);
      this.synchronize();
    };

    this.updateValue = function(index) {
      if ($scope.command.viewModel.env[index].secret === true) {
        $scope.command.secrets['secret' + index].source = $scope.command.viewModel.env[index].rawValue;
      } else {
        $scope.command.viewModel.env[index].value = $scope.command.viewModel.env[index].rawValue;
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
          'source': $scope.command.viewModel.env[index].value
      };

      $scope.command.viewModel.env[index].value = {
        'secret': 'secret' + index
      };
    };

    this.removeSecret = function(index) {
      $scope.command.viewModel.env[index].value =
        $scope.command.secrets['secret' + index].source;

        delete $scope.command.secrets['secret' + index];
    };

    this.synchronize = () => {
      let allNames = $scope.command.viewModel.env.map((item) => item.name);
      Object.keys($scope.command.env).forEach((key) => delete $scope.command.env[key]);

      $scope.command.viewModel.env.forEach((item) => {
        if (item.name) {
          $scope.command.env[item.name] = item.value;
        }

        item.checkUnique = allNames.filter((name) => item.name !== name);
      });
    };
    $scope.$watch(() => JSON.stringify($scope.command.viewModel.env), this.synchronize);
  });