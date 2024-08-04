// Load and process the line chart data
d3.csv("Final.csv").then(data => {
    data.forEach(d => {
        d.Year = +d.Year;
        d['Internet Users(%)'] = +d['Internet Users(%)'];
    });

    const countries = [...new Set(data.map(d => d.Entity))];
    d3.select("#dropdown")
        .selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    const defaultCountry = "United States";
    d3.select("#dropdown").property("value", defaultCountry);

    updateChart(defaultCountry, data);

    d3.select("#dropdown").on("change", function() {
        const selectedCountry = d3.select(this).property("value");
        updateChart(selectedCountry, data);
    });
});

const margin = {top: 40, right: 20, bottom: 30, left: 50};
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svgLine = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const xScaleLine = d3.scaleLinear().range([0, width]);
const yScaleLine = d3.scaleLinear().range([height, 0]);

const xAxisLine = d3.axisBottom(xScaleLine).tickFormat(d3.format("d"));
const yAxisLine = d3.axisLeft(yScaleLine);

svgLine.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")");

svgLine.append("g")
    .attr("class", "y-axis");

svgLine.append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom + 20)
    .text("Year");

svgLine.append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .text("% Internet Users Among Population");

const line = d3.line()
    .x(d => xScaleLine(d.Year))
    .y(d => yScaleLine(d['Internet Users(%)']));

