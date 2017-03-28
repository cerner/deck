'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.core.pipeline.stage.disableCluster.dcos.runJobExecutionDetails.controller', [
    require('angular-ui-router'),
  ])
  .controller('dcosRunJobExecutionDetailsCtrl', function ($scope, $stateParams, executionDetailsSectionService) {

    $scope.configSections = ['runJobConfig', 'taskStatus'];

    let initialized = () => {
      $scope.detailsSection = $stateParams.details;
    };

    let initialize = () => executionDetailsSectionService.synchronizeSection($scope.configSections, initialized);

    initialize();

    $scope.$on('$stateChangeSuccess', initialize);

  });
