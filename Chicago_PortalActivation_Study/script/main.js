var dataset;

async function load_data() {
  dataset = await d3.csv("././data/Complete_Data_Final.csv");
  draw_map(dataset, "SocioEconimic", "Activation");
  draw_demopane(dataset, "60607");
  populteZips();
  zip1 = document.getElementById("");
  RadarChart("#radar_plot_zipcode1", "60623", dataset); //Default values
  RadarChart("#radar_plot_zipcode2", "60612", dataset);
  filter_zipcode_data("60623", "60612");
  draw_bubble(dataset, "SocioEconomic");
}

async function load_data_jitter() {
  var dataset_jitter_race = await d3.csv("././data/Jitter_Data_Race.csv");
  var dataset_jitter_ethnicity = await d3.csv(
    "././data/Jitter_Data_Ethnicity.csv"
  );
  draw_violin(dataset_jitter_race, dataset_jitter_ethnicity);
}
load_data_jitter();
load_data();

var svitheme = "select";
var filter = "select";
var zipcode1 = "select";
var zipcode2 = "select";

var zipcodes = [
  "select",
  "60607",
  "60655",
  "60661",
  "60643",
  "60654",
  "60605",
  "60652",
  "60642",
  "60657",
  "60618",
  "60614",
  "60601",
  "60610",
  "60611",
  "60641",
  "60628",
  "60647",
  "60606",
  "60616",
  "60707",
  "60619",
  "60633",
  "60603",
  "60620",
  "60638",
  "60608",
  "60827",
  "60613",
  "60622",
  "60660",
  "60653",
  "60612",
  "60625",
  "60666",
  "60602",
  "60629",
  "60615",
  "60659",
  "60645",
  "60639",
  "60637",
  "60609",
  "60636",
  "60644",
  "60651",
  "60604",
  "60632",
  "60626",
  "60624",
  "60621",
  "60623",
  "60617",
  "60630",
  "60631",
  "60634",
  "60640",
  "60646",
  "60649",
  "60656",
];

// filter functions for data + making visualization function calls
function filter_data(element) {
  svitheme = document.getElementById("svi").value;
  filter = document.getElementById("filter").value;

  var svitheme_val = svitheme;
  var filter_val = filter;
  var data = dataset;

  draw_map(data, svitheme_val, filter_val);
  draw_bubble(data, svitheme_val);
}

function filter_zipcode_data(element) {
  zipcode1 = document.getElementById("zipcode1").value;
  zipcode2 = document.getElementById("zipcode2").value;

  var zipcode1_val = zipcode1;
  var zipcode2_val = zipcode2;
  RadarChart("#radar_plot_zipcode1", zipcode1_val, dataset);
  RadarChart("#radar_plot_zipcode2", zipcode2_val, dataset);
}

// function for populating zip codes in the drop down menus, sorted for better user experience
function populteZips() {
  zipcode1 = document.getElementById("zipcode1").value;
  zipcode2 = document.getElementById("zipcode2").value;

  var str1 = "";
  var str2 = "";
  zipcodes.sort();
  for (var z of zipcodes) {
    if (z == zipcode1) {
      str1 += "<option value=" + z + " selected>" + z + "</option>";
    } else {
      str1 += "<option value=" + z + ">" + z + "</option>";
    }
  }

  for (var z of zipcodes) {
    if (z == zipcode2) {
      str2 += "<option value=" + z + " selected>" + z + "</option>";
    } else {
      str2 += "<option value=" + z + ">" + z + "</option>";
    }
  }

  document.getElementById("zipcode1").innerHTML = str1;
  document.getElementById("zipcode2").innerHTML = str2;
}

// Chicago choropleth map section
const chicagoMap = d3.select("#map_div").select("svg"),
  width = +chicagoMap.attr("width"),
  height = +chicagoMap.attr("height");

var dataCat = [0, 0.2, 0.4, 0.6, 0.8, 1];
var n = dataCat.length / 2;
var itemWidth = 80;
var itemHeight = 18;

var centroids;
d3.json("././data/zipcodes.geojson").then(function (data) {
  centroids = data.features.map(function (feature) {
    return {
      zipcode: feature.properties.zip,
      center: d3.geoCentroid(feature),
    };
  });
  console.log(centroids);
});

