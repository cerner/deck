'use strict';

import {NAMING_SERVICE} from 'core/naming/naming.service';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.dcos.basicSettings', [
  require('core/serverGroup/configure/common/basicSettingsMixin.controller.js'),
  NAMING_SERVICE,
])
  .controller('dcosServerGroupBasicSettingsController', function($scope, $controller, $uibModalStack, $state,
                                                                       dcosImageReader, namingService) {
    angular.extend(this, $controller('BasicSettingsMixin', {
      $scope: $scope,
      imageReader: dcosImageReader,
      namingService: namingService,
      $uibModalStack: $uibModalStack,
      $state: $state,
    }));
  });
