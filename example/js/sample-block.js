
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


function GetBlockID() {
	var blockId = "";

	var blockNodeIdKey = "BlockID";
	blockId = (GetStorageValue(blockNodeIdKey) !== undefined && GetStorageValue(blockNodeIdKey) !== null) ? GetStorageValue(blockNodeIdKey) : "BROWSER" + randomString(5);

	return blockId;
}

// Instantiate a new Ninja
var ninja = new Ninja({ server: 'https://staging.ninja.is' });


// Create a Block
var blockNodeId = GetBlockID();
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

// Create a GPS device
var gps = new ninja.Device({
	type: Ninja.DeviceTypes.LOCATION,
	deviceId: 2,
	vendor: 1,
	name: 'My Location',
	port: 0
});

block.RegisterDevice(gps);






//--------------------------------------------------
// Angular JS'ey stuff





function NavbarController($scope) {
	$scope.Ninja = ninja;
}


function BlockController($scope) {
	$scope.ninja = ninja;
	$scope.Block = block;
	$scope.TokenKey = "NinjaBlockToken";


	// Deactivates this block from the cloud
	$scope.Deactivate = function() {
		if (ClearStorage()) {
			$scope.StopListening();
			$scope.Block.Options.nodeId = undefined;
			$scope.Block.Options.token = undefined;
			$scope.Block.Options.nodeId = GetBlockID();
		}

		// Reset the activation
		$scope.Activate();
	};

	$scope.Activate = function() {
		$scope.Block.Activate(function(token) {
			$scope.$apply();
			// Set the local storage
			SetStorageValue($scope.TokenKey, token);
			SetStorageValue("BlockID", $scope.Block.Options.nodeId);

			// Actuate the LED's
			$scope.StartUp();
		});
	};


	// Start listening for commands
	$scope.Listen = function() {
		$scope.Block.Listen();
	};

	$scope.StopListening = function() {
		$scope.Block.Stop();
	};

	$scope.IsActivated = function() {
		return ($scope.Block.Options.token !== undefined);
	};

	$scope.TouchLEDs = function() {
		var ledDevices = $scope.Block.GetDevicesByType(Ninja.DeviceTypes.RGBLED);
		for (var i=0; i<ledDevices.length; i++) {
			var ledDevice = ledDevices[i];
			ledDevice.Emit(ledDevice.Options.value);
			console.log("Touch LED: ", ledDevice.Options.value);
		}

	};

	$scope.StartUp = function() {
		$scope.Listen();
		$scope.TouchLEDs();
	};

	// AUTO ACTIVATE IF NO TOKEN IN LOCAL STORAGE
	$scope.Block.Options.token = GetStorageValue($scope.TokenKey);
	if (!$scope.Block.Options.token) {
		$scope.Activate();
	} else {
		$scope.StartUp();
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

function LocationController($scope) {
	$scope.Ninja = ninja;
	$scope.Block = block;

	$scope.Location;
	$scope.Status;
	$scope.Map;
	$scope.MapMarker;

	$scope.UpdateLocation = function(data) {
		$scope.$apply(function() {

			$scope.Location = {
				lat: data.coords.latitude,
				lng: data.coords.longitude,
				accuracy: data.coords.accuracy
			};

			$scope.GenerateMap();

		});
	};

	$scope.SetMapMarker = function() {
		var googleLocation = new google.maps.LatLng($scope.Location.lat, $scope.Location.lng);
		var marker = new google.maps.Marker({
			position: googleLocation,
			map: $scope.Map,
			title: "Me!"
		});

	};

	$scope.GenerateMap = function() {
		var mapOptions = {
			center: new google.maps.LatLng($scope.Location.lat, $scope.Location.lng),
			zoom: 16,
			disableDefaultUI: true,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		$scope.Map = new google.maps.Map(document.getElementById("locationMap"), mapOptions);

		$scope.SetMapMarker();
	};

	if(geo_position_js.init()){
		geo_position_js.getCurrentPosition($scope.UpdateLocation, function() {
			$scope.$apply(function() {
				$scope.Status = "Problem retrieving GPS Location";	
			});
			
		});
	} else{
		$scope.Status = "Location Not Available";
	}

}


function DebugController($scope) {

}