// Map and projection
function draw_map(dataset, theme, filter) {
  var data = new Map();
  var filter_data = new Map();
  if (filter) {
    dataset.map(function (d) {
      filter_data.set(d.PostalCode, +d[filter]);
    });
  }
  if (theme === "SocioEconomic") {
    dataset.map(function (d) {
      data.set(d.PostalCode, +d.SocioEconomic);
    });
  } else if (theme === "HousingTransport") {
    dataset.map(function (d) {
      data.set(d.PostalCode, +d.HousingTransport);
    });
  } else if (theme === "MinorityLanguage") {
    dataset.map(function (d) {
      data.set(d.PostalCode, +d.MinorityLanguage);
    });
  } else if (theme === "HouseholdComposition") {
    dataset.map(function (d) {
      data.set(d.PostalCode, +d.HouseholdComposition);
    });
  } else {
    dataset.map(function (d) {
      data.set(d.PostalCode, +d.Total_active);
    });
  }

  chicagoMap.selectAll("*").remove();

  const projection = d3
    .geoMercator()
    .scale(width * 100)
    .center([-87.6298, 41.8781])
    .translate([290, height / 2.5]);

  const path = d3.geoPath();
  
  // Data and color scale
  const colorScale = d3
    .scaleLinear()
    .domain([0, 0.2, 0.4, 0.6, 0.8, 1])
    .range(["#93caf6", "#9fa0ff", "#9667e0", "#ab51e3", "#6f2dbd", "#4a0a77"]);

    // for glyphs
  const z = d3
    .scaleSqrt()
    .domain([0, 20, 40, 60, 80, 100])
    .range([0, 2, 4, 6, 8]);

  d3.json("././data/zipcodes.geojson").then(function (loadData) {
    let topo = loadData;

    // Draw a tooltip for the map
    var map_tooltip = d3
      .select("#map_div")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("font-size", "12px")
      .style("padding", "2px");

    let mouseOver = function (event, d) {
      d3.selectAll(".zip").transition().style("opacity", 0.5);
      d3.select(this).transition().style("opacity", 1);
      map_tooltip.transition().style("opacity", 0.9);
      map_tooltip
        .html("Zipcode: " + d.properties.zip)
        .style("left", event.x + 10 + "px") 
        .style("top", event.y + 10 + "px");
    };

    let mouseLeave = function (d) {
      d3.selectAll(".zip").transition().style("opacity", 1);
      map_tooltip.transition().duration(500).style("opacity", 0);
    };

    let onClick = function (d) {
      d3.selectAll(".zip").transition().style("stroke", "none");
      d3.select(this).transition().style("opacity", 1).style("stroke", "black");
      var zipCode = d.target.id;
      draw_demopane(dataset, zipCode);
    };

    // Draw the map
    chicagoMap
      .append("g")
      .selectAll("path")
      .data(topo.features)
      .enter()
      .append("path")
      .attr("d", d3.geoPath().projection(projection))
      .attr("fill", function (d) {
        d.total = data.get(d.properties.zip);
        return colorScale(d.total);
      })
      .style("stroke", "transparent")
      .attr("class", function (d) {
        return "zip";
      })
      .attr("id", function (d) {
        return d.properties.zip;
      })
      .style("opacity", 1)
      .on("mouseover", mouseOver)
      .on("mouseleave", mouseLeave)
      .on("click", onClick);

    if (filter) {
      // code for adding the glyphs
      chicagoMap
        .selectAll("myCircles")
        .data(centroids)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
          return projection(d.center)[0];
        })
        .attr("cy", function (d) {
          return projection(d.center)[1];
        })
        .attr("r", function (d) {
          d.total = filter_data.get(d.zipcode);
          return z(d.total * 100);
        })
        .style("fill", "#f5ebe0")
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("fill-opacity", 0.8);
    }

    chicagoMap
      .selectAll("mydots")
      .data(dataCat)
      .enter()
      .append("circle")
      .attr("cx", 430)
      .attr("cy", function (d, i) {
        return 50 + i * 15;
      })
      .attr("r", 5)
      .style("fill", function (d) {
        return colorScale(d);
      });

    chicagoMap
      .selectAll("mylabels")
      .data(dataCat)
      .enter()
      .append("text")
      .attr("x", 440)
      .attr("y", function (d, i) {
        return 50 + i * 15;
      })
      .style("fill", function (d) {
        return colorScale(d);
      })
      .text(function (d) {
        return d;
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .style("font-size", "14px");
  });
}

const demo = d3
  .select("#demo_pane")
  .append("svg")
  .attr("width", 470)
  .attr("height", 200)
  .attr("transform", "translate(0, 0)");

const demo_legend = d3
  .select("#legend")
  .append("svg")
  .attr("width", 470)
  .attr("height", 55);

