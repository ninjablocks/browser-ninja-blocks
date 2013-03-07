'use strict';

devicetoolApp.service('UIEvents', function() {

    var uiEvents = {

        BlockCreated:               'BlockCreated',
        BlockActivated:             'BlockActivated',

        DeviceActuate:              'DeviceActuate',
        DeviceCreated:              'DeviceCreated',
        DeviceRemoved:              'DeviceRemoved'

    };

    return uiEvents;
  
  });
