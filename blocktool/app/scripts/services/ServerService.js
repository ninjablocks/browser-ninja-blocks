'use strict';

blocktoolApp.factory('ServerService',
  ['$rootScope', 'UIEvents', 'Config', '$location', 'Underscore'
   , function($rootScope, UIEvents, Config, $location, _) {


    var server = {

      Platforms: {
        Localhost: {
          Id:                 'localhost',
          Server:             'http://localhost:3000',
          StreamServer:       'http://localhost:3000'
        },

        Staging: {
          Id:                 'staging',
          Server:             'https://staging.ninja.is',
          StreamServer:       'https://staging-streaming.ninja.is'
        },

        Production: {
          Id:                 'production',
          Server:             'https://api.ninja.is',
          StreamServer:       'https://streaming.ninja.is'
        },

        None: {
          Id:                 'none',
          Server:             'https://api.ninja.is',
          StreamServer:       'https://streaming.ninja.is'
        }

      },

      Current: {},

      /**
       * Sets the current server
       */
      SetServer: function(server) {
        server = server.toLowerCase();

        var selectedServer =_.find(this.Platforms, function(platform) {
          return platform.Id.toLowerCase() === server.toLowerCase();
        });

        if (selectedServer && selectedServer !== this.Current) {
          this.Current = selectedServer;

          // Broadcast to the app
          $rootScope.$broadcast(UIEvents.ServerSwitch, this.Current);
        }
      },

      DetectPlatform: function() {

        var platform;

        switch($location.$$host) {
            case 'localhost':
            case '127.0.0.1':
                platform = 'localhost';
                break;
            case 'staging.ninja.is':
                platform = 'staging';
                break;
            default:
                platform = 'production';
                break;
        }

        this.SetServer(platform);

        return platform;
      }

    };


    return server;


}]);