function draw_demopane(data, zipcode) {
  const margin = { top: 10, right: 20, bottom: 20, left: 20 };
  const width = 470;
  const height = 200;
  const barHeight = 30;
  const barPadding = 8;

  demo.selectAll("*").remove();

  const mappedData = data.map((d) => {
    return {
      key: d.PostalCode,
      totalPatients: +d.Total_Population,
      totalActive: +d.Total_active * 100,
      totalInactive: 100 - +d.Total_active * 100,
      LessThan730: +d.LessThan730 * 100,
      GreaterThan730: +d.GreaterThan730 * 100,
      NoValueDays: +d.NoValueDays * 100,
      White: (+d.White / +d.Total_Population) * 100,
      AfricanAmerican: (+d.AfricanAmerican / +d.Total_Population) * 100,
      Asian: (+d.Asian / +d.Total_Population) * 100,
      Others: (+d.Other / +d.Total_Population) * 100,
      None:
        ((+d.Total_Population -
          (+d.White + +d.AfricanAmerican + +d.Asian + +d.Other)) /
          +d.Total_Population) *
        100,
      NoHL: (+d.NoHL / +d.Total_Population) * 100,
      HL: (+d.HL / +d.Total_Population) * 100,
      NoEthnicity: (+d.NoEthnicity / +d.Total_Population) * 100,
    };
  });

  var selectedZip;

  if (zipcode) {
    selectedZip = mappedData.find((d) => d.key === zipcode);
  } else {
    selectedZip = mappedData.find((d) => d.key === "60607");
  }

  const x = d3
    .scaleLinear()
    .domain([0, 100])
    .range([margin.left, 430 - margin.right]);

  const y = d3
    .scaleBand()
    .domain(["Days Since Accessed", "Activation %", "Race", "Ethnicity"])
    .range([margin.top, height - margin.bottom])
    .padding(0.4);

  const xAxis = d3.axisBottom(x);

  const AccessColors = d3
    .scaleOrdinal()
    .domain(["LessThan730", "GreaterThan730", "NoValueDays"])
    .range(["#264653", "#2a9d8f", "black"]);

  const EthnicityColors = d3
    .scaleOrdinal()
    .domain(["HL", "NoHL", "NoEthnicity"])
    .range(["#70d6ff", "#ff70a6", "black"]);

  const ActivationColors = d3
    .scaleOrdinal()
    .domain(["totalActive", "totalInactive"])
    .range(["#8338ec", "#3a86ff"]);

  const RaceColors = d3
    .scaleOrdinal()
    .domain(["White", "AfricanAmerican", "Asian", "Others", "None"])
    .range(["#8ecae6", "#219ebc", "#023047", "#ffb703", "black"]);

  const EthnicityDist = d3.stack().keys(["HL", "NoHL", "NoEthnicity"])([
    selectedZip,
  ]);

  const DaysSinceAccessed = d3
    .stack()
    .keys(["LessThan730", "GreaterThan730", "NoValueDays"])([selectedZip]);

  const ActivationRate = d3.stack().keys(["totalActive", "totalInactive"])([
    selectedZip,
  ]);

  const RaceDist = d3
    .stack()
    .keys(["White", "AfricanAmerican", "Asian", "Others", "None"])([
    selectedZip,
  ]);

  demo_legend.selectAll("*").remove();

  demo
    .append("text")
    .attr("x", 210)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .attr("fill", "black")
    .style("text-decoration", "underline")
    .text("Zipcode: " + zipcode);


  demo
    .append("g")
    .selectAll("g")
    .data(DaysSinceAccessed)
    .join("g")
    .attr("fill", (d) => AccessColors(d.key))
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("y", y("Days Since Accessed"))
    .attr("x", (d) => x(d[0]))
    .attr("width", (d) => x(d[1]) - x(d[0]))
    .attr("height", 35);

  demo
    .append("g")
    .selectAll("g")
    .data(ActivationRate)
    .join("g")
    .attr("fill", (d) => ActivationColors(d.key))
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("y", y("Activation %"))
    .attr("x", (d) => x(d[0]))
    .attr("width", (d) => x(d[1]) - x(d[0]))
    .attr("height", 35);

  demo
    .append("g")
    .selectAll("g")
    .data(RaceDist)
    .join("g")
    .attr("fill", (d) => RaceColors(d.key))
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("y", y("Race"))
    .attr("x", (d) => x(d[0]))
    .attr("width", (d) => x(d[1]) - x(d[0]))
    .attr("height", 35);

  demo
    .append("g")
    .selectAll("g")
    .data(EthnicityDist)
    .join("g")
    .attr("fill", (d) => EthnicityColors(d.key))
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("y", y("Ethnicity"))
    .attr("x", (d) => x(d[0]))
    .attr("width", (d) => x(d[1]) - x(d[0]))
    .attr("height", 35);

  demo
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis);

  demo
    .append("text")
    .attr("x", 412)
    .attr("y", margin.top + 25)
    .attr("writing-mode", "horizontal-lr")
    .text("Days")
    .style("font-size", "12px");

  demo
    .append("text")
    .attr("x", 412)
    .attr("y", margin.top + 36)
    .attr("writing-mode", "horizontal-lr")
    .text("since")
    .style("font-size", "12px");

  demo
    .append("text")
    .attr("x", 412)
    .attr("y", margin.top + 46)
    .attr("writing-mode", "horizontal-lr")
    .text("accessed")
    .style("font-size", "12px");

  demo
    .append("text")
    .attr("x", 412)
    .attr("y", margin.top + 2 * barHeight + barPadding)
    .attr("dy", "0.32em")
    .attr("writing-mode", "horizontal-lr")
    .append("tspan")
    .text("Activation")
    .style("font-size", "12px");

  demo
    .append("text")
    .attr("x", 412)
    .attr("y", margin.top + 2 * barHeight + 2.5 * barPadding)
    .attr("dy", "0.32em")
    .attr("writing-mode", "horizontal-lr")
    .append("tspan")
    .text("Rate")
    .style("font-size", "12px");

  demo
    .append("text")
    .attr("x", 412)
    .attr("y", margin.top + 3 * barHeight + 2 * barPadding)
    .attr("dy", "0.32em")
    .attr("writing-mode", "horizontal-lr")
    .text("Race")
    .style("font-size", "12px");

  demo
    .append("text")
    .attr("x", 412)
    .attr("y", margin.top + 4 * barHeight + 3 * barPadding)
    .attr("dy", "0.32em")
    .attr("writing-mode", "horizontal-lr")
    .text("Ethnicity")
    .style("font-size", "12px");

