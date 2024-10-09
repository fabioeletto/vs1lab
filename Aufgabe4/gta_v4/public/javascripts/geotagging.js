// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");
const mapManager = new MapManager();
// import LocationHelper from './location-helper.js';
// import MapManager from './map-manager.js';

/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
// ... your code here ...
function updateLocation() {
    const latitude = document.getElementById("hiddenLatitude").value;
    const longitude = document.getElementById("hiddenLongitude").value;
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

    mapManager.initMap(latitude, longitude);
    const tags = JSON.parse(discoveryMapContainer.dataset.tags);
    mapManager.updateMarkers(latitude, longitude, tags);
}

async function updatePageContent(tagsResponse = null) {
    let data = tagsResponse;

    const hiddenLatitude = document.getElementById("hiddenLatitude").value;
    const hiddenLongitude = document.getElementById("hiddenLongitude").value;

    if (data === null) {
        const queryParameters = new URLSearchParams();
        if (hiddenLatitude !== "")
            queryParameters.append("latitude", hiddenLatitude);
        if (hiddenLongitude !== "")
            queryParameters.append("longitude", hiddenLongitude);
        queryParameters.append("searchTerm", "");
        const geotagsResponse = await fetch(`/api/geotags?${queryParameters.toString()}`);
        data = await geotagsResponse.json();
    }

    const discoveryResultsElement = document.getElementById("discoveryResults");
    discoveryResultsElement.innerHTML = "";
    data.forEach(({ name, latitude, longitude, hashtag }) => {
        const li = document.createElement("li");
        li.innerHTML = `${name} (${latitude}, ${longitude}) ${hashtag}`;
        discoveryResultsElement.appendChild(li);
    });

    mapManager.updateMarkers(hiddenLatitude, hiddenLongitude, data);
}

async function registerTaggingForm() {
    document
        .getElementById("tag-form")
        .addEventListener("submit", async (event) => {
            event.preventDefault();
            const requestData = {}
            const form = event.target;
            if(form.checkValidity()) {
                requestData["latitude"] = form.latitude.value;
                requestData["longitude"] = form.longitude.value;
                requestData["name"] = form.name.value;
                requestData["hashtag"] = form.hashtag.value;

                const response = await fetch("/api/geotags", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData),
                });
                if (response.ok) {
                    await updatePageContent();
                    document.getElementById("name").value = "";
                    document.getElementById("hashtag").value = "";
                } else {
                    console.error("Adding geotag failed!");
                }

                return;
            }
        }
    );
}

async function registerDiscoveryForm() {
    document
        .getElementById("discoveryFilterForm")
        .addEventListener("submit", async (event) => {
            event.preventDefault();
            
            const form = event.target;
            if(form.checkValidity()) {
                const queryParameters = new URLSearchParams();
                const hiddenLatitude = form.hiddenLatitude.value;
                const hiddenLongitude = form.hiddenLongitude.value;
                const searchTerm = form.searchTerm.value;

                if (hiddenLatitude !== "")
                    queryParameters.append("latitude", hiddenLatitude);
                if (hiddenLongitude !== "")
                    queryParameters.append("longitude", hiddenLongitude);
                if (searchTerm !== "") 
                    queryParameters.append("searchTerm", searchTerm);

                const response = await fetch(`/api/geotags?${queryParameters.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    await updatePageContent(data);
                } else {
                    console.error("Discovery failed!");
                }

                return;
            }
        }
    );
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
    registerTaggingForm();
    registerDiscoveryForm();
});