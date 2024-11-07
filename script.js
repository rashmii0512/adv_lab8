d3.csv("covtype.csv").then(data => {
    // Convert all fields from strings to numbers
    console.log("present");
    data.forEach(d => {
        d.Elevation = +d.Elevation;
        d.Aspect = +d.Aspect;
        d.Slope = +d.Slope;
        d.Horizontal_Distance_To_Hydrology = +d.Horizontal_Distance_To_Hydrology;
        d.Vertical_Distance_To_Hydrology = +d.Vertical_Distance_To_Hydrology;
        d.Horizontal_Distance_To_Roadways = +d.Horizontal_Distance_To_Roadways;
        d.Hillshade_9am = +d.Hillshade_9am;
        d.Hillshade_Noon = +d.Hillshade_Noon;
        d.Hillshade_3pm = +d.Hillshade_3pm;
        d.Horizontal_Distance_To_Fire_Points = +d.Horizontal_Distance_To_Fire_Points;
        
        // Wilderness_Area and Soil_Type fields
        for (let i = 1; i <= 4; i++) {
            d[`Wilderness_Area${i}`] = +d[`Wilderness_Area${i}`];
        }
        for (let i = 1; i <= 40; i++) {
            d[`Soil_Type${i}`] = +d[`Soil_Type${i}`];
        }
        
        // Convert the Cover_Type column as well
        d.Cover_Type = +d.Cover_Type;
    });


    createPieChart(data);

    createPieChart2(data);

    createHistogram(data);

    createHistogram2(data)

    createBarChart(data);

    createCoverTypeBarChart(data);

    createBarChartSoil(data) 
    
    createBoxPlot(data);

    createHistogramHydrology(data);

});

// Function for Pie Chart
function createPieChart2(data) {
    const width = 200, height = 200, radius = Math.min(width, height) / 2;
    const svg = d3.select("#pie-chart2").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const Cover_Type = d3.rollup(data, v => v.length, d => d.Cover_Type);
    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const color = d3.scaleOrdinal()
    .domain([0, 1, 2, 3, 4, 5, 6])
    .range(["#f08080", "#ffcc66", "#66c2a5", "#8da0cb", "#fc8d62", "#e78ac3", "#a6d854"]);
    
    const arcs = svg.selectAll(".arc")
        .data(pie(Array.from(Cover_Type)))
        .enter().append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .style("fill", (d, i) => color(i));

        arcs.append("text")
        .attr("transform", d => {
            // Get the centroid of the arc and add an offset for distance
            const centroid = arc.centroid(d);
            const offset = 100; // This will move the text 10 pixels outward
            return `translate(${centroid[0] * 1.2}, ${centroid[1] * 1.2})`; // Multiplies the x and y coordinates to move it outward
        })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(d => {
            const percentage = ((d.data[1] / d3.sum(Array.from(Cover_Type), d => d[1])) * 100).toFixed(1);
            return `${percentage}%`;
        });
    
        
}

function createPieChart(data) {
    const width = 200, height = 200, radius = Math.min(width, height) / 2;
    const svg = d3.select("#pie-chart").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Calculate the count for each Wilderness Area
    const wildernessCounts = [
        ["Wilderness_Area1", d3.sum(data, d => d.Wilderness_Area1)],
        ["Wilderness_Area2", d3.sum(data, d => d.Wilderness_Area2)],
        ["Wilderness_Area3", d3.sum(data, d => d.Wilderness_Area3)],
        ["Wilderness_Area4", d3.sum(data, d => d.Wilderness_Area4)]
    ];

    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const color = d3.scaleOrdinal()
        .domain(["Wilderness_Area1", "Wilderness_Area2", "Wilderness_Area3", "Wilderness_Area4"])
        .range(["#f08080", "#66c2a5", "#8da0cb", "#fc8d62"]); // Varied color palette for wilderness areas
    
    const arcs = svg.selectAll(".arc")
        .data(pie(wildernessCounts))
        .enter().append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .style("fill", d => color(d.data[0]));

    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(d => {
            const percentage = ((d.data[1] / d3.sum(wildernessCounts, d => d[1])) * 100).toFixed(1);
            return `${percentage}%`;
        });
}

