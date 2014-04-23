angular.module('GoogleMapsDataTool').service('circularPoints', ['$q',
    function($q) {
        return {
            getCircularPointsForRadius: function(center, radiusInMiles, numberOfPoints) {
                var incrementValue = 360 / numberOfPoints;

                var coordinates = [];
                for (var i = 0; i < 360; i += incrementValue) {
                    var latitude = (radiusInMiles/360) * Math.sin(i) + center.latitude;
                    var longitude = (radiusInMiles/360) * Math.cos(i) + center.longitude;
                    
                    coordinates.push({
                        latitude: latitude,
                        longitude: longitude
                    });
                }

                return coordinates;
            }
        }
    }
]);
