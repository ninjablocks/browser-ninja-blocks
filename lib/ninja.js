"use strict";

/**
 * Ninja API Javascript Library
 * @name Ninja JS Library
 * @version  0.1
 * @description Ninja Blocks Javascript Library for use with the Ninja Cloud.
 * @see https://github.com/ninjablocks/browser-ninja-blocks
 * @author Jeremy Manoto (jeremy@ninjablocks.com)
 */
var Ninja = function(options) {


  /***********************************************************
   * Properties
   ***********************************************************/

  // Hack to inject into subobjects
  var that = this;


  // Options for the main ninja object
  this.Options = {
    accessToken:        undefined,
    userAccessToken:    undefined,
    server:             'https://a.ninja.is',   // Server address (no trailing slash)
    streamServer:       'https://stream.ninja.is',  // Stream server address (for use with webcams)
    version:            0, // Always zero (reassess for version 1)
    debug:              false
  };


  /**
   * Generates a server url from the ninja options
   */
  this.ServerUrl = function() {
    var url = this.Options.server + '/rest/v' + this.Options.version;

    return url;
  };

  /**
   * Generate the stream server url
   */
  this.StreamServerUrl = function() {
    var url = this.Options.streamServer + '/rest/v' + this.Options.version;

    return url;
  };

  /***********************************************************
   * Authentication module.
   ***********************************************************/
  var Authentication = function() {
    var ninja = that;

    /**
     * Generates a slug used for the API rest services
     * @param {bool} append flag to omit the ? character in front of string or not.
     */
    this.getAuthSlug = function(append) {
      
      var appendChar = (append) ? '&' : '?';

      var mode = this.GetMode();

      switch (mode) {
        case Ninja.AuthenticationModes.ACCESS_TOKEN:
          return appendChar + 'access_token=' + ninja.Options.accessToken;
          break;
        case Ninja.AuthenticationModes.USER_ACCESS_TOKEN:
          return appendChar + 'user_access_token=' + ninja.Options.userAccessToken;
          break;
        case Ninja.AuthenticationModes.SESSION:
          return '';
          break;
        default:
          return '';
      }

    };

    /**
     * Determines the current Authentication Mode.
     * Preference for ACCESS_TOKEN over USER_ACCESS_TOKEN
     */
    this.GetMode = function() {
      if (ninja.Options[Ninja.AuthenticationModes.ACCESS_TOKEN]) { return Ninja.AuthenticationModes.ACCESS_TOKEN; }
      if (ninja.Options[Ninja.AuthenticationModes.USER_ACCESS_TOKEN]) { return Ninja.AuthenticationModes.USER_ACCESS_TOKEN; }
      return Ninja.AuthenticationModes.SESSION;
    };
  };

  /***********************************************************
   * User object definition (not publicly instantiable)
   * @param {object} options Configuration options
   ***********************************************************/
  var UserAccount = function(options) {
    var ninja = that;

    this.Options = {

    },
    this.Options = Ninja.Utilities.ObjectMerge(this.Options, options);

    this.GetInfo = function(callback) {
      var getUrl = ninja.ServerUrl() + '/user' + ninja.Authentication.getAuthSlug();

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (callback) {
          callback(response);
        }
      }, this);
      xhr.open('GET', getUrl, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      return true;
    };

    var GetInfo_Handler = function(data) {
      if (ninja.Options.debug) { console.log(data); }
    };


    /**
     * Returns the 30 most recent entries in the authenticating user's activity stream.
     */
    this.GetStream = function(callback) {
      var getUrl = ninja.ServerUrl() + '/user/stream' + ninja.Authentication.getAuthSlug();

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (callback) {
          callback(response);
        }
      }, this);
      xhr.open('GET', getUrl, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      return true;
    };


    /**
     * Returns the user's pusher channel.
     * @param {Function} callback Callback function
     */
    this.GetPusherChannel = function(callback) {
      var getUrl = ninja.ServerUrl() + '/user/pusherchannel' + ninja.Authentication.getAuthSlug();

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result) {
          if (callback) {
            callback(response);
          }
        }
      });
      xhr.open('GET', getUrl, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      return true;
    };

    /**
     * Returns the user's preferences from the cloud
     * @param {Function} callback Callback function
     */
    this.GetPreferences = function(callback) {
      var url = ninja.ServerUrl() + '/user/preferences' + ninja.Authentication.getAuthSlug();

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result) {
          if (callback) {
            callback(response.data);
          }
        }
      });
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      return true;
    };

    /**
     * Sets/Updates the user's preferences
     * @param {[type]}   preferencesObject [description]
     * @param {Function} callback          [description]
     */
    this.SetPreferences = function(preferencesObject, callback) {
      var url = ninja.ServerUrl() + '/user/preferences' + ninja.Authentication.getAuthSlug();

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result) {
          if (callback) {
            callback(true);
          }
        } else {
          if (callback) {
            callback(false);
          }
        }
      });
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(preferencesObject));

      return true;
    };


    /**
     * Retrieve Blocks for the User's account
     * @param {Function} callback [description]
     */
    this.GetBlocks = function(callback) {
      if (ninja.Options.debug) { console.log("GetBlocks"); }
      var url = ninja.ServerUrl() + '/blocks' + ninja.Authentication.getAuthSlug();

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result) {
          var blocks = ninja.API.ParseBlocks(response.data);

          if (callback) {
            callback(blocks);
          }
        }
      });
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();
    };


    /**
     * Retrieve Devices for User's account
     * @param {Function} callback Callback function to run afterwards. Injects the device data
     */
    this.GetDevices = function(callback) {
      if (ninja.Options.debug) { console.log("GetDevices "); }
      var getUrl = ninja.ServerUrl() + '/devices' + ninja.Authentication.getAuthSlug();

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result) {
          var blockDevices = ninja.API.ParseDevices(response.data);

          if (callback) {
            callback(blockDevices);
          }
        }
      }, this);
      xhr.open('GET', getUrl, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();
    };

    /**
     * Creates the specified serviceType device.
     * A serviceType is either 'sms', 'email', 'webhook'
     * @param {string}   serviceType sms|email|webhook
     * @param {Function} callback    Callback function
     */
    this.CreateService = function(serviceType, callback) {
      var url = ninja.ServerUrl() + '/service/' + serviceType + ninja.Authentication.getAuthSlug();

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result) {
          var serviceData = response.data;
          ninja.API.GetDeviceByGuid(serviceData.GUID, function(serviceDevice) {
            var devices = {};
            devices[serviceDevice.guid] = serviceDevice;
            // devices.push(serviceDevice);

            var service = ninja.API.ParseDevices(devices);

            if (callback) {
              callback(service.devices[0], service.blocks[0]);
            }
          });
        }

      });
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();
    };

  };

  /***********************************************************
   * Generic API class for non-model specific API endpoints
   * @param {[type]} options [description]
   ***********************************************************/
  var API = function() {
    var ninja = that;

    /**
     * Gets a devices profile from the /device/:guid endpoint
     * @param {string}   guid     Device GUID identifier
     * @param {Function} callback (optional) Callback function
     */
    this.GetDeviceByGuid = function(guid, callback) {
      var url = ninja.ServerUrl() + '/device/' + guid + ninja.Authentication.getAuthSlug();

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result) {
          if (callback) {
            callback(response.data);
          }
        }
      });
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();
    };


    /**
     * Parses the blocks data from GetBlocks()
     * @param {object} blocks Blocks object with the node_id as keys
     */
    this.ParseBlocks = function(blocks) {
      var blocksArray = [];

      for (var nodeId in blocks) {
        if (blocks.hasOwnProperty(nodeId)) {
          var blockObject = blocks[nodeId];

          var block = new ninja.Block({ nodeId: nodeId });
          blocksArray.push(block);
        }
      }

      return blocksArray;
    };


    /**
     * Parses the devices data from GetDevices() separating out Block data from Device data
     * @param {Array} devices Array of devices as returned from the endpoint of GetDevices()
     */
    this.ParseDevices = function(devices) {
      var devicesArray = [];
      var blocksArray = [];

      // searches the blocksArray for the specific block with nodeId as specified
      var GetCreateBlockByNodeId = function(nodeId) {
        var block;

        for (var i=0; i< blocksArray.length; i++) {
          var blockCursor = blocksArray[i];
          if (blockCursor.Options.nodeId === nodeId) {
            block = blockCursor;
          }
        }

        if (block === undefined) {
          block = new ninja.Block({ nodeId: nodeId});
          blocksArray.push(block);
        }

        return block;
      };

      for (var guid in devices) {
        if (devices.hasOwnProperty(guid)) {
          var deviceObject = devices[guid];

          var guidComponents = Ninja.Utilities.SplitGUID(guid);
          var block = GetCreateBlockByNodeId(guidComponents.nodeId);

          var device = new ninja.Device({
            deviceId: guidComponents.deviceId,
            type: deviceObject.device_type,
            name: deviceObject.shortName,
            vendor: deviceObject.vid,
            port: deviceObject.gid,
            rawData: deviceObject
          });
          block.RegisterDevice(device);

          // Parse Subdevices
          for (var k in deviceObject.subDevices) {
            var subdevice = new ninja.Subdevice(deviceObject.subDevices[k]);
            subdevice.Id = k;
            
            device.Options.subdevices.push(subdevice);
          }

          devicesArray.push(device);
        }
      }



      return {
        blocks: blocksArray,
        devices: devicesArray
      };
    };

  };

  /***********************************************************
   * Ninja Block object definition
   * @param {object} options Configuration objects for the Block
   ***********************************************************/
  this.Block = function(options) {
    var ninja = that;
    var listener;
    var listenerXHR;
    var lastXHRIndex = 0;

    /**
     * List of the block's attached devices
     * @type {Array}
     */
    this.Devices = [];

    // Default Block options
    this.Options = {
      nodeId:           undefined,
      token:            undefined,
      listenInterval:   300,
      server:           undefined,
      autoLoadNetwork:  false
    };

    this.Options = Ninja.Utilities.ObjectMerge(this.Options, options);

    /**
     * Overriding ServerUrl
     */
    this.ServerUrl = function() {
      if (this.Options.server) {
        return this.Options.server + '/rest/v' + ninja.Options.version;
      } else {
        return ninja.ServerUrl();
      }
    };

    /**
     * Initiates a Claim on the block
     */
    this.Claim = function(callback) {
      var postData = { nodeid: this.Options.nodeId };
      var postUrl = this.ServerUrl() + '/block' + ninja.Authentication.getAuthSlug();

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result) {
          if (callback) {
            callback(true);
          }
        } else {
          if (callback) {
            callback(false);
          }
        }
      }, this);
      xhr.open('POST', postUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(postData));
    };


    /**
     * Initiates a blocks activation
     * @param {function} callback Callback function to run when complete. Called with the block token as the 1st argument
     */
    this.Activate = function(callback) {
      var postData = { nodeid: this.Options.nodeId };
      var postUrl = this.ServerUrl() + '/block/' + this.Options.nodeId + '/activate';

      var activateListener;

      var activateXHR = Ninja.Utilities.CreateXHR(function(error, response) {
        this.Options.token = response.token;
        if (callback) {
          callback(response.token);
        }
        //this.ConfirmActivation(callback);

      }, this);
      activateXHR.open('GET', postUrl, true);
      xhr.setRequestHeader('Accept', 'application/json');
      activateXHR.send();


      var resumeActivate = function() {
        activateXHR = undefined;
        clearInterval(activateListener);

        this.Activate();
      };

      function parseActivate() {

      }

      //activateListener = setInterval(parseActivate.bind(this), this.Options.listenInterval);

    };


    this.ConfirmActivation = function(callback) {
      var postData = { token: this.Options.token };
      var postUrl = this.ServerUrl() + '/block/' + this.Options.nodeId + '/activate';

      var confirmXHR = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result) {
          if (callback) {
            callback(response.token);
          }
        }
      });
      confirmXHR.open('POST', postUrl, true);
      xhr.setRequestHeader('Accept', 'application/json');
      confirmXHR.send(JSON.stringify(postData));

    };

    /**
     * Unpairs this block from the Ninja Cloud
     * @param {Function} callback Callback function
     */
    this.Unpair = function(callback) {
      var url = this.ServerUrl() + '/block/' + this.Options.nodeId + ninja.Authentication.getAuthSlug();

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result) {
          if (callback) {
            callback(response.data);
          }
        }
      });
      xhr.open('DELETE', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();
    };

    /**
     * Sends a heartbeat to the Ninja Cloud
     * @param {Function} callback [description]
     */
    this.HeartBeat = function(callback) {

    };

    /**
     * Checks to see if the block is listening
     */
    this.IsListening = function() {
      return (listener !== undefined && listenerXHR !== undefined && listenerXHR.readyState === 3);
    };


    /**
     * Handles parsing of the Commands call Listen()
     */
    this.ParseCommands = function(error, response) {
      if (listenerXHR && listenerXHR.readyState === 4) {
        var currIndex = listenerXHR.responseText.length;
        if (lastXHRIndex === currIndex && lastXHRIndex !== 0) {
          return; // No new data
        }
        var commandString = listenerXHR.responseText.substring(lastXHRIndex, currIndex);
        lastXHRIndex = currIndex;

        // split by new line
        var commands = commandString.split('\n');

        for(var i=0; i<commands.length; i++) {
          var command = commands[i];
          if (command !== '') {
            var commandObject = JSON.parse(command);

            // TODO: Send it off the devices
            this.BroadcastCommand(commandObject);
          }
        }

        // Stop the listener
        this.Stop();

        // Re-listen
        this.Listen();

      } else {
        // console.log('Not Listening');
      }


    };


    /**
     * Handles event when Listen() times out and failes
     * @param {[type]} event [description]
     */
    this.ListenErrorHandler = function() {
      this.Stop();
      this.Listen();
    };


    /**
     * Listen for Ninja Commands
     */
    this.Listen = function(interval) {
      // Environment Checks
      if (this.Options.token === undefined) { return false; }

      var commandsUrl = this.ServerUrl() + '/block/' + this.Options.nodeId + '/commands';
      
      // XHR Initiation
      if (!listenerXHR) {

        try {
          listenerXHR = Ninja.Utilities.CreateXHR(this.ParseCommands, this);
          listenerXHR.open('GET', commandsUrl, true);
          listenerXHR.setRequestHeader('X-Ninja-Token', this.Options.token);
          listenerXHR.addEventListener('error', this.ListenErrorHandler.bind(this), false); // need to bind() to rescope the callback so that it knows how to re-call Listen()
          listenerXHR.addEventListener('abort', this.ListenErrorHandler.bind(this), false);
          listenerXHR.addEventListener('load', this.ParseCommands.bind(this), false);

          listenerXHR.send();
      

        } catch (xhr_error) {
          return false;
        }

        // TODO: Catch when the listener fails
        return true;
      } else {
        return false;
      }

    };


    /**
     * Stop listening for Ninja Commands
     */
    this.Stop = function() {
      //listenerXHR.abort();
      lastXHRIndex = 0;
      listenerXHR = undefined;
      clearInterval(listener);
      listener = undefined;

      return true;
    };


    /**
     * Broadcast the specified command to all child objects
     * @param {[type]} command [description]
     */
    this.BroadcastCommand = function(command) {

      if (command.DEVICE) {
        var devices = command.DEVICE;

        for (var i=0; i<devices.length; i++) {
          var commandDevice = devices[i];

          var device = this.GetDeviceByPortVendorDeviceID(commandDevice.G, commandDevice.V, commandDevice.D);
          device.Actuate(commandDevice.DA);
        }
      }
    };

    /*********************/
    /** DEVICE SPECIFIC **/
    /*********************/

    /**
     * Register a Device to this block
     */
    this.RegisterDevice = function(device) {

      // Inject this block into the device
      device.Options.block = this;
      this.Devices.push(device);
    };

    /**
     * Returns all devices registered with this block
     */
    this.GetDevices = function() {
      return this.Devices;
    };

    /**
     * Searches through the device array for specific devices whose type
     * matches the specified Ninja.Types.DEVICE_TYPES instance
     * @param {Ninja.Types.DEVICE_TYPES} deviceType Device Type to search for
     */
    this.GetDevicesByType = function(deviceType) {
      var devices = [];


      for(var i=0; i<this.Devices.length; i++) {
        var device = this.Devices[i];

        if (device.Options.type === deviceType) {
          devices.push(device);
        }
      }

      return devices;
    };


    /**
     * [GetDevicesByTypeId description]
     * @param {[type]} typeId [description]
     */
    this.GetDevicesByDeviceId = function(deviceId) {
      var devices = [];

      for (var i=0; i<this.Devices.length; i++) {
        var device = this.Devices[i];

        if (device.Options.deviceId.toString() === deviceId.toString()) {
          devices.push(device);
        }
      }

      return devices;
    };


    /**
     * Gets a device given the specified port, vendor and deviceId
     * @param {number/string} port     Port number the device is connected to (virtualize it)
     * @param {number} vendor   Vendor number of the device
     * @param {number} deviceId Device Id of the device.
     */
    this.GetDeviceByPortVendorDeviceID = function(port, vendor, deviceId) {
      var device = {};

      for (var i=0; i<this.Devices.length; i++) {
        var deviceInstance = this.Devices[i];

        if (deviceInstance.Options.vendor === vendor &&
          deviceInstance.Options.port == port.toString() &&
          deviceInstance.Options.deviceId == deviceId) {
          device = deviceInstance;
        }
      }

      return device;
    };


    /**
     * Gets a device specified by the guid
     * @param {string} guid GUID to search for
     */
    this.GetDeviceByGuid = function(guid) {
      var device = {};

      for (var i=0; i<this.Devices.length; i++) {
        var deviceInstance = this.Devices[i];

        if (deviceInstance.GUID() === guid) {
          device = deviceInstance;
        }
      }

      return device;
    };

    /**
     * Scans network device
     */
    this.ScanNetworkConfig = function() {

      var existingNetworkDevices = this.GetDevicesByDeviceId(1005);


      if (existingNetworkDevices.length > 0) {
        // Has network device
        
        // SCAN Network Device
        var payload = JSON.stringify({method:'SCAN',params:[],id:0});

        for (var i =0; i<existingNetworkDevices.length; i++) {
          var networkDevice = existingNetworkDevices[i];

          networkDevice.Emit(payload);
        }

      }

    };

    /**
     * Parses the networkData for the specified interfaceTypes
     * @param {Array} interfaceTypes String array of types to search for
     * @param {Object} networkData    Network data object
     */
    this.ParseNetworkData = function(interfaceTypes, networkData) {
      var ipAddress;

      for (var networkInterface in networkData) {

        if (interfaceTypes.indexOf(networkInterface) >=0) {
          for (var i=0; i<networkData[networkInterface].length; i++) {
            var network = networkData[networkInterface][i];
            switch(network.family) {
              case "IPv4":
                ipAddress = network.address;

                return ipAddress;
                break;
            }
          }
        }
      }

    };

    /**
     * Loads the block's network configuration
     */
    this.LoadNetwork = function() {
      var block = this;

      var networkDevice = new ninja.Device({ guid: this.Options.nodeId + "_0_0_1005", loadcallback: function(response) {
        try {
          var netData = JSON.parse(this.value);
          if (netData.hasOwnProperty('result')) {
            netData = netData.result;
            var ipAddress = block.ParseNetworkData(['en0', 'en1', 'en2', 'eth0', 'ethernet','wlan0','wifi'],netData);
            block.Options.server = "http://" + ipAddress + ":8000";
            // console.log("Ninja.Block Server", block.Options.server);
          }
        } catch (exception) {
          // console.log("LoadNetwork Exception", exception);
        }
      }});

    };
    if (this.Options.autoLoadNetwork) this.LoadNetwork();


    /***************
     * MODULES
     ***************/

     this.GetModules = function(callback) {

      var url = this.ServerUrl() + '/module/block/' + this.Options.nodeId;

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (!error && response.result) {
          if (callback) callback(response);
        }
      });
      xhr.open('GET', url);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send();

     };

  };

  /**
   * Module Definition
   * @param {[type]} options [description]
   */
  this.Module = function(options) {
    var ninja = that;

    this.Options = {
      name: ''
    };


    /**
     * Server Url override
     */
    this.ServerUrl = function() {
      if (this.Block && this.Block.Options && this.Block.Options.server) {
        return this.Block.Options.server + '/rest/v' + ninja.Options.version;
      } else {
        return ninja.ServerUrl();
      }
    };

    /**
     * Block reference for this module
     * @type {[type]}
     */
    this.Block = null;


    /**
     *  Gets a module Configuration
     * @param {Function} callback Optional callback
     */
    this.GetConfig = function(callback) {
      var url = this.ServerUrl() + '/module/' + this.Options.name + '/block/' + this.Block.Options.nodeId;

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (error) {
          console.log("Error", error);

        } else {
          console.log("Response", response);
          if (callback) {
            callback(response);
          }
        }
      });
      xhr.open('GET', url);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send();
    };


    /**
     * Sets a module configuration
     * @param {Object} config Configuration object to send to the module
     * @param {Function} callback Optional callback
     */
    this.SetConfig = function(config, callback) {

      var url = this.ServerUrl() + '/module/' + this.Options.name + '/block/' + this.Block.Options.nodeId;

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {

        if (error) {
          console.log("Error", error);

        } else {
          console.log("Response", response);
          if (callback) {
            callback(response);
          }
        }

      });
      xhr.open('PUT', url);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(config));

    };

    this.Module = Ninja.Utilities.CreateXHR(function(error, response) {

    });


    /**
     * Send an RPC command to the client module
     * @param {[type]} method [description]
     * @param {[type]}        [description]
     */
    this.CallRPC = function(method, params, id, callback) {

      var payload = {
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: id
      };

      this.SetConfig(payload, callback);

    };


    this.Options = Ninja.Utilities.ObjectMerge(this.Options, options);

  };


  /***********************************************************
   * Ninja Device Object Definition
   * @param {object} options Configuration Options
   ***********************************************************/
  this.Device = function(options) {
    var ninja = that;


    /**
     * Generates a Ninja Blocks GUID
     */
    this.GUID = function() {
      if (this.Options.hasOwnProperty('guid')) {
        return this.Options.guid;
      } else if (this.Options.block)
        return this.Options.block.Options.nodeId + '_' + this.Options.port + '_' + this.Options.vendor + '_' + this.Options.deviceId;
      else
        return 'Not associated with a block. Please Register this device';
    };


    /**
     * Set specific variables based on device_type or device_id
     */
    var Polymorph = function() {
      if (parseInt(this.Options.deviceId) === 31 || parseInt(this.Options.deviceId) === 30) {
        var station = this.Options.port.toString().substring(0,2);
        var channel = this.Options.port.toString().substring(2,4);
        this.Options.station = station;
        this.Options.channel = channel;

      }
    };


    /**
     * Automatic loading function (if device instantiated with a Guid)
     */
    this.AutoLoadData = function() {
      this.GetData(function(response) {
        this.LoadData(response);
        if (this.Options.loadcallback) this.Options.loadcallback(response);
      }.bind(this));
    };


    /**
     * Loads data (in the format received from backend)
     * @param {object} response Object to load
     */
    this.LoadData = function(response) {

      this.Options.rawData = response;
      this.Options.deviceId = parseInt(response.did, 10);
      this.Options.vendor = parseInt(response.vid);
      this.Options.port = response.gid;
      this.Options.type = response.device_type;
      this.Options.name = response.default_name;

      // Don't set blocks for network device
      if (this.Options.type !== 'network' && this.Options.deviceId !== 1005) {
        var block = new ninja.Block({nodeId: response.node});
        this.Options.block = block;
      }

      if (response.last_data && response.last_data.hasOwnProperty('DA')) {
        this.Options.value = response.last_data.DA;
      }

    };


    /**
     * Server Url override
     */
    this.ServerUrl = function() {
      if (this.Options.block && this.Options.block.Options.server) {
        return this.Options.block.Options.server + '/rest/v' + ninja.Options.version;
      } else {
        return ninja.ServerUrl();
      }
    };

    /**
     * Actuate this device with the specified data.
     * @param {string/number} data Value to actuate the Ninja Blocks cloud with.
     * @param {function} callback Callback called with (error, response) signature
     *
     */
    this.Emit = function(data, callback) {

      var url = this.ServerUrl() + '/device/' + this.GUID() + ninja.Authentication.getAuthSlug();
      data = {
        DA: data
      };

      if (ninja.Options.debug) console.log("Emit: ", this.GUID(), this.Options.block.Options.server);
      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (callback) {
          callback(error, response);
        }
      }, this);

      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));

      return true;
    };



    this.Options = {
      name:         "",
      type:         Ninja.DeviceTypes.UNDEFINED,
      deviceId:     0,
      vendor:       0,
      port:         0,
      block:        undefined,
      value:        undefined,
      subdevices:   [],
      onActuate:    function() { throw(".onActuate() not implemented."); }
    };


    /**
     * Main event handler for responding to events for this device
     * @param  {string}   eventName Event name to respond to
     * @param  {Function} callback  Callback function to execute
     * @return {[type]}             [description]
     */
    this.on = function(eventName, callback) {

    };


    /**
     * Delete this device
     */
    this.Delete = function(callback) {
      var url = this.ServerUrl() + '/device/' + this.GUID() + ninja.Authentication.getAuthSlug();

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (callback) {
          callback(response);
        }
      }, this);

      xhr.open('DELETE', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();
    };


    /**
     * IN PROGRESS:
     * Retrieves the historical data for the device
     * @param {object}   options  Options object of the form
     *                            { from: timestamp, to: timestamp, interval: number + '<Ninja.DeviceDataIntervals>, fn: <Ninja.DeviceDataFunctions> } // all are optional
     * @param {Function} callback Callback function to handle the data
     */
    this.GetHistoricalData = function(options, callback) {

      var queryString = Ninja.Utilities.ObjectToQueryString(options);

      var getUrl = this.ServerUrl() + '/device/' + this.GUID() + '/data?' + queryString + ninja.Authentication.getAuthSlug(queryString.length > 0);

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result){
          if (callback) {
            callback(response.data);
          }
        } else {
          // TODO: raise error
        }
      });
      xhr.open('GET', getUrl, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();
    };


    /**
     * Fetches the full dataset about the device. Useful when combined with heartbeat/data events from
     * the cloud (which won't necessarily contain a complete dataset for the device)
     * @param {Function} callback Callback function to handle the data
     */
    this.GetData = function(callback) {
      var url = this.ServerUrl() + '/device/' + this.GUID() + ninja.Authentication.getAuthSlug();
      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result) {
          if (callback) {
            callback(response.data);
          }
        } else {
          // TODO: Exception handling
        }
      }, this);

      xhr.open('GET', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();
    };


    /**
     * Get the callback for the device
     * @param {Function} callback Optional callback function to execute on success
     */
    this.GetCallback = function(callback) {
      var url = this.ServerUrl() + '/device/' + this.GUID() + '/callback' + ninja.Authentication.getAuthSlug();
      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result) {
          if (callback) {
            callback(response.data);
          }
        }
      });
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();
    };


    /**
     * Set the callback for the device
     * @param {string}   newCallbackUrl New Callback Url
     * @param {Function} callback       Optional callback function to execute on success
     */
    this.SetCallback = function(newCallbackUrl, callback) {
      var url = this.ServerUrl() + '/device/' + this.GUID() + '/callback' + ninja.Authentication.getAuthSlug();

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result) {
          if (callback)
            callback();
        }
      });

      if (newCallbackUrl !== null) {
        var payload = { url: newCallbackUrl };

        
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(payload));
      } else {
        xhr.open('DELETE', url, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();
      }
    };


    /**
     * Renames a device
     * @param {[type]} newName [description]
     */
    this.Rename = function(newName, callback) {

      var data = {
        shortName: newName
      };

      var url = this.ServerUrl() + '/device/' + this.GUID() + ninja.Authentication.getAuthSlug();
      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result) {
          if (callback) {
            callback();
          }
        }
      });
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    };


    /**
     * Create or Updates a subdevice object.
     * If the subdevice object has an 'id' key then the action will be a PUT (update).
     * @param {Subdevice}   subObject Subdevice object specification. Requires 'category' and 'shortName'
     * @param {Function} callback  Optional callback function
     */
    this.SetSubdevice = function(subObject, callback) {

      if (subObject instanceof ninja.Subdevice) {

        var url, xhr;

        if (!subObject.Id) {
          url = this.ServerUrl() + '/device/' + this.GUID() + '/subdevice' + ninja.Authentication.getAuthSlug();
          xhr = Ninja.Utilities.CreateXHR(function(error, response) {
            if (response.result) {
              subObject.Id = response.data.id;
              if (callback) {
                callback(response.data);
              }
            } else {
              if (callback) {
                callback(false);
              }
            }
          });
          xhr.open('POST', url, true);
        } else {
          url = this.ServerUrl() + '/device/' + this.GUID() + '/subdevice/' + subObject.Id + ninja.Authentication.getAuthSlug();
          xhr = Ninja.Utilities.CreateXHR(function(error, response) {
            if (response.result) {
              if (callback) {
                callback(true);
              }
            } else {
              if (callback) {
                callback(false);
              }
            }
          });
          xhr.open('PUT', url, true);
        }

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send(JSON.stringify(subObject.Options));

      } else {
        return false;
      }
    };


    /**
     * Gets the subdevice with the corresponding subdevice id
     * @param {string}   subdeviceId Id to search for
     * @param {Function} callback    Callback function
     */
    this.GetSubdeviceById = function(subdeviceId, callback) {
      var subdevice;

      for (var k in this.Options.subdevices) {
        var s = this.Options.subdevices[k];

        if (k.Id == subdeviceId) {
          subdevice = s;
          break;
        }
      }

      return subdevice;
    };


    /**
     * Deletes a SubDevice
     * @param {Subdevice}   subObject Subdevice to delete
     * @param {Function} callback  Callback function
     */
    this.DeleteSubdevice = function(subObject, callback) {
      if (subObject instanceof ninja.Subdevice) {

        if (!subObject.Id) {
          if (callback) {
            callback(false);
          }
          return false;
        }
        var url = this.ServerUrl() + '/device/' + this.GUID() + '/subdevice/' + subObject.Id + ninja.Authentication.getAuthSlug();
        var xhr = Ninja.Utilities.CreateXHR((function(response) {

            // Remove the subdevice from this devices subdevices array
            var deleteIndex = this.Options.subdevices.indexOf(subObject);
            this.Options.subdevices.splice(deleteIndex, 1);

            // Run the callback
            if (callback) {
              callback((response.result ? true : false));
            }

        }).bind(this));
        xhr.open('DELETE', url, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();
      }
    };


    /**
     * Determines whether the meta data object is populated
     */
    this.HasMetaData = function() {
      return (Ninja.Utilities.ObjectIsDefined(this.GetMetaData()));
    };


    /**
     * Gets the device's meta data.
     */
    this.GetMetaData = function() {
      if (this.Options.rawData && this.Options.rawData.meta) {
        return this.Options.rawData.meta;
      } else {
        return {};
      }
    };
  

    this.Options = Ninja.Utilities.ObjectMerge(this.Options, options);
    this.Actuate = this.Options.onActuate;
    Polymorph.bind(this)();

    if (this.Options.hasOwnProperty('guid')) {
      this.AutoLoadData();
    }

  };

  /************************************************************
   * Generic Ninja SubDevice Object Definition
   * This object is required to be attached to a Device
   * @param {object} options Instantiation options
   ***********************************************************/
  this.Subdevice = function(options) {
    var ninja = that;

    this.Id = null;

    // Default Subdevice options
    this.Options = {
      category:     '',
      shortName:    '',
      data:         null,
      type:         null
    };

    /**
     * Morphs the subdevice object depending on the category instantiated
     */
    var Polymorph = function(thisSubdevice) {
      
      switch(thisSubdevice.Options.category) {
        case Ninja.SubdeviceCategories.RF:
          // console.log(Ninja.SubdeviceCategories.RF);
          break;
        case Ninja.SubdeviceCategories.WEBHOOK:
          // console.log(Ninja.SubdeviceCategories.WEBHOOK);
          break;
        case Ninja.SubdeviceCategories.SMS:
          // console.log(Ninja.SubdeviceCategories.SMS);
          break;
      }
    };

    /**
     * Makes sure the subdevice object is valid.
     * @param {[type]} thisSubdevice [description]
     */
    var ValidateObject = function(thisSubdevice) {
      if (thisSubdevice.Options.category === '') return false;
      if (thisSubdevice.Options.type === null || thisSubdevice.Options.type === '' || thisSubdevice.Options.type === undefined) return false;

      return true;
    };

    this.Options = Ninja.Utilities.ObjectMerge(this.Options, options);

    // Validate the object
    if (!ValidateObject(this)) {
      return this;
    } else {
      // Setup and specifics for the instantiated subdevice category
      Polymorph(this);
    }
  
  };

  /************************************************************
   * Genericl 3rd Party Ninja App
   ***********************************************************/
  this.App = function(options) {
    var ninja = that;

    var Id = null;

    this.Options = {
      name:         '',
      redirectUri:  null,
      secret:       null
    };

    /**
     * Saves (create or update) this application to the cloud.
     * @param {Function} callback Callback function
     */
    this.Save = function(callback) {
      var url;

      var data = {
        name: this.Options.name,
        redirect_uri: this.Options.redirectUri
      };

      var xhrVerb;
      if (this.Id) {
        // Update
        xhrVerb = 'PUT';
        data.id = this.Id;
        url = ninja.ServerUrl() + '/app/' + this.Id + ninja.Authentication.getAuthSlug();
      } else {
        // Create New
        xhrVerb = 'POST';
        url = ninja.ServerUrl() + '/app' + ninja.Authentication.getAuthSlug();
      }

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {
        if (response.result) {
          Save_Handler(response.data);
          if (callback) {
            callback(response.data);
          }
        }
      });
      xhr.open(xhrVerb, url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send(JSON.stringify(data));
    };

    var Save_Handler = function(responseData) {
      this.Id = (responseData.id) ? responseData.id : null;
      this.Options.secret = (responseData.secret) ? responseData.secret : null;
    };

    /**
     * Deletes this application
     */
    this.Delete = function() {
      var url = ninja.ServerUrl() + '/app/' + this.Id + ninja.Authentication.getAuthSlug();

      var xhr = Ninja.Utilities.CreateXHR(function(error, response) {

      });
      xhr.open('DELETE', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();
    };

    this.Options = Ninja.Utilities.ObjectMerge(this.Options, options);

  };



  // ----------------------------------
  // Custom Initialization starts here
  // ----------------------------------

  // instantiate the utilities
  this.Authentication = new Authentication();
  this.API = new API();


  // merge the options
  this.Options = Ninja.Utilities.ObjectMerge(this.Options, options);

  // Load the user (remove conditionality)
  // if (this.Options.accessToken || this.Options.userAccessToken) {
    this.User = new UserAccount();
  // }

};

