
const maps = 'https://maps.amsterdam.nl/open_geodata/geojson.php?KAARTLAAG=GEBIED_BUURTEN_EXWATER&THEMA=gebiedsindeling';

const attacks = 'https://maps.amsterdam.nl/open_geodata/geojson.php?KAARTLAAG=WOII&THEMA=woii';

function getData(){
//resource fetching 2 datasets: https://medium.com/@wisecobbler/using-the-javascript-fetch-api-f92c756340f0
    let mapData = fetch(maps).then(res => {return res.json()});
    let bombingData = fetch(attacks).then(res => {return res.json()});

    const combineData = {'mapData': {}, 'bombingData': {}};
    
    Promise.all([mapData, bombingData])
    .then( values => {
        combineData['mapData'] = values[0]
        combineData['bombingData'] = values[1]

        return combineData
    })
    .then(data => draw(data))

}

getData()


function draw(data){
    console.log('data: ', data)

    let selection = data.bombingData.features.map(d => {return d.properties.Soort})


    /* Initialize tooltip */
    let tip = d3.tip().attr('class', 'd3-tip').html(d => { 
        console.log(d.properties)

        return `<strong>Datum: ${d.properties.Datum}</strong>
                <br>
                <i>${d.properties.Adres}</i>
                <br>
                <p>${d.properties.Omschrijving}</p>`});

    // d3.queue()
    //     .defer(d3.json(data))

    const svg = d3.select('svg')

    const width = +svg.attr('width');
    const height = +svg.attr('height');

//const yValue = d => d.origin;
    const margin = { top: 40, right: 30, bottom: 150, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;



    const projection = d3.geoMercator();
    const mapPath = d3.geoPath().projection(projection)
    
    const bombPath = d3.geoPath().projection(projection)

    projection.fitSize([innerWidth, innerHeight], data.mapData, data.bombingData)

    // bombLocations.fitSize([innerWidth, innerHeight], data.bombingData)

    const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

    g.call(tip)

    g
    .selectAll("path")
    .data(data.mapData.features)
    .join('path')
    .attr("d", mapPath)
    .style("stroke", "#000000")
    .style("stroke-width", "1")
    .style("fill", "#c59371");

    g
    .selectAll('circle')
    .data(data.bombingData.features)
    .join('circle')
    .attr('transform', d => "translate(" + projection([d.geometry.coordinates[0], d.geometry.coordinates[1]]) + ")")
    .attr('r', 5)
    // .attr('bom', bombPath)
    .style('stroke', 'purple')
    // .transition()
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)


    
    
    // .append('g')
    // .classed('raa', true)
    // .selectAll('circles')
    // .data(data.bombingData.features)
    // .join('circle')
    // // .attr('d', d => console.log(d.geometry.coordinates))
    // .attr('cx', d => d.geometry.coordinates[0])
    // .attr('cy', d =>  d.geometry.coordinates[0])
    // .attr('r', 15)
    // .style('stroke', 'purple')

}