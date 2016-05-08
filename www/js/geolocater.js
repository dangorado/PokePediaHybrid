var geolocater = {
	initialize: function() {
		this.bindEvents();
	},
	bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        geolocater.geolocate();
    },
    geolocate: function() 
    {
  		if (navigator.geolocation) 
  		{
  			navigator.geolocation.getCurrentPosition(onSuccess, onError);
  		}
    }
};
// onSuccess Callback
// This method accepts a Position object, which contains the
// current GPS coordinates
//
var onSuccess = function(position) 
{
	var coordinates = 	'<p>Latitude: '          + position.coords.latitude          + '</p>' +
          				'<p>Longitude: '         + position.coords.longitude         + '</p>' +
          				'<p>Altitude: '          + position.coords.altitude          + '</p>' +
          				'<p>Accuracy: '          + position.coords.accuracy          + '</p>' +
          				'<p>Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '</p>' +
          				'<p>Heading: '           + position.coords.heading           + '</p>' +
          				'<p>Speed: '             + position.coords.speed             + '</p>' +
          				'<p>Timestamp: '         + position.timestamp                + '</p>';
    $('#coordscontainer').html(coordinates).enhanceWithin();
};

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}