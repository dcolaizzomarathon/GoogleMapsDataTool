angular.module('PerformanceTool').directive('barGraph', function() {
    return {
        require: 'ngModel',
        scope: {
            results: '=ngModel'
        },
        link: function(scope, element, attrs) {
            scope.$watch('results', function(newResults, oldResults) {
                if (newResults)
                    scope.showResults(newResults);
            })

            var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 40
            },
                width = window.innerWidth - margin.left - margin.right,
                height = window.innerHeight - 200 - margin.top - margin.bottom;

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
                .orient("left")
                .tickFormat(d3.format(".2s"));

            scope.svg = d3.select("body").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            scope.showResults = function(results) {

                var trials = results.map(function(result, index) {
                    var currentTotal = 0;
                    return {
                        name: result.Name,
                        index: index,
                        date: result.Date,
                        totalTime: result.TotalTime,
                        values: result.Events.map(function(event, i) {
                            var bottom = currentTotal;
                            currentTotal += event.Time;
                            return {
                                position: i + 1,
                                time: event.Time,
                                bottom: bottom,
                                label: event.Label
                            };
                        })
                    }
                });

                scope.color.domain(trials.map(function(d) {
                    return d.index;
                }));

                scope.x.domain(trials.map(function(d) {
                    return d.index;
                }));

                scope.y.domain([
                    0,
                    d3.max(trials, function(trial) {
                        return d3.max(trial.values, function(event) {
                            return event.time;
                        });
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
                    .text("Time(ms)");

                var state = scope.svg.selectAll(".state")
                    .data(trials)
                    .enter().append("g")
                    .attr("class", "g")
                    .attr("transform", function(d) {
                        return "translate(" + scope.x(d.index) + ",0)";
                    });

                state.selectAll("rect")
                    .data(function(d) {
                        return d.values;
                    })
                    .enter().append("rect")
                    .attr("width", scope.x.rangeBand())
                    .attr("y", function(d) {
                        return scope.y(d.bottom);
                    })
                    .attr("height", function(d) {
                        return d.time;
                    })
                    .style("fill", function(d) {
                        return scope.color(d.position);
                    });

                // var legend = svg.selectAll(".legend")
                //     .data(color.domain().slice().reverse())
                //     .enter().append("g")
                //     .attr("class", "legend")
                //     .attr("transform", function(d, i) {
                //         return "translate(0," + i * 20 + ")";
                //     });

                // legend.append("rect")
                //     .attr("x", width - 18)
                //     .attr("width", 18)
                //     .attr("height", 18)
                //     .style("fill", color);

                // legend.append("text")
                //     .attr("x", width - 24)
                //     .attr("y", 9)
                //     .attr("dy", ".35em")
                //     .style("text-anchor", "end")
                //     .text(function(d) {
                //         return d;
                //     });
            }
        }
    };
});
