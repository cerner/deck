'use strict';

// TODO copied from kubernetes, haven't changed it yet

let angular = require('angular');

import {SERVER_GROUP_WRITER} from 'core/serverGroup/serverGroupWriter.service';
import {TASK_MONITOR_BUILDER} from 'core/task/monitor/taskMonitor.builder';

module.exports = angular.module('spinnaker.kubernetes.serverGroup.details.resize.controller', [
  require('core/application/modal/platformHealthOverride.directive.js'),
  require('core/task/modal/reason.directive.js'),
  SERVER_GROUP_WRITER,
  TASK_MONITOR_BUILDER,
])
  .controller('kubernetesResizeServerGroupController', function($scope, $uibModalInstance, serverGroupWriter, taskMonitorBuilder,
                                                                application, serverGroup, kubernetesAutoscalerWriter) {
    $scope.serverGroup = serverGroup;
    $scope.currentSize = { desired: serverGroup.replicas };

    $scope.command = {
      capacity: {
        desired: $scope.currentSize.desired,
      },
    };

    if ($scope.serverGroup.autoscalerStatus) {
      $scope.command.capacity.min = $scope.serverGroup.deployDescription.capacity.min;
      $scope.command.capacity.max = $scope.serverGroup.deployDescription.capacity.max;
      $scope.command.scalingPolicy = { cpuUtilization: { target: null, }, };
    }

    $scope.verification = {};

    if (application && application.attributes) {
      if (application.attributes.platformHealthOnly) {
        $scope.command.interestingHealthProviderNames = ['Kubernetes'];
      }

      $scope.command.platformHealthOnlyShowOverride = application.attributes.platformHealthOnlyShowOverride;
    }

    this.isValid = function () {
      var command = $scope.command;
      return $scope.verification.verified
        && command.capacity !== null
        && command.capacity.desired !== null;
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
      var capacity = $scope.command.capacity;

      var submitMethod = function() {
        var payload = {
          capacity: capacity,
          serverGroupName: serverGroup.name,
          credentials: serverGroup.account,
          account: serverGroup.account,
          namespace: serverGroup.region,
          region: serverGroup.region,
          interestingHealthProviderNames: ['KubernetesPod'],
          reason: $scope.command.reason,
        };
        if (serverGroup.autoscalerStatus) {
          return kubernetesAutoscalerWriter.upsertAutoscaler(serverGroup, application, payload);
        } else {
          return serverGroupWriter.resizeServerGroup(serverGroup, application, payload);
        }
      };

      $scope.taskMonitor.submit(submitMethod);
    };

    this.cancel = function () {
      $uibModalInstance.dismiss();
    };
  });
