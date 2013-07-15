'use strict';

blocktoolApp.controller('BlockCtrl'
  , ['$rootScope', '$scope', 'Console', 'UIEvents', 'BlockService'
  , function($rootScope, $scope, console, UIEvents, BlockService) {




  /**
   * Is this block selected in the UI
   */
  $scope.IsSelected = function() {
    if ($scope.SelectedBlock) {
      return ($scope.SelectedBlock.Options.nodeId === $scope.Block.Options.nodeId);
    }
  };


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


  /**
   * Check if the Block is listening
   */
  $scope.IsListening = function() {
    return ($scope.Block.IsListening());
  };

  /**
   * Determine if this block is activated
   */
  $scope.IsActivated = function() {
    return ($scope.Block.Options.token !== null && $scope.Block.Options.token !== undefined && $scope.Block.Options.token !== "");
  };

  $scope.IsActivating = false;

  /**
   * Instigate Block Activation
   */
  $scope.Activate = function() {
    console.log('[Block]: Activating', $scope.Block.Options.nodeId);

    $scope.IsActivating = true;

    $scope.Block.Activate(function(token) {
      if (!$rootScope.$$phase) {
        $rootScope.$apply();
      }

      console.log('[Block]: Activated', $scope.Block.Options.nodeId);
      $rootScope.$broadcast(UIEvents.BlockActivated, $scope.Block);

    });
  };


  $scope.Deactivate = function() {
    $scope.Block.Options.token = null;
    $scope.IsActivating = false;
  }

  /**
   * Removes the block
   */
  $scope.Remove = function() {
    BlockService.RemoveBlock($scope.Block);
  };


  /**
   * Listen for server ServerSwitch
   */
  $rootScope.$on(UIEvents.ServerSwitch, function(event, server ) {
    // console.log("[Block]:", $scope.Block.Options);
    if ($scope.Block.hasOwnProperty("Tokens") && $scope.Block.Tokens.hasOwnProperty(server.Id)) {
      $scope.Block.Options.token = $scope.Block.Tokens[server.Id];
    } else {
      $scope.Block.Options.token = undefined;
    }
  });



}]);