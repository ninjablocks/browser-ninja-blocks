'use strict';

blocktoolApp.controller('DeviceCtrl',
  ['$rootScope', '$scope', 'Console', 'UIEvents'
  , function($rootScope, $scope, console, UIEvents) {


    /**
     * Emit a data value for the device
     */
    $scope.Emit = function() {
      $scope.Device.Emit($scope.Device.Options.value);
    };


    /**
     * Delete/Remove this device
     */
    $scope.Remove = function() {
      console.log("[Device]: Removing", $scope.Device.GUID());
      $scope.Device.Options.block.UnregisterDevice($scope.Device);
      $rootScope.$broadcast(UIEvents.DeviceRemoved, $scope.Device);
      if (!$rootScope.$$phase) { $rootScope.$apply(); }
    };

    $rootScope.$on(UIEvents.DeviceActuate, function(event, device) {
      $scope.$apply();
    });

}]);