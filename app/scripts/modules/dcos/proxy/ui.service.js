'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.proxy.dcos.ui.service', [
  require('core/config/settings.js'),
])
  .factory('dcosProxyUiService', function(settings) {
    let apiPrefix = '#';

    function getHost(accountName) {
      let host = settings.providers.dcos.defaults.proxy;
      let account = settings.providers.dcos[accountName];

      if (account && account.proxy) {
        host = account.proxy;
      }

      if (!host.startsWith('http://') && !host.startsWith('https://')) {
        host = 'http://' + host;
      }

      return host;
    }

    function buildLink(accountName, kind, region, name, taskName = null) {

      let host = getHost(accountName);
      let link = host + '/' + apiPrefix + '/' + kind.toLowerCase() + '/' + encodeURIComponent('/' + accountName + '/' + region.replace('_', '/') + '/') + name;
      if (taskName) {
        link = link + '/tasks/' + taskName;
      }

      return link;
    }

    function buildLoadBalancerLink(accountName, kind, name) {
      return getHost(accountName) + '/' + apiPrefix + '/' + kind.toLowerCase() + '/' + encodeURIComponent('/' + accountName + '/') + name;
    }

    return {
      buildLink: buildLink,
      buildLoadBalancerLink: buildLoadBalancerLink
    };
  });
