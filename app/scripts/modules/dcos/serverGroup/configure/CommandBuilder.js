'use strict';

let angular = require('angular');

import {ACCOUNT_SERVICE} from 'core/account/account.service';
import {NAMING_SERVICE} from 'core/naming/naming.service';

module.exports = angular.module('spinnaker.dcos.serverGroupCommandBuilder.service', [
  ACCOUNT_SERVICE,
  NAMING_SERVICE,
])
  .factory('dcosServerGroupCommandBuilder', function (settings, $q,
                                                       accountService, namingService) {
    function buildNewServerGroupCommand(application, defaults) {
      defaults = defaults || {};

      var defaultCredentials = defaults.account || settings.providers.dcos.defaults.account;
      var defaultRegion = defaults.region || settings.providers.dcos.defaults.region;

      var command = {
        credentials: defaultCredentials,
        account: defaultCredentials,
        region: defaultRegion,
        application: application.name,
        stack: '',
        freeFormDetails: '',
        cmd: null,
        args: null,
        dcosUser: null,
        env: {},
        instances: 1,
        cpus: 0.5,
        mem: 512,
        disk: 0.0,
        gpus: 0.0,
        constraints: '',
        fetch: null,
        storeUrls: null,
        backoffSeconds: null,
        backoffFactor: null,
        maxLaunchDelaySeconds: null,
        readinessChecks: null,
        dependencies: null,
        upgradeStrategy: null,
        acceptedResourceRoles: null,
        residency: null,
        secrets: null,
        taskKillGracePeriodSeconds: null,
        requirePorts: false,
        container: null,
        docker: null,
        labels: {},
        healthChecks: [],
        persistentVolumes: [],
        dockerVolumes: [],
        externalVolumes: [],
        serviceEndpoints: [],
        viewState: {
          useSimpleCapacity: true,
          usePreferredZones: true,
          mode: defaults.mode || 'create',
        },
        cloudProvider: 'dcos',
        selectedProvider: 'dcos',
      };

      return $q.when(command);
    }

    // Only used to prepare view requiring template selecting
    function buildNewServerGroupCommandForPipeline() {
      return $q.when({
        viewState: {
          requiresTemplateSelection: true,
        }
      });
    }

    function buildServerGroupCommandFromExisting(application, serverGroup, mode) {
      mode = mode || 'clone';

      var serverGroupName = namingService.parseServerGroupName(serverGroup.name);

      var command = {
        credentials: serverGroup.account,
        account: serverGroup.account,
        region: serverGroup.region,
        application: application.name,
        stack: serverGroupName.stack,
        freeFormDetails: serverGroupName.freeFormDetails,
        cmd: serverGroup.cmd,
        args: serverGroup.args,
        dcosUser: serverGroup.user,
        env: serverGroup.env,
        instances: serverGroup.instances,
        cpus: serverGroup.cpus,
        mem: serverGroup.mem,
        disk: serverGroup.disk,
        gpus: serverGroup.gpus,
        constraints: serverGroup.constraints,
        fetch: serverGroup.fetch,
        storeUrls: serverGroup.storeUrls,
        backoffSeconds: serverGroup.backoffSeconds,
        backoffFactor: serverGroup.backoffFactor,
        maxLaunchDelaySeconds: serverGroup.maxLaunchDelaySeconds,
        container: serverGroup.container,
        docker: serverGroup.docker,
        healthChecks: serverGroup.healthChecks,
        readinessChecks: serverGroup.readinessChecks,
        dependencies: serverGroup.dependencies,
        upgradeStrategy: serverGroup.upgradeStrategy,
        labels: serverGroup.labels,
        acceptedResourceRoles: serverGroup.acceptedResourceRoles,
        residency: serverGroup.residency,
        secrets: serverGroup.secrets,
        taskKillGracePeriodSeconds: serverGroup.taskKillGracePeriodSeconds,
        requirePorts: serverGroup.requirePorts,
        serviceEndpoints: serverGroup.serviceEndpoints,
        persistentVolumes: serverGroup.persistentVolumes,
        dockerVolumes: serverGroup.dockerVolumes,
        externalVolumes: serverGroup.externalVolumes,
        cloudProvider: 'dcos',
        selectedProvider: 'dcos',
        viewState: {
          useSimpleCapacity: true,
          mode: mode,
        },
      };

      return $q.when(command);
    }

    function buildServerGroupCommandFromPipeline(application, originalCluster) {

      var pipelineCluster = _.cloneDeep(originalCluster);
      var commandOptions = {account: pipelineCluster.account, region: pipelineCluster.region};
      var asyncLoader = $q.all({command: buildNewServerGroupCommand(application, commandOptions)});

      return asyncLoader.then(function (asyncData) {
        var command = asyncData.command;

        var viewState = {
          disableImageSelection: true,
          useSimpleCapacity: true,
          mode: 'editPipeline',
          submitButtonLabel: 'Done',
        };

        var viewOverrides = {
          region: pipelineCluster.region,
          credentials: pipelineCluster.account,
          viewState: viewState,
        };

        pipelineCluster.strategy = pipelineCluster.strategy || '';
        var extendedCommand = angular.extend({}, command, pipelineCluster, viewOverrides);
        return extendedCommand;
      });

    }

    return {
      buildNewServerGroupCommand: buildNewServerGroupCommand,
      buildNewServerGroupCommandForPipeline: buildNewServerGroupCommandForPipeline,
      buildServerGroupCommandFromExisting: buildServerGroupCommandFromExisting,
      buildServerGroupCommandFromPipeline: buildServerGroupCommandFromPipeline,
    };
  });

