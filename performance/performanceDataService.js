angular.module('PerformanceTool').service('performanceDataService', ['$q', '$http',
    function($q, $http) {
        return {
            get: function(fileName) {
                var deferred = $q.defer();
                
                $http.get('http://localhost:46123/results/' + fileName)
                    .success(deferred.resolve)
                    .error(deferred.reject);

                return deferred.promise;
            }
        }
    }
]);
