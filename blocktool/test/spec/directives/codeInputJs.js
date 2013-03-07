'use strict';

describe('Directive: codeInputJs', function() {
  beforeEach(module('blocktoolApp'));

  var element;

  it('should make hidden element visible', inject(function($rootScope, $compile) {
    element = angular.element('<code-input-js></code-input-js>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the codeInputJs directive');
  }));
});
