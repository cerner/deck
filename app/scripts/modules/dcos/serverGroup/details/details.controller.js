'use strict';

import _ from 'lodash';
let angular = require('angular');

import {CONFIRMATION_MODAL_SERVICE} from 'core/confirmationModal/confirmationModal.service';
import {SERVER_GROUP_WARNING_MESSAGE_SERVICE} from 'core/serverGroup/details/serverGroupWarningMessage.service';
import {SERVER_GROUP_READER} from 'core/serverGroup/serverGroupReader.service';
import {SERVER_GROUP_WRITER} from 'core/serverGroup/serverGroupWriter.service';
import {RUNNING_TASKS_DETAILS_COMPONENT} from 'core/serverGroup/details/runningTasks.component';

module.exports = angular.module('spinnaker.serverGroup.details.dcos.controller', [
  require('angular-ui-router'),
  require('../configure/configure.dcos.module.js'),
  CONFIRMATION_MODAL_SERVICE,
  SERVER_GROUP_WARNING_MESSAGE_SERVICE,
  SERVER_GROUP_READER,
  SERVER_GROUP_WRITER,
  require('core/utils/selectOnDblClick.directive.js'),
  require('../paramsMixin.js'),
  RUNNING_TASKS_DETAILS_COMPONENT,
])
  .controller('dcosServerGroupDetailsController', function ($scope, $state, app, serverGroup,
                                                                  serverGroupReader, $uibModal, serverGroupWriter,
                                                                  serverGroupWarningMessageService,
                                                                  dcosServerGroupCommandBuilder, dcosServerGroupParamsMixin,
                                                                  confirmationModalService, dcosProxyUiService) {
    let application = app;

    $scope.state = {
      loading: true
    };

    function extractServerGroupSummary() {
      var summary = _.find(application.serverGroups.data, function (toCheck) {
        return toCheck.name === serverGroup.name && toCheck.account === serverGroup.accountId && toCheck.region === serverGroup.region;
      });
      if (!summary) {
        application.loadBalancers.data.some(function (loadBalancer) {
          if (loadBalancer.account === serverGroup.accountId && loadBalancer.region === serverGroup.region) {
            return loadBalancer.serverGroups.some(function (possibleServerGroup) {
              if (possibleServerGroup.name === serverGroup.name) {
                summary = possibleServerGroup;
                return true;
              }
            });
          }
        });
      }
      return summary;
    }

    this.uiLink = function uiLink() {
      return dcosProxyUiService.buildLink($scope.serverGroup.account, 'services', $scope.serverGroup.region, $scope.serverGroup.name);
    };

    this.showJson = function showJson() {
      $scope.userDataModalTitle = 'Application JSON';
      $scope.userData = $scope.serverGroup.json;
      $uibModal.open({
        templateUrl: require('core/serverGroup/details/userData.html'),
        controller: 'CloseableModalCtrl',
        scope: $scope
      });
    };

    function normalizeDeploymentStatus(serverGroup) {
      let deploymentStatus = serverGroup.deploymentStatus;

      if (deploymentStatus !== undefined && deploymentStatus !== null) {
        deploymentStatus.unavailableReplicas |= 0;
        deploymentStatus.availableReplicas |= 0;
        deploymentStatus.updatedReplicas |= 0;
      }
    }

    function retrieveServerGroup() {
      var summary = extractServerGroupSummary();
      return serverGroupReader.getServerGroup(application.name, serverGroup.accountId, serverGroup.region, serverGroup.name).then(function(details) {
        cancelLoader();

        angular.extend(details, summary);

        $scope.serverGroup = details;
        normalizeDeploymentStatus($scope.serverGroup);
      },
        autoClose
      );
    }

    function autoClose() {
      if ($scope.$$destroyed) {
        return;
      }
      $state.params.allowModalToStayOpen = true;
      $state.go('^', null, {location: 'replace'});
    }

    function cancelLoader() {
      $scope.state.loading = false;
    }

    retrieveServerGroup().then(() => {
      // If the user navigates away from the view before the initial retrieveServerGroup call completes,
      // do not bother subscribing to the refresh
      if (!$scope.$$destroyed) {
        app.serverGroups.onRefresh($scope, retrieveServerGroup);
      }
    });

    this.destroyServerGroup = () => {
      var serverGroup = $scope.serverGroup;

      var taskMonitor = {
        application: application,
        title: 'Destroying ' + serverGroup.name,
      };

      var submitMethod = function () {
        return serverGroupWriter.destroyServerGroup(serverGroup, application, {
          cloudProvider: 'dcos',
          serverGroupName: serverGroup.name,
          region: serverGroup.region,
        });
      };

      var stateParams = {
        name: serverGroup.name,
        accountId: serverGroup.account,
        region: serverGroup.region
      };

      var confirmationModalParams = {
        header: 'Really destroy ' + serverGroup.name + '?',
        buttonText: 'Destroy ' + serverGroup.name,
        provider: 'dcos',
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        platformHealthOnlyShowOverride: app.attributes.platformHealthOnlyShowOverride,
        platformHealthType: 'DCOS',
        submitMethod: submitMethod,
        body: this.getBodyTemplate(serverGroup, application),
        onTaskComplete: function () {
          if ($state.includes('**.serverGroup', stateParams)) {
            $state.go('^');
          }
        },
      };

      confirmationModalService.confirm(confirmationModalParams);
    };

    this.getBodyTemplate = (serverGroup, application) => {
      if (this.isLastServerGroupInRegion(serverGroup, application)) {
        return serverGroupWarningMessageService.getMessage(serverGroup);
      }
    };

    this.isLastServerGroupInRegion = function (serverGroup, application ) {
      try {
        var cluster = _.find(application.clusters, {name: serverGroup.cluster, account:serverGroup.account});
        return _.filter(cluster.serverGroups, {region: serverGroup.region}).length === 1;
      } catch (error) {
        return false;
      }
    };

    this.disableServerGroup = function disableServerGroup() {
      var serverGroup = $scope.serverGroup;

      var taskMonitor = {
        application: application,
        title: 'Disabling ' + serverGroup.name
      };

      var submitMethod = (params) => serverGroupWriter.disableServerGroup(
          serverGroup,
          application,
          angular.extend(params, dcosServerGroupParamsMixin.disableServerGroup(serverGroup, application))
      );

      var confirmationModalParams = {
        header: 'Really disable ' + serverGroup.name + '?',
        buttonText: 'Disable ' + serverGroup.name,
        provider: 'dcos',
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod,
        askForReason: true,
      };

      confirmationModalService.confirm(confirmationModalParams);
    };

    this.enableServerGroup = function enableServerGroup() {
      var serverGroup = $scope.serverGroup;

      var taskMonitor = {
        application: application,
        title: 'Enabling ' + serverGroup.name,
      };

      var submitMethod = (params) => serverGroupWriter.enableServerGroup(
          serverGroup,
          application,
          angular.extend(params, dcosServerGroupParamsMixin.enableServerGroup(serverGroup, application))
      );

      var confirmationModalParams = {
        header: 'Really enable ' + serverGroup.name + '?',
        buttonText: 'Enable ' + serverGroup.name,
        provider: 'dcos',
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod,
        askForReason: true,
      };

      confirmationModalService.confirm(confirmationModalParams);
    };

    this.rollbackServerGroup = function rollbackServerGroup() {
      $uibModal.open({
        templateUrl: require('./rollback/rollback.html'),
        controller: 'dcosRollbackServerGroupController as ctrl',
        resolve: {
          serverGroup: function() { return $scope.serverGroup; },
          disabledServerGroups: function() {
            var cluster = _.find(app.clusters, {name: $scope.serverGroup.cluster, account: $scope.serverGroup.account});
            return _.filter(cluster.serverGroups, {isDisabled: true, region: $scope.serverGroup.namespace});
          },
          application: function() { return app; }
        }
      });
    };

    this.resizeServerGroup = function resizeServerGroup() {
      $uibModal.open({
        templateUrl: require('./resize/resize.html'),
        controller: 'dcosResizeServerGroupController as ctrl',
        resolve: {
          serverGroup: function() { return $scope.serverGroup; },
          application: function() { return application; }
        }
      });
    };

    // this.cloneServerGroup = function cloneServerGroup(serverGroup) {
    //   $uibModal.open({
    //     templateUrl: require('../configure/wizard/wizard.html'),
    //     controller: 'dcosCloneServerGroupController as ctrl',
    //     size: 'lg',
    //     resolve: {
    //       title: function() { return 'Clone ' + serverGroup.name; },
    //       application: function() { return application; },
    //       serverGroup: function() { return serverGroup; },
    //       serverGroupCommand: function() { return dcosServerGroupCommandBuilder.buildServerGroupCommandFromExisting(application, serverGroup); },
    //     }
    //   });
    // };
  }
);