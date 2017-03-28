'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.dcos.general.component', [])
  .component('dcosGeneral', {
    bindings: {
      general: '=',
    },
    templateUrl: require('./general.component.html'),
    controller: function () {
      if (this.general === undefined || this.general == null) {
        this.general = {};
      }
    }
  });
