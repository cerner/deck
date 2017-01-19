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

    function buildLink(accountName, kind, group, name, taskName = null) {
      let host = getHost(accountName);
      // TODO group may not be prefixed with / or could also be postfixed with /. Need to figure this out.
      let link = host + '/' + apiPrefix + '/' + kind.toLowerCase() + '/' + encodeURIComponent('/' + accountName + '/' + (group == 'root' ? '' : group + '/') + name);
      if (taskName) {
        link = link + '/tasks/' + taskName;
      }

      return link;
    }

    return {
      buildLink: buildLink,
    };
  });
