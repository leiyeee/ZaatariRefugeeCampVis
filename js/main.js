var margin = {
        top: 10,
        right: 10,
        bottom: 25,
        left: 50
    },
    height = 500,
    width = 700,
    padding = 20;



d3.csv("data/zaatari-refugee-camp-population.csv", (data) => {
    return {
        date: d3.timeParse("%Y-%m-%d")(data.date),
        population: data.population
    }
}).then(function (data) {
    console.log(data)

    //darwing space area-chart
    var svg = d3.select("#area-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")



    //create x-scae based on time
    var x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    let xAxis = d3.axisBottom()
        .scale(x)
        .ticks(15);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis);

    //create y-scae based on population
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return +d.population;
        })])
        .range([height, 0]);

    let yAxis = d3.axisLeft()
        .scale(y)
        .ticks(10);
    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + (padding - 21) + ",0)")
        .call(yAxis);

    // Set the gradient
    svg.append("linearGradient")
        .attr("id", "line-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("y1", y(100000))
        .attr("x2", 0)
        .attr("y2", y(200000))
        .selectAll("stop")
        .data([
            {
                offset: "0%",
                color: "#9A8C98"
            },
            {
                offset: "0%",
                color: "#826870"
            }
        ])
        .enter().append("stop")
        .attr("offset", function (d) {
            return d.offset;
        })
        .attr("stop-color", function (d) {
            return d.color;
        });
    //darw area chart
    let path = svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", d3.area()
            .x(function (d) {
                return x(d.date)
            })
            .y0(height)
            .y1(function (d) {
                return y(d.population)
            })
        )

        .attr("fill", "url(#line-gradient)")
        .attr("stroke", "none");


    svg.append("line")
        .style("stroke", "white")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 1)
        .attr("x1", 0)
        .attr("y1", height/2 +5)
        .attr("x2", width)
        .attr("y2", height/2 +5);


    var focus = svg.append("g")
        .style("display", "none");

    // append the circle at the intersection
    focus.append("circle")
        .attr("class", "y")
        .style("fill", "none")
        .style("stroke", "blue")
        .attr("r", 4);

    focus.append("line")
        .attr("class", "x")
        .style("stroke", "white")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 1)
        .attr("y1", 0)
        .attr("y2", height);


    // append the y line
    focus.append("line")
        .attr("class", "y")
        .style("stroke", "white")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("x1", width)
        .attr("x2", width);

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function () {
            focus.style("display", null);
        })
        .on("mouseout", function () {
            focus.style("display", "none");
        })
        .on("mousemove", mousemove);

    // place the value at the intersection
    focus.append("text")
        .attr("class", "y1")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "-.3em");
    focus.append("text")
        .attr("class", "y2")
        .attr("dx", 8)
        .attr("dy", "-.3em");

    // place the date at the intersection
    focus.append("text")
        .attr("class", "y3")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "1em");
    focus.append("text")
        .attr("class", "y4")
        .attr("dx", 8)
        .attr("dy", "1em");


    let bisectDate = d3.bisector(d => d.date).left;

    function mousemove() {
        var x0 = x.invert(d3.pointer(event)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        focus.select("circle.y")
            .attr("transform",
                "translate(" + x(d.date) + "," +
                y(d.population) + ")");

        focus.select("text.y1")
            .attr("transform",
                "translate(" + x(d.date) + "," +
                y(d.population) + ")")
            .text(d.population);

        focus.select("text.y2")
            .attr("transform",
                "translate(" + x(d.date) + "," +
                y(d.population) + ")")
            .text(d.population);

        focus.select("text.y3")
            .attr("transform",
                "translate(" + x(d.date) + "," +
                y(d.population) + ")")
            .text(d3.timeFormat("%Y-%m-%d")(d.date));

        focus.select("text.y4")
            .attr("transform",
                "translate(" + x(d.date) + "," +
                y(d.population) + ")")
            .text(d3.timeFormat("%Y-%m-%d")(d.date));

        focus.select(".x")
            .attr("transform",
                "translate(" + x(d.date) + "," +
                y(d.population) + ")")
            .attr("y2", height - y(d.population));
        focus.select(".y")
            .attr("transform", "translate(" + width * -1 + "," + y(d.population) + ")")
            .attr("x2", width + width);
    }

    //darw bar chart
    var svg1 = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    //store information
    var d = [{
            household: "Caravas",
            percentage: 79.68
            },
        {
            household: "Combination*",
            percentage: 10.81
            },
        {
            household: "Tents",
            percentage: 9.51
            }
    ];
    var x1 = d3.scaleBand()
        .domain(d3.map(d, function (dd) {
            return dd.household;
        }))
        .range([0, width]);

    let xAxis1 = d3.axisBottom()
        .scale(x1)
        .ticks(3);

    svg1.append("g")
        .attr("class", "x-axis1")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis1);

    var y1 = d3.scaleLinear()
        .domain([0, d3.max(d, function (dd) {
            return +dd.percentage;
        })])
        .range([height, 0]);

    let yAxis1 = d3.axisLeft()
        .scale(y1)
        .ticks(10);
    svg1.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + (padding - 21) + ",0)")
        .call(yAxis1);

    var bar = svg1.selectAll(".bar")
        .data(d)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (dd) {
            return x1(dd.household) + x1.bandwidth() / 3;
        })
        .attr("y", function (dd) {
            return y1(dd.percentage);
        })
        .attr("width", x1.bandwidth() / 3)
        .attr("height", function (dd) {
            return height - y1(dd.percentage);
        })
        .attr("fill", "#4A4E69")

    var numA = ["79.68", "10.81", "9.51"];

    svg1.selectAll(".bartext")
        .data(d)
        .enter()
        .append("text")
        .attr("class", "bartext")
        .text(function (dd) {
            return dd.percentage + "%";
        })
        .attr("x", function (dd) {
            return x1(dd.household) + x1.bandwidth() / 2;
        })
        .attr("y", function (dd) {
            return y1(dd.percentage) + 20;
        })
        .style("text-anchor", "middle")
        .style("fill", "white")


})
