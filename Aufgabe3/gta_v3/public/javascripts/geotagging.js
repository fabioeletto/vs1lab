// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");
// import LocationHelper from './location-helper.js';
// import MapManager from './map-manager.js';

/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
// ... your code here ...
function updateLocation() {
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;
    const discoveryMapContainer = document.getElementById('map');

    if (latitude === "" || longitude === "") {
        LocationHelper.findLocation(({latitude, longitude}) => {
            document.getElementById("latitude").value = latitude;
            document.getElementById("longitude").value = longitude;
            document.getElementById("hiddenLatitude").value = latitude;
            document.getElementById("hiddenLongitude").value = longitude;
    
            Array.from(discoveryMapContainer.children).forEach(child => {
                child.remove();
            });
        });
    }

    const mapManager = new MapManager();
    mapManager.initMap(latitude, longitude);

    const tags = JSON.parse(discoveryMapContainer.dataset.tags);
    mapManager.updateMarkers(latitude, longitude, tags);
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    // alert("Please change the script 'geotagging.js'");
    updateLocation();
});