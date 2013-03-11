'use strict';

/**
 * Main Ninja Blocks factory.
 */
blocktoolApp.service('NinjaService'
  ,['$rootScope', 'ServerService', 'UIEvents'
  , function($rootScope, ServerService, UIEvents) {

    ServerService.DetectPlatform();

    var ninjaOptions = {
      server: ServerService.Current.Server,
      streamServer: ServerService.Current.StreamServer,
      debug: true
    };

    var ninja = new Ninja(ninjaOptions);

    $rootScope.$on(UIEvents.ServerSwitch, function(event) {
      ninja.Options.server = ServerService.Current.Server;
      ninja.Options.streamServer = ServerService.Current.StreamServer;
    });


    return ninja;

}]);