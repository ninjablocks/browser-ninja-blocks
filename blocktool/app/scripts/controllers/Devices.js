'use strict';

blocktoolApp.controller('DevicesCtrl',
  ['$rootScope', '$scope', 'BlockService', 'UIEvents'
  , function($rootScope, $scope, BlockService, UIEvents) {

    $scope.Devices = BlockService.GetBlocksDevices();


    $scope.UpdateDevices = function() {
      $scope.Devices = BlockService.GetBlocksDevices();      
    };

    $scope.$watch('BlockService.GetBlocksDevices()', function(event) {
      $scope.UpdateDevices();
    });

    $rootScope.$on(UIEvents.DeviceRemoved, function(event, device) {
      $scope.UpdateDevices();
    });

    $rootScope.$on(UIEvents.DeviceCreated, function(event, device) {
      $scope.UpdateDevices();
    });


}]);