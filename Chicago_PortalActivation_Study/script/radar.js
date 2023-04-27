var radar_margin = { top: 0, right: 0, bottom: 0, left: 0 },
radar_width = 400,
radar_height = 320;


function RadarChart(id, zipcode, dataset) {
    
    var filteredData = dataset;
    d3.select(id).select("svg").remove();
    const rdr_svg = d3.select(id).append("svg");

    dataCatRadar = ["Chicago", zipcode]
    const radarScale = d3.scaleOrdinal().domain(["Chicago", zipcode])
    .range(['#8edf34','#f18701']);
    
    rdr_svg
    .attr("width", radar_width)
    .attr("height", radar_height)
    .attr("class", "svg_" + id);
    
    if (zipcode != "select") {
        filteredData = filteredData.filter(record => record.PostalCode === zipcode);
    }
    
    var data = [
        [
            { axis: "HousingTransport", value: d3.mean(dataset, (d) => d.HousingTransport)},
            { axis: "HouseholdComposition", value: d3.mean(dataset, (d) => d.HouseholdComposition) },
            { axis: "MinorityLanguage", value: d3.mean(dataset, (d) => d.MinorityLanguage) },
            { axis: "SocioEconomic", value: d3.mean(dataset, (d) => d.SocioEconomic) },
            { axis: "MyChartActivation", value: d3.mean(dataset, (d) => d.Total_active) },
            { axis: "TotalPatients", value: d3.mean(dataset, (d) => d.Population_Percentage * 100) },
        ],
        [
            { axis: "HousingTransport", value: (filteredData? filteredData[0].HousingTransport : 0)},
            { axis: "HouseholdComposition", value: (filteredData? filteredData[0].HouseholdComposition : 0)},
            { axis: "MinorityLanguage", value: (filteredData? filteredData[0].MinorityLanguage : 0)},
            { axis: "SocioEconomic", value: (filteredData? filteredData[0].SocioEconomic : 0)},
            { axis: "MyChartActivation", value: (filteredData? filteredData[0].Total_active : 0)},
            { axis: "TotalPatients", value: (filteredData? filteredData[0].Population_Percentage * 100 : 0)},
        ],
    ];
    
    var radar_color = d3
    .scaleOrdinal()
    .range(['#8edf34','#f18701', "black", "black"]);
    
    var options = {
        w: radar_width,
        h: radar_height,
        margin: radar_margin,
        maxValue: 0.5,
        levels: 6,
        roundStrokes: true,
        color: radar_color,
    };
    
    var cfg = {
        w: 400, //Width of the circle
        h: 400, //Height of the circle
        margin: { top: 0, right: 0, bottom: 0, left: 0 }, //The margins of the rdr_svg
        levels: 6, //How many levels or inner circles should there be drawn
        maxValue: 0, //What is the value that the biggest circle will represent
        labelFactor: 1.5, //How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 40, //The number of pixels after which a label needs to be given a new line
        opacityArea: 0.5, //The opacity of the area of the blob
        dotRadius: 4, //The size of the colored circles of each blog
        opacityCircles: 0.1, //The opacity of the circles of each blob
        strokeWidth: 2, //The width of the stroke around each blob
        roundStrokes: false, //If true the area and stroke will follow a round path (cardinal-closed)
        color: d3.scaleOrdinal(d3.schemeCategory10), //Color function
    };
    
    var scaleList = [
        [0, 0.2, 0.4, 0.6, 0.8, 1], //"HousingTransport"
        [0, 0.2, 0.4, 0.6, 0.8, 1], //"HouseholdComposition"
        [0, 0.2, 0.4, 0.6, 0.8, 1], //"MinorityLanguage":
        [0, 0.2, 0.4, 0.6, 0.8, 1], //"SocioEconomic"
        [0, 0.2, 0.4, 0.6, 0.8, 1], //"Total Activation":
        [0,  0.8, 1.6, 2.4, 3.2, 4.0, 100], //"Total Patients"
    ];
    
    //Put all of the options into a variable called cfg
    if ("undefined" !== typeof options) {
        for (var i in options) {
            if ("undefined" !== typeof options[i]) {
                cfg[i] = options[i];
            }
        } //for i
    } //if
    
    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    var maxValue = Math.max(
        cfg.maxValue,
        d3.max(data, function (i) {
            return d3.max(
                i.map(function (o) {
                    return o.value;
                })
                );
            })
            );
            
            var allAxis = data[0].map(function (i, j) {
                return i.axis;
            }), //Names of each axis
            total = allAxis.length, //The number of different axes
            radius = Math.min(cfg.w / 3, cfg.h / 2.8), //Radius of the outermost circle
            Format = d3.format(".1f"), //Percentage formatting
            angleSlice = (Math.PI * 2) / total; //The width in radians of each "slice"
            
            var g = rdr_svg
            .append("g")
            .attr(
                "transform",
                "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + cfg.h / 1.9 + ")"
                );
                
                //title code
                rdr_svg
                .append("text")
                .attr("x", 210  )
                .attr("y", 20)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .attr("fill", "black")
                .style("text-decoration", "underline")
                .text("Chicago vs " + zipcode);
                
                //Filter for the outside glow
                var filter = g.append("defs").append("filter").attr("id", "glow"),
                feGaussianBlur = filter
                .append("feGaussianBlur")
                .attr("stdDeviation", "1.8")
                .attr("result", "coloredBlur"),
                feMerge = filter.append("feMerge"),
                feMergeNode_1 = feMerge.append("feMergeNode").attr("in", "coloredBlur"),
                feMergeNode_2 = feMerge.append("feMergeNode").attr("in", "SourceGraphic");
                
                //Wrapper for the grid & axes
                var axisGrid = g.append("g").attr("class", "axisWrapper");
                
                //Draw the background circles
                axisGrid
                .selectAll(".levels")
                .data(d3.range(1, cfg.levels + 1).reverse())
                .enter()
                .append("circle")
                .attr("class", "gridCircle")
                .attr("r", function (d, i) {
                    return (radius / cfg.levels) * d;
                })
                .style("fill", "black")
                .style("stroke", "#CDCDCD")
                .style("fill-opacity", cfg.opacityCircles)
                .style("filter", "url(#glow)");
                
                var rScaleList = [
                    d3.scaleLinear().range([0, radius]).domain([0, scaleList[0][5]]),
                    d3.scaleLinear().range([0, radius]).domain([0, scaleList[1][5]]),
                    d3.scaleLinear().range([0, radius]).domain([0, scaleList[2][5]]), 
                    d3.scaleLinear().range([0, radius]).domain([0, scaleList[3][5]]),
                    d3.scaleLinear().range([0, radius]).domain([0, scaleList[4][5]]), 
                    d3.scaleLinear().range([0, radius]).domain([0, scaleList[5][5]])
                ];
                //Create the straight lines radiating outward from the center
                var axis = axisGrid
                .selectAll(".axis")
                .data(allAxis)
                .enter()
                .append("g")
                .attr("class", "axis");
                
                //scale
                for (let echelleNumero = 0; echelleNumero < 6; echelleNumero++) {
                    axis
                    .append("text")
                    .attr("class", "textscale")
                    .style("font-size", "10px")
                    .attr("fill", "#737373")
                    .data(scaleList[echelleNumero])
                    .attr("x", 4)
                    .attr("dy", "-8")
                    .attr("y", function (d, i) {
                        return (-radius * i) / scaleList[echelleNumero].length;
                    })
                    .attr("transform", function (d, i) {
                        var angleI = (angleSlice * echelleNumero * 180) / Math.PI;
                        var flip = angleI < 90 || angleI > 270 ? false : true; 
                        if (flip == true) {
                            return "rotate(" + angleI + ")";
                        } else {
                            return "rotate(" + angleI + ")";
                        }
                    })
                    .text(function (d) {
                        if (echelleNumero == 0) {
                            return Format(d);
                        } else {
                            if (d != 0) {
                                return Format(d);
                            } else {
                                return;
                            }
                        }
                    });
                }
                //Append the lines
                
                axis
                .append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", function (d, i) {
                    return radius * Math.cos(angleSlice * i - Math.PI / 2);
                })
                .attr("y2", function (d, i) {
                    return radius * Math.sin(angleSlice * i - Math.PI / 2);
                })
                .attr("class", "line")
                .style("stroke", "white")
                .style("stroke-width", "2px");
                
                //Append the labels at each axis
                axis
                .append("text")
                .attr("class", "legend")
                .style("font-size", "11px")
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("dy", "-1px")
                .attr("dx", "10px")
                .attr("x", function (d, i) {
                    return radius * 1.3 * Math.cos(angleSlice * i - Math.PI / 2);
                })
                .attr("y", function (d, i) {
                    return radius * 1.1 * Math.sin(angleSlice * i - Math.PI / 2);
                })
                .text(function (d) {
                    return d;
                })
                .call(wrap, cfg.wrapWidth);
                
                //The radial line function
                var radarLine = d3
                .lineRadial()
                .curve(d3.curveLinearClosed)
                .radius(function (d, i) {
                    return rScaleList[i](d.value);
                })
                .angle(function (d, i) {
                    return i * angleSlice;
                });
                
                if (cfg.roundStrokes) {
                    radarLine.curve(d3.curveLinearClosed);
                }
                
                //Create a wrapper for the blobs
                var blobWrapper = g
                .selectAll(".radarWrapper")
                .data(data)
                .enter()
                .append("g")
                .attr("class", "radarWrapper");
                
                //Append the backgrounds
                blobWrapper
                .append("path")
                .attr("class", "radarArea")
                .attr("d", function (d, i) {
                    return radarLine(d);
                })
                .style("fill", function (d, i) {
                    return cfg.color(i);
                })
                .style("fill-opacity", cfg.opacityArea)
                .on("mouseover", function (d, i) {
                    //Dim all blobs
                    d3.selectAll(".radarArea")
                    .transition()
                    .duration(200)
                    .style("fill-opacity", 0.1);
                    //Bring back the hovered over blob
                    d3.select(this).transition().duration(200).style("fill-opacity", 0.7);
                })
                .on("mouseout", function () {
                    //Bring back all blobs
                    d3.selectAll(".radarArea")
                    .transition()
                    .duration(200)
                    .style("fill-opacity", cfg.opacityArea);
                });
                
                //Create the outlines
                blobWrapper
                .append("path")
                .attr("class", "radarStroke")
                .attr("d", function (d, i) {
                    return radarLine(d);
                })
                .style("stroke-width", cfg.strokeWidth + "px")
                .style("stroke", function (d, i) {
                    return cfg.color(i);
                })
                .style("fill", "none")
                .style("filter", "url(#glow)");
                
                //Append the circles
                blobWrapper
                .selectAll(".radarCircle")
                .data(function (d, i) {
                    return d;
                })
                .enter()
                .append("circle")
                .attr("class", "radarCircle")
                .attr("r", cfg.dotRadius)
                .attr("cx", function (d, i) {
                    return rScaleList[i](d.value) * Math.cos(angleSlice * i - Math.PI / 2);
                })
                .attr("cy", function (d, i) {
                    return rScaleList[i](d.value) * Math.sin(angleSlice * i - Math.PI / 2);
                })
                .style("fill", function (d, i, j) {
                    return cfg.color(j);
                })
                .style("fill-opacity", 0.8);
                
                //Wrapper for the invisible circles on top
                var blobCircleWrapper = g
                .selectAll(".radarCircleWrapper")
                .data(data)
                .enter()
                .append("g")
                .attr("class", "radarCircleWrapper");
                
                //Append a set of invisible circles on top for the mouseover pop-up
                blobCircleWrapper
                .selectAll(".radarInvisibleCircle")
                .data(function (d, i) {
                    return d;
                })
                .enter()
                .append("circle")
                .attr("class", "radarInvisibleCircle")
                .attr("r", cfg.dotRadius * 1.5)
                .attr("cx", function (d, i) {
                    return rScaleList[i](d.value) * Math.cos(angleSlice * i - Math.PI / 2);
                })
                .attr("cy", function (d, i) {
                    return rScaleList[i](d.value) * Math.sin(angleSlice * i - Math.PI / 2);
                })
                .style("fill", "none")
                .style("pointer-events", "all")
                .on("mouseover", function (d, i) {
                    newX = parseFloat(d3.select(this).attr("cx")) - 10;
                    newY = parseFloat(d3.select(this).attr("cy")) - 10;
                    
                    rdr_tooltip
                    .attr("x", newX)
                    .attr("y", newY)
                    .text(Format(d.value))
                    .transition()
                    .duration(200)
                    .style("opacity", 1);
                })
                .on("mouseout", function () {
                    rdr_tooltip.transition().duration(200).style("opacity", 0);
                });
                
                //Set up the small rdr_tooltip for when you hover over a circle
                var rdr_tooltip = g
                .append("text")
                .attr("class", "tooltip")
                .style("opacity", 0);
                
                //Taken from http://bl.ocks.org/mbostock/7555321
                //Wraps rdr_svg text
                function wrap(text, width) {
                    text.each(function () {
                        var text = d3.select(this),
                        words = text.text().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.4, // ems
                        y = text.attr("y"),
                        x = text.attr("x"),
                        dy = parseFloat(text.attr("dy")),
                        tspan = text
                        .text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
                        
                        while ((word = words.pop())) {
                            line.push(word);
                            tspan.text(line.join(" "));
                            if (tspan.node().getComputedTextLength() > width) {
                                line.pop();
                                tspan.text(line.join(" "));
                                line = [word];
                                tspan = text
                                .append("tspan")
                                .attr("x", x)
                                .attr("y", y)
                                .attr("dy", ++lineNumber * lineHeight + dy + "em")
                                .text(word);
                            }
                        }
                    });
                } //wrap
                
                rdr_svg.selectAll("mydots")
                .data(dataCatRadar)
                .enter()
                .append("circle")
                .attr("cx", 340)
                .attr("cy", function (d, i) { return 50 + i * 15 })
                .attr("r", 5)
                .style("fill", function (d) { return radarScale(d) })
                
                rdr_svg.selectAll("mylabels")
                .data(dataCatRadar)
                .enter()
                .append("text")
                .attr("x", 350)
                .attr("y", function (d, i) { return 50 + i * 15 })
                .style("fill", "black")
                .text(function (d) { return d })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .style("font-size", "12px")
            } //RadarChart
            
            