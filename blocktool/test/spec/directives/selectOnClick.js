'use strict';

describe('Directive: selectOnClick', function() {
  beforeEach(module('devicetoolApp'));

  var element;

  it('should make hidden element visible', inject(function($rootScope, $compile) {
    element = angular.element('<select-on-click></select-on-click>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the selectOnClick directive');
  }));
});
