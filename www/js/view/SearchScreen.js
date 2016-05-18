var INT_SEARCH_MAX_DISTANCE_LATLNG = 0.5;

var currentSearchScreen;
var pokemonGeolocater;

var SearchScreen = function() 
{
    currentSearchScreen = this;
    this.map;
    this.currentLatLng;
    this.markers = [];

	this.initialize();
}

SearchScreen.prototype.initialize = function()
{
	currentSearchScreen.currentLatLng = new google.maps.LatLng(51.6884714, 5.2864208);  // De standaard coords wijzen naar Avans Hogeschool toe.

    if ( navigator.geolocation ) 
    {
        function success(pos) 
        {
            currentSearchScreen.currentLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            currentSearchScreen.initMap(); // De geolocation werkt en de gebruiker's positie is gevonden. Centreer de map daarheen.
        }
        function fail(error) 
        {
            // Kon niet de gebruiker's positie vinden, dus ga naar de standaard locatie toe.
            console.log('Could not get the geolocation of the user.');
            currentSearchScreen.initMap();
        }
        // De gebruiker's positie proberen te vinden.  Cache de locatie voor 5 mins, timeout na 6 seconden.
        navigator.geolocation.getCurrentPosition(success, fail, {maximumAge: 500000, enableHighAccuracy:true, timeout: 6000});
    } 
    else
    {
        // Geen geolocation beschikbaar. Maar teken de map op de positie van Avans.
        currentSearchScreen.initMap();
    }
    
}

SearchScreen.prototype.initMap = function() 
{
    var myOptions = 
    {
        zoom: 10,
        center: currentSearchScreen.currentLatLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    currentSearchScreen.map = new google.maps.Map(document.getElementById("pokemonSearchMapCanvas"), myOptions);
    currentSearchScreen.pokemonGeolocater = new PokemonGeolocater(currentSearchScreen.map);
    this.pokemonGeolocater.spawnNewSet(currentSearchScreen.currentLatLng);
}