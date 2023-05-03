const jitter_margin = { top: 20, right: 0, bottom: 30, left: 0 };
const jitter_width = 500 - jitter_margin.left - jitter_margin.right;
const jitter_height = 350 - jitter_margin.top - jitter_margin.bottom;

const Violin_svg = d3
  .select("#violin_div")
  .select("svg")
  .attr("width", jitter_width)
  .attr("height", jitter_height)
  .attr(
    "transform",
    "translate(" + jitter_margin.left + ", " + jitter_margin.bottom + ")"
  )
  .attr("class", "violin");

function draw_violin(dataset_race, dataset_ethnicity) {
  const labels = ["White", "Black", "Asian", "Others", "No Race"];

  let data = new Array(dataset_race.length);
  for (let i = 0; i < dataset_race.length; i++) {
    data[i] = {
      value: dataset_race[i].activation_value,
      label: dataset_race[i].label,
      zipcode: dataset_race[i].zipcode,
    };
  }

  const jitterWidth = 30;

  let yScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([jitter_height - jitter_margin.bottom - jitter_margin.top, 0]);

  let xScale = d3
    .scaleBand()
    .range([0, jitter_width - jitter_margin.right - jitter_margin.left])
    .domain(labels)
    .padding(0.05);

  Violin_svg.selectAll("*").remove();

  Violin_svg.append("g")
    .attr(
      "transform",
      "translate(0," + (jitter_height - jitter_margin.bottom) + ")"
    )
    .call(d3.axisBottom(xScale));

  Violin_svg.append("g")
    .attr("transform", "translate(25," + jitter_margin.top + ")")
    .call(d3.axisLeft(yScale));

  const jitterColorScale = d3
    .scaleThreshold()
    .domain([0, 0.2, 0.4, 0.6, 0.8, 1])
    .range(["#FFFFFF", "#eeef20", "#80ed99", "#57cc99", "#38a3a5", "#22577a", "#525174"]);

  const jitterdataCat = [0, 0.2, 0.4, 0.6, 0.8, 1];

  let histogram = d3
    .histogram()
    .domain(yScale.domain())
    .thresholds(yScale.ticks(10))
    .value((d) => d);

  let sumstat = d3.rollup(
    data,
    (v) => {
      let input = v.map((g) => g["value"]);
      return histogram(input);
    },
    (d) => d["label"]
  );

  const maxNum = Array.from(sumstat.values())
    .map((value, key) => d3.max(value.map((d) => d.length)))
    .reduce((a, b) => (a > b ? a : b));

  let xNumScale = d3
    .scaleLinear()
    .range([xScale.bandwidth() / 2, xScale.bandwidth()])
    .domain([0, maxNum]);

  var tooltip = d3
    .select("#violin_div")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("position", "absolute")
    .style("padding", "5px");

  function mouseover(event, d) {
    tooltip.transition().duration(200).style("opacity", 0.9);

    tooltip
      .html("Zipcode: " + d.zipcode)
      .style("left", event.pageX + "px")
      .style("top", event.pageY + "px");
  }

  function mouseout(d) {
    tooltip.transition().duration(500).style("opacity", 0);
  }

  Violin_svg.append("text")
    .attr("x", 250)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .attr("fill", "black")
    .style("text-decoration", "underline")
    .text("MyChart Activation across racial communities");

  Violin_svg.append("linearGradient")
    .attr("id", "violinGradient")
    .attr("x1", 0)
    .attr("y1", "0%")
    .attr("x2", 0)
    .attr("y1", "100%")
    .selectAll("stop")
    .data([
      {
        offset: "0%",
        color: "#b5e48c",
      },
      {
        offset: "20%",
        color: "#76c893",
      },
      {
        offset: "40%",
        color: "#34a0a4",
      },
      {
        offset: "60%",
        color: "#168aad",
      },
      {
        offset: "80%",
        color: "#1a759f",
      },
      {
        offset: "100%",
        color: "#184e77",
      },
    ])
    .enter()
    .append("stop")
    .attr("offset", function (d) {
      return d.offset;
    })
    .attr("stop-color", function (d) {
      return d.color;
    });

  // Define the foreignObject element
  let checkBox = Violin_svg.append("foreignObject")
    .attr("x", 320)
    .attr("y", 0)
    .attr("width", 100)
    .attr("height", 20);

  // Append the checkbox input element
  checkBox
    .append("xhtml:input")
    .attr("type", "checkbox")
    .on("change", (d) => {
      let isChecked = d.returnValue;
      if (isChecked) {
        draw_violin_ethnicity(dataset_race, dataset_ethnicity);
      }
    });

  checkBox.append("xhtml:label").attr("x", 10).attr("y", 10).text("Ethnicity");

  Violin_svg.selectAll("violinBands")
    .data(sumstat)
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return "translate(" + (xScale(d[0]) + 15) + ", " + "15" + ")";
    })
    .append("path")
    .datum(function (d) {
      return d[1];
    })
    .style("stroke", "none")
    .attr("fill", "url(#violinGradient)")
    .attr(
      "d",
      d3
        .area()
        .x0(xNumScale(0))
        .x1(function (d) {
          return xNumScale(d.length);
        })
        .y(function (d) {
          return yScale(d.x0);
        })
        .curve(d3.curveCatmullRom)
    );

  Violin_svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", 95)
    .attr("y", 10)
    .text("MyChart Activation (scale : 0 - 1)")
    .style("font-size", "10px");

  Violin_svg.selectAll("violinPoints")
    .data(data)
    .enter()
    .append("circle")
    .attr("transform", function (d) {
      return "translate(15,15)";
    })
    .attr("cx", function (d) {
      return (
        xScale(d["label"]) +
        xScale.bandwidth() / 2 -
        Math.random() * jitterWidth
      );
    })
    .attr("cy", function (d) {
      return yScale(d["value"]);
    })
    .attr("r", 5)
    .style("fill", function (d) {
      return jitterColorScale(d["value"]);
    })
    .attr("stroke", "white")
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

  Violin_svg.selectAll("mydots")
    .data(jitterdataCat)
    .enter()
    .append("circle")
    .attr("cx", 430)
    .attr("cy", function (d, i) {
      return 20 + i * 15;
    })
    .attr("r", 5)
    .style("fill", function (d) {
      return jitterColorScale(d);
    });

  Violin_svg.selectAll("mylabels")
    .data(jitterdataCat)
    .enter()
    .append("text")
    .attr("x", 440)
    .attr("y", function (d, i) {
      return 22 + i * 15;
    })
    .style("fill", function (d) {
      return jitterColorScale(d);
    })
    .text(function (d) {
      return d;
    })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .style("font-size", "14px");
}

