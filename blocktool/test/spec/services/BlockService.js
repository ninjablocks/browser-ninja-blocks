'use strict';

describe('Service: BlockService', function () {

  // load the service's module
  beforeEach(module('blocktoolApp'));

  // instantiate service
  var BlockService;
  beforeEach(inject(function(_BlockService_) {
    BlockService = _BlockService_;
  }));

  it('should do something', function () {
    expect(!!BlockService).toBe(true);
  });

});
