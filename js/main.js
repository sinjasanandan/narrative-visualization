Promise.all([
    d3.csv("Final.csv"),
    d3.json("countries.geojson")
]).then(([data, geoData]) => {
    // Process the data
    const latestData = d3.rollups(data, v => v.sort((a, b) => b.Year - a.Year)[0], d => d.Code).map(d => d[1]);

    // Create a map of country codes to internet usage percentages
    const internetUsageMap = new Map(latestData.map(d => [d.Code, +d['Internet Users(%)']]));

    // Render the map
    createChoropleth(geoData, internetUsageMap);
});

function createChoropleth(geoData, internetUsageMap) {
    const width = 960;
    const height = 500;

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
    svg.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", d => {
            const countryData = internetData.find(data => data.Entity === d.properties.name);
            return countryData ? colorScale(countryData['Internet Users(%)']) : "#ccc";
        })
        .attr("stroke", "#333")  // Border color
        .attr("stroke-width", 0.5)  // Border thickness
        .attr("stroke-linejoin", "round");  // Smooths corners

    svg.append("g")
        .selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#333")  // Border color
        .attr("stroke-width", 0.5);  // Border thickness
}
