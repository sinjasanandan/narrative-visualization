// Promise.all([
//     d3.csv("Final.csv"),
//     d3.json("countries.geojson")
// ]).then(([data, geoData]) => {
//     // Process the data
//     const latestData = d3.rollups(data, v => v.sort((a, b) => b.Year - a.Year)[0], d => d.Code).map(d => d[1]);

//     // Create a map of country codes to internet usage percentages
//     const internetUsageMap = new Map(latestData.map(d => [d.Code, +d['Internet Users(%)']]));

//     // Render the map
//     createChoropleth(geoData, internetUsageMap);
// });

// function createChoropleth(geoData, internetUsageMap) {
//     const width = 1000;
//     const height = 550;

//     const svg = d3.select("#choropleth-map")
//         .append("svg")
//         .attr("width", width)
//         .attr("height", height);

//     // Define a projection and path generator
//     const projection = d3.geoMercator().scale(150).translate([width / 2, height / 1.4]);
//     const path = d3.geoPath().projection(projection);

//     // Define a color scale
//     const colorScale = d3.scaleSequential(d3.interpolateBlues)
//         .domain([0, d3.max(Array.from(internetUsageMap.values()))]);

//     // Draw the map
//     svg.selectAll("path")
//         .data(geoData.features)
//         .enter().append("path")
//         .attr("d", path)
//         .attr("fill", d => {
//             const code = d.properties.iso_a3;
//             const usage = internetUsageMap.get(code);
//             return usage ? colorScale(usage) : "#ccc"; // Default color if no data
//         })
//         .attr("stroke", "#333")
//         .attr("stroke-width", 0.5);

//     svg.append("g")
//         .selectAll("path")
//         .data(geoData.features)
//         .enter()
//         .append("path")
//         .attr("d", path)
//         .attr("fill", "none")
//         .attr("stroke", "#333")  // Border color
//         .attr("stroke-width", 0.5);  // Border thickness

//     const tooltip = d3.select("body").append("div")
//         .attr("class", "tooltip")
//         .style("opacity", 0)
//         .style("position", "absolute")
//         .style("background-color", "#f9f9f9")
//         .style("border", "1px solid #d3d3d3")
//         .style("padding", "5px")
//         .style("border-radius", "3px");

//     countries.on("mouseover", function(event, d) {
//             tooltip.transition().duration(200).style("opacity", .9);
//             const code = d.properties.iso_a3;
//             const usage = internetUsageMap.get(code);
//             const countryName = d.properties.name;
//             tooltip.html(`${countryName}<br>Internet Usage: ${usage ? usage.toFixed(2) : 'No Data'}%`)
//                 .style("left", (event.pageX + 5) + "px")
//                 .style("top", (event.pageY - 28) + "px");
//         })
//         .on("mouseout", function() {
//             tooltip.transition().duration(500).style("opacity", 0);
//         });
// }


// function addVerticalLegend(svg, colorScale, width) {
//     const legendHeight = 200;
//     const legendWidth = 20;

//     const legend = svg.append("g")
//         .attr("class", "legend")
//         .attr("transform", `translate(${width - legendWidth - 40}, 100)`);

//     const legendScale = d3.scaleLinear()
//         .domain(colorScale.domain())
//         .range([legendHeight, 0]);

//     // Add a color gradient bar
//     const gradient = svg.append("defs")
//         .append("linearGradient")
//         .attr("id", "gradient")
//         .attr("x1", "0%")
//         .attr("y1", "100%")
//         .attr("x2", "0%")
//         .attr("y2", "0%");

//     gradient.append("stop")
//         .attr("offset", "0%")
//         .attr("stop-color", colorScale(colorScale.domain()[0]));

//     gradient.append("stop")
//         .attr("offset", "100%")
//         .attr("stop-color", colorScale(colorScale.domain()[1]));

//     legend.append("rect")
//         .attr("width", legendWidth)
//         .attr("height", legendHeight)
//         .style("fill", "url(#gradient)");

//     // Add an axis for the legend
//     const legendAxis = d3.axisRight(legendScale)
//         .ticks(5)
//         .tickFormat(d => `${d}%`);

//     legend.append("g")
//         .attr("transform", `translate(${legendWidth}, 0)`)
//         .call(legendAxis);
// }











Promise.all([
    d3.csv("Final.csv"),
    d3.json("countries.geojson")
]).then(([data, geoData]) => {
    // Process the data
    const latestData = d3.rollups(data, v => v.sort((a, b) => b.Year - a.Year)[0], d => d.Code).map(d => d[1]);

    // Create a map of country codes to internet usage percentages
    const internetUsageMap = new Map(latestData.map(d => [d.Code, +d['Internet Users(%)']]));

    // Render the map and legend
    const svg = createChoropleth(geoData, internetUsageMap);
    addHorizontalLegend(svg, d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(Array.from(internetUsageMap.values()))]), svg.attr("width"));

});

function createChoropleth(geoData, internetUsageMap) {
    const width = 1000;
    const height = 640;

    const svg = d3.select("#choropleth-map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Define a projection and path generator
    const projection = d3.geoMercator().scale(150).translate([width / 2, height / 1.4]);
    const path = d3.geoPath().projection(projection);

    // Define a color scale
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(Array.from(internetUsageMap.values()))]);

    // Draw the map
    const countries = svg.selectAll("path")
        .data(geoData.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", d => {
            const code = d.properties.iso_a3;
            const usage = internetUsageMap.get(code);
            return usage ? colorScale(usage) : "#ccc"; // Default color if no data
        })
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5);


    svg.append("g")
        .selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#333")  // Border color
        .attr("stroke-width", 0.5);  // Border thickness

    // Add tooltips
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "#f9f9f9")
        .style("border", "1px solid #d3d3d3")
        .style("padding", "5px")
        .style("border-radius", "3px");

    countries.on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            const code = d.properties.iso_a3;
            const usage = internetUsageMap.get(code);
            const countryName = d.properties.name;
            tooltip.html(`${countryName}<br>Internet Usage: ${usage ? usage.toFixed(2) : 'No Data'}%`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    return svg;
}

function addHorizontalLegend(svg, colorScale, width) {
    const legendHeight = 20;
    const legendWidth = 300; // Adjust as needed

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${50 + width / 2 - legendWidth / 2}, ${svg.attr("height") - 50})`);

    // Add a color gradient bar
    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "horizontal-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorScale(colorScale.domain()[0]));

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScale(colorScale.domain()[1]));

    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#horizontal-gradient)");

    // Add an axis for the legend
    const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d => `${d}%`);

    legend.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis);
}
