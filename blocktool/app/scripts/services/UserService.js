'use strict';

/**
 * Ninja Blocks User factory
 */
devicetoolApp.factory('UserService'
	, ['$rootScope', '$q', '$http', 'Config', 'UIEvents', 'NinjaService'
	, function($rootScope, $q, $http, Config, UIEvents, NinjaService) {

		var userService = {

			InfoDeferred: $q.defer(),

			GetInfo: function() {
				NinjaService.User.GetInfo(this.GetInfo_Handler.bind(this));
				// console.log("UserService.GetInfo", this);

			},

			GetInfo_Handler: function(data) {
				// console.log("GetInfo_Handler", data, this);
				this.Info = data;
				$rootScope.$broadcast(UIEvents.UserInfoLoaded, data);

				// fulfill the promise
				this.InfoDeferred.resolve(data);
			},

			Info: {},


			GetLoginStatus: function() {
				NinjaService.User.GetInfo(this.GetLoginStatus_Handler.bind(this));
			},

			GetLoginStatus_Handler: function(data) {
				// console.log("GetLoginStatus:", data);
				if (!data.error) {
					this.IsLoggedIn = true;
					$rootScope.$broadcast(UIEvents.UserStatusChecked, this.IsLoggedIn);
				} else {
					this.IsLoggedIn = false;
					$rootScope.$broadcast(UIEvents.UserStatusChecked, this.IsLoggedIn);
				}

			},

			IsLoggedIn: false,


			Login: function(email, password) {
				
				var payload = {
					email: email,
					password: password,
					rememberme: false,
					redirect: '/alpha/'
				};

				$http.post(Config.Server + '/signin', payload).success((function(response) {
					if (response.result === 1) {
						console.log('Login()', this);
						$rootScope.$broadcast(UIEvents.UserLogin);
						this.IsLoggedIn = true;
					}
				}).bind(this)).error((function(response) {
					$rootScope.$broadcast(UIEvents.UserLoginFailed, response);
					this.IsLoggedIn = false;
				}).bind(this));

			},


			Logout: function() {
				$http.get(Config.Server + '/signout').success((function(response){
					$rootScope.$broadcast(UIEvents.UserLogout);
					console.log("Logout():", this);
					this.IsLoggedIn = false;
				}).bind(this)).error(function(response) {
					$rootScope.$broadcast(UIEvents.UserLogoutFailed);
				});
			}

		};


		return userService;


}]);
