var INT_GEO_MAX_DISTANCE_LATLNG = 0.05,	// De maximale afstand in lat/long vanaf de gebruiker's locatie waarop pokémon gespawned worden
	INT_GEO_DETECTION_RADIUS = 1000.01,	// De radius in kilometers waarin de speler dichtbij genoeg is om de pokémon te detecteren/vangen.
	INT_GEO_NUMBER_TO_SPAWN = 25,		// De maximale hoeveelheid pokémon die tegelijkertijd gespawned zijn.
	INT_GEO_TIME_BETWEEN_SPAWNS = 30, 	// De tijd in minuten tussen pokémon spawns.
	INT_GEO_AVANS_LAT = 51.6884714,		// <-- Avans' locatie
	INT_GEO_AVANS_LON = 5.2864208,
	INT_GEO_RARITY_LEVELS = 10,			// Hoeveel niveaus van zeldzaamheid er zijn van pokémon.
	INT_GEO_MOVEMENT_UPDATE_RATE = 10, 	// Hoeveel secondes er tussen movement updates zit.
	INT_GEO_VIBRATION_TIME = 2500;		// Hoeveel millisecondes er gevibreert wordt bij het vinden van een pokemon.
var IMG_GEO_POKEBALL = 'img/pokeball_icon.png';

// Waarschijnlijk iets van een timestamp implementen zodat om de zoveel tijd een nieuwe set gegenereerd wordt.
var PokemonGeolocater = function(mapElementId) 
{
	currentGeolocater = this;

	this.mapElementId = mapElementId; // De DIV waar de map in staat.
	this.playerMarker; // De marker die de speler's huidige positie representeerd.
	this.currentLatLng; // De speler's huidige positie.

    this.wildPokemon = []; // De wilde pokemon die op dit moment gespawned zijn.
    this.wildPokemonSpawnTime; // De tijdstip waarop de wilde pokemon gespawned zijn.

    // Listener toevoegen die activeert wanneer de pagina klaar is met laden.
    $(document).on('pagebeforeshow', currentGeolocater.initialize );
}

PokemonGeolocater.prototype.initialize = function()
{
	var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");
    // Eerst kijken of de gebruiker zich uberhaupt op de pokedex pagina bevindt.
    if (activePage[0].id == "pokemonSearchScreenPage")
    {
		currentGeolocater.initMap();
	}
}

// Om de MOVEMENT_UPDATE_RATE secondes, nadat movement gedetecteerd is, spreek dan de updateToCurrentPosition methode aan.
PokemonGeolocater.prototype.initMovementWatchLoop = function()
{
	navigator.geolocation.watchPosition(currentGeolocater.updateToCurrentPosition, currentGeolocater.geolocationError, { timeout: ( INT_GEO_MOVEMENT_UPDATE_RATE * 10 ) });
}

PokemonGeolocater.prototype.geolocationError = function()
{
	console.log('Could not get the geolocation of the user.');
}

// Een asynchrone methode die de speler's positie update.
PokemonGeolocater.prototype.updateToCurrentPosition = function()
{
	if ( navigator.geolocation ) 
    {
        function success(pos) 
        {
        	// Positie en speler marker goed zetten.
            currentGeolocater.currentLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            currentGeolocater.updatePlayerMarker();

    		// Pokémon spawnen indien de juiste condities actief zijn.
	    	currentGeolocater.spawnNewSet(currentGeolocater.currentLatLng);

	    	// Tenslotte checken of de speler dichtbij een wilde pokemon staat.
    		currentGeolocater.checkForWildPokemon(currentGeolocater.currentLatLng);
        }
        function fail(error) 
        {
            // Kon niet de gebruiker's positie vinden.
            currentGeolocater.geolocationError();
        }
        // De gebruiker's positie proberen te vinden. Roept de bovenste twee methodes aan. Cache de locatie voor 5 mins. Een timeout error geven als er na 6 seconden geen reactie is.
        navigator.geolocation.getCurrentPosition(success, fail, {maximumAge: 500000, enableHighAccuracy:true, timeout: 6000});
    } 
    else
    {
    	// Er is helemaal geen geolocation beschikbaar.
    	console.log('No geolocation available!');
    }
    
}

// Initializeerd de map. Als de location nog niet beschikbaar is, init dan op Avans.
PokemonGeolocater.prototype.initMap = function() 
{
	if (currentGeolocater.currentLatLng == null)
	{
		currentGeolocater.currentLatLng = new google.maps.LatLng(INT_GEO_AVANS_LAT, INT_GEO_AVANS_LON);  // De standaard coords wijzen naar Avans Hogeschool toe.
	}

	if (pokemonMap == null)
	{
		// een options object wat aan de google maps map doorgevoerd wordt.
		var myOptions = 
	    {
	        zoom: 15,
	        center: currentGeolocater.currentLatLng,
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	    };
	    // Map aanmaken
	    pokemonMap = new google.maps.Map(currentGeolocater.mapElementId, myOptions);
	    // Marker op de speler zetten
	    currentGeolocater.updatePlayerMarker();

	    // Start de watch loop
	    currentGeolocater.initMovementWatchLoop();
	}
}

