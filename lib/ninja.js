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
		accessToken:			undefined,
		userAccessToken:		undefined,
		server:					'https://a.ninja.is',	// Server address (no trailing slash)
		version:				0,
		debug:					false
	};


	/**
	 * Generates a server url from the ninja options
	 */
	this.ServerUrl = function() {
		var url = this.Options.server + '/rest/v' + this.Options.version;

		return url;
	};

	/***********************************************************
	 * Authentication module.
	 ***********************************************************/
	var Authentication = function() {
		var ninja = that;

		/**
		 * Generates a slug used for the API rest services
		 */
		this.getAuthSlug = function() {
			if (ninja.Options.accessToken) {
				return '?access_token=' + ninja.Options.accessToken;
			} else if(ninja.Options.userAccessToken) {
				return '?user_access_token=' + ninja.Options.userAccessToken;
			} else {
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
			return null;
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

			var xhr = Ninja.Utilities.CreateXHR(function(response) {
				if (callback) {
					callback(response);
				}
			}, this);
			xhr.open('GET', getUrl, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send();

			return true;
		};

		var GetInfo_Handler = function(data) {
			console.log(data);
		};
		

		/**
		 * Returns the 30 most recent entries in the authenticating user's activity stream.
		 */
		this.GetStream = function(callback) {
			var getUrl = ninja.ServerUrl() + '/user/stream' + ninja.Authentication.getAuthSlug();

			var xhr = Ninja.Utilities.CreateXHR(function(response) {
				if (callback) {
					callback(response);
				}
			}, this);
			xhr.open('GET', getUrl, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send();
		};


		/**
		 * Returns the user's pusher channel.
		 * @param {Function} callback Callback function
		 */
		this.GetPusherChannel = function(callback) {
			var getUrl = ninja.ServerUrl() + '/user/pusherchannel' + ninja.Authentication.getAuthSlug();

			var xhr = Ninja.Utilities.CreateXHR(function(response) {
				if (response.result) {
					if (callback) {
						callback(response);
					}
				}
			});
			xhr.open('GET', getUrl, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send();
		};


		/**
		 * Retrieve Devices from User's account
		 * @param {Function} callback Callback function to run afterwards. Injects the device data
		 */
		this.GetDevices = function(callback) {
			if (ninja.Options.debug) { console.log("GetDevices "); }
			var getUrl = ninja.ServerUrl() + '/devices' + ninja.Authentication.getAuthSlug();

			var xhr = Ninja.Utilities.CreateXHR(function(response) {
				if (response.result) {
					var blockDevices = ParseDevices(response.data, callback);

					if (callback) {
						callback(blockDevices);
					}
				}
			}, this);
			xhr.open('GET', getUrl, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send();
		};

		/**
		 * Parses the devices data from GetDevices() separating out Block data from Device data
		 * @param {Array} devices Array of devices as returned from the endpoint of GetDevices()
		 */
		var ParseDevices = function(devices) {
			if (ninja.Options.debug) { console.log("GetDevices_Handler "); }
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
						name: deviceObject.shortName,
						vendor: deviceObject.vid,
						port: deviceObject.gid,
						rawData: deviceObject
					});
					block.RegisterDevice(device);


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
			nodeId: undefined,
			token: undefined,
			listenInterval: 300
		};

		this.Options = Ninja.Utilities.ObjectMerge(this.Options, options);

		/**
		 * Initiates a Claim on the block
		 */
		this.Claim = function(callback) {
			var postData = { nodeid: this.Options.nodeId };
			var postUrl = ninja.ServerUrl() + '/block' + ninja.Authentication.getAuthSlug();

			var xhr = Ninja.Utilities.CreateXHR(function(response) {
				if (response.result) {
					if (callback) {
						callback(response.result);
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
			var postUrl = ninja.ServerUrl() + '/block/' + this.Options.nodeId + '/activate';

			var activateListener;

			var activateXHR = Ninja.Utilities.CreateXHR(function(response) {
				this.Options.token = response.token;
				if (callback) {
					callback(response.token);
				}
				//this.ConfirmActivation(callback);

			}, this);
			activateXHR.open('GET', postUrl, true);
			activateXHR.setRequestHeader('Content-Type', 'application/json');
			//activateXHR.addEventListener('error', resumeActivate.bind(this), false);
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
			var postUrl = ninja.ServerUrl() + '/block/' + this.Options.nodeId + '/activate';

			var confirmXHR = Ninja.Utilities.CreateXHR(function(response) {
				if (response.result) {
					if (callback) {
						callback(response.token);
					}
				}
			});
			confirmXHR.open('POST', postUrl, true);
			confirmXHR.send(postData);

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
		this.ParseCommands = function() {
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

			var commandsUrl = ninja.ServerUrl() + '/block/' + this.Options.nodeId + '/commands';
			
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

				if (device.Options.deviceId === deviceId) {
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
			if (this.Options.block)
				return this.Options.block.Options.nodeId + '_' + this.Options.port + '_' + this.Options.vendor + '_' + this.Options.deviceId;
			else
				return 'Not associated with a block. Please Register this device';
		};


		/**
		 * Actuate this device with the specified data.
		 * @param {string/number} data Value to actuate the Ninja Blocks cloud with.
		 *
		 */
		this.Emit = function(data, callback) {

			var url = ninja.ServerUrl() + '/block/' + this.Options.block.Options.nodeId + '/data' + ninja.Authentication.getAuthSlug();
			data = {
				GUID: this.GUID(),
				G: this.Options.port,
				V: this.Options.vendor,
				D: this.Options.deviceId,
				DA: data
			};

			var xhr = Ninja.Utilities.CreateXHR(function(response) {
				if (callback) {
					callback(response);
				}
			}, this);
			xhr.open('POST', url, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.setRequestHeader('X-Ninja-Token', this.Options.block.Options.token);
			xhr.send(JSON.stringify(data));

			return true;
		};


		this.Options = {
			name: "",
			type: Ninja.DeviceTypes.UNDEFINED,
			deviceId: 0,
			vendor: 0,
			port: 0,
			block: undefined,
			value: undefined,
			onActuate: function() { throw(".onActuate() not implemented."); }
		};

		this.Options = Ninja.Utilities.ObjectMerge(this.Options, options);


		this.Actuate = this.Options.onActuate;


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
			var url = ninja.ServerUrl() + '/device/' + this.GUID() + ninja.Authentication.getAuthSlug();

			var xhr = Ninja.Utilities.CreateXHR(function(response) {
				if (callback) {
					callback(response);
				}
			}, this);

			xhr.open('DELETE', url, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
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

			var getUrl = ninja.ServerUrl() + '/device/' + this.GUID() + '/data';

			var xhr = Ninja.Utilities.CreateXHR(function(response) {
				
			});
			xhr.open('GET', getUrl, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send();

		};


		/**
		 * Fetches Metadata about the device. Useful when combined with heartbeat/data events from 
		 * the cloud (which won't necessarily contain a complete dataset for the device)
		 * @param {Function} callback Callback function to handle the data
		 */
		this.GetMetaData = function(callback) {
			var getUrl = ninja.ServerUrl() + '/device/' + this.GUID() + ninja.Authentication.getAuthSlug();
			var xhr = Ninja.Utilities.CreateXHR(function(response) {
				if (response.result) {
					if (callback) {
						callback(response.data);
					}
				} else { 
					// TODO: Exception handling
				}
			}, this);

			xhr.open('GET', getUrl, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send();
		};


	};




	// ----------------------------------
	// Custom Initialization starts here
	// ----------------------------------

	// instantiate the utilities
	this.Authentication = new Authentication();


	// merge the options
	this.Options = Ninja.Utilities.ObjectMerge(this.Options, options);

	// Load the user
	if (this.Options.accessToken || this.Options.userAccessToken) {
		this.User = new UserAccount();
	}

};

/***********************************************************
 * Static Types
 ***********************************************************/
// Authentication Modes
Ninja.AuthenticationModes = {
	USER_ACCESS_TOKEN:	'userAccessToken',
	ACCESS_TOKEN:		'accessToken'
};

// Device Types
Ninja.DeviceTypes = {
	UNDEFINED:		'undefined',
	BUTTON:			'button',
	RGBLED:			'led',
	TEMPERATURE:	'temperature',
	HUMIDITY:		'humidity',
	RF433:			'rf433',
	MOTION:			'motion',
	DISTANCE:		'distance',
	WEBSERVICE:		'webservice',
	ORIENTATION:	'orientation',
	LOCATION:		'location',
	ACCELERATION:	'acceleration',
	PROXIMITY:		'proximity',
	SOUND:			'sound',
	WEBCAM:			'webcam'
};

// Device Historical Data folding functions
Ninja.DeviceDataFunctions = {
	MEAN:			'mean',			// Mean, average
	SUM:			'sum',			// Sum
	MINIMUM:		'min',			// Minimum
	MAXIMUM:		'max',			// Maximum
	STDDEV:			'stddev',		// Standard Deviation
	SUMSQ:			'ss',			// Sum of Squares
	COUNT:			'count'			// Count
};

// Device Historical Data retrieval intervals (used with prepended numeric vendor)
Ninja.DeviceDataIntervals = {
	MINUTE:			'min',
	HOUR:			'hour',
	DAY:			'day',
	MONTH:			'month',
	YEAR:			'year'
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
			} catch(e) { obj1[p] = obj2[p];	}
		}
		return obj1;
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

		xhr.onreadystatechange = function(event) {
			if (xhr.readyState === 4 && xhr.responseText) {
				if (callback && callbackScope) callback.call(callbackScope, JSON.parse(xhr.responseText));
				else if (callback) callback(JSON.parse(xhr.responseText));
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


