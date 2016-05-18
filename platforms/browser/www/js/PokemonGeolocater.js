var INT_GEO_MAX_DISTANCE_LATLNG = 0.05,	// De maximale afstand vanaf de gebruiker's locatie waarop pokémon gespawned worden
	INT_GEO_MARKER_RADIUS = 0.00005,	// De radius waarin de speler dichtbij genoeg is om de pokémon te detecteren/vangen.
	INT_GEO_NUMBER_TO_SPAWN = 25,		// De maximale hoeveelheid pokémon die tegelijkertijd gespawned zijn.
	INT_GEO_AVANS_LAT = 51.6884714,		// <-- Avans' locatie
	INT_GEO_AVANS_LON = 5.2864208,
	INT_GEO_RARITY_LEVELS = 10;	
var IMG_GEO_POKEBALL = 'img/pokeball_icon.png';

var currentGeolocater;

// Waarschijnlijk iets van een timestamp implementen zodat om de zoveel tijd een nieuwe set gegenereerd wordt.
var PokemonGeolocater = function(mapElementId) 
{
	currentGeolocater = this;

	this.mapElementId = mapElementId;
	this.map;

	this.currentLatLng; // De speler's huidige positie.
    this.wildPokemon = [];

    this.initialize();
}

PokemonGeolocater.prototype.initialize = function()
{
	currentGeolocater.currentLatLng = new google.maps.LatLng(51.6884714, 5.2864208);  // De standaard coords wijzen naar Avans Hogeschool toe.
    currentGeolocater.initToCurrentPosition();
}

// Een asynchrone methode die de speler's positie update.
PokemonGeolocater.prototype.initToCurrentPosition = function()
{
	if ( navigator.geolocation ) 
    {
        function success(pos) 
        {
            currentGeolocater.currentLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            currentGeolocater.initMap();
        }
        function fail(error) 
        {
            // Kon niet de gebruiker's positie vinden.
            console.log('Could not get the geolocation of the user.');
            currentGeolocater.initMap();
        }
        // De gebruiker's positie proberen te vinden. Roept de bovenste twee methodes aan. Cache de locatie voor 5 mins. Een timeout error geven als er na 6 seconden geen reactie is.
        navigator.geolocation.getCurrentPosition(success, fail, {maximumAge: 500000, enableHighAccuracy:true, timeout: 6000});
        // 
    	navigator.geolocation.watchPosition(currentGeolocater.movementDetected, fail, { timeout: 30000 });
    } 
    else
    {
    	// Er is helemaal geen geolocation beschikbaar.
    	console.log('No geolocation available!');
    	currentGeolocater.initMap();
    }
}

PokemonGeolocater.prototype.initMap = function() 
{
    // var myOptions = 
    // {
    //     zoom: 10,
    //     center: currentGeolocater.currentLatLng,
    //     mapTypeId: google.maps.MapTypeId.ROADMAP
    // };

    // this.map = new google.maps.Map(this.mapElementId, myOptions);
    // currentGeolocater.spawnNewSet(this.currentLatLng);
}

// Spawned een hoeveelheid nieuwe wilde pokémon om de opgegeven positie heen. 
PokemonGeolocater.prototype.spawnNewSet = function(pos)
{
	var self = this;
	this.wildPokemon = [];

	var maxLat = pos.lat() + INT_GEO_MAX_DISTANCE_LATLNG;
	var minLat = pos.lat() - INT_GEO_MAX_DISTANCE_LATLNG;
	var maxLon = pos.lng() + INT_GEO_MAX_DISTANCE_LATLNG;
	var minLon = pos.lng() - INT_GEO_MAX_DISTANCE_LATLNG;

	var latSpan = maxLat - minLat;
	var lonSpan = maxLon - minLon;

	for (var i = 0; i < INT_GEO_NUMBER_TO_SPAWN; i++)
	{
		var lat = minLat + latSpan * Math.random();
		var lon = minLon + lonSpan * Math.random();
		var rarity = Math.floor( ( Math.random() * INT_GEO_RARITY_LEVELS ) );

		this.wildPokemon.push( new PokemonWildMarker( lat, lon, rarity, self.map, IMG_GEO_POKEBALL ) );
	}

	// Voegt een wilde pokemon toe op de standaard avans locatie.
	this.wildPokemon.push( new PokemonWildMarker( 51.6884714, 5.2864208, (INT_GEO_RARITY_LEVELS / 2), self.map, IMG_GEO_POKEBALL ) );
	
}

// Retourneerd of de speler binnen het bereik van een wilde pokémon staat of niet.
PokemonGeolocater.prototype.detectProximity = function(pos)
{
	for (var i = 0; i < this.wildPokemon.length; i++)
	{
		Location.distanceBetween(this.wildPokemon[i].getMarker().getPosition().latitude, this.wildPokemon[i].getMarker().getPosition().longitude, 
			pos.getCenter().latitude, pos.getCenter().longitude, INT_GEO_MARKER_RADIUS);

		return true;
	}

	return false;
}


// Wanneer de speler beweegt, check dan of er pokémon in de buurt staan. Zo ja, laat dan een prompt zien oid.
PokemonGeolocater.prototype.movementDetected = function(pos)
{
	currentGeolocater.currentLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
	console.log('position after movement: ' + currentGeolocater.currentLatLng);
	$('#debugPosition').html('<p>position after movement: ' + currentGeolocater.currentLatLng + '</p>').enhanceWithin();
}