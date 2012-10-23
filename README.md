Ninja Blocks Browser JS
===
A browser javascript library to interact with the Ninja Blocks platform.

## Instantiate the API
```javascript
var ninja = new Ninja({
    user_access_token: ''
});
```


## Create a Block
```javascript
var block = new ninja.Block({
    node_id: '123456789JAVASCRIPT'
});
block.Activate();
```


### Listen for Commands
```javascript
block.Listen();
```


## Create a Device
```javascript
var led = new ninja.Device({
    type: ninja.Types.DEVICE_TYPES.RGBLED,
    type_id: 1000,
    name: 'My LED',
    vendor: 0,
    port: 0,
    onActuate: function(data) {
        console.log("LED Actuated: ", data);
    }
});
block.RegisterDevice(led);
```


## Emit data from a Device
```javascript
led.Emit("FF000FF"); // Tell Ninja API that the LED is purple