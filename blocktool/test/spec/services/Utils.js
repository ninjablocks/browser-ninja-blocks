'use strict';

describe('Service: Utils', function () {

  // load the service's module
  beforeEach(module('devicetoolApp'));

  // instantiate service
  var Utils;
  beforeEach(inject(function(_Utils_) {
    Utils = _Utils_;
  }));

  it('should do something', function () {
    expect(!!Utils).toBe(true);
  });

});
