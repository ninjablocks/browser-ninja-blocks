'use strict';

blocktoolApp.controller('BlockCtrl'
  , ['$rootScope', '$scope', 'Console', 'UIEvents', 'BlockService'
  , function($rootScope, $scope, console, UIEvents, BlockService) {





  /**
   * Listen for commands for the block
   */
  $scope.Listen = function() {
    $scope.Block.Listen();
  };

  /**
   * Stop listening for commands
   */
  $scope.StopListening = function() {
    $scope.Block.Stop();
  };

  $scope.IsListening = function() {
    return ($scope.Block.IsListening());
  };

  /**
   * Determine if this block is activated
   */
  $scope.IsActivated = function() {
    return ($scope.Block.Options.token !== null && $scope.Block.Options.token !== undefined && $scope.Block.Options.token !== "");
  };

  /**
   * Instigate Block Activation
   */
  $scope.Activate = function() {
    console.log('[Block]: Activating', $scope.Block.Options.nodeId);

    $scope.Block.Activate(function(token) {
      if (!$rootScope.$$phase) {
        $rootScope.$apply();
      }

      console.log('[Block]: Activated', $scope.Block.Options.nodeId);
      $rootScope.$broadcast(UIEvents.BlockActivated, $scope.Block);

    });
  };

  /**
   * Removes the block
   */
  $scope.Remove = function() {
    BlockService.RemoveBlock($scope.Block);
  };



}]);