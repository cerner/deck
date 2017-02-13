'use strict';

import {ACCOUNT_SERVICE} from 'core/account/account.service';
import {CONFIRMATION_MODAL_SERVICE} from 'core/confirmationModal/confirmationModal.service';
import {LOAD_BALANCER_WRITE_SERVICE} from 'core/loadBalancer/loadBalancer.write.service';

let angular = require('angular');

module.exports = angular.module('spinnaker.loadBalancer.dcos.details.controller', [
  require('angular-ui-router'),
  ACCOUNT_SERVICE,
  CONFIRMATION_MODAL_SERVICE,
  LOAD_BALANCER_WRITE_SERVICE,
  require('core/utils/selectOnDblClick.directive.js'),
])
  .controller('dcosLoadBalancerDetailsController', function ($scope, $state, $uibModal, loadBalancer, app,
                                                                   confirmationModalService, accountService, loadBalancerWriter,
                                                                   dcosProxyUiService, $q) {

    let application = app;

    $scope.state = {
      loading: true
    };

    function extractLoadBalancer() {
      $scope.loadBalancer = application.loadBalancers.data.filter(function (test) {
        return test.name === loadBalancer.name &&
          test.account === loadBalancer.accountId;
      })[0];

      if ($scope.loadBalancer) {
        $scope.state.loading = false;
      } else {
        autoClose();
      }

      return $q.when(null);
    }

    this.uiLink = function uiLink() {
      return dcosProxyUiService.buildLink($scope.loadBalancer.account, 'services', $scope.loadBalancer.region, $scope.loadBalancer.name);
    };

    this.showJson = function showJson() {
      $scope.userDataModalTitle = 'Application JSON';
      $scope.userData = $scope.loadBalancer.json;
      $uibModal.open({
        templateUrl: require('core/serverGroup/details/userData.html'),
        controller: 'CloseableModalCtrl',
        scope: $scope
      });
    };

    function autoClose() {
      if ($scope.$$destroyed) {
        return;
      }
      $state.params.allowModalToStayOpen = true;
      $state.go('^', null, {location: 'replace'});
    }

    extractLoadBalancer().then(() => {
      // If the user navigates away from the view before the initial extractLoadBalancer call completes,
      // do not bother subscribing to the refresh
      if (!$scope.$$destroyed) {
        app.loadBalancers.onRefresh($scope, extractLoadBalancer);
      }
    });

    this.editLoadBalancer = function editLoadBalancer() {
      $uibModal.open({
        templateUrl: require('../configure/wizard/editWizard.html'),
        controller: 'dcosUpsertLoadBalancerController as ctrl',
        size: 'lg',
        resolve: {
          application: function() { return application; },
          loadBalancer: function() { return angular.copy($scope.loadBalancer); },
          isNew: function() { return false; }
        }
      });
    };

    this.deleteLoadBalancer = function deleteLoadBalancer() {
      if ($scope.loadBalancer.instances && $scope.loadBalancer.instances.length) {
        return;
      }

      const taskMonitor = {
        application: application,
        title: 'Deleting ' + loadBalancer.name,
      };

      const command = {
        cloudProvider: 'dcos',
        loadBalancerName: $scope.loadBalancer.name,
        credentials: $scope.loadBalancer.account
      };

      const submitMethod = () => loadBalancerWriter.deleteLoadBalancer(command, application);

      confirmationModalService.confirm({
        header: 'Really delete ' + loadBalancer.name + '?',
        buttonText: 'Delete ' + loadBalancer.name,
        provider: 'dcos',
        account: loadBalancer.account,
        applicationName: application.name,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };
  }
);
