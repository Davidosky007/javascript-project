// Initialize Materialize components
M.AutoInit();


// Auto-scroll page to map once user hits 'GO'
function scrollToId(id) {
  $("html,body").animate(
    {
      scrollTop: $("#" + id).offset().top
    },
    "slow"
  );
}

// GLOBAL VARIABLES
var map;
var autocomplete;
var service;


function initialise() {
  // Autocomplete will only return city suggestions
  autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("search_term"),
    {
      types: ["(cities)"]
    }
  );

  // Map is instantiated and set to an initial fixed location
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 41.902782, lng: 12.496365 },
    zoom: 3
  });
}


// Render map based on user's search inputs
function renderMap() {
  
  var user_search = document.getElementById("search_term").value;
  // Error handling
  if (!user_search) {
    alert("Please enter a valid city in the search bar");
    return;
  }

  // Reveals previously initialised map
  $("#map").css("display", "block");

  scrollToId("map");

  // Instantiate Geocoder object
  var geocoder = new google.maps.Geocoder();
  var selLocLat = 0;
  var selLocLng = 0;

  // User search location used to refocus map
  geocoder.geocode({ address: user_search }, function(results, status) {
    if (status === "OK") {
      selLocLat = results[0].geometry.location.lat();
      selLocLng = results[0].geometry.location.lng();

      var coords = new google.maps.LatLng(selLocLat, selLocLng);

      map = new google.maps.Map(document.getElementById("map"), {
        center: coords,
        zoom: 17
      });

      // Define request to pass to the places service
      var request = {
        location: coords,
        radius: 5000
      };

      // Apply filters to request (if selected)
      if (document.getElementById("museums").checked) {
        request["type"] = "museum";
      } else if (document.getElementById("accommodation").checked) {
        request["type"] = "lodging";
      } else if (document.getElementById("bars").checked) {
        request["type"] = "bar";
      } else if (document.getElementById("restaurants").checked) {
        request["type"] = "restaurant";
      } else if (document.getElementById("supermarkets").checked) {
        request["type"] = "supermarket";
      }

      // Gather nearby places
      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, callback);
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
  
  // Pop-up info box to guide users
  M.toast({ html: "Click on a marker to see more info", displayLength: 2000 });
}

// Display markers on map based on nearbySearch results
function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

// Drop custom markers on map
function createMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    animation: google.maps.Animation.DROP,
    icon: {
      url: "../javascript-project/assets/img/map_pin.svg",
      scaledSize: new google.maps.Size(65, 150)
    }
  });


  var request = { reference: place.reference };
  // Retrieve details of selected marker on click
  service.getDetails(request, function(details, status) {
      
    google.maps.event.addListener(marker, "click", function() {
      $("#place-info").css("display", "block");
      scrollToId("infoCard");
      restorePreviousCardInfo();
      
      // Re-initialise materialize tabs
      $("ul.tabs").tabs();
      changeCardInfo(place, details);
    });
  });
}


// Update place information HTML in card tabs based on place results
function changeCardInfo(place_results, contact_details) {
  var placePhoto = place_results.photos[0].getUrl();

  $("#hold-place-name").html(
    "<div class='col s12 m3' id='place-pic'><img class='responsive-img' src=" +
      placePhoto +
      "></div><div class='col s12 m9'><h3>" +
      place_results.name +
      "</h3></div>"
  );
  if (contact_details.formatted_address) {
    $("#hold-place-address").html(
      "<h6>" + contact_details.formatted_address + "</h6>"
    );
  }
  if (contact_details.formatted_phone_number) {
    $("#hold-place-phone").html(
      "<h6>" + contact_details.formatted_phone_number + "</h6>"
    );
  }
  if (contact_details.reviews) {
    var len = (len = contact_details.reviews.length);
    var review_image =
      "<div class='col s3' id='review-pic'><i class='material-icons main'>face</i></div>";
    var review_text = "";
    for (var i = 0; i < len; i++) {
      if (contact_details.reviews[i].profile_photo_url) {
        review_image =
          "<div class='col s3' id='review-pic'><img src=" +
          contact_details.reviews[i].profile_photo_url +
          "></div>";
      }
      review_text +=
        "<div class ='row'>" +
        review_image +
        "<div class='col s9 left-align' id='review-name'><h5>" +
        contact_details.reviews[i].author_name +
        "</h5><p>" +
        contact_details.reviews[i].text +
        "</p></div></div>";
    }
    $("#hold-place-review").html(review_text);
  }
  if (contact_details.website) {
    $("#hold-place-website").html(
      "<h6><a href='" +
        contact_details.website +
        "' target='_blank'>Launch Website <i class='material-icons main'>launch</i></a></h6>"
    );
  }
}


      
// Clear out previous card information
function restorePreviousCardInfo() {
  $("#hold-place-name").html("");
  $("#hold-place-address").html(
    "Unfortunately, this place does not have address details"
  );
  $("#hold-place-phone").html(
    "Unfortunately, this place does not have a phone number"
  );
  $("#hold-place-review").html(
    "Unfortunately, this place does not have any reviews yet"
  );
  $("#hold-place-website").html(
    "Unfortunately, this place does not have a website"
  );
}
