'use strict';

import _ from 'lodash';

import {ACCOUNT_SERVICE} from 'core/account/account.service';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.dcos.configuration.service', [
  ACCOUNT_SERVICE,
  require('../../image/image.reader.js'),
])
  .factory('dcosServerGroupConfigurationService', function($q, accountService, dcosImageReader) {
    function configureCommand(application, command, query = '') {
      let queries = command.docker.image ? [grabImageAndTag(command.docker.image.imageId)] : [];

      if (query) {
        queries.push(query);
      }

      let imagesPromise;
      if (queries.length) {
        imagesPromise = $q.all(queries
          .map(q => dcosImageReader.findImages({
            provider: 'dockerRegistry',
            count: 50,
            q: q })))
          .then(_.flatten);
      } else {
        imagesPromise = $q.when([]);
      }

      return $q.all({
        accounts: accountService.listAccounts('dcos'),
        allImages: imagesPromise
      }).then(function(backingData) {
        backingData.filtered = {};

        if (command.viewState.contextImages) {
          backingData.allImages = backingData.allImages.concat(command.viewState.contextImages);
        }

        command.backingData = backingData;

        var accountMap = _.fromPairs(_.map(backingData.accounts, function(account) {
          return [account.name, accountService.getAccountDetails(account.name)];
        }));

        return $q.all(accountMap).then(function(accountMap) {
          command.backingData.accountMap = accountMap;
          configureAccount(command);
          attachEventHandlers(command);
        });
      });
    }

    function grabImageAndTag(imageId) {
      return imageId.split('/').pop();
    }

    function buildImageId(image) {
      if (image.fromContext) {
        return `${image.cluster} ${image.pattern}`;
      } else if (image.fromTrigger && !image.tag) {
        return `${image.registry}/${image.repository} (Tag resolved at runtime)`;
      } else {
        return `${image.registry}/${image.repository}:${image.tag}`;
      }
    }

    function configureDockerRegistries(command) {
      var result = { dirty: {} };
      command.backingData.filtered.dockerRegistries = command.backingData.account.dockerRegistries;
      return result;
    }

    function configureImages(command) {
      var result = { dirty: {} };

      if (!command.account) {
        command.backingData.filtered.images = [];
      } else {
        var registryAccountNames = _.map(command.backingData.account.dockerRegistries, function(registry) {
          return registry.accountName;
        });
        command.backingData.filtered.images = _.map(_.filter(command.backingData.allImages, function(image) {
          return image.fromContext || image.fromTrigger || _.includes(registryAccountNames, image.account) || image.message;
        }), function(image) {
          return mapImage(image);
        });

        if (command.docker.image && !_.some(command.backingData.filtered.images, {imageId: command.docker.image.imageId})) {
          result.dirty.imageId = command.docker.image.imageId;
          command.docker.image = null;
        }
      }

      return result;
    }

    function mapImage(image) {
      if (image.message !== undefined) {
        return image;
      }

      return {
        repository: image.repository,
        tag: image.tag,
        imageId: buildImageId(image),
        registry: image.registry,
        fromContext: image.fromContext,
        fromTrigger: image.fromTrigger,
        cluster: image.cluster,
        account: image.account,
        pattern: image.pattern,
        stageId: image.stageId,
      };
    }

    function configureAccount(command) {
      var result = { dirty: {} };

      command.backingData.account = command.backingData.accountMap[command.account];
      if (command.backingData.account) {
        angular.extend(result.dirty, configureDockerRegistries(command).dirty);
        angular.extend(result.dirty, configureImages(command).dirty);
      }

      return result;
    }

    function attachEventHandlers(command) {
      command.accountChanged = function accountChanged() {
        var result = { dirty: {} };
        angular.extend(result.dirty, configureAccount(command).dirty);
        command.viewState.dirty = command.viewState.dirty || {};
        angular.extend(command.viewState.dirty, result.dirty);
        return result;
      };
    }

    return {
      configureCommand: configureCommand,
      configureAccount: configureAccount,
      configureImages: configureImages,
      configureDockerRegistries: configureDockerRegistries,
      buildImageId: buildImageId
    };
  });
