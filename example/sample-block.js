
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
var block1 = new ninja.Block({ node_id: '123456789ABCJS' });
block1.Activate();


// Create a Button Device
var button = new ninja.Device({
	type: Ninja.DeviceTypes.BUTTON,
	type_id: 5,
	name: 'My JS Device',
	vendor: 0,
	port: 0
});

block1.RegisterDevice(button);


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

block1.RegisterDevice(led);
