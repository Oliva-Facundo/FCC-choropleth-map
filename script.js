document.addEventListener("DOMContentLoaded", function () {
  d3.select("#title").text("United States Educational Attainment");
  d3.select("#description").text(
    "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
  );

  const h = 600;
  const w = 1000;
  const p = 50;

  const svg = d3.select("#country").attr("width", w).attr("height", h);

  Promise.all([
    fetch(
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
    ).then((res) => res.json()),
    fetch(
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
    ).then((res) => res.json()),
  ])
    .then((data) => {
      const educationData = data[0];
      const countiesData = data[1];

      let usCounties = topojson.feature(
        countiesData,
        countiesData.objects.counties
      );
      let usStates = topojson.mesh(
        countiesData,
        countiesData.objects.states,
        (a, b) => a !== b
      );
      let path = d3.geoPath();

      let toolTips = d3
        .select("#tooltip")
        .attr("class", "tooltip")
        .style("background", "beige")
        .style("color", "black")
        .style("opacity", 0);

      let minEd = d3.min(educationData, (d) => d.bachelorsOrHigher);
      let maxEd = d3.max(educationData, (d) => d.bachelorsOrHigher);
      let stepVariance = (Math.abs(maxEd) - Math.abs(minEd)) / 10;

      const svg = d3.select("#country").attr("width", w).attr("height", h);

      let target;

      svg
        .selectAll("path")
        .data(usCounties.features)
        .enter()
        .append("path")
        .style("fill", (d) => {
          target = educationData.filter((obj) => obj.fips == d.id);

          if (target.length > 0) {
            return d3.interpolateRdYlBu(
              1 - target[0].bachelorsOrHigher / Math.round(maxEd)
            );
          } else {
            return "beige";
          }
        })
        .style("stroke", "grey")
        .style("stroke-width", "0.5px")
        .attr("class", "county")
        .attr("data-fips", (d) => d.id)
        .attr("data-education", (d) => {
          target = educationData.filter((obj) => obj.fips == d.id);
          if (target.length > 0) {
            return target[0].bachelorsOrHigher;
          }
        })
        .attr("d", path)
        .on("mouseover", function (e, d, i) {
          d3.select(this).style("stroke", "black").style("stroke-width", 0.9);

          target = educationData.filter((obj) => obj.fips == d.id).slice();

          toolTips
            .html(
              target[0].area_name +
                ", " +
                target[0].state +
                "<br>" +
                target[0].bachelorsOrHigher +
                "%"
            )
            .attr("data-education", target[0].bachelorsOrHigher)
            .style("left", e.pageX + 15 + "px")
            .style("top", e.pageY - 50 + "px")
            .style(
              "background",
              d3.interpolateRdYlBu(
                1 - target[0].bachelorsOrHigher / Math.round(maxEd)
              )
            )
            .style("opacity", 0.9);
        })
        .on("mouseout", function (d, i) {
          d3.select(this).style("stroke", "grey").style("stroke-width", 0.5);
          toolTips.style("opacity", 0);
        });

      svg
        .append("path")
        .datum(usStates)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-linejoin", "round")
        .attr("class", "states")
        .attr("d", path);

      const colors = ["#0000ff", '#87ceeb','#ffffff', '#f1b04c', "#ff0000"];

      function createGradient(svg, id, colors) {
        const gradient = svg
          .append("defs")
          .append("linearGradient")
          .attr("id", id)
          .attr("x1", "-20%")
          .attr("x2", "100%")

        const step = 100 / (colors.length - 1);

        colors.forEach((color, i) => {
          gradient
            .append("stop")
            .attr("offset", `${step * i}%`)
            .attr("stop-color", color);
        });
      }
      
      let legend = svg.append("g").attr("class", "legend").attr("id", "legend");
      
      let legendSize = 20;
      let legendLength = 10;
      
      for (let i = 0; i < 10; ++i) {
        createGradient(svg, 'customGradient' + i, colors)
        legend
          .append("rect")
          .style("stroke", "black")
          .style("stroke-width", 1)
          .attr("x", 0.45 * w + i * (legendSize * 2 + 1))
          .attr("y", 30)
          .attr("width", legendSize * 3 + 1)
          .attr("height", legendSize / 2)
          .style("fill", `url(#customGradient${i})`);
      }

      for (var j = 0; j <= legendLength; ++j) {
        legend
          .append("text")
          .attr("x", 0.45 * w + j * (legendSize * 2 + 1))
          .attr("y", 20)
          .text(
            Math.round(Math.round((minEd + j * stepVariance) * 100) / 100) + "%"
          );
      }
    })
    .catch((error) => console.error("No se pudieron cargar los datos:", error));
});
