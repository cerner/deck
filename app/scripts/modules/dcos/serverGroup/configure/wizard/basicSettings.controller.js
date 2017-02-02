'use strict';

import {V2_MODAL_WIZARD_SERVICE} from 'core/modal/wizard/v2modalWizard.service';
import {NAMING_SERVICE} from 'core/naming/naming.service';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.dcos.basicSettings', [
  require('angular-ui-router'),
  require('angular-ui-bootstrap'),
  require('core/serverGroup/configure/common/basicSettingsMixin.controller.js'),
  V2_MODAL_WIZARD_SERVICE,
  NAMING_SERVICE,
])
  .controller('dcosServerGroupBasicSettingsController', function($scope, $controller, $uibModalStack, $state,
                                                                       v2modalWizardService, dcosImageReader, namingService) {
    angular.extend(this, $controller('BasicSettingsMixin', {
      $scope: $scope,
      imageReader: dcosImageReader,
      namingService: namingService,
      $uibModalStack: $uibModalStack,
      $state: $state,
    }));
  });
