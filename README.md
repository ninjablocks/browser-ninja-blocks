Ninja Blocks Browser JS
===
A browser javascript library to interact with the Ninja Blocks API platform. Allows any javascript enabled browser to be turned into a Ninja Block or to create a custom Ninja dashboard to read and/or actuate devices.

Blocks can be created in code and activated to listen for actuation commands from the Ninja Cloud. Devices can also be created in code, registered to the block and made to react to the actuation commands from the Ninja Cloud.

*NOTE: Authentication with the Ninja Cloud API lies outside the scope of this library.*


Usage
===

## The 'Ninja' Object
The `Ninja` object is the main object housing all the logic for the API. 

A single instance of this object is required to utilise the library and an optional `options` object may be injected to customize it.

```javascript
var options = {
    server: "https://a.ninja.is",
    version: 0,
    access_token: "YOUR OAUTH2 ACCESS TOKEN",
    user_access_token: "YOUR USER ACCESS TOKEN"
}
var ninja = new Ninja(options);
```

Options can be modified post-instantiation by interrogating the `Options` sub-object.

```javascript
ninja.Options.access_token = "YOUR OAUTH2 ACCESS TOKEN";
```

---

## The 'Block' Object

Blocks can be created by instantiating a new `ninja.Block()` object.

Instantiation of a `Block` requires a `node_id` to be passed in and before the block can be made of any use, it must also be activated.

_Note: Activation is a 2-way challenge against the Ninja Cloud which will require the user to claim the block through their [Ninja dashboard](http://a.ninja.is)_

```javascript
var block = new ninja.Block({
    node_id: '123456789JAVASCRIPT',
});
block.Activate();
```


### Listen for Block Commands
Once a block is successfully activated it can listen for commands from the Ninja Cloud. 

Listening for commands is as simple as running the `Listen()` function on the block. An optional interval length (in milliseconds) can be passed in to dictate how frantic the Listening should occur.

_NOTE: Listening opens a long GET request to the Ninja Cloud and browsers may timeout the request. If this occurs, the function will restart itself and resume listening._

```javascript
block.Listen(300);
```



Likewise, to stop listening for commands run the `Stop()` function on the block.
```javascript
block.Stop();
```


Check for Listening state.
```
block.IsListening() //returns true|false;
```

---

## The Device Object
Devices can be created by instantiating a new `ninja.Device()` object and setting a few required options.  
Once instantiated, the device must also be registered against a block

<table>
    <tr>
        <th>Option</th>
        <th>Description</th>
        <th>Required</th>
    </tr>
    <tr>
        <td>type</td>
        <td>A value from the `Ninja.DeviceTypes` type definitions</td>
        <td>*</td>
    </tr>
    <tr>
        <td>type_id</td>
        <td>A numeric value of the device (see Ninja Blocks Device Id list). </td>
        <td>*</td>
    </tr>
    <tr>
        <td>name</td>
        <td>The name of the device.</td>
        <td>*</td>
    </tr>
    <tr>
        <td>vendor</td>
        <td>The vendor id of the device. Default 0.</td>
        <td></td>
    </tr>
    <tr>
        <td>port</td>
        <td>The port number of the device. Default 0.</td>
        <td></td>
    </tr>
    <tr>
        <td>onActuate</td>
        <td>function definition to execute when the device gets actuated</td>
        <td></td>
    </tr>
</table>


```javascript
var led = new ninja.Device({
    type: Ninja.DeviceTypes.RGBLED,
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

### Actuating a Device
To respond to actuations to the device from the Ninja Cloud set the `onActuate` function definition. Which can be set in the options object passed in during instantiation. The function should take a single argument which will represent the the data value to respond with.

```javascript
led.Options.onActuate = function(data) {
    console.log("LED Actuated: ", data);
    // ... do something else
};
```


### Emitting Data for a Device
To send data to the Ninja cloud from your device use the `Emit()` function.  
_Make sure the device is already registered to a block._

The `Emit()` function takes a single (1) argument of its data value to send.  
For example: to tell the Ninja cloud that the LED is purple, send through the RGB value of the LED as the data value.
```javascript
led.Emit("FF000FF");
```

---

# Types
The following types are public and can be referenced from anywhere in your javascript code (as long as they library is included ;)

## Ninja.AuthenticationModes
```javascript
Ninja.AuthenticationModes.ACCESS_TOKEN;
Ninja.AuthenticationModes.USER_ACCESS_TOKEN;
```
`ACCESS_TOKEN` refers to tokens retrieved through the OAuth2 process.  
`USER_ACCESS_TOKEN` refers to the token generated within the Ninja dashboard


## Ninja.DeviceTypes
```javascript
Ninja.DeviceTypes.UNDEFINED;
Ninja.DeviceTypes.ACCELERATION;
Ninja.DeviceTypes.BUTTON;
Ninja.DeviceTypes.DISTANCE;
Ninja.DeviceTypes.HUMIDITY;
Ninja.DeviceTypes.LOCATION;
Ninja.DeviceTypes.MOTION;
Ninja.DeviceTypes.ORIENTATION;
Ninja.DeviceTypes.PROXIMITY;
Ninja.DeviceTypes.RF433;
Ninja.DeviceTypes.RGBLED;
Ninja.DeviceTypes.SOUND;
Ninja.DeviceTypes.TEMPERATURE;
Ninja.DeviceTypes.WEBCAM;
Ninja.DeviceTypes.WEBSERVICE;
```
