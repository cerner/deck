'use strict';

let angular = require('angular');

import {SERVER_GROUP_WRITER} from 'core/serverGroup/serverGroupWriter.service';
import {TASK_MONITOR_BUILDER} from 'core/task/monitor/taskMonitor.builder';

module.exports = angular.module('spinnaker.dcos.serverGroup.details.resize.controller', [
  SERVER_GROUP_WRITER,
  TASK_MONITOR_BUILDER,
])
  .controller('dcosResizeServerGroupController', function($scope, $uibModalInstance, serverGroupWriter, taskMonitorBuilder,
                                                     application, serverGroup) {
    $scope.serverGroup = serverGroup;
    $scope.currentSize = {
      oldSize: serverGroup.instances.length,
      newSize: null
    };

    $scope.verification = {};

    $scope.command = angular.copy($scope.currentSize);

    if (application && application.attributes) {
      $scope.command.platformHealthOnlyShowOverride = application.attributes.platformHealthOnlyShowOverride;
    }

    this.isValid = function () {
      var command = $scope.command;
      if (!$scope.verification.verified) {
        return false;
      }
      return command.newSize !== null;
    };

    $scope.taskMonitor = taskMonitorBuilder.buildTaskMonitor({
      application: application,
      title: 'Resizing ' + serverGroup.name,
      modalInstance: $uibModalInstance,
    });

    this.resize = function () {
      if (!this.isValid()) {
        return;
      }

      var capacity = { min: $scope.command.newSize, max: $scope.command.newSize, desired: $scope.command.newSize };

      var submitMethod = function() {
        return serverGroupWriter.resizeServerGroup(serverGroup, application, {
          serverGroupName: serverGroup.name,
          credentials: serverGroup.account,
          account: serverGroup.account,
          region: serverGroup.region,
          capacity: capacity,
        });
      };

      $scope.taskMonitor.submit(submitMethod);
    };

    this.cancel = function () {
      $uibModalInstance.dismiss();
    };
  });
