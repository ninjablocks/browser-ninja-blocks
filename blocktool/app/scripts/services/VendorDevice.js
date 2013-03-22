'use strict';

blocktoolApp.factory('VendorDevice',
  ['$resource', '$http', 'UIEvents', '$rootScope', 'Underscore'
  , function($resource, $http, UIEvents, $rootScope, _) {

    // var VendorDevices = $resource('/json/vendor_devices.json');
    // var vendorDevices = VendorDevices.get(function(response) {
    //   console.log("Vendor Devices", response);
    // });

    var vendorDevices = {

      Devices: [],

      Load: function() {
        $http.get('/json/vendor_devices.json').success(function(response) {

          var data = response.data;

          data = _.pluck(data, 'device_type');
          data = _.without(data, "");
          data = _.sortBy(data, function(type) { return type; });
          data = _.uniq(data, true);

          // console.log("Vendor Devices", data);
          this.Devices = data;
          $rootScope.$broadcast(UIEvents.VendorDevicesLoaded, this.Devices);
        }.bind(this));
      }
    };

    vendorDevices.Load();

    return vendorDevices;


}]);