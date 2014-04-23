angular.module('GoogleMapsDataTool').service('matrixService', ['$q', '$http',
    function($q, $http) {
        return {
            getXDima: function(coordinates) {
                var deferred = $q.defer();
                var points = coordinates.map(function(coordinate) {
                    return {
                        latitude: coordinate.latitude,
                        longitude: coordinate.longitude
                    };
                });
                $http({
                    method: 'post',
                    url: 'http://localhost:50610/api/XDimaMatrix',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: {
                        points: coordinates
                    }
                }).success(deferred.resolve)
                    .error(deferred.reject);

                return deferred.promise;
            }
        }
    }
]);
