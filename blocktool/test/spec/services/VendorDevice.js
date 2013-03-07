'use strict';

describe('Service: VendorDevice', function () {

  // load the service's module
  beforeEach(module('blocktoolApp'));

  // instantiate service
  var VendorDevice;
  beforeEach(inject(function(_VendorDevice_) {
    VendorDevice = _VendorDevice_;
  }));

  it('should do something', function () {
    expect(!!VendorDevice).toBe(true);
  });

});