/***********************************************************
 * Static Types
 ***********************************************************/
// Authentication Modes
Ninja.AuthenticationModes = {
  USER_ACCESS_TOKEN:  'userAccessToken',
  ACCESS_TOKEN:       'accessToken',
  SESSION:            'session'
};

// Device Types
Ninja.DeviceTypes = {
  UNDEFINED:      'undefined',
  BUTTON:         'button',
  RGBLED:         'rgbled',
  TEMPERATURE:    'temperature',
  HUMIDITY:       'humidity',
  RF433:          'rf433',
  MOTION:         'motion',
  DISTANCE:       'distance',
  WEBSERVICE:     'webservice',
  ORIENTATION:    'orientation',
  LOCATION:       'location',
  ACCELERATION:   'acceleration',
  PROXIMITY:      'proximity',
  SOUND:          'sound',
  WEBCAM:         'webcam',
  EMAIL:          'email',
  TWILIO:         'twilio',
  SMS:            'sms',
  WEBHOOK:        'webhook',
  FACEBOOK:       'facebook',
  TWITTER:        'twitter',
  NETWORK:        'network',
  RELAY:          'relay'
};

// Device Modes
Ninja.DeviceModes = {
  ACTUATOR:       'actuator',
  SENSOR:         'sensor'
};

