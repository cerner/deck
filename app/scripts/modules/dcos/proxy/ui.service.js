'use strict';

const angular = require('angular');

import {DcosProviderSettings} from '../dcos.settings';

module.exports = angular.module('spinnaker.proxy.dcos.ui.service', [])
  .factory('dcosProxyUiService', function() {
    let apiPrefix = '#';

    function getHost(accountName) {
      let host = DcosProviderSettings.defaults.proxy;
      let account = DcosProviderSettings[accountName];

      if (account && account.proxy) {
        host = account.proxy;
      }

      if (!host.startsWith('http://') && !host.startsWith('https://')) {
        host = 'http://' + host;
      }

      return host;
    }

    function buildLink(accountName, region, name, taskName = null) {

      let host = getHost(accountName);
      let link = host + '/' + apiPrefix + '/services/overview/' + encodeURIComponent('/' + accountName + '/' + region.replace('_', '/') + '/') + name;
      if (taskName) {
        link = link + '/tasks/' + taskName;
      }

      return link;
    }

    function buildLoadBalancerLink(accountName, name) {
      return getHost(accountName) + '/' + apiPrefix + '/services/overview/' + encodeURIComponent('/' + accountName + '/') + name;
    }

    return {
      buildLink: buildLink,
      buildLoadBalancerLink: buildLoadBalancerLink
    };
  });
