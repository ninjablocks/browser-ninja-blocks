'use strict';

devicetoolApp.controller('BlocksCtrl'
  , ['$scope', 'Utils', 'BlockService'
  , function($scope, Utils, BlockService) {

    /**
     * Blocks array
     * @type {Array}
     */
    $scope.Blocks = [];


    /**
     * Creates a new block
     */
    $scope.CreateNewBlock = function() {

      var blockId = Utils.GenerateBlockId();
      var block = BlockService.CreateBlock(blockId);

    };

    
    $scope.SaveBlocks = function() {
      BlockService.StoreBlocks();
    };

    /**
     * Watch for changes to the blocks array
     */
    $scope.$watch('BlockService.Blocks', function(event) {
      $scope.Blocks = BlockService.Blocks;
    });


}]);
