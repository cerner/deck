'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.dcos.group.selectField.directive', [])
  .directive('dcosSelectField', function () {
    return {
      restrict: 'E',
      templateUrl: require('./selectField.directive.html'),
      scope: {
        namespaces: '=',
        component: '=',
        field: '@',
        columns: '@',
        account: '=',
        onChange: '&',
        hideLabel: '=',
      }
    };
  });
