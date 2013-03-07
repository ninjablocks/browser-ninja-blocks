'use strict';

blocktoolApp.controller('BlocksCtrl'
  , ['$rootScope', '$scope', 'Utils', 'BlockService', 'UIEvents'
  , function($rootScope, $scope, Utils, BlockService, UIEvents) {

    /**
     * Blocks array
     * @type {Array}
     */
    $scope.Blocks = [];


    /**
     * Currently Selected Block
     * @type {[type]}
     */
    $scope.SelectedBlock = null;

    /**
     * Creates a new block
     */
    $scope.CreateNewBlock = function() {

      var blockId = Utils.GenerateBlockId();
      var block = BlockService.CreateBlock(blockId);

    };

    /**
     * Saves the Blocks to Local Storage
     */
    $scope.SaveBlocks = function() {
      BlockService.StoreBlocks();
    };

    /**
     * Watch for changes to the blocks array
     */
    $scope.$watch('BlockService.Blocks', function(event) {
      $scope.Blocks = BlockService.Blocks;
    });


    $scope.SelectBlock = function(block) {
      $rootScope.$broadcast(UIEvents.BlockSelect, block);
      $scope.SelectedBlock = block;
    };

}]);
