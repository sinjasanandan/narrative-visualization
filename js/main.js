d3.csv("data/Final.csv").then(data => {
    // Parse the data
    data.forEach(d => {
        d.Year = +d.Year;
        d['Internet Users(%)'] = +d['Internet Users(%)'];
    });

    // Initialize the chart with a default country
    const defaultCountry = "United States";
    updateChart(defaultCountry, data);
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

// Line generator function
const line = d3.line()
    .x(d => xScale(d.Year))
    .y(d => yScale(d['Internet Users(%)']));

// Function to update the chart based on selected country
function updateChart(country, data) {
    // Filter data based on selected country
    const filteredData = data.filter(d => d.Entity === country);

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
}

// Create a dropdown menu for country selection
const dropdown = d3.select("#dropdown")
    .append("select")
    .on("change", function() {
        const selectedCountry = d3.select(this).property("value");
        updateChart(selectedCountry, data);
    });

// Populate dropdown options with unique country names
const countries = [...new Set(data.map(d => d.Entity))];
dropdown.selectAll("option")
    .data(countries)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

// Initialize the chart with the default country
updateChart(defaultCountry, data);
