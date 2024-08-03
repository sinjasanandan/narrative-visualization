// Load and process the line chart data
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

// Define margins and dimensions for the line chart
const margin = {top: 40, right: 20, bottom: 30, left: 50};
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create the SVG container for the line chart
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Define scales for the line chart
const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

// Define axes for the line chart
const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")); // Format tick labels as integers (years)
const yAxis = d3.axisLeft(yScale);

// Append x and y axes for the line chart
svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")");

svg.append("g")
    .attr("class", "y-axis");

// Add x-axis label for the line chart
svg.append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom + 20)
    .text("Year");

// Add y-axis label for the line chart
svg.append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .text("% Internet Users Among Population");

// Line generator function for the line chart
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

// Function to update the line chart based on the selected country
function updateChart(country, data) {
    // Filter data based on the selected country
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

// Load and process the bubble chart data
Promise.all([
    d3.csv("Final.csv"),
    d3.csv("countries of the world.csv")
]).then(([finalData, worldData]) => {
    // Parse the data
    finalData.forEach(d => {
        d.Year = +d.Year;
        d['Internet Users(%)'] = +d['Internet Users(%)'];
    });

    worldData.forEach(d => {
        d.Population = +d.Population;
        d['GDP ($ per capita)'] = +d['GDP ($ per capita)'];
        d['Literacy (%)'] = +d['Literacy (%)'];
    });

    // Merge the datasets by country
    const mergedData = finalData.map(d => {
        const worldInfo = worldData.find(w => w.Country === d.Entity);
        return worldInfo ? {...d, ...worldInfo} : null;
    }).filter(d => d);

    // Filter to get the most recent data per country
    const latestData = d3.rollups(mergedData, v => v.sort((a, b) => b.Year - a.Year)[0], d => d.Entity).map(d => d[1]);

    // Step 2: Create the Bubble Chart
    createBubbleChart(latestData);
});

// Function to create the bubble chart
function createBubbleChart(data) {
    // Define margins and dimensions
    const margin = {top: 40, right: 20, bottom: 50, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create the SVG container for the bubble chart
    const svg = d3.select("#bubble-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define scales
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d['GDP ($ per capita)'])])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d['Internet Users(%)'])])
        .range([height, 0]);

    const rScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.Population)])
        .range([5, 30]);

    // Define axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Append x and y axes for the bubble chart
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", 40)
        .style("text-anchor", "middle")
        .text("GDP ($ per capita)");

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .style("text-anchor", "middle")
        .text("% Internet Users Among Population");

    // Add the bubbles
    svg.selectAll(".bubble")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "bubble")
        .attr("cx", d => xScale(d['GDP ($ per capita)']))
        .attr("cy", d => yScale(d['Internet Users(%)']))
        .attr("r", d => rScale(d.Population))
        .attr("fill", "steelblue")
        .attr("opacity", 0.7);

    // Add tooltip behavior
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll(".bubble")
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`${d.Entity}<br>GDP: $${d['GDP ($ per capita)']}<br>Internet Usage: ${d['Internet Users(%)']}%<br>Population: ${d.Population}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
        });
}
