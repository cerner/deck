'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.dcos.volumes', [
])
  .controller('dcosServerGroupVolumesController', function($scope) {

    this.volumeModes = [
        {
            mode: 'RW',
            description: 'Read And Write',
        },
        {
            mode: 'RO',
            description: 'Read Only',
        }
    ];

    this.addPersistentVolume = function() {
      $scope.command.persistentVolumes.push({
        containerPath: null,
        persistent: {
            size: null
        },
        mode: this.volumeModes[0].mode,
      });
    };

    this.removePersistentVolume = function(index) {
      $scope.command.persistentVolumes.splice(index, 1);
    };

    this.addDockerVolume = function() {
      $scope.command.dockerVolumes.push({
        containerPath: null,
        hostPath: null,
        mode: this.volumeModes[0].mode,
      });
    };

    this.removeDockerVolume = function(index) {
      $scope.command.dockerVolumes.splice(index, 1);
    };

    this.addExternalVolume = function() {
      $scope.command.externalVolumes.push({
        containerPath: null,
        external: {
          name: null,
          provider: 'dvdi',
          options: {
            'dvdi/driver': 'rexray'
          }
        },
        mode: this.volumeModes[0].mode,
      });
    };

    this.removeExternalVolume = function(index) {
      $scope.command.externalVolumes.splice(index, 1);
    };
  });
