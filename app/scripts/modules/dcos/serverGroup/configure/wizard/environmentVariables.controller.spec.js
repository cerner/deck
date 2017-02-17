'use strict';

describe('dcosServerGroupEnvironmentVariablesController', function() {

  var controller;
  var scope;

  beforeEach(
    window.module(
      require('./environmentVariables.controller.js')
    )
  );

  beforeEach(window.inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    scope.command = {};

    controller = $controller('dcosServerGroupEnvironmentVariablesController', {
      $scope: scope,
    });
  }));

  describe('Environment Variables', function () {

    beforeEach(function() {
      scope.command.env = [];
    });

    it('Environment Variables spec 1', function () {
      controller.addEnvironmentVariable();

      expect(scope.command.env.length).toEqual(1);
    });

    it('Environment Variables spec 2', function () {
      var index = 0;

      controller.addEnvironmentVariable();

      scope.command.env[index].name = 'Key';
      scope.command.env[index].value = 'Value';
      scope.command.env[index].rawValue = scope.command.env[index].value;
      scope.command.env[index].isSecret = true;

      controller.addSecret(index);

      expect(scope.command.env.length).toEqual(1);
      expect(Object.keys(scope.command.secrets).length).toEqual(1);
    });

    it('Environment Variables spec 3', function () {
      var index = 0;

      controller.addEnvironmentVariable();

      scope.command.env[index].name = 'Key';
      scope.command.env[index].value = 'Value';
      scope.command.env[index].rawValue = scope.command.env[index].value;
      scope.command.env[index].isSecret = true;

      controller.addSecret(index);
      controller.removeSecret(index);

      expect(scope.command.env.length).toEqual(1);
      expect(Object.keys(scope.command.secrets).length).toEqual(0);
    });

    it('Environment Variables spec 4', function () {
      var index = 0;

      controller.addEnvironmentVariable();

      scope.command.env[index].name = 'Key';
      scope.command.env[index].value = 'oldValue';
      scope.command.env[index].rawValue = 'newValue';

      controller.updateValue(index);

      expect(scope.command.env[index].value).toEqual(scope.command.env[index].rawValue);
    });

    it('Environment Variables spec 5', function () {
      var index = 0;

      controller.addEnvironmentVariable();

      scope.command.env[index].name = 'Key';
      scope.command.env[index].value = 'oldValue';
      scope.command.env[index].rawValue = scope.command.env[index].value;
      scope.command.env[index].isSecret = true;

      controller.addSecret(index);
      controller.updateValue(index);

      expect(scope.command.secrets['secret' + index].source).toEqual(scope.command.env[index].rawValue);
    });

    it('Environment Variables spec 6', function () {
      controller.addEnvironmentVariable();
      controller.removeEnvironmentVariable(0);

      expect(scope.command.env.length).toEqual(0);
    });

    it('Environment Variables spec 7', function () {
      var index = 0;

      controller.addEnvironmentVariable();

      scope.command.env[index].name = 'Key';
      scope.command.env[index].value = 'oldValue';
      scope.command.env[index].rawValue = scope.command.env[index].value;
      scope.command.env[index].isSecret = false;

      controller.updateSecret(index, scope.command.env[index].isSecret);

      expect(scope.command.env.length).toEqual(1);
      expect(Object.keys(scope.command.secrets).length).toEqual(1);

      scope.command.env[index].isSecret = true;

      controller.updateSecret(index, scope.command.env[index].isSecret);

      expect(scope.command.env.length).toEqual(1);
      expect(Object.keys(scope.command.secrets).length).toEqual(0);

    });
  });
});
