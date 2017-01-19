'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.dcos.serverGroup.paramsMixin', [])
  .factory('dcosServerGroupParamsMixin', function () {

    function destroyServerGroup(serverGroup) {
      return {
        namespace: serverGroup.namespace,
        interestingHealthProviderNames: ['DcosService']
      };
    }

    function enableServerGroup(serverGroup) {
      return {
          namespace: serverGroup.region,
          interestingHealthProviderNames: ['DcosService']
      };
    }

    function disableServerGroup(serverGroup) {
      return {
          namespace: serverGroup.region,
          interestingHealthProviderNames: ['DcosService']
      };
    }

    return {
      destroyServerGroup: destroyServerGroup,
      enableServerGroup: enableServerGroup,
      disableServerGroup: disableServerGroup,
    };
  });
