console.log('HELLO THERE');
const mapData = JSON.parse(document.querySelector('#map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiaGFzbWFubm4iLCJhIjoiY2w1NW9xMzgwMWE1OTNkdDd6NXFuZm5ndSJ9.TctHI5yKo_2V2_8MBRKK6g';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
});

const bounds = new mapboxgl.LngLatBounds();

mapData.forEach((loc) => {
  // Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
