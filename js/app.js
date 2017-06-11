var ambala_map;
var ambala_coor = {
    lat: 30.3782,
    lng: 76.7767
}

// Initialize collapse button
  $(".button-collapse").sideNav();
  // Initialize collapsible (uncomment the line below if you use the dropdown variation)
  $('.collapsible').collapsible();

var locs = [];
var infoWindow = '';

var view = {
    list: ko.observableArray([]),
    searchQuery: ko.observable(),

    wasError: ko.observable(false),
    ErrMsg: ko.observable(''),

    constructor: function () {
        for (var i in locs) {
            view.list.push(locs[i].title);
        }
    },
    filter: function (query) {
        view.list.removeAll();
        for (var j in locs) {
            if (locs[j].title.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                view.list.push(locs[j].title);
                locs[j].setVisible(true);
            } else {
                locs[j].setVisible(false);
            }
        }
    }
}

function mapnotResponding() {
    view.wasError(true);
    alert('Map can"t be loaded');
}

function animationLocator(locator) {
    locator.setIcon('http://maps.google.com/mapfiles/ms/icons/lodging.png');
    locator.setAnimation(google.maps.Animation.BOUNCE);
}

function get_foursquare_hotels() {
    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/search?v=20161016&ll=30.3782%2C76.7767&query=hotel&limit=10&intent=checkin&client_id=KAJGJPMDW5ZDKVXJLWZSGF2MHARHVOUGWYP1DQWZRCAPZIHD&client_secret=AQJ52GHNLFWZQH0MUVQNPNOGKT550VTIEER3J53H0AR3LSC2',
        async: true
    }).done(function (re) {
        metadata = re.response.venues;
        for (var i = 0; i < metadata.length; i++) {
            var locator = new google.maps.Marker({
                title: metadata[i].name,
                position: {
                    lat: parseFloat(metadata[i].location.lat),
                    lng: parseFloat(metadata[i].location.lng)
                },
                map: ambala_map,
                animation: google.maps.Animation.DROP,
                Addres: metadata[i].location.address
            });
            locator.addListener('click', opendataWindow2);
            locs.push(locator);
        }
        var Area = new google.maps.LatLngBounds();
        for (var k in locs) {
            Area.extend(locs[k].position);
        }
        ambala_map.fitBounds(Area);
        view.constructor();
    }).fail(function () {
        view.wasError(true);
        alert('Hotels cant be displayed!');
    });
}

function opendataWindow2() {
    opendataWindow(this);
}

function stopanimationLocator(locator) {
    infoWindow.locator.setIcon(null);
    infoWindow.locator.setAnimation(null);
}

function opendataWindow(locator) {
    if (infoWindow.locator !== locator && infoWindow.locator !== undefined) {
        stopanimationLocator(infoWindow.locator);
    }
    animationLocator(locator);
    var content = '<h3>' + ' Name - ' + locator.title + '</h3>';
    if(typeof(locator.Addres) === "undefined"){
        content += '<h5>' + ' Address : not given</h5>';
    }else{
        content += '<h5>' + ' Address - ' + locator.Addres + '</h5>';
    }
    infoWindow.locator = locator;
    infoWindow.setContent(content);
    infoWindow.open(ambala_map, locator);
    infoWindow.addListener('closeclick', stopanimationLocator);
}

function open(title) {
    for (var j in locs) {
        if (locs[j].title == title) {
            opendataWindow(locs[j]);
            return;
        }
    }
}

function startMap() {
    view.wasError(false);
    infoWindow = new google.maps.InfoWindow();
    ambala_map  = new google.maps.Map(document.getElementById('map'), {
        center: ambala_coor,
        zoom: 14
    });
    get_foursquare_hotels();
}

ko.applyBindings(view);
view.searchQuery.subscribe(view.filter);
