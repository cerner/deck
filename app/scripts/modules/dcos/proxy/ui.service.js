'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.proxy.dcos.ui.service', [
  require('core/config/settings.js'),
])
  .factory('dcosProxyUiService', function(settings) {
    //TODO Could we use this to proxy to DCOS itself?
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

      // TODO the region == 'global' check should probably change, in the case where they actually set the region as global. This only applies to load balancers.
      let link = host + '/' + apiPrefix + '/' + kind.toLowerCase() + '/' + encodeURIComponent('/' + accountName + '/' + (region == 'global' ? '' : region.replace('_', '/') + '/') + name);
      if (taskName) {
        link = link + '/tasks/' + taskName;
      }

      return link;
    }

    return {
      buildLink: buildLink,
    };
  });
