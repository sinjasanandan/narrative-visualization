d3.csv("Final.csv").then(data => {
    // Parse the data
    console.log(data); 
    data.forEach(d => {
        d.Year = +d.Year;
        d['Internet Users(%)'] = +d['Internet Users(%)'];
    });

    // Create a list of unique countries
    const countries = [...new Set(data.map(d => d.Entity))];

    // Create the dropdown menu
    d3.select("#dropdown")
        .selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    // Set the default value for dropdown menu
    const defaultCountry = "United States";
    d3.select("#dropdown").property("value", defaultCountry);

    // Initialize the chart with the default country
    updateChart(defaultCountry, data);

    // Update the chart when a new country is selected
    d3.select("#dropdown").on("change", function() {
        const selectedCountry = d3.select(this).property("value");
        console.log("Selected country:", selectedCountry);
        updateChart(selectedCountry, data);
    });
});

// Define margins and dimensions
const margin = {top: 40, right: 20, bottom: 30, left: 50};
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create the SVG container
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Define scales
const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

// Define axes
const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")); // Format tick labels as integers (years)
const yAxis = d3.axisLeft(yScale);

// Append x and y axes
svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")");

svg.append("g")
    .attr("class", "y-axis");

// Add x-axis label
svg.append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom + 20)
    .text("Year");

// Add y-axis label
svg.append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .text("% Internet Usage Among Population");

// Line generator function
const line = d3.line()
    .x(d => xScale(d.Year))
    .y(d => yScale(d['Internet Users(%)']));

// Create a tooltip div
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "#f9f9f9")
    .style("border", "1px solid #d3d3d3")
    .style("padding", "5px")
    .style("border-radius", "3px");

// Function to update the chart based on selected country
function updateChart(country, data) {
    // Filter data based on selected country
    const filteredData = data.filter(d => d.Entity === country);

    if (filteredData.length === 0) {
        console.log("No data found for country:", country);
        return;
    }

    console.log("Filtered data for", country, ":", filteredData);

    // Update scales
    xScale.domain(d3.extent(filteredData, d => d.Year));
    yScale.domain([0, d3.max(filteredData, d => d['Internet Users(%)'])]);

    // Update axes
    svg.select(".x-axis").call(xAxis);
    svg.select(".y-axis").call(yAxis);

    // Bind data to line path and update
    const linePath = svg.selectAll(".line").data([filteredData]);

    // Enter phase for the line path
    linePath.enter()
        .append("path")
        .attr("class", "line")
        .merge(linePath)
        .transition()
        .duration(1000)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2);

    // Exit phase (if data changes significantly)
    linePath.exit().remove();

    // Add points for each data point
    const points = svg.selectAll(".point")
        .data(filteredData);

    points.enter()
        .append("circle")
        .attr("class", "point")
        .attr("r", 4)
        .attr("fill", "steelblue")
        .merge(points)
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d['Internet Users(%)']));

    points.exit().remove();

    // Add tooltip behavior and make it clickable
    svg.selectAll(".point")
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Year: ${d.Year}<br>Internet Usage: ${d['Internet Users(%)'].toFixed(3)}%`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("click", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Year: ${d.Year}<br>Internet Usage: ${d['Internet Users(%)'].toFixed(3)}%`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
        });

}