// Device Historical Data folding functions
Ninja.DeviceDataFunctions = {
  MEAN:           'mean',     // Mean, average
  SUM:            'sum',      // Sum
  MINIMUM:        'min',      // Minimum
  MAXIMUM:        'max',      // Maximum
  STDDEV:         'stddev',   // Standard Deviation
  SUMSQ:          'ss',     // Sum of Squares
  COUNT:          'count'     // Count
};

// Device Historical Data retrieval intervals (used with prepended numeric vendor)
Ninja.DeviceDataIntervals = {
  MINUTE:         'min',
  HOUR:           'hour',
  DAY:            'day',
  MONTH:          'month',
  YEAR:           'year'
};

// Subdevice categories
Ninja.SubdeviceCategories = {
  EMAIL:          'email',
  RF:             'rf',
  WEBHOOK:        'webhook',
  SMS:            'sms'
};

// Subdevice Types
Ninja.SubdeviceTypes = {
  ACTUATOR:       'actuator',
  SENSOR:         'sensor'
};

/***********************************************************
 * Utilities methods and functions.
 * Used throughout the API.
 ***********************************************************/
Ninja.Utilities = {

  /**
   * Merges two objects together recursively
   * @param {object} obj1 primary object to merge into
   * @param {object} obj2 secondary object to copy values into obj1
   *
   * @author Markus (http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically)
   */
  ObjectMerge: function(obj1, obj2) {
    for (var p in obj2) {
      try {
        if ( obj2[p].constructor==Object )
          { obj1[p] = this.ObjectMerge(obj1[p], obj2[p]); }
        else
          { obj1[p] = obj2[p]; }
      } catch(e) { obj1[p] = obj2[p]; }
    }
    return obj1;
  },

  /**
   * Convert an object to a query string
   * @param {Object} obj Object to be query string'd
   */
  ObjectToQueryString: function(obj) {
    var queryString = '';
    var queries = [];

    for (var k in obj) {
      try {
        if (k && obj[k]) {
          queryString = k +'=' + obj[k];
          queries.push(queryString);
        }
      } catch (e) {}
    }

    return queries.join('&');
  },


  /**
   * Converts a hash object into an array. 
   * @param {Object} obj     Object to convert
   * @param {string} idField New fieldname for the object key within the array
   */
  ObjectArrayToArray: function(obj, idField) {
    var objectArray = [];

    if (!idField) {
      idField = 'id'
    }

    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        var item = obj[k];
        item[idField] = k;
        objectArray.push(item);
      }
    }

    return objectArray;
  },

  /**
   * Tests an object for the existence of any keys
   * @param {Object} obj Object to be tested
   * @return {bool} Boolean value denoting if the object is defined or not.
   */
  ObjectIsDefined: function(obj) {
    var isDefined = false;

    for(var k in obj) {
      try {
        if (k && obj[k]) {
          isDefined = true;
        }
      } catch (e) {
        isDefined = false;
      }
    }

    return isDefined;
  },

  /**
   * Creates an XHR object to handle requests.
   * If callback specified it will be called with the specified scope (optional as well)
   * @param  {function} callback      (optional) Callback function called with a JSON object of the response
   * @param  {object}   callbackScope (optional) Scope of the callback function
   * @return {object}                 XHR object
   *
   * @author Ryan Kinal (http://stackoverflow.com/questions/3470895/small-ajax-javascript-library)
   * @author Jeremy Manoto
   */
  CreateXHR: function(callback, callbackScope)
  {
    var xhr;
    if (window.ActiveXObject) {
      try {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
      }
      catch(e) {
        xhr = null;
      }
    }
    else { xhr = new XMLHttpRequest(); }

    xhr.onerror = function(event) {

      var error = new Error();
      error.result = 0;
      error.event = event;

      if (callback && callbackScope) callback.call(callbackScope, error);
        else if (callback) callback(error);
    };

    xhr.onreadystatechange = function(event) {
      if (xhr.readyState === 4 && xhr.responseText && xhr.status === 200) {
        if (callback && callbackScope) callback.call(callbackScope, null, JSON.parse(xhr.responseText));
        else if (callback) callback(null, JSON.parse(xhr.responseText));
      } else if (xhr.readyState === 4 && xhr.status !== 200) {
        xhr.onerror(event);
      }
    };



    return xhr;
  },

  /**
   * Splits a GUID string into it's components.
   * @param {string} guid Ninja Blocks GUID string
   * @return {object} JSON object of the device
   */
  SplitGUID: function(guid) {

    var guidComponents = guid.split('_');
    var nodeId = guidComponents[0];
    var port = guidComponents[1];
    var vendor = guidComponents[2];
    var deviceId = guidComponents[3];

    return {
      nodeId: nodeId,
      port: port,
      vendor: vendor,
      deviceId: deviceId
    };
  }
};

/**
 * NinjaResult
 * @description Acts as a payload package for return results throughout the Ninja JS library.
 *              Object can be instantiated in multiple ways.
 *              new Ninja.Result({ result, message, payload });
 *              new Ninja.Result(result, payload); // if result === true
 *              new Ninja.Result(result, message); // if result === false
 *              new Ninja.Result(result, message, payload);
 *
 *
 * @param {object} options Result options {result:bool, message:string, payload:object}
 */
Ninja.Result = function(options) {

  var result = false;
  var message = '';
  var payload;

  // object to be returned.
  var object;

  if (arguments.length === 3) {
    // results called with 3 arguments (result, message, payload)

    result = arguments[0];
    message = arguments[1];
    payload = arguments[2];
  }

  else if (arguments.length === 2) {

    result = arguments[0];

    if (result) {
      // 2nd argument is the payload. no message required
      payload = arguments[1];
    } else {
      // 2nd argument is an error message
      message = arguments[1];
    }
  }

  else if (arguments.length === 1) {
    // argument is an object
    if (options.result) { result = options.result; }
    if (options.message) { message = options.message; }
    if (options.payload) { payload = options.payload; }

  }

  // construct the return object
  object = {
    result: result,
    message: message,
    payload: payload
  };


  return object;
};

