angular.module('GoogleMapsDataTool').directive('barGraph', function() {
    return {
        scope: {
            results: '='
        },
        link: function(scope, element, attrs) {

            scope.$watchCollection('results', function(newResults, oldResults) {
                if (newResults)
                    scope.showResults(newResults);
            });

            var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 40
            }, element = element[0],
                width = element.clientWidth - margin.left - margin.right,
                height = element.clientHeight - margin.top - margin.bottom;

            scope.x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1);

            scope.y = d3.scale.linear()
                .rangeRound([height, 0]);

            scope.color = d3.scale.ordinal()
                .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

            scope.xAxis = d3.svg.axis()
                .scale(scope.x)
                .orient("bottom");

            scope.yAxis = d3.svg.axis()
                .scale(scope.y)
                .orient("left");

            scope.line = d3.svg.line()
                .interpolate("basis")
                .x(function(d) {
                    // debugger
                    return scope.x(d.distance);
                })
                .y(function(d) {
                    // debugger
                    return scope.y(d.duration);
                });

            scope.svg = d3.select(element).append("svg")
            // .attr("width", width + margin.left + margin.right)
            // .attr("height", height + margin.top + margin.bottom)
            .attr("class", "flex-svg")
                .append("g");
            // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            scope.showResults = function(results) {
                var trials = results.map(function(result) {
                    return {
                        type: result.type,
                        description: result.description,
                        success: result.success,
                        duration: result.duration || 0,
                        distance: result.averageDistance
                    };
                });

                scope.color.domain(trials.map(function(trial) {
                    return trial.type;
                }));

                scope.x.domain([0,
                    d3.max(trials, function(trial) {
                        return trial.distance;
                    })
                ]);

                scope.y.domain([
                    0,
                    d3.max(trials, function(trial) {
                        return trial.duration;
                    })
                ]);

                scope.svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(scope.xAxis);

                scope.svg.append("g")
                    .attr("class", "y axis")
                    .call(scope.yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Time (ms)");

                var performanceRun = scope.svg.selectAll(".performanceRun")
                    .data(trials)
                    .enter().append("g")
                    .attr("class", "performanceRun");

                performanceRun.append("path")
                    .attr("class", "line")
                    .attr("d", function(d) {
                        return scope.line(d);
                    })
                    .style("stroke", function(d) {
                        return scope.color(d.type);
                    });
            };
        }
    };
});
