'use strict';

blocktoolApp.factory('BlockService'
  , ['$rootScope', 'Utils', 'UIEvents', 'NinjaService', 'StoreJS', 'Console', 'Underscore', 'ServerService'
  , function($rootScope, Utils, UIEvents, NinjaService, store, console, _, ServerService) {
  
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

      // console.log("[Devices]:", devices);

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
      block.Tokens = {}; // Create the tokens object (specified for app)
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
    ConstructOnActuateFn: function(onActuateFn, device) {
      var fn = function(DA, block, device) {
        device.Options.value = DA;

        var deviceProfile = _.clone(device.Options);

        $rootScope.$broadcast(UIEvents.DeviceActuate, deviceProfile);

        if (onActuateFn) {
          onActuateFn.call(device, DA, block, device);
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
          options: _.clone(block.Options),
          devices: _.map(block.Devices, function(device) {
            var deviceStore = _.clone(device.Options);
            delete deviceStore.block;
            delete deviceStore.rawData;

            return deviceStore;
          })
        };

        blockStore.options.token = undefined; // Clear our the current blockStore token. Tokens should only be in the Tokens hash for storage

        blockStore.tokens = (block.hasOwnProperty("Tokens")) ? block.Tokens : {};
        blockStore.tokens[ServerService.Current.Id] = block.Options.token;

        return blockStore;
      });

      console.log("[Store]: Store Blocks", blocks);

      store.set("Blocks", blocks);
    },


    /**
     * Loads blocks from local storage
     * Pays attention to the currently selected server
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

          // TODO: Switch block config based on server
          var block;

          // Inject Tokens
          block = new NinjaService.Block(blockStore.options);
          if (blockStore.hasOwnProperty("tokens")) {
            block.Tokens = blockStore.tokens;
            if (block.Tokens.hasOwnProperty(ServerService.Current.Id)) {
              block.Options.token = block.Tokens[ServerService.Current.Id];
            }
          } else {
            block.Tokens = {};
          }

          // console.log("[Store]: Parsing Block", blockStore, block);

          // Loads Devices
          _.each(blockStore.devices, function(deviceOptions) {

            var device = new NinjaService.Device(deviceOptions);

            // Try onActuate definition
            if(deviceOptions.hasOwnProperty('onActuateCode')) {
              var onActuate = new Function("DA", "block", "device", deviceOptions.onActuateCode);
              device.Actuate = this.ConstructOnActuateFn(onActuate, device);
            }


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
   * Load the blocks
   */
  $rootScope.$on(UIEvents.LoadBlocks, function(event) {
    blockService.LoadBlocks();
  });

  /**
   * Respond to block activations
   */
  $rootScope.$on(UIEvents.BlockActivated, function(event, block) {
    blockService.StoreBlocks();
  });

  /**
   * Store blocks when Devices get created
   */
  $rootScope.$on(UIEvents.DeviceCreated, function(event, device) {
    blockService.StoreBlocks();
  });



  return blockService;
}]);