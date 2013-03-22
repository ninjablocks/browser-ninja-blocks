'use strict';

describe('Directive: foundationSelect', function() {
  beforeEach(module('blocktoolApp'));

  var element;

  it('should make hidden element visible', inject(function($rootScope, $compile) {
    element = angular.element('<foundation-select></foundation-select>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the foundationSelect directive');
  }));
});