function createBarChart(data) {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#bar-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Calculate sum values for each hillshade column
    const hillshadeMetrics = [
        { key: "Hillshade_9am", value: d3.sum(data, d => d.Hillshade_9am) },
        { key: "Hillshade_Noon", value: d3.sum(data, d => d.Hillshade_Noon) },
        { key: "Hillshade_3pm", value: d3.sum(data, d => d.Hillshade_3pm) }
    ];

    const x = d3.scaleBand()
        .domain(hillshadeMetrics.map(d => d.key))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(hillshadeMetrics, d => d.value)])
        .nice()  // Ensures that the ticks are nice numbers
        .range([height, 0]);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    svg.selectAll(".bar")
        .data(hillshadeMetrics)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", "lightseagreen");

    svg.selectAll(".label")
        .data(hillshadeMetrics)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => x(d.key) + x.bandwidth() / 2)
        .attr("y", d => y(d.value) - 5) // Offset the label above the bar
        .attr("text-anchor", "middle")
        .text(d => d.value.toFixed(1));
}


function createCoverTypeBarChart(data) {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#cover-type-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Group and count data by Cover_Type
    const coverTypeData = d3.rollup(data, v => v.length, d => d.Cover_Type);
    const coverTypes = Array.from(coverTypeData, ([key, value]) => ({ key, value }));

    const x = d3.scaleBand()
        .domain(coverTypes.map(d => d.key))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(coverTypes, d => d.value)])
        .nice()  // Ensures that the ticks are nice numbers
        .range([height, 0]);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d => `Type ${d}`));  // Label Cover_Types for clarity

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    svg.selectAll(".bar")
        .data(coverTypes)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", "lightseagreen");

    svg.selectAll(".label")
        .data(coverTypes)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => x(d.key) + x.bandwidth() / 2)
        .attr("y", d => y(d.value) - 5) // Offset the label above the bar
        .attr("text-anchor", "middle")
        .text(d => d.value);
}




function createHistogram(data) {
    const svgWidth = 500;
    const svgHeight = 300;
    const margin = { top: 10, right: 30, bottom: 30, left: 40 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#histogram").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const histogram = d3.histogram()
        .value(d => d.Elevation)  // Use age for the histogram
        .domain([0, d3.max(data, d => d.Elevation)])  // Set the domain for the histogram
        .thresholds(d3.range(d3.min(data, d => d.Elevation), d3.max(data, d => d.Elevation),  (d3.max(data, d => d.Elevation) - d3.min(data, d => d.Elevation) )/4  ));  // Adjust bin size as needed

    const bins = histogram(data);  // Pass in the full dataset

    const x = d3.scaleLinear()
        .domain([d3.min(data, d => d.Elevation)-2, d3.max(data, d => d.Elevation)+2])  // X domain from 0 to max age
        .range([0, width]);

    const y = d3.scaleLinear()
        .range([height, 0]);

    y.domain([0, d3.max(bins, d => d.length)]);  // Y domain is the max count of data points in any bin

    g.selectAll(".bar")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.x0))  // Positioning each bar
        .attr("y", d => y(d.length))  // Set height based on frequency
        .attr("width", d => x(d.x1) - x(d.x0) - 1)  // Width of each bar
        .attr("height", d => height - y(d.length))  // Bar height
        .style("fill", "lightseagreen");

    g.append("g")
        .attr("transform", `translate(0, ${height})`)  // Positioning the x-axis at the bottom
        .call(d3.axisBottom(x).ticks(10));  // Add ticks

    g.append("g")
        .call(d3.axisLeft(y));  // Add the left y-axis

    
}


function createHistogram2(data) {
    const svgWidth = 500;
    const svgHeight = 300;
    const margin = { top: 10, right: 30, bottom: 30, left: 40 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#histogram2").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const histogram = d3.histogram()
        .value(d => d.Slope)  // Use age for the histogram
        .domain([0, d3.max(data, d => d.Slope)])  // Set the domain for the histogram
        .thresholds(d3.range(d3.min(data, d => d.Slope), d3.max(data, d => d.Slope),  (d3.max(data, d => d.Slope) - d3.min(data, d => d.Slope) )/5  ));  // Adjust bin size as needed

    const bins = histogram(data);  // Pass in the full dataset

    const x = d3.scaleLinear()
        .domain([d3.min(data, d => d.Slope)-2, d3.max(data, d => d.Slope)+2])  // X domain from 0 to max age
        .range([0, width]);

    const y = d3.scaleLinear()
        .range([height, 0]);

    y.domain([0, d3.max(bins, d => d.length)]);  // Y domain is the max count of data points in any bin

    g.selectAll(".bar")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.x0))  // Positioning each bar
        .attr("y", d => y(d.length))  // Set height based on frequency
        .attr("width", d => x(d.x1) - x(d.x0) - 1)  // Width of each bar
        .attr("height", d => height - y(d.length))  // Bar height
        .style("fill", "lightseagreen");

    g.append("g")
        .attr("transform", `translate(0, ${height})`)  // Positioning the x-axis at the bottom
        .call(d3.axisBottom(x).ticks(20));  // Add ticks

    g.append("g")
        .call(d3.axisLeft(y));  // Add the left y-axis

    
}


