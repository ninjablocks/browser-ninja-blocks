'use strict';

blocktoolApp.controller('DeviceFactoryCtrl',
  ['$rootScope', '$scope', 'NinjaService', 'NinjaUtilities', 'BlockService', 'UIEvents', 'Underscore'
  , function($rootScope, $scope, NinjaService, NinjaUtilities, BlockService, UIEvents, _) {


    /**
     * Array of Device Types
     * @type {[type]}
     */
    $scope.Types = Ninja.DeviceTypes;

    /**
     * Array of Blocks
     * @type {[type]}
     */
    $scope.Blocks = BlockService.Blocks;


    /**
     * Watch the Blocks
     */
    $scope.$watch('BlockService.Blocks', function(event) {
      $scope.Blocks = BlockService.Blocks;
    });


    /**
     * Block to create the device on
     * @type {String}
     */
    $scope.BlockNodeId = '';

    /**
     * Function to execute
     * @type {[type]}
     */
    $scope.OnActuateCode = null;

    /**
     * DeviceOptions to create the device
     * @type {Object}
     */
    $scope.DeviceOptions = {
      type: '',
      deviceId: 0,
      name: '',
      vendor: 0,
      port: 0
    };


    /**
     * Parses the OnActuate code into a Function (if possible)
     * Returns null if not;
     */
    $scope.ParseOnActuate = function(code) {
      try {
        var onActuate = new Function("DA", "block", "device", code);
        return onActuate;
      } catch (e) {
        return null;
      }
    };


    /**
     * Creates a Device
     */
    $scope.CreateDevice = function() {
      // Attach an actuate handler
      var deviceOptions = _.clone($scope.DeviceOptions);

      var code = $scope.OnActuateCode;

      // Parse the code
      var onActuate = $scope.ParseOnActuate($scope.OnActuateCode);

      var device = new NinjaService.Device(deviceOptions);

      // Wrap the on Actuate callback
      device.Actuate = BlockService.ConstructOnActuateFn(onActuate, device);

      // Set the actuate code
      if (onActuate) {
        device.Options.onActuateCode = code;
      }

      var block = BlockService.GetBlockByNodeId($scope.BlockNodeId);
      if (block) {
        block.RegisterDevice(device);
      }

      $rootScope.$broadcast(UIEvents.DeviceCreated, device);

      $scope.ResetDevice();
      
    };
    
    /**
     * Reset the Device factory
     */
    $scope.ResetDevice = function() {
      $scope.OnActuate = null;
      $scope.DeviceOptions = {
        type: '',
        deviceId: 0,
        name: '',
        vendor: 0,
        port: 0
      };
      $scope.BlockNodeId = '';
    };


    $rootScope.$on(UIEvents.BlockSelect, function(event, block) {
      $scope.BlockNodeId = block.Options.nodeId;
    });
}]);