function draw_violin_ethnicity(dataset_race, dataset_ethnicity) {
  const labels = [
    "Hispanic or Latino",
    "Not Hispanic or Latino",
    "No Ethnicity",
  ];

  let dataEth = new Array(dataset_ethnicity.length);
  for (let i = 0; i < dataset_ethnicity.length; i++) {
    dataEth[i] = {
      value: dataset_ethnicity[i].activation_value,
      label: dataset_ethnicity[i].label,
      zipcode: dataset_ethnicity[i].zipcode,
    };
  }

  const minVal = d3.min(dataEth, (d) => d["value"]);
  const maxVal = d3.max(dataEth, (d) => d["value"]);
  const meanVal = d3.mean(dataEth, (d) => d["value"]);
  const jitterWidth = 30;

  let yScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([jitter_height - jitter_margin.bottom - jitter_margin.top, 0]);

  let xScale = d3
    .scaleBand()
    .range([0, jitter_width - jitter_margin.right - jitter_margin.left])
    .domain(labels)
    .padding(0.05);

  Violin_svg.selectAll("*").remove();

  Violin_svg.append("g")
    .attr(
      "transform",
      "translate(0," + (jitter_height - jitter_margin.bottom) + ")"
    )
    .call(d3.axisBottom(xScale));

  Violin_svg.append("g")
    .attr("transform", "translate(25," + jitter_margin.top + ")")
    .call(d3.axisLeft(yScale));

  const jitterColorScale = d3
    .scaleThreshold()
    .domain([0, 0.2, 0.4, 0.6, 0.8, 1])
    .range(["#FFFFFF", "#eeef20", "#80ed99", "#57cc99", "#38a3a5", "#22577a", "#525174"]);

  const jitterdataCat = [0, 0.2, 0.4, 0.6, 0.8, 1];

  let histogram = d3
    .histogram()
    .domain(yScale.domain())
    .thresholds(yScale.ticks(10))
    .value((d) => d);

  let sumstat = d3.rollup(
    dataEth,
    (v) => {
      let input = v.map((g) => g["value"]);
      return histogram(input);
    },
    (d) => d["label"]
  );

  const maxNum = Array.from(sumstat.values())
    .map((value, key) => d3.max(value.map((d) => d.length)))
    .reduce((a, b) => (a > b ? a : b));

  let xNumScale = d3
    .scaleLinear()
    .range([xScale.bandwidth() / 2, xScale.bandwidth()])
    .domain([0, maxNum]);

  Violin_svg.append("text")
    .attr("x", 250)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .attr("fill", "black")
    .style("text-decoration", "underline")
    .text("MyChart Activation across Ethnicities");

  Violin_svg.append("linearGradient")
    .attr("id", "violinGradient")
    .attr("x1", 0)
    .attr("y1", "0%")
    .attr("x2", 0)
    .attr("y1", "100%")
    .selectAll("stop")
    .data([
      {
        offset: "0%",
        color: "#b5e48c",
      },
      {
        offset: "20%",
        color: "#76c893",
      },
      {
        offset: "40%",
        color: "#34a0a4",
      },
      {
        offset: "60%",
        color: "#168aad",
      },
      {
        offset: "80%",
        color: "#1a759f",
      },
      {
        offset: "100%",
        color: "#184e77",
      },
    ])
    .enter()
    .append("stop")
    .attr("offset", function (d) {
      return d.offset;
    })
    .attr("stop-color", function (d) {
      return d.color;
    });

  // Define the foreignObject element
  let checkBox = Violin_svg.append("foreignObject")
    .attr("x", 320)
    .attr("y", 0)
    .attr("width", 100)
    .attr("height", 20);

  // Append the checkbox input element
  checkBox
    .append("xhtml:input")
    .attr("type", "checkbox")
    .attr("checked", true)
    .on("change", () => {
      let isChecked = d3.select(this).property("checked");
      if (!isChecked) {
        draw_violin(dataset_race, dataset_ethnicity);
      }
    });

  checkBox.append("xhtml:label").attr("x", 10).attr("y", 10).text("Ethnicity");

  Violin_svg.selectAll("violinBands")
    .data(sumstat)
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return "translate(" + xScale(d[0]) + ", " + "15" + ")";
    })
    .append("path")
    .datum(function (d) {
      return d[1];
    })
    .style("stroke", "none")
    .attr("fill", "url(#violinGradient)")
    .attr(
      "d",
      d3
        .area()
        .x0(xNumScale(0))
        .x1(function (d) {
          return xNumScale(d.length);
        })
        .y(function (d) {
          return yScale(d.x0);
        })
        .curve(d3.curveCatmullRom)
    );

  Violin_svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", 95)
    .attr("y", 10)
    .text("MyChart Activation (scale : 0 - 1)")
    .style("font-size", "10px");

  var tooltip = d3
    .select("#violin_div")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("position", "absolute")
    .style("padding", "5px");

  function mouseover(event, d) {
    tooltip.transition().duration(200).style("opacity", 0.9);

    tooltip
      .html("Zipcode: " + d.zipcode)
      .style("left", event.pageX + "px")
      .style("top", event.pageY + "px");
  }

  function mouseout(d) {
    tooltip.transition().duration(500).style("opacity", 0);
  }

  Violin_svg.selectAll("violinPoints")
    .data(dataEth)
    .enter()
    .append("circle")
    .attr("transform", function (d) {
      return "translate(0,15)";
    })
    .attr("cx", function (d) {
      return (
        xScale(d["label"]) +
        xScale.bandwidth() / 2 -
        Math.random() * jitterWidth
      );
    })
    .attr("cy", function (d) {
      return yScale(d["value"]);
    })
    .attr("r", 5)
    .style("fill", function (d) {
      return jitterColorScale(d["value"]);
    })
    .attr("stroke", "white")
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

  Violin_svg.selectAll("mydots")
    .data(jitterdataCat)
    .enter()
    .append("circle")
    .attr("cx", 430)
    .attr("cy", function (d, i) {
      return 20 + i * 15;
    })
    .attr("r", 5)
    .style("fill", function (d) {
      return jitterColorScale(d);
    });

  Violin_svg.selectAll("mylabels")
    .data(jitterdataCat)
    .enter()
    .append("text")
    .attr("x", 440)
    .attr("y", function (d, i) {
      return 22 + i * 15;
    })
    .style("fill", function (d) {
      return jitterColorScale(d);
    })
    .text(function (d) {
      return d;
    })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .style("font-size", "14px");
}

// Reference :https://d3-graph-gallery.com/graph/violin_jitter.html