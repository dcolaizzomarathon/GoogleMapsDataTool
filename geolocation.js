angular.module('GoogleMapsDataTool').service('geolocation', ['$q', function($q) {
    return {
        getCurrentPosition: function() {
            var deferred = $q.defer();
            if(navigator.geolocation)
                navigator.geolocation.getCurrentPosition(deferred.resolve, deferred.reject);
            else
                $q.reject();
            return deferred.promise;
        }
    }
}]);
