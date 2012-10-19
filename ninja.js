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
		AUTH_MODES: {
			USER_ACCESS_TOKEN: 1,
			ACCESS_TOKEN: 2
		}
	};


	/***********************************************************
	 * Properties
	 ***********************************************************/
	
	// Hack to inject into subobjects
	var that = this;


	// Options for the main ninja object
	this.Options = {
		access_token: undefined,
		user_access_token: undefined
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
				return "?access_token=" + ninja.Options.access_token;
			} else if(ninja.Options.user_access_token) {
				return "?user_access_token=" + ninja.Options.user_access_token;
			} else {
				return "";
			}
		};

	};


	/***********************************************************
	 * [User description]
	 * @param {[type]} options [description]
	 ***********************************************************/
	this.User = function(options) {
		this.ninja = that;
	};

	/***********************************************************
	 * Ninja Block object definition
	 * @param {[type]} options [description]
	 ***********************************************************/
	this.Block = function(options) {
		var ninja = that;
		var utilities = new ninja.Utilities();

		// Default Block options
		this.Options = {
			node_id: undefined
		};


		this.Options = utilities.ObjectMerge(this.Options, options);


		this.Claim = function() {
			var postData = { nodeid: this.Options.node_id };
			var postUrl = "http://localhost:3000/rest/v0/block" + authentication.getAuthSlug();

			var xhr = utilities.createXHR(function(response) {
				console.log(response);
			});
			xhr.open('POST', postUrl, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(postData));

		};


		this.Activate = function() {
			var postData = {};
			var postUrl = "http://localhost:3000/rest/v0/block/" + this.Options.node_id + "/activate" + authentication.getAuthSlug();

			var xhr = utilities.createXHR(function(response) {
				console.log(response);
			});
			xhr.open('GET', postUrl, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send();

		};

		/**
		 * Listen for Ninja Commands
		 */
		this.Listen = function() {
			var commandsUrl = "http://localhost:3000/rest/v0/block/" + this.Options.node_id + "/commands" + authentication.getAuthSlug();
			console.log(getUrl);
			
			var xhr = new XMLHttpRequest();
			xhr.open("GET", commandsUrl, true);
			xhr.setRequestHeader('X-Ninja-Token', $scope.blockToken);
			xhr.send();

			// Define a method to parse the partial response chunk by chunk
			var last_index = 0;
			function parseCommands() {
				var curr_index = xhr.responseText.length;
				if (last_index == curr_index) {
					return; // No new data
				}
				var commandString = xhr.responseText.substring(last_index, curr_index);
				last_index = curr_index;

				// split by new line
				var commands = commandString.split('\n');

				angular.forEach(commands, function(command) {
					if (command !== "") {
						commandObject = JSON.parse(command);
						console.log(commandObject);

						// Send it off the devices
						nbService.actuate(commandObject);
					}
				});
			}

			// Check for new content every 10th of a seconds
			$scope.commandProcess = setInterval(parseCommands, 100);

		};

	};

	/***********************************************************
	 * [Device description]
	 * @param {[type]} options [description]
	 ***********************************************************/
	this.Device = function(options) {
		this.ninja = that;
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


		this.createXHR = function(callback)
		{
			var xhr;
			if (window.ActiveXObject) {
				try {
					xhr = new ActiveXObject("Microsoft.XMLHTTP");
				}
				catch(e) {
					alert(e.message);
					xhr = null;
				}
			}
			else { xhr = new XMLHttpRequest(); }

			xhr.onreadystatechange = function(event) {
				if (xhr.readyState === 4) {
					if (callback) callback(xhr.responseText);
				}
			};

			return xhr;
		};

	};

	// ----------------------------------
	// Custom Initialization starts here
	// ----------------------------------

	// interrogate the passed in Ninja options
	
	var utilities = new this.Utilities();
	var authentication = new this.Authentication();

	// merge the options
	this.Options = utilities.ObjectMerge(this.Options, options);


};



/**
 * SAMPLE LIBRARY USAGE
 * ====================
 *
 * Assumes authentication has already happened. Developer/User should pass in
 * their predetermined authentication token.
 */


// Instantiate a new Ninja
var ninja = new Ninja({
	//access_token: "cf07e7b9-6695-478b-ae49-62e1988cd9e3",
	user_access_token: "c1581092-58fa-41e5-bd18-20946fada118"
});
console.log(ninja);


// Create a Block
var block1 = new ninja.Block({
	node_id: "123456789ABC"
});
console.log(block1);
block1.Claim();
block1.Activate();










/*

var block = new ninja.block('auto','802bd698-efda-4fa3-bd07-13e8b1ff80db');

var led = new ninja.device('rgbled','Browser Background');

block.registerDevice(led);

led.on('data',function(data) {
	document.body.style.backgroundColor=data;
});

*/