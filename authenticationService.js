angular.module('services').service('authenticationService', ['$q', '$http', '$rootScope',
    function ($q, $http, $rootScope) {
        var self = this;
        var accessToken = null;
        var tenantId = null;
        var refreshTimeout = null;

        var REFRESH_TIMEOUT_MULTIPLIER = 0.9;

        this.login = function (userId, password) {
            var deferred = $q.defer();
            var scope = ["marathon_odyssey"];
            var postBody = {
                "grant_type": "password",
                "username": userId,
                "password": password,
                "scope": scope
            };

            var time = new Date();

            $http.post('/api/token', objectToFormBody(postBody))
                .success(function (data, status, headers, config) {
                if (status == 200) {
                    setUserId(userId);
                    handleAuthSuccess(data, time);
                    deferred.resolve();
                }
                else {
                    handleAuthFailure(data);
                    deferred.reject();
                }

            }).error(function (data, status, headers, config) {
                handleAuthFailure(data);
                deferred.reject();
            });

            return deferred.promise;
        };

        this.logOut = function() {
            setAccessToken(null);
            setRefreshToken(null);
            setExpireTime(null);
            $rootScope.$emit('loggedOut');
        };

        this.refreshUserSession = function() {
            var deferred = $q.defer();

            var refreshToken = localStorage.getItem('refreshToken'),
                userId = localStorage.getItem('userId');
                
            if(refreshToken && userId) {
                var postBody = {
                    "grant_type": "refresh_token",
                    "username": userId,
                    "refresh_token": refreshToken
                };

                var time = new Date();

                $http.post('/api/token', objectToFormBody(postBody))
                    .success(function(data, status, headers, config) {
                        handleAuthSuccess(data, time);
                        deferred.resolve();
                    }).error(function(data, status, headers, config) {
                        handleAuthFailure(data);
                        deferred.reject();
                    });
            }
            else
                deferred.reject();

            return deferred.promise;
        };

        this.getTenantId = function() {
            return tenantId;
        };

        this.getAccessToken = function() {
            return accessToken;
        };

        var handleAuthSuccess = function(data, requestTime) {
            tenantId = data.tenantId;

            setAccessToken(data.access_token);
            setRefreshToken(data.refresh_token);

            var expireTime = new Date(requestTime);
            expireTime.setSeconds(requestTime.getSeconds() + data.expires_in);
            setExpireTime(expireTime);
        };

        var handleAuthFailure = function(data) {
            self.logOut();
        };

        var setUserId = function(userId) {
            localStorage.setItem('userId', userId);
        };

        var setAccessToken = function (token) {
            accessToken = token;

            if (accessToken){
                $http.defaults.headers.common['Authorization'] = "Bearer " + accessToken;
                console.log(accessToken)               
            }
            else
                delete $http.defaults.headers.common['Authorization'];
        };

        var setRefreshToken = function(refreshToken) {
            if(refreshToken)
                localStorage.setItem('refreshToken', refreshToken);
            else
                localStorage.removeItem('refreshToken');
        };

        var setExpireTime = function(expireTime) {
            if(refreshTimeout) {
                clearTimeout(refreshTimeout);
                refreshTimeout = null;
            }

            if(expireTime) {
                var milliseconds = (expireTime - new Date()) * REFRESH_TIMEOUT_MULTIPLIER;
                refreshTimeout = setTimeout(self.refreshUserSession, milliseconds);
            }
        };

        var objectToFormBody = function(o) {
            return Object.keys(o).map(function(key){
                return key + '=' + encodeURI(o[key]).replace(/\+/g, '%2B');
            }).join('&');
        };
    }]);
