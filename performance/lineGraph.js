angular.module('PerformanceTool').directive('lineGraph', function() {
    return {
        require: 'ngModel',
        scope: {
            results: '=ngModel'
        },
        link: function(scope, element, attrs) {
            scope.$watch('results', function(newResults, oldResults) {
                if(newResults)
                	scope.showResults(newResults);
            })

            var margin = {
                top: 20,
                right: 80,
                bottom: 30,
                left: 50
            },
                width = window.innerWidth - margin.left - margin.right,
                height = window.innerHeight - 200 - margin.top - margin.bottom;

            var parseDate = d3.time.format("%Y%m%d").parse;

            scope.x = d3.scale.linear()
                .range([0, width]);

            scope.y = d3.scale.linear()
                .range([height, 0]);

            scope.color = d3.scale.category10();

            scope.xAxis = d3.svg.axis()
                .scale(scope.x)
                .orient("bottom");

            scope.yAxis = d3.svg.axis()
                .scale(scope.y)
                .orient("left");

            scope.line = d3.svg.line()
                .interpolate("basis")
                .x(function(d) {
                    return scope.x(d.position);
                })
                .y(function(d) {
                    return scope.y(d.time);
                });

            scope.msToSecondsString = function(s){
                var ms = s % 1000;
                s = (s - ms) / 1000;
                var secs = s % 60;

                return [(secs < 10 ? '0' + secs : secs), '.', ms, 's'].join("");
            }

            scope.svg = d3.select("body").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            scope.tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip");

            scope.showResults = function(results) {
                var trials = results.map(function(result) {
                    return {
                        name: result.Name,
                        date: result.Date,
                        totalTime: result.TotalTime,
                        values: result.Events.map(function(event, i) {
                            return {
                                position: i + 1,
                                time: event.Time,
                                label: event.Label
                            };
                        })
                    }
                });

                scope.color.domain(trials.map(function(trial) {
                    return trial.name;
                }));

                scope.x.domain([0,
                    d3.max(trials, function(trial) {
                        return trial.values.length;
                    })
                ]);

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
                    .text("Time (ms)");

                var performanceRun = scope.svg.selectAll(".performanceRun")
                    .data(trials)
                    .enter().append("g")
                    .attr("class", "performanceRun");

                performanceRun.append("path")
                    .attr("class", "line")
                    .attr("d", function(d) {
                        return scope.line(d.values);
                    })
                    .style("stroke", function(d) {
                        return scope.color(d.name);
                    })
                    .on("mouseover", function(d) {
                        scope.tooltip.style("top", (event.pageY - 100) + "px").style("left", (event.pageX + 100) + "px")
                        scope.tooltip.style("visibility", "visible");
                        scope.tooltip.text([d.name, scope.msToSecondsString(d.totalTime)].join(" "));

                        selectedCircles = performanceRun.append("g").selectAll("circle")
                            .data(d.values)
                            .enter()
                            .append("circle")
                            .attr("r", 5)
                            .attr("fill", "none")
                            .attr("stroke", "black")
                            .attr("cx", function(item, index) {
                                return scope.x(item.position);
                            })
                            .attr("cy", function(item, index) {
                                return scope.y(item.time);
                            });

                        selectedCircleLabels = performanceRun.append("g").selectAll("text")
                            .data(d.values)
                            .enter()
                            .append("text")
                            .text(function(d) {
                                return d.label;
                            })
                            .attr("class", "label")
                            .attr("x", function(item, index) {
                                return scope.x(item.position) + 10;
                            })
                            .attr("y", function(item, index) {
                                return scope.y(item.time) + 10;
                            });

                        d3.select(this)
                            .classed("active", true);
                    })
                    .on("mouseout", function(d) {
                        scope.tooltip.style("visibility", "hidden");

                        selectedCircles.remove();
                        selectedCircleLabels.remove();

                        d3.select(this)
                            .classed("active", false);
                    });

                performanceRun.append("text")
                    .datum(function(d) {
                        return {
                            name: d.name,
                            value: d.values[d.values.length - 1]
                        };
                    })
                    .attr("transform", function(d) {
                        return "translate(" + scope.x(d.value.time) + "," + scope.y(d.value.position) + ")";
                    })
                    .attr("x", 3)
                    .attr("dy", ".35em")
                    .text(function(d) {
                        return d.name;
                    });
            };
        }
    };
});
