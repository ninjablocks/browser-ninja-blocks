
/**
 * EXAMPLE USAGE
 * ====================
 *
 * Assumes authentication has already happened. Developer/User should pass in
 * their predetermined authentication token.
 */


// Instantiate a new Ninja
var ninja = new Ninja({ server: 'http://localhost:3000', user_access_token: 'c1581092-58fa-41e5-bd18-20946fada118'});


// Create a Block
var block1 = new ninja.Block({ node_id: '123456789ABCJS' });
block1.Activate();


// Create a Device
var button = new ninja.Device({
	type: Ninja.DeviceTypes.BUTTON,
	type_id: 5,
	name: 'My JS Device',
	vendor: 0,
	port: 0
});

block1.RegisterDevice(button);


var led = new ninja.Device({
	type: Ninja.DeviceTypes.RGBLED,
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
