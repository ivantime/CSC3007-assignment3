let width = 1000, height = 600;

let svg = d3.select("svg")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("position", "relative")

// Load external data
Promise.all([d3.json("sgmap.json"), d3.csv("population2021.csv")]).then(data => {

    var combinedArray = data[0].features;
    var popArray = data[1];

    for (i = 0; i < combinedArray.length; i++) {
        for (j = 0; j < popArray.length; j++) {
            try {
                if (combinedArray[i].properties["Name"].toLowerCase().localeCompare(
                    popArray[j]["Subzone"].toLowerCase()) === 0 &&

                    combinedArray[i].properties["Planning Area Name"].toLowerCase().localeCompare(
                        popArray[j]["Planning Area"].toLowerCase()) === 0) {
                    if (popArray[j]["Population"] === "-") { }
                    else {
                        combinedArray[i].properties["pop"] = parseInt(popArray[j]["Population"]);
                    }
                }
                else { }
            }
            catch (excpt) { }
        }
    }
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [width, height]])
        .on('zoom', zoomed);
    svg.call(zoom);

    function zoomed(event) {
        svg
            // To prevent stroke width from scaling
            .selectAll('path')
            .attr('transform', event.transform);
    }
    let maxValues = -1;
    let total = 0;
    let tmp;
    data[0].features = combinedArray
    data[0].features.forEach((eachArr, __) => {
        total += (eachArr.properties.pop === undefined ? 0 : eachArr.properties.pop)
        tmp = parseInt(eachArr.properties.pop);
        if (parseInt(tmp) > parseInt(maxValues)) { maxValues = parseInt(tmp); };
    })

    bars = []
    count = 0;
    var perBar = Math.ceil(maxValues / 9)
    for (i = 0; i < 9; i++) {
        count += perBar
        bars.push(count)
    }

    let colorScale = d3.scaleLinear()
        .domain(bars)
        .range(["#FFFFFF", "#CCE3DB", "#A6E5DB", "#28E5DB", "#28BED0", "#2894B4", "#286A94", "#285494", "#00000"]);

    // let colorScale = d3.scaleLinear()
    //     .domain(bars)
    //     .range(["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"]);

    var rects = svg.selectAll("rect")
        .data(bars)
        .enter()
        .append("rect")
        .attr("width", 40)
        .attr("height", 17)
        .attr("y", function (d, i) { return Math.floor(i / 10) * 20 + 10 })
        .attr("x", function (d, i) { return 8 + i % 10 *  41 })
        .attr("fill", function (d, i) { console.log(i); return colorScale(d); })

    var texts = svg.selectAll("text")
        .data(bars);

        texts
        .enter()
        .append("text")
        .attr("width", 10)
        .attr("height", 17)
        .attr("y", function (d, i){ return 30+ Math.floor(i / 9) * 20 + 10 })
        .attr("x", function (d, i) {  return 15 +  i % 13 * 40 })
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .html(function (d) {  return d })


    // Map and projection
    var projection = d3.geoMercator()
        .center([103.851959, 1.290270])
        .fitExtent([[20, 20], [980, 580]], data[0]);
    let geopath = d3.geoPath().projection(projection);

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("width", "300px")
        .style("height", "100px")
        .style("opacity", 0)
        .style('position', 'absolute')
        .style('padding-top', '70px')
        .style("right", (150) + "px")
        .style("bottom", (130) + "px")
        .style('padding-bottom', '25px')
        .style('background', 'rgba(0,0,0,0.6)')
        .style('border-radius', '20px')
        .style('color', '#fff');


    svg.append("g")
        .attr("id", "districts")
        .selectAll("path")
        .data(data[0].features)
        .enter()
        .append("path")
        .attr("d", geopath)
        .attr("fill", function (d) {
            //if population value not available or 0, shade fill in black, 
            //else show color shade accordingly
            return (d.properties["pop"] === undefined) ?
                "black" : colorScale(d.properties.pop)
        })

        .on("mouseover", (event, d) => {
            //show tooltip
            d3.select(".tooltip").html("<b><u><center>" + d.properties.Name + "</center></b></u></br>" +
                "<center> Population: " + String(d.properties.pop).toUpperCase() + "</center>")
                .style("opacity", 1);

            //show stroke (red)
            d3.select(event.currentTarget)
                .style("stroke", "red")
                .style("stroke-width", "2px")
        })
        .on("mouseout", function (d) {
            //hide tooltip
            d3.select(".tooltip").html(null)
                .style("opacity", 0);

            //remove stroke (red)
            d3.select(event.currentTarget)
                .style("stroke", null)
        });
    console.log(data[0])

})