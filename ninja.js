/**
 * Ninja API for use with the Browser
 */


/**
 * Ninja Object.
 * Requires the user specify an access_token or user_access_token.
 * @param {[type]} options [description]
 */
var Ninja = function(options) {

	/***********************************************************
	 * TYPE DEFINITIONS
	 ***********************************************************/


	/**
	 * Type definitions for the API
	 * @type {Object}
	 */
	this.Types = {
		// Authentication Modes
		AUTH_MODES: {
			USER_ACCESS_TOKEN: 1,
			ACCESS_TOKEN: 2
		},

		// Device Types
		DEVICE_TYPES: {
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
		}
	};


	/***********************************************************
	 * Properties
	 ***********************************************************/
	
	// Hack to inject into subobjects
	var that = this;


	// Options for the main ninja object
	this.Options = {
		access_token:			undefined,
		user_access_token:		undefined,
		server:					''				// Server address (no trailing slash)
	};


	/***********************************************************
	 * Functions
	 ***********************************************************/


	/**
	 * [Authentication description]
	 * @param {[type]} options [description]
	 */
	this.Authentication = function(options) {
		var ninja = that;

		/**
		 * Generates a slug used for the API rest services
		 */
		this.getAuthSlug = function() {
			if (ninja.Options.access_token) {
				return '?access_token=' + ninja.Options.access_token;
			} else if(ninja.Options.user_access_token) {
				return '?user_access_token=' + ninja.Options.user_access_token;
			} else {
				return '';
			}
		};

	};


	/***********************************************************
	 * [User description]
	 * @param {[type]} options [description]
	 ***********************************************************/
	var UserAccount = function(options) {
		var ninja = that;
		var utilities = new ninja.Utilities();

		this.Options = {

		},
		this.Options = utilities.ObjectMerge(this.Options, options);

		this.GetInfo = function(callback) {
			var getUrl = ninja.Options.server + '/rest/v0/user' + authentication.getAuthSlug();

			var xhr = utilities.CreateXHR(function(response) {
				if (callback)
					callback(response);
				console.log("UserAccount.GetInfo: ", response);
			}, this);
			xhr.open('GET', getUrl, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send();

			return true;
		};


		/**
		 * Returns the 30 most recent entries in the authenticating user's activity stream.
		 */
		this.GetStream = function(callback) {
			var getUrl = ninja.Options.server + '/rest/v0/user/stream' + authentication.getAuthSlug();

			var xhr = utilities.CreateXHR(function(response) {
				if (callback)
					callback(response);
				console.log("UserAccount.GetStream: ", response);
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
			var getUrl = ninja.Options.server + '/rest/v0/user/pusherchannel' + authentication.getAuthSlug();

			xhr = utilities.CreateXHR(function(response) {
				if (response.result) {
					if (callback)
						callback(response);
					console.log("UserAccount.GetPusherChannel: ", response);
				}
			});
			xhr.open('GET', getUrl, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send();
		};
	};

	/***********************************************************
	 * Ninja Block object definition
	 * @param {[type]} options [description]
	 ***********************************************************/
	this.Block = function(options) {
		var ninja = that;
		var utilities = new ninja.Utilities();
		var listener;
		var listenerXHR;

		/**
		 * List of the block's attached devices
		 * @type {Array}
		 */
		this.Devices = [];

		// Default Block options
		this.Options = {
			node_id: undefined,
			token: undefined,
			listenInterval: 300
		};

		this.Options = utilities.ObjectMerge(this.Options, options);

		/**
		 * Initiates a Claim on the block
		 */
		this.Claim = function(callback) {
			var postData = { nodeid: this.Options.node_id };
			var postUrl = ninja.Options.server + '/rest/v0/block' + authentication.getAuthSlug();

			var xhr = utilities.CreateXHR(function(response) {
				if (response.result) {
					if (callback)
						callback(response.result);
				}
			}, this);
			xhr.open('POST', postUrl, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(postData));
		};


		/**
		 * Initiates a blocks activation
		 */
		this.Activate = function(callback) {
			var postData = { nodeid: this.Options.node_id };
			var postUrl = ninja.Options.server + '/rest/v0/block/' + this.Options.node_id + '/activate' + authentication.getAuthSlug();

			var activateListener;

			var activateXHR = utilities.CreateXHR(function(response) {
				this.Options.token = response.token;
			}, this);
			activateXHR.open('GET', postUrl, true);
			activateXHR.setRequestHeader('Content-Type', 'application/json');
			activateXHR.addEventListener('error', resumeActivate.bind(this), false);
			activateXHR.send();


			function resumeActivate() {
				activateXHR = undefined;
				clearInterval(activateListener);

				this.Activate();
			}

			function parseActivate() {

			}

			//activateListener = setInterval(parseActivate.bind(this), this.Options.listenInterval);

		};


		this.HeartBeat = function(callback) {

		};

		/**
		 * Checks to see if the block is listening
		 */
		this.IsListening = function() {
			return (listener && listenerXHR.readyState == 3);
		};


		/**
		 * Listen for Ninja Commands
		 */
		this.Listen = function() {
			var commandsUrl = ninja.Options.server + '/rest/v0/block/' + this.Options.node_id + '/commands' + authentication.getAuthSlug();
			
			// Error handler if the listener disconnects unexpectedly
			function errorHandler(event) {
				//console.log('XHR Error: ', event);
				listenerXHR = undefined;
				clearInterval(listener);

				// Resume listening
				this.Listen();
			}


			// XHR Initiation
			if (!listenerXHR) {

				try {
					listenerXHR = new XMLHttpRequest();
					listenerXHR.open('GET', commandsUrl, true);
					listenerXHR.setRequestHeader('X-Ninja-Token', this.Options.token);
					listenerXHR.addEventListener('error', errorHandler.bind(this), false); // need to bind() to rescope the callback so that it knows how to re-call Listen()
					listenerXHR.send();

					// Define a method to parse the partial response chunk by chunk
					var last_index = 0;

					// XHR Function definitions
					function parseCommands() {
						if (listenerXHR.readyState == 3) {
							var curr_index = listenerXHR.responseText.length;
							if (last_index == curr_index && last_index !== 0) {
								return; // No new data
							}
							var commandString = listenerXHR.responseText.substring(last_index, curr_index);
							last_index = curr_index;

							// split by new line
							var commands = commandString.split('\n');

							for(var i=0; i<commands.length; i++) {
								var command = commands[i];
								if (command !== '') {
									commandObject = JSON.parse(command);

									// TODO: Send it off the devices
									this.BroadcastCommand(commandObject);
								}
							}
						} else {
							// console.log('Not Listening');
						}
					}


					// Check for new content every 10th of a seconds
					listener = setInterval(parseCommands.bind(this), this.Options.listenInterval);
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
			listenerXHR.abort();
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

					var device = this.GetDeviceByGuid(commandDevice.GUID);
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

				if (device.Options.type == deviceType) {
					devices.push(device);
				}
			}

			return devices;
		};


		/**
		 * [GetDevicesByTypeId description]
		 * @param {[type]} typeId [description]
		 */
		this.GetDevicesByTypeId = function(typeId) {
			var devices = [];

			for (var i=0; i<this.Devices.length; i++) {
				var device = this.Devices[i];

				if (device.Options.type_id == typeId) {
					devices.push(device);
				}
			}

			return devices;
		};


		/**
		 * Gets a device
		 * @param {string} guid GUID to search for
		 */
		this.GetDeviceByGuid = function(guid) {
			var device = {};

			for (var i=0; i<this.Devices.length; i++) {
				var deviceInstance = this.Devices[i];

				if (deviceInstance.GUID() == guid) {
					device = deviceInstance;
				}
			}

			return device;
		};

	};

	/***********************************************************
	 * [Device description]
	 * @param {[type]} options [description]
	 ***********************************************************/
	this.Device = function(options) {
		this.ninja = that;

		var utilities = new ninja.Utilities();


		/**
		 * Generates a Ninja Blocks GUID
		 */
		this.GUID = function() {
			if (this.Options.block)
				return this.Options.block.Options.node_id + '_' + this.Options.port + '_' + this.Options.vendor + '_' + this.Options.type_id;
			else
				return 'Not associated with a block. Please Register this device';
		};


		/**
		 * Actuate this device with the specified data.
		 * @param {string/number} data Value to actuate the Ninja Blocks cloud with.
		 *
		 */
		this.Emit = function(data) {

			var url = ninja.Options.server + '/rest/v0/block/' + this.GUID() + '/data' + authentication.getAuthSlug();
			data = {
				GUID: this.GUID(),
				G: this.Options.port,
				V: this.Options.vendor,
				D: this.Options.type_id,
				DA: data
			};

			var xhr = utilities.CreateXHR(function(response) {
				console.log(response);
			}, this);
			xhr.open('POST', url, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.setRequestHeader('X-Ninja-Token', this.Options.block.Options.token);
			xhr.send(JSON.stringify(data));

			return true;
		};


		this.Options = {
			type: ninja.Types.DEVICE_TYPES.UNDEFINED,
			type_id: 0,
			vendor: 0,
			port: 0,
			block: undefined,
			value: undefined,
			onActuate: function() { console.log(this.GUID() + ".onActuate() not implemented."); }
		};

		this.Options = utilities.ObjectMerge(this.Options, options);


		this.Actuate = this.Options.onActuate;


		/**
		 * Main event handler for responding to events for this device
		 * @param  {string}   eventName Event name to respond to
		 * @param  {Function} callback  Callback function to execute
		 * @return {[type]}             [description]
		 */
		this.on = function(eventName, callback) {

		};
	};

	/***********************************************************
	 * Utilities methods and functions.
	 ***********************************************************/
	this.Utilities = function() {
		this.ninja = that;

		/**
		 * Merges two objects together recursively
		 * @param {object} obj1 primary object to merge into
		 * @param {object} obj2 secondary object to copy values into obj1
		 *
		 * @author Markus (http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically)
		 */
		this.ObjectMerge = function(obj1, obj2) {
			for (var p in obj2) {
				try {
					if ( obj2[p].constructor==Object )
						{ obj1[p] = MergeRecursive(obj1[p], obj2[p]); }
					else
						{ obj1[p] = obj2[p]; }
				} catch(e) { obj1[p] = obj2[p];	}
			}
			return obj1;
		};


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
		this.CreateXHR = function(callback, callbackScope)
		{
			var xhr;
			if (window.ActiveXObject) {
				try {
					xhr = new ActiveXObject('Microsoft.XMLHTTP');
				}
				catch(e) {
					alert(e.message);
					xhr = null;
				}
			}
			else { xhr = new XMLHttpRequest(); }

			xhr.onreadystatechange = function(event) {
				if (xhr.readyState === 4) {
					if (callback && callbackScope) callback.call(callbackScope, JSON.parse(xhr.responseText));
					else if (callback) callback(JSON.parse(xhr.responseText));
				}
			};

			return xhr;
		};


		/**
		 * Cross Browser XML Parser
		 * @author Tim Down (http://stackoverflow.com/questions/7949752/cross-browser-javascript-xml-parsing)
		 */
		if (typeof window.DOMParser != 'undefined') {
			this.ParseXml = function(xmlStr) {
				return ( new window.DOMParser() ).parseFromString(xmlStr, 'text/xml');
			};
		} else if (typeof window.ActiveXObject != 'undefined' &&
				new window.ActiveXObject('Microsoft.XMLDOM')) {
			this.ParseXml = function(xmlStr) {
				var xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
				xmlDoc.async = 'false';
				xmlDoc.loadXML(xmlStr);
				return xmlDoc;
			};
		} else {
			throw new Error('No XML parser found');
		}

	};

	/***********************************************************
	 * Utilities methods and functions.
	 ***********************************************************/

	// ----------------------------------
	// Custom Initialization starts here
	// ----------------------------------

	// interrogate the passed in Ninja options
	
	var utilities = new this.Utilities();
	var authentication = new this.Authentication();

	// merge the options
	this.Options = utilities.ObjectMerge(this.Options, options);

	// Load the user
	this.User = new UserAccount();

};



/**
 * EXAMPLE USAGE
 * ====================
 *
 * Assumes authentication has already happened. Developer/User should pass in
 * their predetermined authentication token.
 */


// Instantiate a new Ninja
var ninja = new Ninja({
	server: 'http://localhost:3000',
	user_access_token: ''
});


// Create a Block
var block1 = new ninja.Block({ node_id: '123456789ABCJS' });
block1.Activate();


// Create a Device
var button = new ninja.Device({
	type: ninja.Types.DEVICE_TYPES.BUTTON,
	type_id: 5,
	name: 'My JS Device',
	vendor: 0,
	port: 0
});

block1.RegisterDevice(button);


var led = new ninja.Device({
	type: ninja.Types.RGBLED,
	type_id: 1000,
	name: 'My LED',
	vendor: 0,
	port: 0,
	onActuate: function(data) {
		console.log("LED Actuated: ", data);
		console.log("LED Actuate this: ", this);

	}
});

block1.RegisterDevice(led);

