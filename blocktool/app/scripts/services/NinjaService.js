'use strict';

/**
 * Main Ninja Blocks factory.
 */
devicetoolApp.service('NinjaService'
	,['Config'
	, function(Config) {

	var ninjaOptions = {
		server: Config.Server,
		streamServer: Config.StreamServer,
		// userAccessToken: USER_ACCESS_TOKEN,
		debug: false
	};

	if (Config.UserAccessToken && Config.UserAccessToken.length > 0) {
		ninjaOptions.userAccessToken = Config.UserAccessToken;
	}


	var ninja = new Ninja(ninjaOptions);

	return ninja;

}]);