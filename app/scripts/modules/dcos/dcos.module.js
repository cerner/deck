'use strict';

let angular = require('angular');

import {CLOUD_PROVIDER_REGISTRY} from 'core/cloudProvider/cloudProvider.registry';

require('./logo/dcos.logo.less');

// load all templates into the $templateCache
var templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

module.exports = angular.module('spinnaker.dcos', [
  CLOUD_PROVIDER_REGISTRY,
])
  .config(function(cloudProviderRegistryProvider) {
    cloudProviderRegistryProvider.registerProvider('dcos', {
      name: 'DCOS',
      logo: {
        path: require('./logo/dcos.logo.png')
      },
    });
  });
