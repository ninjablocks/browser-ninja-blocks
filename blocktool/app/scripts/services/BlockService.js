'use strict';

blocktoolApp.factory('BlockService'
  , ['$rootScope', 'Utils', 'UIEvents', 'NinjaService', 'StoreJS', 'Console', 'Underscore'
  , function($rootScope, Utils, UIEvents, NinjaService, store, console, _) {
  
  // Public API here
  var blockService = {


    /**
     * Array of Blocks
     * @type {Array}
     */
    Blocks: [],


    /**
     * Gets the devices for the blocks
     */
    GetBlocksDevices: function() {
      var devices = [];

      _.reduce(this.Blocks, function(devices, block) {
        _.each(block.Devices, function(device) {
          devices.push(device);
        });
        return devices;
      }, devices);

      console.log("[Devices]:", devices);

      return devices;
    },

    /**
     * Adds a block to the Blocks array
     * @param {Block} block Block to add
     */
    AddBlock: function(block) {
      this.Blocks.push(block);
    },

    /**
     * Removes a block from the blocks array
     * @param {[type]} block [description]
     */
    RemoveBlock: function(block) {
      var removeIndex = this.Blocks.indexOf(block);
      this.Blocks.splice(removeIndex, 1);
    },

    /**
     * Creates a new block with the specified nodeId
     * @param {string} nodeId Node identifier to use
     */
    CreateBlock: function(nodeId) {
      console.log("[Block]: Creating new Block", nodeId);
      var block = new NinjaService.Block({ nodeId: nodeId });
      this.AddBlock(block);

      $rootScope.$broadcast(UIEvents.BlockCreated, block);
    },


    /**
     * Finds a block by given nodeId
     * @param {string} nodeId Node Id to search for
     */
    GetBlockByNodeId: function(nodeId) {
      var block = _.find(this.Blocks, function(block) {
        return (block.Options.nodeId === nodeId);
      });

      return block;
    },

    /**
     * Constructs the generic onActuate function for all devices
     * @param {Function} onActuateFn   User Defined actuate function
     * @param {Object} deviceOptions Device.Options object
     */
    ConstructOnActuateFn: function(onActuateFn, deviceOptions) {
      var fn = function(DA) {
        var deviceProfile = _.clone(deviceOptions);
        deviceProfile.value = DA;

        $rootScope.$broadcast(UIEvents.DeviceActuate, deviceProfile);

        if (onActuateFn) {
          onActuateFn(DA);
        }
      };

      return fn;
    },


    /**
     * Stores the blocks array in local storage
     */
    StoreBlocks: function() {
      var blocks = _.map(this.Blocks, function(block) {
        var blockStore = {
          options: block.Options,
          devices: _.map(block.Devices, function(device) {
            var deviceStore = _.clone(device.Options);
            delete deviceStore.block;
            delete deviceStore.rawData;

            return deviceStore;
          })
        };
        return blockStore;
      });

      store.set("Blocks", blocks);
    },


    /**
     * Loads blocks from local storage
     */
    LoadBlocks: function() {
      var blocks = store.get("Blocks");

      if (blocks) {
        console.log("[Store]: Loading Blocks from local storage");

        if (!blocks.length) {
          console.log("[Store]: No Blocks found");
          return;
        }

        // Loads Blocks
        _.each(blocks, function(blockStore) {
          console.log("[Store]: Parsing Block", blockStore);

          var block = new NinjaService.Block(blockStore.options);

          // Loads Devices
          _.each(blockStore.devices, function(deviceOptions) {

            // Try onActuate definition
            if(deviceOptions.hasOwnProperty('onActuateCode')) {
              var onActuate = new Function("DA", deviceOptions.onActuateCode);
              deviceOptions.onActuate = this.ConstructOnActuateFn(onActuate, deviceOptions);
            }

            var device = new NinjaService.Device(deviceOptions);

            block.RegisterDevice(device);
          }.bind(this));
          this.AddBlock(block);
        }.bind(this));

      } else {
        console.log("[Store]: No Blocks in Local Storage");
        console.log("[Store]: Initializing Local Storage Blocks");
        store.set("Blocks", []);
      }
    }

  };

  /**
   * Respond to block activations
   */
  $rootScope.$on(UIEvents.BlockActivated, function(event, block) {
    blockService.StoreBlocks();
  });

  $rootScope.$on(UIEvents.DeviceCreated, function(event, device) {
    blockService.StoreBlocks();
  });


  return blockService;
}]);