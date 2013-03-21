'use strict';

blocktoolApp.controller('DeviceCtrl',
  ['$rootScope', '$scope', 'Console', 'UIEvents', 'BlockService'
  , function($rootScope, $scope, console, UIEvents, BlockService) {


    $scope.EMITMODES = {
      STRING: 0,
      JSON: 1
    };

    $scope.OnActuateCode = $scope.Device.Options.onActuateCode;

    $scope.EmitMode = $scope.EMITMODES.STRING;

    /**
     * Emit a data value for the device
     */
    $scope.Emit = function() {
      var emitData = $scope.Device.Options.value;
      $scope.Device.Emit(emitData);
    };


    /**
     * Toggles the emit mode
     */
    $scope.ToggleEmitMode = function() {
      if ($scope.EmitMode == $scope.EMITMODES.STRING) {
        $scope.EmitMode = $scope.EMITMODES.JSON;
      } else {
        $scope.EmitMode = $scope.EMITMODES.STRING;
      }
    };

    /**
     * Tests the emit mode with specified mode
     * @param {EMITMODES} mode Mode to test
     */
    $scope.IsEmitMode = function(mode) {
      return ($scope.EmitMode === mode);
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

    /**
     * Updates this devices onActuate code
     */
    $scope.UpdateOnActuate = function() {

      var onActuate = null;

      try {
        onActuate = new Function("DA", "block", "device", $scope.OnActuateCode);
      } catch (e) {}

      if (onActuate) {
        var fn = BlockService.ConstructOnActuateFn(onActuate, $scope.Device).bind($scope.Device);

        // Assign new functionality
        $scope.Device.Actuate = fn;
        $scope.Device.Options.onActuateCode = $scope.OnActuateCode;
        $scope.Device.Options.onActuate = fn;
      }
    };

}]);