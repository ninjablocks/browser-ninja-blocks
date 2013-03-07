'use strict';

describe('Service: Debug', function () {

  // load the service's module
  beforeEach(module('devicetoolApp'));

  // instantiate service
  var Debug;
  beforeEach(inject(function(_Debug_) {
    Debug = _Debug_;
  }));

  it('should do something', function () {
    expect(!!Debug).toBe(true);
  });

});
