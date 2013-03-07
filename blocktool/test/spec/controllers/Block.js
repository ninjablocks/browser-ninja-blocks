'use strict';

describe('Controller: BlockCtrl', function() {

  // load the controller's module
  beforeEach(module('devicetoolApp'));

  var BlockCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    scope = {};
    BlockCtrl = $controller('BlockCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
