'use strict';

blocktoolApp.service('Config'
    , ['$rootScope', '$location'
    , function($rootScope, $location) {

        var PLATFORMS = {
            YEOMAN:             'Yeoman',
            LOCALHOST:          'Localhost',
            DERP:               'Derp',
            STAGING:            'Staging',
            PRODUCTION:         'Production'
        };


        var configYeoman = {
            Mode:               PLATFORMS.YEOMAN,
            Server:             'http://localhost:3000',
            StreamServer:       'http://localhost:3000'
        };

        var configDev = {
            Mode:               PLATFORMS.LOCALHOST,
            Server:             '',
            StreamServer:       ''
        };

        var configDerp = {
            Mode:               PLATFORMS.DERP,
            Server:             '',
            StreamServer:       ''
        };

        var configStaging = {
            Mode:               PLATFORMS.STAGING,
            Server:             '',
            StreamServer:       ''
        };

        var configProduction = {
            Mode:               PLATFORMS.PRODUCTION,
            Server:             'https://api.ninja.is',
            StreamServer:       'https://streaming.ninja.is'
        };


        var detectPlatform = function() {

            var platform;

            switch($location.$$host) {
                case 'localhost':
                case '127.0.0.1':
                    if ($location.$$port === 3501) {
                        platform = PLATFORMS.YEOMAN;
                    } else if ($location.$$port === 8000 || $location.$$port === 8008) {
                        platform = PLATFORMS.LOCALHOST;
                    }
                    break;
                case 'derp.local':
                    platform = PLATFORMS.DERP;
                    break;
                case 'staging.ninja.is':
                    platform = PLATFORMS.STAGING;
                    break;
                default:
                    platform = PLATFORMS.PRODUCTION;
                    break;
            }

            return platform;
        };

}]);
