'use strict';

describe('Service: Underscore', function () {

  // load the service's module
  beforeEach(module('devicetoolApp'));

  // instantiate service
  var Underscore;
  beforeEach(inject(function(_Underscore_) {
    Underscore = _Underscore_;
  }));

  it('should do something', function () {
    expect(!!Underscore).toBe(true);
  });

});
