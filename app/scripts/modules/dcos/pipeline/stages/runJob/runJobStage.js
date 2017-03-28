'use strict';

import _ from 'lodash';

let angular = require('angular');

import {DOCKER_IMAGE_AND_TAG_SELECTOR_COMPONENT} from 'docker/image/dockerImageAndTagSelector.component';

module.exports = angular.module('spinnaker.core.pipeline.stage.dcos.runJobStage', [
  DOCKER_IMAGE_AND_TAG_SELECTOR_COMPONENT,
  require('dcos/job/general.component.js'),
  require('dcos/job/schedule.component.js'),
  require('dcos/job/labels.component.js'),
  require('./runJobExecutionDetails.controller.js')
])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      provides: 'runJob',
      cloudProvider: 'dcos',
      templateUrl: require('./runJobStage.html'),
      executionDetailsUrl: require('./runJobExecutionDetails.html'),
      validators: [
        { type: 'requiredField', fieldName: 'account' },
        { type: 'requiredField', fieldName: 'general.id' }
      ]
    });
  }).controller('dcosRunJobStageCtrl', function($scope, accountService) {
    this.stage = $scope.stage;
    if (!_.has(this.stage, 'name')) {
      _.set(this.stage, 'name', Date.now().toString());
    }

    accountService.listAccounts('dcos')
      .then((accounts) => {
        this.accounts = accounts;
      });

    this.stage.cloudProvider = 'dcos';
    this.stage.application = $scope.application.name;

    if (this.docker === undefined || this.docker == null) {
      this.stage.docker = {
        image: {}
      };
    }

    if (!this.stage.credentials && $scope.application.defaultCredentials.dcos) {
      this.stage.credentials = $scope.application.defaultCredentials.dcos;
    }

    this.onChange = (changes) => {
      this.stage.docker.image.registry = changes.registry;
    };
  });
