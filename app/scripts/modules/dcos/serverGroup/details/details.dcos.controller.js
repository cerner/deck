'use strict';

import _ from 'lodash';

import {ACCOUNT_SERVICE} from 'core/account/account.service';
import {CONFIRMATION_MODAL_SERVICE} from 'core/confirmationModal/confirmationModal.service';
import {SERVER_GROUP_READER} from 'core/serverGroup/serverGroupReader.service';
import {SERVER_GROUP_WRITER} from 'core/serverGroup/serverGroupWriter.service';
import {SERVER_GROUP_WARNING_MESSAGE_SERVICE} from 'core/serverGroup/details/serverGroupWarningMessage.service';
import {RUNNING_TASKS_DETAILS_COMPONENT} from 'core/serverGroup/details/runningTasks.component';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.details.dcos.controller', [
  require('angular-ui-router'),
  ACCOUNT_SERVICE,
  require('../configure/CommandBuilder.js'),
  SERVER_GROUP_WARNING_MESSAGE_SERVICE,
  SERVER_GROUP_READER,
  CONFIRMATION_MODAL_SERVICE,
  SERVER_GROUP_WRITER,
  RUNNING_TASKS_DETAILS_COMPONENT,
  require('./resize/resize.controller'),
  require('core/modal/closeable/closeable.modal.controller.js'),
  require('core/utils/selectOnDblClick.directive.js'),
])
  .controller('dcosServerGroupDetailsController', function ($scope, $state, $templateCache, $interpolate, app, serverGroup,
                                                       dcosServerGroupCommandBuilder, serverGroupReader, $uibModal, confirmationModalService, serverGroupWriter,
                                                       serverGroupWarningMessageService, accountService) {

    let application = app;

    $scope.state = {
      loading: true
    };

    function extractServerGroupSummary () {
      var summary = _.find(application.serverGroups.data, function (toCheck) {
        return toCheck.name === serverGroup.name && toCheck.account === serverGroup.accountId && toCheck.region === serverGroup.region;
      });
      return summary;
    }

    function retrieveServerGroup() {
      var summary = extractServerGroupSummary();
      return serverGroupReader.getServerGroup(application.name, serverGroup.accountId, serverGroup.region, serverGroup.name).then(function(details) {
        cancelLoader();

        // it's possible the summary was not found because the clusters are still loading
        details.account = serverGroup.accountId;

        accountService.getAccountDetails(details.account).then((accountDetails) => {
          details.apiEndpoint = _.filter(accountDetails.regions, {name: details.region})[0].endpoint;
        });

        angular.extend(details, summary);

        $scope.serverGroup = details;

        if (_.isEmpty($scope.serverGroup)) {
          autoClose();
        }
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

    this.destroyServerGroup = function destroyServerGroup() {
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

    this.resizeServerGroup = function resizeServerGroup() {
      $uibModal.open({
        templateUrl: require('./resize/resize.html'),
        controller: 'dcosResizeServerGroupController as controller',
        resolve: {
          serverGroup: function() { return $scope.serverGroup; },
          application: function() { return application; }
        }
      });
    };
  }
);
