'use strict';

import {Observable, Subject} from 'rxjs';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.dcos.containerSettings', [
])
  .controller('dcosServerGroupContainerSettingsController', function($scope, dcosServerGroupConfigurationService) {
    this.groupByRegistry = function (image) {
      if (image) {
        if (image.fromContext) {
          return 'Find Image Result(s)';
        } else if (image.fromTrigger) {
          return 'Images from Trigger(s)';
        } else {
          return image.registry;
        }
      }
    };

    function searchImages(q) {
      return Observable.fromPromise(
        dcosServerGroupConfigurationService
          .configureCommand($scope.application, $scope.command, q)
      );
    }

    var imageSearchResultsStream = new Subject();

    imageSearchResultsStream
      .debounceTime(250)
      .switchMap(searchImages)
      .subscribe();

    this.searchImages = function(q) {
      imageSearchResultsStream.next(q);
    };
  });
