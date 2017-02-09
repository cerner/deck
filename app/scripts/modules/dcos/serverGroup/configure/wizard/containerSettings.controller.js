'use strict';

import {Observable, Subject} from 'rxjs';
import {V2_MODAL_WIZARD_SERVICE} from 'core/modal/wizard/v2modalWizard.service';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.dcos.containerSettings', [
  require('angular-ui-router'),
  require('angular-ui-bootstrap'),
  require('core/serverGroup/configure/common/basicSettingsMixin.controller.js'),
  V2_MODAL_WIZARD_SERVICE,
])
  .controller('dcosServerGroupContainerSettingsController', function($scope, $controller, $uibModalStack, $state,
                                                                       v2modalWizardService, dcosImageReader,
                                                                       dcosServerGroupConfigurationService) {
    this.groupByRegistry = function (image) {
      if (image) {
        if (image.fromContext) {
          return 'Find Image Result(s)';
        } else if (image.fromTrigger) {
          return 'Images from Trigger(s)';
        } else {
          return image.registry;
        }
      }
    };

    function searchImages(q) {
      return Observable.fromPromise(
        dcosServerGroupConfigurationService
          .configureCommand($scope.application, $scope.command, q)
      );
    }

    var imageSearchResultsStream = new Subject();

    imageSearchResultsStream
      .debounceTime(250)
      .switchMap(searchImages)
      .subscribe();

    this.searchImages = function(q) {
      imageSearchResultsStream.next(q);
    };

    angular.extend(this, $controller('BasicSettingsMixin', {
      $scope: $scope,
      imageReader: dcosImageReader,
      $uibModalStack: $uibModalStack,
      $state: $state,
    }));
  });
