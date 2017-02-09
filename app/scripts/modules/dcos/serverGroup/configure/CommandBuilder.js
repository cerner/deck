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
    function reconcileUpstreamImages(image, upstreamImages) {
        if (image.fromContext) {
          let matchingImage = upstreamImages.find((otherImage) => image.stageId === otherImage.stageId);

          if (matchingImage) {
            image.cluster = matchingImage.cluster;
            image.pattern = matchingImage.pattern;
            image.repository = matchingImage.repository;
            return image;
          } else {
            return null;
          }
        } else if (image.fromTrigger) {
          let matchingImage = upstreamImages.find((otherImage) => {
            return image.registry === otherImage.registry
              && image.repository === otherImage.repository
              && image.tag === otherImage.tag;
          });

          if (matchingImage) {
            return image;
          } else {
            return null;
          }
        } else {
          return image;
        }
    }

    function findUpstreamImages(current, all, visited = {}) {
      // This actually indicates a loop in the stage dependencies.
      if (visited[current.refId]) {
        return [];
      } else {
        visited[current.refId] = true;
      }
      let result = [];
      if (current.type === 'findImage') {
        result.push({
          fromContext: true,
          cluster: current.cluster,
          pattern: current.imageNamePattern,
          repository: current.name,
          stageId: current.refId
        });
      }
      current.requisiteStageRefIds.forEach(function(id) {
        let next = all.find((stage) => stage.refId === id);
        if (next) {
          result = result.concat(findUpstreamImages(next, all, visited));
        }
      });

      return result;
    }

    function findTriggerImages(triggers) {
      return triggers.filter((trigger) => {
        return trigger.type === 'docker';
      }).map((trigger) => {
        return {
          fromTrigger: true,
          repository: trigger.repository,
          account: trigger.account,
          organization: trigger.organization,
          registry: trigger.registry,
          tag: trigger.tag,
        };
      });
    }

    function buildNewServerGroupCommand(application, defaults = {}) {
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
        docker: null,
        labels: {},
        healthChecks: [],
        persistentVolumes: [],
        dockerVolumes: [],
        externalVolumes: [],
        serviceEndpoints: [],
        viewState: {
          mode: defaults.mode || 'create',
        },
        cloudProvider: 'dcos',
        selectedProvider: 'dcos',
      };

      return $q.when(command);
    }

    function buildNewServerGroupCommandForPipeline(current, pipeline) {
      let contextImages = findUpstreamImages(current, pipeline.stages) || [];
      contextImages = contextImages.concat(findTriggerImages(pipeline.triggers));

      return $q.when({
        viewState: {
          contextImages: contextImages,
          mode: 'editPipeline',
          requiresTemplateSelection: true,
        }
      });
    }

    function buildServerGroupCommandFromExisting(application, existing, mode) {
      mode = mode || 'clone';

      var serverGroupName = namingService.parseServerGroupName(existing.name);

      var command = {
        credentials: existing.account,
        account: existing.account,
        region: existing.region,
        application: existing.name,
        stack: serverGroupName.stack,
        freeFormDetails: serverGroupName.freeFormDetails,
        cmd: existing.cmd,
        args: existing.args,
        dcosUser: existing.user,
        env: existing.env,
        instances: existing.instances,
        cpus: existing.cpus,
        mem: existing.mem,
        disk: existing.disk,
        gpus: existing.gpus,
        constraints: existing.constraints,
        fetch: existing.fetch,
        storeUrls: existing.storeUrls,
        backoffSeconds: existing.backoffSeconds,
        backoffFactor: existing.backoffFactor,
        maxLaunchDelaySeconds: existing.maxLaunchDelaySeconds,
        container: existing.container,
        docker: existing.docker,
        healthChecks: existing.healthChecks,
        readinessChecks: existing.readinessChecks,
        dependencies: existing.dependencies,
        upgradeStrategy: existing.upgradeStrategy,
        labels: existing.labels,
        acceptedResourceRoles: existing.acceptedResourceRoles,
        residency: existing.residency,
        secrets: existing.secrets,
        taskKillGracePeriodSeconds: existing.taskKillGracePeriodSeconds,
        requirePorts: existing.requirePorts,
        serviceEndpoints: existing.serviceEndpoints,
        persistentVolumes: existing.persistentVolumes,
        dockerVolumes: existing.dockerVolumes,
        externalVolumes: existing.externalVolumes,
        cloudProvider: 'dcos',
        selectedProvider: 'dcos',
        viewState: {
          mode: mode,
        },
      };

      return $q.when(command);
    }

    function buildServerGroupCommandFromPipeline(application, originalCluster, current, pipeline) {
      var pipelineCluster = _.cloneDeep(originalCluster);

      var commandOptions = {account: pipelineCluster.account, region: pipelineCluster.region};
      var asyncLoader = $q.all({command: buildNewServerGroupCommand(application, commandOptions)});


      return asyncLoader.then(function (asyncData) {
        var command = asyncData.command;

        let contextImages = findUpstreamImages(current, pipeline.stages) || [];
        contextImages = contextImages.concat(findTriggerImages(pipeline.triggers));

        if (command.docker && command.docker.image) {
          command.docker.image = reconcileUpstreamImages(command.docker.image, contextImages);
        }

        var viewState = {
          contextImages: contextImages,
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

