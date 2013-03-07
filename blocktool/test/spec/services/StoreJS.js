'use strict';

describe('Service: StoreJS', function () {

  // load the service's module
  beforeEach(module('blocktoolApp'));

  // instantiate service
  var StoreJS;
  beforeEach(inject(function(_StoreJS_) {
    StoreJS = _StoreJS_;
  }));

  it('should do something', function () {
    expect(!!StoreJS).toBe(true);
  });

});