// legends for demographics section, with absolute positions to efficiently utilize the limited space

  const legendData1 = [
    { label: "Less than 730 days", color: AccessColors("LessThan730") },
    {
      label: "Between 730 and 1460 days",
      color: AccessColors("GreaterThan730"),
    },
    { label: "Hispanic or Latino", color: EthnicityColors("HL") },
  ];

  legendData2 = [
    { label: "Active", color: ActivationColors("totalActive") },
    { label: "Inactive", color: ActivationColors("totalInactive") },
    { label: "Not Hispanic or Latino", color: EthnicityColors("NoHL") },
  ];

  legendData3 = [
    { label: "White", color: RaceColors("White") },
    { label: "Asian", color: RaceColors("Asian") },
    { label: "Others", color: RaceColors("Others") },
    { label: "No value", color: AccessColors("NoValueDays") },
    { label: "African American", color: RaceColors("AfricanAmerican") },
  ];

  const legendItem1 = demo_legend
    .selectAll(".legend-item1")
    .data(legendData1)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(${i * 160 || margin.left}, 5)`);

  legendItem1
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", 12)
    .style("fill", (d) => d.color);

  legendItem1
    .append("text")
    .attr("x", 20)
    .attr("y", 8)
    .text((d) => d.label)
    .attr("text-anchor", "right")
    .style("alignment-baseline", "middle")
    .style("font-size", "10px");

  const legendItem2 = demo_legend
    .selectAll(".legend-item2")
    .data(legendData2)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(${i * 160 || margin.left}, 20)`);

  legendItem2
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", 12)
    .style("fill", (d) => d.color);

  legendItem2
    .append("text")
    .attr("x", 20)
    .attr("y", 8)
    .text((d) => d.label)
    .attr("text-anchor", "right")
    .style("alignment-baseline", "middle")
    .style("font-size", "10px");

  const legendItem3 = demo_legend
    .selectAll(".legend-item3")
    .data(legendData3)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(${i * 80 || margin.left}, 35)`);

  legendItem3
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", 12)
    .style("fill", (d) => d.color);

  legendItem3
    .append("text")
    .attr("x", 20)
    .attr("y", 8)
    .text((d) => d.label)
    .attr("text-anchor", "right")
    .style("alignment-baseline", "middle")
    .style("font-size", "10px");
}

const margin_bubble = { top: 35, right: 30, bottom: 35, left: 25 },
  width_bubble = 500 - margin_bubble.left - margin_bubble.right,
  height_bubble = 350 - margin_bubble.top - margin_bubble.bottom;

const bubble = d3
  .select("#bubble_div")
  .select("svg")
  .attr("width_bubble", width_bubble)
  .attr("height_bubble", height_bubble)
  .append("g")
  .attr("transform", `translate(${margin_bubble.left},${margin_bubble.top})`);

function draw_bubble(dataset, svitheme) {

  bubble.selectAll("*").remove();
  const x = d3.scaleLinear().domain([0, 1]).range([0, width_bubble]);
  bubble
    .append("g")
    .attr("transform", `translate(0, ${height_bubble})`)
    .call(d3.axisBottom(x).ticks(10));

  // Add X axis label:
  bubble
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width_bubble)
    .attr("y", height_bubble + 30)
    .text(svitheme + " (Scale : 0 - 1)")
    .style("font-size", "10px");

  // Add Y axis
  const y = d3.scaleLinear().domain([0, 1]).range([height_bubble, 0]);
  bubble.append("g").call(d3.axisLeft(y));

  // Add Y axis label:
  bubble
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", 0)
    .attr("y", -10)
    .text("MyChart Activation (Scale : 0 - 1)")
    .attr("text-anchor", "start")
    .style("font-size", "10px");

  // Add title
  bubble
    .append("text")
    .attr("x", 220)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .attr("fill", "black")
    .style("text-decoration", "underline")
    .text("MyChart Activation vs " + svitheme);

  bubble
    .append("text")
    .attr("x", 270)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .attr("fill", "black")
    .style("text-decoration", "underline")
    .text("(bubble size proportionate to zip code population)");

  // Add a scale for bubble size
  const z = d3.scaleSqrt().domain([60, 50000]).range([2, 30]);

  // Add a scale for bubble color
  const myColor = d3
    .scaleLinear()
    .domain([0, 0.2, 0.4, 0.6, 0.8, 1.0])
    .range(["#93caf6", "#9fa0ff", "#9667e0", "#ab51e3", "#6f2dbd", "#4a0a77"]);

  // Define the tooltip div
  var tooltip_bbl = d3
    .select("#bubble_div")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("font-size", "10px")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("padding", "5px");

  // Define the mouseover function
  function mouseover(event, d) {
    tooltip_bbl.transition().style("opacity", 0.9);

    tooltip_bbl
      .html(
        "zipcode: " +
          d.PostalCode +
          "<br>Population percentage:" +
          ( Math.round(d.Population_Percentage * 100) / 100)
      )
      .style("left", event.x + "px") 
      .style("top", event.y + "px");
  }

  // Define the mouseout function
  function mouseout(d) {
    tooltip_bbl.transition().duration(500).style("opacity", 0);
  }

  // hover interaction functions
  const highlight = function (event, d) {
    d3.selectAll(".bubbles").style("opacity", 0.05);
    d3.selectAll("." + d.class).style("opacity", 1);
  };

  const noHighlight = function (event, d) {
    d3.selectAll(".bubbles").style("opacity", 1);
  };

// add bubbles
  bubble
    .append("g")
    .selectAll("dot")
    .data(dataset)
    .join("circle")
    .attr("class", function (d) {
      if (d[svitheme] == 0) {
        return "bubbles first";
      } else if (d[svitheme] > 0 && d[svitheme] <= 0.2) {
        return "bubbles second";
      } else if (d[svitheme] > 0.2 && d[svitheme] <= 0.4) {
        return "bubbles third";
      } else if (d[svitheme] > 0.4 && d[svitheme] <= 0.6) {
        return "bubbles fourth";
      } else if (d[svitheme] > 0.6 && d[svitheme] <= 0.8) {
        return "bubbles fifth";
      } else {
        return "bubbles sixth";
      }
    })
    .attr("cx", (d) => x(d[svitheme]))
    .attr("cy", (d) => y(d.Total_active))
    .attr("r", (d) => z(d.Total_Population))
    .style("fill", (d) => myColor(d[svitheme]))
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

  const size = 10;
  const allgroups = [
    { value: 0, class: "first" },
    { value: 0.2, class: "second" },
    { value: 0.4, class: "third" },
    { value: 0.6, class: "fourth" },
    { value: 0.8, class: "fifth" },
    { value: 1, class: "sixth" },
  ];
  bubble
    .selectAll("myrect")
    .data(allgroups)
    .join("circle")
    .attr("cx", 390)
    .attr("cy", (d, i) => 0 + i * (size + 5))
    .attr("r", 5)
    .style("fill", (d) => myColor(d.value))
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight);

  bubble
    .selectAll("mylabels")
    .data(allgroups)
    .enter()
    .append("text")
    .attr("x", 390 + size * 0.8)
    .attr("y", (d, i) => i * (size + 5))
    .style("fill", (d) => myColor(d.value))
    .text((d) => d.value)
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .style("font-size", "14px")
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight);
}