function createBoxPlot(data) {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#box-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const Aspect = data.map(d => +d.Aspect).filter(d => !isNaN(d));

    const q1 = d3.quantile(Aspect, 0.25);
    const median = d3.quantile(Aspect, 0.5);
    const q3 = d3.quantile(Aspect, 0.75);
    const iqr = q3 - q1;
    const min = d3.min(Aspect);
    const max = d3.max(Aspect);

    const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
    const upperWhisker = Math.min(max, q3 + 1.5 * iqr);

    console.log("Q1:", q1, "Median:", median, "Q3:", q3, "IQR:", iqr, "Lower whisker:", lowerWhisker, "Upper whisker:", upperWhisker);

    const xScale = d3.scaleBand()
        .domain(["Aspect"])
        .range([0, width])
        .padding(0.4);

    const yScale = d3.scaleLinear()
        .domain([d3.min(Aspect), d3.max(Aspect)])
        .nice()
        .range([height, 0]);

    svg.append("rect")
        .attr("x", xScale("Aspect"))
        .attr("y", yScale(q3))
        .attr("width", xScale.bandwidth())
        .attr("height", Math.abs(yScale(q1) - yScale(q3)))  // Use Math.abs to ensure a positive height
        .attr("fill", "lightseagreen");

    svg.append("line")
        .attr("x1", xScale("Aspect"))
        .attr("x2", xScale("Aspect") + xScale.bandwidth())
        .attr("y1", yScale(median))
        .attr("y2", yScale(median))
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    svg.append("line")
        .attr("x1", xScale("Aspect") + xScale.bandwidth() / 2)
        .attr("x2", xScale("Aspect") + xScale.bandwidth() / 2)
        .attr("y1", yScale(lowerWhisker))
        .attr("y2", yScale(q1))
        .attr("stroke", "black");

    svg.append("line")
        .attr("x1", xScale("Aspect") + xScale.bandwidth() / 2)
        .attr("x2", xScale("Aspect") + xScale.bandwidth() / 2)
        .attr("y1", yScale(q3))
        .attr("y2", yScale(upperWhisker))
        .attr("stroke", "black");

    Aspect.forEach(d => {
        if (d < lowerWhisker || d > upperWhisker) {
            svg.append("circle")
                .attr("cx", xScale("Aspect") + xScale.bandwidth() / 2)
                .attr("cy", yScale(d))
                .attr("r", 5)
                .attr("fill", "red");
        }
    });


    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));
}

function createInfoCards(totalCount, menCount, womenCount) {
    const cardContainer = d3.select("#info-cards").selectAll(".card")
        .data([
            { label: "Total", count: totalCount },
            { label: "Male", count: menCount },
            { label: "Female", count: womenCount }
        ])
        .enter()
        .append("div")
        .attr("class", d => `card ${d.label.toLowerCase()}`)
        .html(d => `<h3>${d.label}</h3><p>${d.count}</p>`);
}




function createHistogramHydrology(data) {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#histogram-hydrology")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const hydrologyData = data.map(d => +d.Horizontal_Distance_To_Hydrology).filter(d => !isNaN(d));

    const xScale = d3.scaleLinear()
        .domain([d3.min(hydrologyData), d3.max(hydrologyData)])
        .range([0, width]);

    const histogram = d3.histogram()
        .value(d => d)
        .domain(xScale.domain())
        .thresholds(xScale.ticks(20));

    const bins = histogram(hydrologyData);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height, 0]);

    svg.selectAll(".bar")
        .data(bins)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.length))
        .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
        .attr("height", d => height - yScale(d.length))
        .attr("fill", "lightseagreen");

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));
}



function createBarChartSoil(data) {
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#bar-chart-soil")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const soilTypeCounts = Array(40).fill(0); // Initialize array for 40 soil types

    // Count occurrences of each soil type (Soil_Type1 to Soil_Type40)
    data.forEach(d => {
        for (let i = 1; i <= 40; i++) {
            if (d[`Soil_Type${i}`] === 1) {
                soilTypeCounts[i - 1] += 1;
            }
        }
    });

    const xScale = d3.scaleBand()
        .domain(d3.range(1, 41))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(soilTypeCounts)])
        .nice()
        .range([height, 0]);

    svg.selectAll(".bar")
        .data(soilTypeCounts)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => xScale(i + 1))
        .attr("y", d => yScale(d))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d))
        .attr("fill", "lightseagreen");

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d => `${d}`));

    svg.append("g")
        .call(d3.axisLeft(yScale));
}
