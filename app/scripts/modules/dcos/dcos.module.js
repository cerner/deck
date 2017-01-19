'use strict';

let angular = require('angular');

import {CLOUD_PROVIDER_REGISTRY} from 'core/cloudProvider/cloudProvider.registry';
import {DCOS_KEY_VALUE_DETAILS} from './common/keyValueDetails.component';

require('./logo/dcos.logo.less');

// load all templates into the $templateCache
var templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

module.exports = angular.module('spinnaker.dcos', [
  CLOUD_PROVIDER_REGISTRY,
  DCOS_KEY_VALUE_DETAILS,
  require('./loadBalancer/configure/configure.dcos.module.js'),
  require('./loadBalancer/details/details.dcos.module.js'),
  require('./loadBalancer/transformer.js'),
  require('./instance/details/details.dcos.module.js'),
  require('./serverGroup/transformer.js'),
  require('./serverGroup/details/details.dcos.module.js'),
  require('./proxy/ui.service.js'),
])
  .config(function(cloudProviderRegistryProvider) {
    cloudProviderRegistryProvider.registerProvider('dcos', {
      name: 'DC/OS',
      logo: {
        path: require('./logo/dcos.logo.png')
      },
      instance: {
        detailsTemplateUrl: require('./instance/details/details.html'),
        detailsController: 'dcosInstanceDetailsController',
      },
      loadBalancer: {
        transformer: 'dcosLoadBalancerTransformer',
        detailsTemplateUrl: require('./loadBalancer/details/details.html'),
        detailsController: 'dcosLoadBalancerDetailsController',
        createLoadBalancerTemplateUrl: require('./loadBalancer/configure/wizard/createWizard.html'),
        createLoadBalancerController: 'dcosUpsertLoadBalancerController',
      },
      serverGroup: {
        skipUpstreamStageCheck: true,
        transformer: 'dcosServerGroupTransformer',
        detailsTemplateUrl: require('./serverGroup/details/details.html'),
        detailsController: 'dcosServerGroupDetailsController',
        //cloneServerGroupController: 'kubernetesCloneServerGroupController',
        //cloneServerGroupTemplateUrl: require('./serverGroup/configure/wizard/wizard.html'),
        //commandBuilder: 'kubernetesServerGroupCommandBuilder',
        //configurationService: 'kubernetesServerGroupConfigurationService',
        //paramsMixin: 'kubernetesServerGroupParamsMixin',
      },
    });
  });
