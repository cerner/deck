'use strict';

describe('dcosServerGroupCommandBuilder', function() {

  beforeEach(
    window.module(
      require('./CommandBuilder.js')
    )
  );

  beforeEach(window.inject(function(dcosServerGroupCommandBuilder, accountService, namingService, $q, $rootScope, _settings_) {
    this.dcosServerGroupCommandBuilder = dcosServerGroupCommandBuilder;
    this.$scope = $rootScope;
    this.$q = $q;
    this.settings = _settings_;
    this.accountService = accountService;
    this.namingService = namingService;
  }));

  describe('buildNewServerGroupCommand', function() {
    it('should initializes to default values', function () {
      var command = null;
      this.dcosServerGroupCommandBuilder.buildNewServerGroupCommand({ name: 'dcosApp' }).then(function(result) {
        command = result;
      });

      this.$scope.$digest();
      expect(command.viewState.mode).toBe('create');
    });
  });

  describe('buildServerGroupCommandFromExisting', function () {
    it('should use base server group otherwise use the default', function() {
      spyOn(this.namingService, 'parseServerGroupName').and.returnValue(this.$q.when('dcosApp-test-test'));

      var baseServerGroup = {};
      baseServerGroup.deployDescription = {
        account: 'prod',
        region: 'test',
        cluster: 'dcos-test-test',
        type: 'dcos',
        cloudProvider: 'dcos',
        resources: {},
        capacity: {},
        image: {}
      };

      var command = null;
      this.dcosServerGroupCommandBuilder.buildServerGroupCommandFromExisting({name: 'dcosApp'}, baseServerGroup).then(function(result) {
        command = result;
      });

      this.$scope.$digest();

      expect(command.viewState.mode).toBe('clone');
    });
  });
});
