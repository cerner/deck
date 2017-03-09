'use strict';

import _ from 'lodash';

let angular = require('angular');

module.exports = angular.module('spinnaker.dcos.loadBalancer.transformer', [])
  .factory('dcosLoadBalancerTransformer', function ($q, settings) {
    function normalizeLoadBalancer(loadBalancer) {
      loadBalancer.provider = loadBalancer.type;
      loadBalancer.instances = [];
      loadBalancer.instanceCounts = buildInstanceCounts(loadBalancer.serverGroups);
      return $q.resolve(loadBalancer);
    }

    function buildInstanceCounts(serverGroups) {
      let instanceCounts = _.chain(serverGroups)
        .map('instances')
        .flatten()
        .reduce(
          (acc, instance) => {
            acc[_.camelCase(instance.health.state)]++;
            return acc;
          },
          {
            up: 0,
            down: 0,
            outOfService: 0,
            succeeded: 0,
            failed: 0,
            unknown: 0,
          }
        )
        .value();

      instanceCounts.outOfService += _.chain(serverGroups)
        .map('detachedInstances')
        .flatten()
        .value()
        .length;

      return instanceCounts;
    }

    function constructNewLoadBalancerTemplate() {
      return {
        provider: 'dcos',
        bindHttpHttps: true,
        cpus: 2,
        instances: 1,
        mem: 1024,
        acceptedResourceRoles: ['slave_public'],
        portRange: {
          protocol: 'tcp',
          minPort: 10000,
          maxPort: 10100
        },
        credentials: settings.providers.dcos ? settings.providers.dcos.defaults.account : null,
      };
    }

    function convertLoadBalancerForEditing(loadBalancer) {
      return loadBalancer.description;
    }

    return {
      normalizeLoadBalancer: normalizeLoadBalancer,
      constructNewLoadBalancerTemplate: constructNewLoadBalancerTemplate,
      convertLoadBalancerForEditing: convertLoadBalancerForEditing
    };
  });
