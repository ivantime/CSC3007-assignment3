let width = 1000, height = 600;

let svg = d3.select("svg")
    .attr("viewBox", "0 0 " + width + " " + height)

// Load external data
Promise.all([d3.json("sgmap.json"), d3.csv("population2021.csv")]).then(data => {

    // console.log(data[0]);
    // console.log(data[1]);

    var combinedArray = data[0].features;
    var popArray = data[1];

    const combined = combinedArray.map(function (arr, i1) {
        return popArray.map(function (n, i2) {
            return {
                geoMetry: arr.geometry,
                properties: Object.assign({ pop: popArray[i2].Population }, arr.properties)
            }
        });
    });
    console.log(combined)

    // Map and projection
    var projection = d3.geoMercator()
        .center([103.851959, 1.290270])
        .fitExtent([[20, 20], [980, 580]], data[0]);

    let geopath = d3.geoPath().projection(projection);

    svg.append("g")
        .attr("id", "districts")
        .selectAll("path")
        .data(data[0].features)
        .enter()
        .append("path")
        .attr("d", geopath)
        .attr("fill", "#777")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);
})