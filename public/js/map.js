maptilersdk.config.apiKey = maptoken;
const map = new maptilersdk.Map({
    container: 'map', // container's id or the HTML element to render the map
    style: maptilersdk.MapStyle.STREETS,
    center: listing.geometry.coordinates,
    zoom: 15,
});

const marker = new maptilersdk.Marker({color: "red", draggable: true})
    .setPopup(new maptilersdk.Popup().setHTML(`<h4>${listing.location}</h4> <p>Exact location provideed after booking.</p>`))
    .setLngLat(listing.geometry.coordinates)
    .addTo(map);

    Popup.addTo(map);