
/**
 * EXAMPLE USAGE
 * ====================
 *
 * Assumes authentication has already happened. Developer/User should pass in
 * their predetermined authentication token.
 */

/** LOCAL STORAGE **/

function GetLocalStorage() {
	if('localStorage' in window && window['localStorage'] !== null) {
		return window.localStorage;
	} else {
		return false;
	}
}

function SetStorageValue(key, value) {
	var store = GetLocalStorage();
	if (store) {
		store.setItem(key, value);
	} else {
		return false;
	}

}

function GetStorageValue(key) {
	var store = GetLocalStorage();
	if (store) {
		var value = store.getItem(key);
		return (value !== "undefined" && value !== "null" && value !== "") ? value : undefined;
	} else {
		return undefined;
	}
}

function RemoveStorageValue(key) {
	var store = GetLocalStorage();
	if (store) {
		store.removeItem(key);
		return true;
	} else {
		return false;
	}
}

function ClearStorage() {
	var store = GetLocalStorage();
	if (store) {
		store.clear();
		return true;
	} else {
		return false;
	}
}



/** NINJA API **/

/** Randomly generate the block id **/
function randomString(length) {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789123456789";
	var string_length = length;
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}



// Instantiate a new Ninja
var ninja = new Ninja({ server: 'https://staging.ninja.is' });


// Create a Block
var blockNodeIdKey = "BlockID";
var blockNodeId = (GetStorageValue(blockNodeIdKey) !== undefined) ? GetStorageValue(blockNodeIdKey) : "BROWSER" + randomString(5);
var block = new ninja.Block({ nodeId: blockNodeId });


// Create a Button Device
var button = new ninja.Device({
	type: Ninja.DeviceTypes.BUTTON,
	deviceId: 5,
	name: 'My Button',
	vendor: 0,
	port: 0
});

block.RegisterDevice(button);

// Create an LED device
var led = new ninja.Device({
	type: Ninja.DeviceTypes.RGBLED,
	deviceId: 1000,
	name: 'My LED',
	vendor: 0,
	port: 0,
	value: GetStorageValue("LEDColor"),
	onActuate: function(data, device) {
		console.log("LED Actuated: ", data);
	}
});

block.RegisterDevice(led);

//--------------------------------------------------
// Angular JS'ey stuff





function NavbarController($scope) {
	$scope.Ninja = ninja;
}


function ActivateController($scope) {
	$scope.Ninja = ninja;
	$scope.Block = block;
	$scope.TokenKey = "NinjaBlockToken";


	// Deactivates this block from the cloud
	$scope.Deactivate = function() {
		if (ClearStorage()) {
			$scope.Block.Options.nodeId = undefined;
			$scope.Block.Options.token = undefined;
		}

		// Reset the activation
		$scope.Activate();
	};

	$scope.Activate = function() {
		$scope.Block.Activate(function(token) {
			$scope.$apply();
			// Set the local storage
			SetStorageValue($scope.TokenKey, token);
			SetStorageValue(blockNodeIdKey, $scope.Block.Options.nodeId);
		});
	};


	// Start listening for commands
	$scope.Listen = function() {
		$scope.Block.Listen();
	};

	$scope.IsActivated = function() {
		return ($scope.Block.Options.token !== undefined);
	};

	// AUTO ACTIVATE IF NO TOKEN IN LOCAL STORAGE
	$scope.Block.Options.token = GetStorageValue($scope.TokenKey);
	if (!$scope.Block.Options.token) {
		$scope.Activate();
	}

}


function DevicesController($scope) {
	$scope.Ninja = ninja;
	$scope.NinjaDeviceTypes = Ninja.DeviceTypes;
	$scope.Block = block;

}


function LEDController($scope) {
	$scope.Ninja = ninja;
	$scope.Block = block;

	$scope.Actuate = function() {
		$scope.Device.Emit($scope.Device.Options.value);
	};

	$scope.SetColor = function(color) {
		console.log("set led: ", color);
		$scope.$apply(function() {
			$scope.Device.Options.value = color;
			$scope.Actuate();
			SetStorageValue("LEDColor", color);
		});
	
	};

	$scope.SetDevice = function(device) {
		$scope.Device = device;
	};


	$scope.Heartbeat = function() {
		$scope.heartbeat = setInterval($scope.Actuate, 500);
	};

	$scope.Stop = function() {
		clearInterval($scope.heartbeat);
	};

	$scope.Device.Actuate = $scope.SetColor;

}


function ButtonController($scope) {
	$scope.Ninja = ninja;
	$scope.Block = block;

	$scope.Click = function(device) {
		console.log("Button click");
		$scope.Device.Emit(1);
	};

	$scope.Release = function(device) {
		console.log("Button release");
		$scope.Device.Emit(0);
	};
}


function DebugController($scope) {

}