// Deze methode zet de speler's marker op zijn/haar huidige positie.
PokemonGeolocater.prototype.updatePlayerMarker = function()
{
	// De marker compleet clearen.
	if (this.playerMarker != null)
	{
		this.playerMarker.setMap(null);
		this.playerMarker = null;
	}
	
	this.playerMarker = new google.maps.Marker
    ({
    	position: currentGeolocater.currentLatLng,
    	map: pokemonMap,
    	title: 'You are here!'
    });

    // Centreert de map op de speler's positie.
    pokemonMap.setCenter( currentGeolocater.currentLatLng );
}

// Als de INT_GEO_TIME_BETWEEN_SPAWNS verstreken is, dan spawned deze methode een hoeveelheid nieuwe wilde pokémon om de huidige positie heen. 
PokemonGeolocater.prototype.spawnNewSet = function(pos)
{
	var self = this;

	var currentTime = new Date($.now());
	var addedTime = new Date($.now()); // Als ik addedTime = currentTime doe, dan maakt javascript er schijnbaar een reference van

	addedTime.setMinutes( ( currentTime.getMinutes() + INT_GEO_TIME_BETWEEN_SPAWNS ) );

	if ( self.wildPokemon.length == 0 || currentTime > addedTime )
	{
		self.wildPokemonSpawnTime = currentTime;
		self.deleteOldSet();

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
			var rarity = Math.floor( ( Math.random() * INT_GEO_RARITY_LEVELS ) ); // NOTE: Later beter distributeren zodat zeldzame pokemon ook echt zeldzaam zijn!

			self.wildPokemon.push( new PokemonWildMarker( lat, lon, rarity, pokemonMap, IMG_GEO_POKEBALL ) );
		}

		// Voegt een wilde pokemon toe op de standaard avans locatie en op mijn huis :)
		self.wildPokemon.push( new PokemonWildMarker( INT_GEO_AVANS_LAT, INT_GEO_AVANS_LON, (INT_GEO_RARITY_LEVELS / 2), pokemonMap, IMG_GEO_POKEBALL ) );
		self.wildPokemon.push( new PokemonWildMarker( 51.62574, 5.41395, (INT_GEO_RARITY_LEVELS / 2), pokemonMap, IMG_GEO_POKEBALL ) );
	}
}

// Verwijderd alle bestaande markers.
PokemonGeolocater.prototype.deleteOldSet = function()
{
	if (this.wildPokemon.length > 0)
	{
		for (var i = 0; i < this.wildPokemon.length; i++)
		{
			this.wildPokemon[i].deleteMarker();
		}
	}

	this.wildPokemon = [];
}

// Checken of de speler in de buurt staat van een wilde pokémon. Zo ja, laat dan aan een listener weten dat dit het geval is en retourneer de pokemon's entry.
PokemonGeolocater.prototype.checkForWildPokemon = function(pos)
{
	var wildPokemonMarker = this.checkWildPokemonProximity(pos);
	if ( wildPokemonMarker != null )
	{
		var rarity = wildPokemonMarker.getRarity();
		wildPokemonMarker.deleteMarker();
		wildPokemonMarker = null;

		// Vibreren als er een pokémon gevonden is.
		if ( navigator.vibrate )
		{
			navigator.vibrate( INT_GEO_VIBRATION_TIME );
		}

		wildEncounterEventListener.notify( rarity );
	}
}

// Kijkt of de speler binnen het bereik van een wilde pokémon staat of niet. Zo ja, retourneer dan dat WildPokemonMarker object.
PokemonGeolocater.prototype.checkWildPokemonProximity = function(pos)
{
	for (var i = 0; i < this.wildPokemon.length; i++)
	{
		var wildPoke = this.wildPokemon[i];

		if (wildPoke != null)
		{
			var distance = getDistanceBetweenPoints(wildPoke.getMarker().getPosition().lat(), wildPoke.getMarker().getPosition().lng(), 
												pos.lat(), pos.lng());
			if (distance < INT_GEO_DETECTION_RADIUS)
			{
				return this.wildPokemon[i];
			}
		}

		
	}
	return null;
}

// Berekening dat de afstand tussen twee punten in kilometers retourneerd.
function getDistanceBetweenPoints(lat1, lon1, lat2, lon2) 
{
	var R = 6371; // Radius van de Aarde in KM.
  	var dLat = degToRad(lat2 - lat1);  // De methode hiervoor staat hieronder.
  	var dLon = degToRad(lon2 - lon1); 
  	var a = 
    	Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    	Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * 
    	Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  	var d = R * c; // Afstand in KM.
  	return d;
}

function degToRad(deg) 
{
 	return deg * ( Math.PI / 180 )
}

// Event Listener function voor wanneer de speler dichtbij een wilde pokémon staat.
var wildEncounterEventListener = 
{
    notify: function (rarity) 
    {
        this.trigger('encounterEvent', rarity);
    }
};

// De listener extenden. De interface staat in de PokemonDatabase klasse beschreven.
$.extend(wildEncounterEventListener, eventInterface);