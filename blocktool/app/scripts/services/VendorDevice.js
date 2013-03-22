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

      DeviceTypes: function() {
        var data = _.pluck(this.Devices, 'device_type');
        data = _.without(data, "");
        data = _.sortBy(data, function(type) { return type; });
        data = _.uniq(data, true);

        return data;
      },

      /**
       * Gets a device_type for a given deviceId
       * @param {[type]} deviceId [description]
       */
      GetTypeForDevice: function(deviceId) {
        var device = _.find(this.Devices, function(device) {
                      return device.did === parseInt(deviceId);
                    });

        if (device){
          return device.device_type;
        } else {
          return "";
        }
      },

      Load: function() {
        $http.get('/json/vendor_devices.json').success(function(response) {

          var data = response.data;
          data = _.sortBy(data, function(device) {
            return device.device_type;
          })
          this.Devices = data;

          $rootScope.$broadcast(UIEvents.VendorDevicesLoaded, this.Devices);
        }.bind(this));
      }
    };

    vendorDevices.Load();

    return vendorDevices;


}]);