'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.dcos.serverGroup.paramsMixin', [])
  .factory('dcosServerGroupParamsMixin', function () {

    function destroyServerGroup(serverGroup) {
      return {
        dcosCluster: serverGroup.dcosCluster,
        group: serverGroup.group,
        //region: serverGroup.region,
        interestingHealthProviderNames: ['DcosService']
      };
    }

    function enableServerGroup(serverGroup) {
      return {
        dcosCluster: serverGroup.dcosCluster,
        group: serverGroup.group,
        //region: serverGroup.region,
        interestingHealthProviderNames: ['DcosService']
      };
    }

    function disableServerGroup(serverGroup) {
      return {
        dcosCluster: serverGroup.dcosCluster,
        group: serverGroup.group,
        //region: serverGroup.region,
        interestingHealthProviderNames: ['DcosService']
      };
    }

    return {
      destroyServerGroup: destroyServerGroup,
      enableServerGroup: enableServerGroup,
      disableServerGroup: disableServerGroup,
    };
  });
