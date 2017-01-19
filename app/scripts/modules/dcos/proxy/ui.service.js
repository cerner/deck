'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.proxy.dcos.ui.service', [
  require('core/config/settings.js'),
])
  .factory('dcosProxyUiService', function(settings) {
    //TODO Could we use this to proxy to DCOS itself?
    let apiPrefix = 'api/v1/proxy/namespaces/kube-system/services/kubernetes-dashboard/#';

    function getHost(accountName) {
      let host = settings.providers.kubernetes.defaults.proxy;
      let account = settings.providers.kubernetes[accountName];

      if (account && account.proxy) {
        host = account.proxy;
      }

      if (!host.startsWith('http://') && !host.startsWith('https://')) {
        host = 'http://' + host;
      }

      return host;
    }

    function buildLink(accountName, kind, namespace, serverGroupName) {
      let host = getHost(accountName);
      return host + '/' + apiPrefix + '/' + kind.toLowerCase() + '/' + namespace + '/' + serverGroupName;
    }

    return {
      buildLink: buildLink,
    };
  });
