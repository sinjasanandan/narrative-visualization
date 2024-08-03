// Load both CSV files
Promise.all([
    d3.csv("Final.csv"),
    d3.csv("countries of the world.csv")
]).then(([internetData, worldData]) => {
    // Parse and merge data
    const combinedData = internetData.map(d => {
        // Find corresponding country data
        const countryData = worldData.find(c => c.Country === d.Entity);
        return {
            ...d,
            Population: countryData ? +countryData.Population : undefined,
            GDP: countryData ? +countryData['GDP ($ per capita)'] : undefined
        };
    }).filter(d => d.Population && d.GDP); // Keep only countries with data in both CSVs

    // Initialize the charts
    const defaultCountry = "United States";
    updateLineChart(defaultCountry, internetData);
    updateBubbleChart(combinedData);

    // Dropdown change event
    d3.select("#dropdown").on("change", function() {
        const selectedCountry = d3.select(this).property("value");
        updateLineChart(selectedCountry, internetData);
    });

    // Button click events to switch slides
    d3.select("#switch-to-bubble").on("click", function() {
        d3.select("#line-chart-container").style("display", "none");
        d3.select("#bubble-chart-container").style("display", "block");
        updateBubbleChart(combinedData); // Update bubble chart on switch
    });

    d3.select("#switch-to-line").on("click", function() {
        d3.select("#bubble-chart-container").style("display", "none");
        d3.select("#line-chart-container").style("display", "block");
        updateLineChart(defaultCountry, internetData); // Update line chart on switch
    });
});

// Define function to update line chart
function updateLineChart(country, data) {
    // Remove any existing SVG in the line chart container before drawing
    d3.select("#line-chart svg").remove();

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
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale);

    // Append x and y axes
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")");

    svg.append("g")
        .attr("class", "y-axis");

    // Append axis labels
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Year");

    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .text("Internet Usage Across Population");

    // Line generator function
    const line = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d['Internet Users(%)']));

    // Filter data based on selected country
    const filteredData = data.filter(d => d.Entity === country);

    if (filteredData.length === 0) {
        console.log("No data found for country:", country);
        return;
    }

    // Update scales
    xScale.domain(d3.extent(filteredData, d => d.Year));
    yScale.domain([0, d3.max(filteredData, d => d['Internet Users(%)'])]);

    // Update axes
    svg.select(".x-axis").call(xAxis);
    svg.select(".y-axis").call(yAxis);

    // Bind data to line path and update
    const linePath = svg.selectAll(".line").data([filteredData]);

    linePath.enter()
        .append("path")
        .attr("class", "line")
        .merge(linePath)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2);

    linePath.exit().remove();

    // Add points for each data point
    const points = svg.selectAll(".point").data(filteredData);

    points.enter()
        .append("circle")
        .attr("class", "point")
        .attr("r", 4)
        .attr("fill", "steelblue")
        .merge(points)
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d['Internet Users(%)']));

    points.exit().remove();

    // Add tooltip behavior
    const tooltip = d3.select("body").select(".tooltip");
    if (tooltip.empty()) {
        d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "#f9f9f9")
            .style("border", "1px solid #d3d3d3")
            .style("padding", "5px")
            .style("border-radius", "3px");
    }

    svg.selectAll(".point")
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Year: ${d.Year}<br>Internet Usage: ${d['Internet Users(%)']}%`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
        })
        .on("click", function(event, d) {
            alert(`Year: ${d.Year}\nInternet Usage: ${d['Internet Users(%)']}%`);
        });
}

// Define function to update bubble chart
function updateBubbleChart(data) {
    // Remove any existing SVG in the bubble chart container before drawing
    d3.select("#bubble-chart svg").remove();

    // Define margins and dimensions
    const margin = {top: 40, right: 20, bottom: 30, left: 50};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#bubble-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define scales
    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);
    const sizeScale = d3.scaleSqrt().range([5, 50]);

    // Define axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Append x and y axes
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")");

    svg.append("g")
        .attr("class", "y-axis");

    // Append axis labels
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("GDP per Capita");

    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .text("Internet Usage (%)");

    // Set domains for scales
    xScale.domain(d3.extent(data, d => d.GDP));
    yScale.domain([0, d3.max(data, d => d['Internet Users(%)'])]);
    sizeScale.domain(d3.extent(data, d => d.Population));

    // Bind data to bubble elements and update
    const bubbles = svg.selectAll(".bubble").data(data);

    bubbles.enter()
        .append("circle")
        .attr("class", "bubble")
        .merge(bubbles)
        .attr("cx", d => xScale(d.GDP))
        .attr("cy", d => yScale(d['Internet Users(%)']))
        .attr("r", d => sizeScale(d.Population))
        .attr("fill", "lightblue")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1);

    bubbles.exit().remove();

    // Update axes
    svg.select(".x-axis").call(xAxis);
    svg.select(".y-axis").call(yAxis);
}
