var map; // Map Object
var input; // Input Box 
var marker = 'undf'; //Marker for the destination; Set to 'undf' to check if a marker has been set.
var interval; // The interval for checking location
var alarm; // Alarm Sound
var toggleDB = false; //Makes sure the alarm and notification only appears once.
var dist; //Distance text
var ghostmarker = 'undf'; //The position where the user clicks
var current_marker = 'undf';
var current_icon;
var alertd = 0.5;
var timer; // Timer Display

function load() {
    input = document.getElementById('Dest');
    alarm = document.getElementById('alarm');
    dist = document.getElementById('dist');
    timer = document.getElementById('safeTimerDisplay');
    //runtimer();
    document.getElementById('Alrt').value = alertd;
    current_icon = new L.icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });
    map = L.map('mainmap').setView([0, 0], 5);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a       href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 25,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoibHlubmxvIiwiYSI6ImNrMnMxcGJoNDB2dTMzbm1ieG53dHBrd3QifQ.Rd6I5PvAtpo_ni7AfRNH1w'
    }).addTo(map);
    map.locate({
        setView: true,
        maxZoom: 22
    })
    //L.control.locate().addTo(map);
    interval = setInterval(Track, 3000)
    map.on('click', function (e) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(UpdateDistance);
        }
        ghostmarker = e;
        loc = e.latlng.lat.toFixed(5) + ', ' + e.latlng.lng.toFixed(5);
        input.innerHTML = loc;
    })
}

// function runtimer() {
//     var sec = 3.0;
//     var timerinterval = setInterval(function () {
//         timer.innerHTML = 'Updating in : ' + sec.toFixed(1);
//         sec = sec - 0.1;
//         if (sec < 0) {
//             sec = 3;
//         }
//     }, 100);
// }

function pop(location) {
    if (marker != 'undf') {
        map.removeLayer(marker);
    }
    marker = L.marker(location).addTo(map).bindPopup('Selected Location').openPopup();
}

function start() {
    if (input.innerHTML.replace(' ', '') != '') {
        loc = input.innerHTML.split(','); // Location infomation from input box
        pop(loc);
    }
    document.getElementById('DestLabel').innerHTML = 'Destination'
    document.getElementById('startButton').innerHTML = 'Update'
    document.getElementById('stopButton').disabled = false;
    toggleDB = false;
}

function stop() {
    if (marker != 'undf') {
        map.removeLayer(marker);
        ghostmarker = 'undf';
        dist.innerHTML = "Distance from current position: 0 Mi"
    }
    document.getElementById('DestLabel').innerHTML = ' Chose Destination'
    document.getElementById('startButton').innerHTML = 'Start'
    document.getElementById('stopButton').disabled = true;
}

//Distance Formula
function getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c * 0.621371; // Distance in miles
    return d.toFixed(2); // Truncates to 2 decimal places
}

function ComputeDistance(current) {
    lat1 = current.coords.latitude // Lat of Current Position
    lng1 = current.coords.longitude // Lng of Current Position
    if (marker != 'undf') {
        lat2 = marker._latlng.lat // Lat of Marker
        lng2 = marker._latlng.lng // Lng of Marker
    } else {
        console.log('No Marker');
    }
    if (getDistance(lat1, lng1, lat2, lng2) < alertd && toggleDB == false && document.getElementById('startButton').innerHTML == 'Update'){
        toggleDB = true;
        alarm.play()
        alert("You are close to your destination!")
        alarm.pause()
        stop();
    }
}

function UpdateDistance(current) {
    alertd = document.getElementById('Alrt').value;
    console.log("Alert Radius : " + alert);
    lat1 = current.coords.latitude // Lat of Current Position
    lng1 = current.coords.longitude // Lng of Current Position
    if (current_marker != 'undf') {
        map.removeLayer(current_marker);
    }
    console.log(" Current : " + lat1 + " " + lng1);
    current_marker = L.marker([lat1, lng1], {
        icon: current_icon
    }).addTo(map).bindPopup('Current Location').openPopup();
    if (ghostmarker != 'undf') {
        lat2 = ghostmarker.latlng.lat // Lat of Marker
        lng2 = ghostmarker.latlng.lng // Lng of Marker
        dist.innerHTML = "Distance from current position: " + getDistance(lat1, lng1, lat2, lng2) + " Mi"
    } else {
        console.log('No Ghost Marker');
    }
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function Track() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(ComputeDistance, function () {
            console.log("No Location to Compute Distance");
        }, {
            maximumAge: 10000,
            timeout: 5000,
            enableHighAccuracy: true
        });
        navigator.geolocation.getCurrentPosition(UpdateDistance, function () {
            console.log("No Location to Update Distance");
        }, {
            maximumAge: 10000,
            timeout: 5000,
            enableHighAccuracy: true
        });
    }
}