// Load the map and data files
Promise.all([
    d3.json("data/countries.json"),
    d3.csv("data/cross-country-literacy-rates.csv")
]).then(function(files) {
    const geoData = files[0];
    const literacyData = files[1];

    // Process data to get the latest literacy rate for each country
    const latestData = {};

    literacyData.forEach(d => {
        const country = d['country code']; // Assuming this is the ISO A3 code
        const year = +d['year'];
        const literacyRate = +d['literacy rate'];

        if (!latestData[country] || year > latestData[country].year) {
            latestData[country] = { literacyRate: literacyRate, year: year };
        }
    });

    // Set up the SVG and map projection
    const width = 960, height = 600;

    const projection = d3.geoMercator()
        .scale(150)
        .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    const svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Define color scale based on literacy rate
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, 100]); // assuming literacy rates are percentages

    // Bind data to the map and create one path per GeoJSON feature
    svg.append("g")
        .selectAll("path")
        .data(geoData.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", function(d) {
            const countryCode = d.properties.ISO_A3;
            const literacyRate = latestData[countryCode] ? latestData[countryCode].literacyRate : 0;
            return colorScale(literacyRate);
        })
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, d) {
            const countryCode = d.properties.ISO_A3;
            const literacyRate = latestData[countryCode] ? latestData[countryCode].literacyRate : "No data";
            d3.select("#tooltip")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px")
                .select("#value")
                .text(d.properties.NAME + ": " + literacyRate + "%");
            d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function() {
            d3.select("#tooltip").classed("hidden", true);
        });
});

// Add a tooltip to the HTML file
d3.select("body").append("div")
    .attr("id", "tooltip")
    .attr("class", "hidden")
    .append("p")
    .html("<strong id='value'></strong>");
