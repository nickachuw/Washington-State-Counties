console.log('Testing')
// Create the base map object w/ properties
var map = L.map('map', {
  center: [47.7511, -120.7401],
  zoom: 7.4
});

// Add the base map image
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

// Create our Object of state counties (grabbing from an ajax call)
var stateCounties = null;

// TODO: Rename if used or delete if not
// Create a color gradient to use to color different population areas
var colors = chroma.scale('OrRd').colors(8); //colors = chroma.scale('RdPu').colors(7);
// Manually set first color in array to black
colors[0] = '#000000'

// Append dynamic styles to the page to organize the pop areas
for (i = 0; i < colors.length; i++) {
    $('head').append($("<style> .interior-color-" + (i + 1).toString() + " { color: " + colors[i] + "; font-size: 15px; text-shadow: 0 0 3px #ffffff;} </style>"));
}

// Create a color gradient to use to color different population areas
// TODO: Delete me if not used
var densityColors = chroma.scale('RdPu').colors(8);

function setColor(density) {
  var id = 0;
  if (density >= 100000) { id = 7;}
  else if (density > 50000 && density <= 99999) { id = 6; }
  else if (density > 25000 && density <= 49999) { id = 5; }
  else if (density > 10000 &&  density <= 24999) { id = 4; }
  else if (density > 5000 &&  density <= 9999) { id = 3; }
  else if (density > 1000 &&  density <= 4999) { id = 2; }
  else if (density > 0 &&  density <= 999) { id = 1; }
  else  { id = 0;}
  return colors[id];
}

// 7. Set style function that sets fill color.md property equal to pop density
function style(feature) {
    // console.log('Cur feature ', feature, ' to : ', feature.properties.JURISDICT_DESG_CD)
    return {
        fillColor: setColor(feature.properties.Pop_Change),
        fillOpacity: 0.8,
        weight: 2,
        opacity: .3,
        color: '#000000',
        dashArray: '4'
    };
}

// Add  a highlight
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
  stateCounties.resetStyle(e.target);
  info.update();
}

// Fill in our stateCounties object with data from the geoJson to put on map
stateCounties = L.geoJson.ajax("../data/wa.geoJson", {
  // For each feature, add a pop up of the name and the population change
  onEachFeature: function (feature, layer) {
    layer.bindPopup(feature.properties.JURISDICT_NM + " " + feature.properties.Pop_Change)
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight
    })
  },
  style: style,
  attribution: 'WA Public Land Survey',
}).addTo(map)

//Create a leaflet control object for legend
var legend = L.control({position: 'topright'});

//Add function that runs when legend appears on map
legend.onAdd = function(){
  var div = L.DomUtil.create('div', 'legend');
  div.innerHTML += '<b>County Population (# of new people)</b><br />';
  div.innerHTML += '<i style="background: ' + colors[7] + '; opacity: 0.8"></i><p>100,000+</p>';
  div.innerHTML += '<i style="background: ' + colors[6] + '; opacity: 0.8"></i><p>50,000 - 99,999</p>';
  div.innerHTML += '<i style="background: ' + colors[5] + '; opacity: 0.8"></i><p>25000 - 49,999</p>';
  div.innerHTML += '<i style="background: ' + colors[4] + '; opacity: 0.8"></i><p>10000 - 24999</p>';
  div.innerHTML += '<i style="background: ' + colors[3] + '; opacity: 0.8"></i><p>5,000 - 9,999</p>';
  div.innerHTML += '<i style="background: ' + colors[2] + '; opacity: 0.8"></i><p>1,000 - 4,999</p>';
  div.innerHTML += '<i style="background: ' + colors[1] + '; opacity: 0.8"></i><p>0 - 999</p>';
  div.innerHTML += '<i style="background: ' + colors[0] + '; opacity: 0.8"></i><p>Population Loss</p>';
  div.innerHTML += '<br><b>Click on any county to display its exact change in population</b><br />';
  return div;
}
// Add the legend to the map
legend.addTo(map);

//  Add scale bar to map
L.control.scale({position: 'bottomleft'}).addTo(map);

// Add a title and description to map
var title = L.control({position: 'topleft'});
title.onAdd = function(){
  var div = L.DomUtil.create('div', 'title');
  div.innerHTML += '<b>Washington State Counties Population Change 2000-2010</b><br />';
  div.innerHTML += '<p>This map displays the change in populations within all Washington State Counties between the years <br> 2000 and 2010. The counties become an increasingly darker red as their total population change<br> increase while black represents counties that experienced a loss of persons over the 10 year span. <br> Future updates will be made to the map including the location of technology companies to help demonstate reasons for population increases in certain areas.</p><br />';
  return div;
}
title.addTo(map);
