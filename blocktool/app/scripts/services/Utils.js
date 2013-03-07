'use strict';

blocktoolApp.factory('Utils'
  , ['StoreJS', function(store) {

  // Public API here
  var utils = {
    GenerateString: function(length) {
      var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789123456789";
      var string_length = length;
      var randomstring = '';
      for (var i=0; i<string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
      }
      return randomstring;
    },

    GenerateBlockId: function() {
      var blockId = "";

      var blockNodeIdKey = "BlockID";
      blockId = (store.get(blockNodeIdKey) !== undefined && store.get(blockNodeIdKey) !== null) ? store.get(blockNodeIdKey) : "BROWSER" + this.GenerateString(5);

      return blockId;
    }
  };
  
  return utils;
}]);
