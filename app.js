angular.module('GoogleMapsDataTool', ['google-maps', 'timer']);

angular.module('GoogleMapsDataTool').controller('Main', ['$scope', '$filter', 'geolocation', 'circularPoints', 'matrixService',
    function($scope, $filter, geolocation, circularPoints, matrixService) {
        $scope.tests = [{
            name: 'Circular',
            type: 'circular'
        }, {
            name: 'Random Circle',
            type: 'randomCircle'
        }, {
            name: 'Manual',
            type: 'manual'
        }];

        $scope.testResults = [{
            type: "Test",
            description: "Test Description",
            success: true,
            duration: 999,
            averageDistance: 5
        }];
        $scope.currentTestResult;

        $scope.stopTimer = function() {
            $scope.$broadcast('timer-stop');
            $scope.timerRunning = false;
        };

        $scope.reset = function(){
            $scope.testResults = [];
        }

        geolocation.getCurrentPosition().then(function(currentLocation) {
            $scope.map.center.latitude = currentLocation.coords.latitude;
            $scope.map.center.longitude = currentLocation.coords.longitude;
        });

        $scope.generatePoints = function() {
            var coordinates = circularPoints.getCircularPointsForRadius($scope.map.center, $scope.radius, $scope.numberOfPoints);
            $scope.coordinates = [];
            $scope.coordinates = coordinates;
        };

        $scope.startTest = function() {
            $scope.currentTestResult = {
                type: $scope.test.name,
                running: true,
                description: [$scope.map.center.latitude + "," + $scope.map.center.longitude, $scope.radius, $scope.numberOfPoints].join(" "),
                center: $scope.map.center,
                averageDistance: $scope.radius,
                numberOfPoints: $scope.numberOfPoints
            };
            $scope.testResults.push($scope.currentTestResult);

            $scope.onTextAreaChanged();
            
            matrixService.getXDima($scope.parsedCoordinates)
                .then(function(result) {
                    $scope.currentTestResult.matrix = result.matrix.matrix;
                    $scope.currentTestResult.duration = result.duration;
                    $scope.currentTestResult.success = true;
                }, function(error) {
                    $scope.stopTimer();
                    $scope.currentTestResult.success = false;
                });
        };

        $scope.onTextAreaChanged = function(){
            var coordinatesAsString = $scope.coordinatesAsString;
            $scope.parsedCoordinates = $scope.parseCoordinates(coordinatesAsString);
        }

        $scope.parseCoordinates = function(coordinatesAsString){
            var coordinates = coordinatesAsString.split("\n").map(function(coordinatePairString){
                var coordinates = coordinatePairString.split(" ");
                return {
                    latitude: coordinates[0] || 0,
                    longitude: coordinates[1] || 0
                };
            });

            return coordinates;
        };

        $scope.$watch('coordinates', function(newCoordinates) {
            if (!newCoordinates)
                return;

            $scope.coordinatesAsString = newCoordinates.map(function(coordinate) {
                return [coordinate.latitude, coordinate.longitude].join(" ");
            }).join("\n");
        });

        $scope.markerOptions = {
            draggable: true,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10
            }
        };

        $scope.markerEvents = {
            dragend: function(marker, eventName, args) {
                var position = marker.getPosition();
                $scope.map.center.latitude = position.lat();
                $scope.map.center.longitude = position.lng();
                $scope.$apply();
            }
        };

        $scope.map = {
            center: {
                latitude: 45,
                longitude: -74
            },
            zoom: 8
        };
    }
]);
