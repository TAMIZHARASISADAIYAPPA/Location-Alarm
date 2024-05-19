var audio = new Audio('old-mechanic-alarm-clock-140410.mp3');
var button = document.getElementById('alarm')
mapboxgl.accessToken = process.env.ACCESS_TOKEN;
const coordinates = document.getElementById('coordinates');
const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [0, 0],
    zoom: 2
});
    
const geojson = {
  'type': 'FeatureCollection',
  'features': [
      {
          'type': 'Feature',
          'geometry': {
              'type': 'Point',
              'coordinates': [0, 0]
          }
      }
  ]
};

const canvas = map.getCanvasContainer();
  
const geocoder = new MapboxGeocoder({
// Initialize the geocoder
accessToken: mapboxgl.accessToken, // Set the access token
mapboxgl: mapboxgl, // Set the mapbox-gl instance
marker: false, // Do not use the default marker style,
reverseGeocode: true
});

const geolocateControl = new mapboxgl.GeolocateControl({
positionOptions: {
    enableHighAccuracy: true
},
// When active the map will receive updates to the device's location as it changes.
trackUserLocation: true,
// Draw an arrow next to the location dot to indicate which direction the device is heading.
showUserHeading: true
})
map.addControl(geolocateControl);
// Add the geocoder to the map

const options = {
enableHighAccuracy: true,
timeout: 5000,
maximumAge: 0,
};
map.addControl(geocoder);

geocoder.on('result', async function(e) {
console.log(e.result.place_name);
geocoder.clear();
// await map.getSource('point').setData(e.result.geometry);
const coords = e.result.geometry.coordinates;
geojson.features[0].geometry.coordinates=[coords[0], coords[1]]
await map.getSource('point').setData(geojson);
coordinates.style.display = 'block';
coordinates.innerHTML = `Longitude: ${coords[0]}<br />Latitude: ${coords[1]}`;
canvas.style.cursor = '';
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(showPosition)
} else {
  console.log("Geolocation is not supported by this browser.");
}
function showPosition(position) {
  console.log(position.coords.longitude, geojson.features[0].coordinates[0])
  if(position.coords.longitude == geojson.features[0].coordinates[0] && position.coords.latitude==geojson.features[0].coordinates[1])
  {
    audio.play()
  }
}

});


function onMove(e) {
const coords = e.lngLat;
canvas.style.cursor = 'grabbing';
geojson.features[0].geometry.coordinates = [coords.lng, coords.lat];
map.getSource('point').setData(geojson);
$.get("https://api.mapbox.com/geocoding/v5/mapbox.places/" +
      coords.lng + "," + coords.lat + ".json?access_token=" + mapboxgl.accessToken,
    ).fail(function(jqXHR, textStatus, errorThrown) {
      alert("There was an error while geocoding: " + errorThrown);
    });
}

function onUp(e) {
  const coords = e.lngLat;
  geojson.features[0].geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];
  map.getSource('point').setData(geojson);
  coordinates.style.display = 'block';
  coordinates.innerHTML = `Longitude: ${coords.lng}<br />Latitude: ${coords.lat}`;
  canvas.style.cursor = '';

  map.off('mousemove', onMove);
  map.off('touchmove', onMove);
}

map.on('load', () => {
  // Add a single point to the map.
  map.addSource('point', {
      'type': 'geojson',
      'data': geojson
  });

  map.addLayer({
      'id': 'point',
      'type': 'circle',
      'source': 'point',
      'paint': {
          'circle-radius': 10,
          'circle-color': '#F84C4C' // red color
      }
  });

  // When the cursor enters a feature in
  // the point layer, prepare for dragging.
  map.on('mouseenter', 'point', () => {
      map.setPaintProperty('point', 'circle-color', '#3bb2d0');
      canvas.style.cursor = 'move';
  });

  map.on('mouseleave', 'point', () => {
      map.setPaintProperty('point', 'circle-color', '#3887be');
      canvas.style.cursor = '';
  });

  map.on('mousedown', 'point', (e) => {
      // Prevent the default map drag behavior.
      e.preventDefault();

      canvas.style.cursor = 'grab';

      map.on('mousemove', onMove);
      map.once('mouseup', onUp);
  });

  map.on('touchstart', 'point', (e) => {
      if (e.points.length !== 1) return;

      // Prevent the default map drag behavior.
      e.preventDefault();

      map.on('touchmove', onMove);
      map.once('touchend', onUp);
  });

map.on('click', (e)=>{
  geojson.features[0].geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];
  map.getSource('point').setData(geojson);
  coordinates.innerHTML = `Longitude: ${e.lngLat.lng}<br />Latitude: ${e.lngLat.lat}`;
  console.log(geojson.features[0].geometry.coordinates)
})

var alarm_timeout = ()=>{
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(position => {
    if((position.coords.longitude==geojson.features[0].geometry.coordinates[0]) && (position.coords.latitude==geojson.features[0].geometry.coordinates[1]))
    {
      audio.play()
    }
  })
} else {
  console.log("Geolocation is not supported by this browser.");
}}

  
var button = document.getElementById('alarm')
var alarmText = document.getElementById('alarm-text')
button.addEventListener('click', function(e){
  console.log(geojson.features[0].geometry.coordinates)
  if(geojson.features[0].geometry.coordinates[0]==0 && geojson.features[0].geometry.coordinates[1]==0)
    alarmText.innerHTML = "Please select a valid location"
  else{
    console.log(geojson.features[0].geometry)
    alarmText.innerHTML = `Alarm is set for ${geojson.features[0].geometry}`
    setTimeout(alarm_timeout, 10)
  }
  
})
var button = document.getElementById('stop-alarm')
button.addEventListener('click', function(e){
  alarmText.innerHTML = "Alarm stopped"
  audio.pause();
})
});