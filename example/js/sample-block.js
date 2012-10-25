
/**
 * EXAMPLE USAGE
 * ====================
 *
 * Assumes authentication has already happened. Developer/User should pass in
 * their predetermined authentication token.
 */


// Instantiate a new Ninja
var ninja = new Ninja({ server: 'http://localhost:3000' });


// Create a Block
var block = new ninja.Block({ node_id: 'BROWSERBLOCK' });


// Create a Button Device
var button = new ninja.Device({
	type: Ninja.DeviceTypes.BUTTON,
	type_id: 5,
	name: 'My Button',
	vendor: 0,
	port: 0
});

block.RegisterDevice(button);


// Create an LED device
var led = new ninja.Device({
	type: Ninja.DeviceTypes.RGBLED,
	type_id: 1000,
	name: 'My LED',
	vendor: 0,
	port: 0,
	onActuate: function(data, device) {
		console.log("LED Actuated: ", data);
	}
});

block.RegisterDevice(led);

//--------------------------------------------------
// Angular JS'ey stuff

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






function NavbarController($scope) {
	$scope.Ninja = ninja;
}


function ActivateController($scope) {
	$scope.Ninja = ninja;
	$scope.Block = block;
	$scope.TokenKey = "NinjaBlockToken";

	// AUTO ACTIVATE IF NO TOKEN IN LOCAL STORAGE
	$scope.Block.Options.token = GetStorageValue($scope.TokenKey);
	if (!$scope.Block.Options.token) {
		$scope.Block.Activate(function(token) {
			$scope.$apply();
			// Set the local storage
			SetStorageValue($scope.TokenKey, token);
			
		});
	}
}


function DevicesController($scope) {
	$scope.Ninja = ninja;
	$scope.NinjaDeviceTypes = Ninja.DeviceTypes;
	$scope.Block = block;
}


