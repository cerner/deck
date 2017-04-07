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

      this.idPattern = {
        test: function(id) {
          var pattern = /^([a-z0-9]*(\${.+})*)*$/;
          return pattern.test(id);
        }
      };
    }
  });
