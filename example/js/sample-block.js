
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
		return store.getItem(key);
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


// Instantiate a new Ninja
var ninja = new Ninja({ server: 'http://localhost:3000' });


// Create a Block
var block = new ninja.Block({ node_id: 'BROWSERBLOCK' });


// Create a Button Device
var button = new ninja.Device({
	type: Ninja.DeviceTypes.BUTTON,
	device_id: 5,
	name: 'My Button',
	vendor: 0,
	port: 0
});

block.RegisterDevice(button);


// Create an LED device
var led = new ninja.Device({
	type: Ninja.DeviceTypes.RGBLED,
	device_id: 1000,
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
		});
	};


	// Start listening for commands
	$scope.Listen = function() {
		$scope.Block.Listen();
		console.log("Listening");
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
		console.log("actuating LED");
		$scope.Device.Emit($scope.Device.Options.value);
	};

	$scope.SetColor = function(color) {
		$scope.$apply(function() {
			$scope.Device.Options.value = color;
			$scope.Actuate();
			SetStorageValue("LEDColor", color);
		});
	
	};

	$scope.SetDevice = function(device) {
		$scope.Device = device;
	};

	$scope.Device.Actuate = $scope.SetColor;

}


function ButtonController($scope) {
	$scope.Ninja = ninja;
	$scope.Block = block;

	$scope.Click = function(device) {
		$scope.Device.Emit(1);
		console.log("Down");
	};

	$scope.Release = function(device) {
		$scope.Device.Emit(0);
		console.log("Up");
	};
}