const tooltipLine = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function updateChart(country, data) {
    const filteredData = data.filter(d => d.Entity === country);
    if (filteredData.length === 0) return;

    xScaleLine.domain(d3.extent(filteredData, d => d.Year));
    yScaleLine.domain([0, d3.max(filteredData, d => d['Internet Users(%)'])]);

    svgLine.select(".x-axis").call(xAxisLine);
    svgLine.select(".y-axis").call(yAxisLine);

    const linePath = svgLine.selectAll(".line").data([filteredData]);

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

    linePath.exit().remove();

    const points = svgLine.selectAll(".point")
        .data(filteredData);

    points.enter()
        .append("circle")
        .attr("class", "point")
        .attr("r", 4)
        .attr("fill", "steelblue")
        .merge(points)
        .attr("cx", d => xScaleLine(d.Year))
        .attr("cy", d => yScaleLine(d['Internet Users(%)']));

    points.exit().remove();

    svgLine.selectAll(".point")
        .on("mouseover", function(event, d) {
            tooltipLine.transition().duration(200).style("opacity", .9);
            tooltipLine.html(`Year: ${d.Year}<br>Internet Usage: ${d['Internet Users(%)'].toFixed(3)}%`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("click", function(event, d) {
            tooltipLine.transition().duration(200).style("opacity", .9);
            tooltipLine.html(`Year: ${d.Year}<br>Internet Usage: ${d['Internet Users(%)'].toFixed(3)}%`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltipLine.transition().duration(500).style("opacity", 0);
        });
}

// Load and process the bubble chart data
Promise.all([
    d3.csv("Final.csv"),
    d3.csv("countries of the world.csv")
]).then(([finalData, worldData]) => {
    finalData.forEach(d => {
        d.Entity = d.Entity.trim();
        d.Year = +d.Year;
        d['Internet Users(%)'] = +d['Internet Users(%)'];
    });

    worldData.forEach(d => {
        d.Country = d.Country.trim().replace(/['"]+/g, '');
        d.Population = +d.Population;
        d['GDP ($ per capita)'] = +d['GDP ($ per capita)'];
        d['Literacy (%)'] = +d['Literacy (%)'];
    });

    const mergedData = finalData.map(d => {
        const worldInfo = worldData.find(w => w.Country === d.Entity);
        return worldInfo ? {...d, ...worldInfo} : null;
    }).filter(d => d);

    const latestData = d3.rollups(mergedData, v => v.sort((a, b) => b.Year - a.Year)[0], d => d.Entity).map(d => d[1]);

    createBubbleChart(latestData);
});

function createBubbleChart(data) {
    const margin = {top: 40, right: 20, bottom: 50, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svgBubble = d3.select("#bubble-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const xScaleBubble = d3.scaleLinear().range([0, width]);
    const yScaleBubble = d3.scaleLinear().range([height, 0]);
    const radiusScale = d3.scaleSqrt().range([2, 20]);

    xScaleBubble.domain(d3.extent(data, d => d['GDP ($ per capita)'])).nice();
    yScaleBubble.domain(d3.extent(data, d => d['Internet Users(%)'])).nice();
    radiusScale.domain([0, d3.max(data, d => d.Population)]).nice();

    svgBubble.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScaleBubble).tickFormat(d3.format(".0s")));

    svgBubble.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScaleBubble));

    svgBubble.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("GDP ($ per capita)");

    svgBubble.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .text("Internet Users (%)");

    const bubbles = svgBubble.selectAll(".bubble")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "bubble")
        .attr("cx", d => xScaleBubble(d['GDP ($ per capita)']))
        .attr("cy", d => yScaleBubble(d['Internet Users(%)']))
        .attr("r", d => radiusScale(d.Population))
        .attr("fill", "steelblue")
        .attr("fill-opacity", 0.6)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
        })
        .on("mouseout", function() {
            d3.select(this).attr("stroke", null);
        });

    svgBubble.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 150}, ${height - 100})`);

    const legend = svgBubble.select(".legend");

    legend.selectAll("rect")
        .data([5000000, 10000000, 50000000])
        .enter()
        .append("rect")
        .attr("width", 30)
        .attr("height", 30)
        .attr("x", 0)
        .attr("y", (d, i) => i * 40)
        .attr("fill", "steelblue")
        .attr("opacity", 0.6)
        .attr("stroke", "#000")
        .attr("stroke-width", 1);

    legend.selectAll("text")
        .data([5000000, 10000000, 50000000])
        .enter()
        .append("text")
        .attr("x", 40)
        .attr("y", (d, i) => i * 40 + 20)
        .text(d => d.toLocaleString())
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");

    d3.select("#switch-to-bubble").on("click", () => {
        document.getElementById("line-chart-container").style.display = "none";
        document.getElementById("choropleth-map-container").style.display = "none";
        document.getElementById("bubble-chart-container").style.display = "block";
        d3.select("#switch-to-bubble").style("display", "none");
        d3.select("#switch-to-line").style("display", "inline");
    });
}

// Load and process the choropleth map data
Promise.all([
    d3.json("https://d3js.org/world-50m.v1.json"),
    d3.csv("Final.csv")
]).then(([worldData, finalData]) => {
    const projection = d3.geoMercator().scale(150).translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    const colorScale = d3.scaleQuantize().range(d3.schemeBlues[9]);

    const svgMap = d3.select("#choropleth-map")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("https://d3js.org/world-50m.v1.json").then(geojson => {
        const countries = topojson.feature(geojson, geojson.objects.countries).features;

        const dataByCountry = d3.group(finalData, d => d.Entity);
        const dataByCountryMap = new Map(dataByCountry.map(([key, values]) => [key, values[0]]));

        countries.forEach(country => {
            const countryData = dataByCountryMap.get(country.properties.name) || {};
            country.properties.value = countryData['GDP ($ per capita)'] || 0;
        });

        colorScale.domain([0, d3.max(countries, d => d.properties.value)]);

        svgMap.selectAll("path")
            .data(countries)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", d => colorScale(d.properties.value))
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .on("mouseover", function(event, d) {
                d3.select(this).attr("stroke", "black").attr("stroke-width", 1);
                tooltipMap.transition().duration(200).style("opacity", .9);
                tooltipMap.html(`Country: ${d.properties.name}<br>GDP per capita: ${d.properties.value.toFixed(2)}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).attr("stroke", null);
                tooltipMap.transition().duration(500).style("opacity", 0);
            });

        svgMap.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - 150}, 30)`)
            .call(d3.legendColor().scale(colorScale));

        d3.select("#switch-to-choropleth").on("click", () => {
            document.getElementById("line-chart-container").style.display = "none";
            document.getElementById("bubble-chart-container").style.display = "none";
            document.getElementById("choropleth-map-container").style.display = "block";
            d3.select("#switch-to-choropleth").style("display", "none");
            d3.select("#switch-to-line").style("display", "inline");
        });
    });
});

const tooltipMap = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
