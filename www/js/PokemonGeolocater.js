var INT_GEO_MAX_DISTANCE_LATLNG = 0.05,	// De maximale afstand vanaf de gebruiker's locatie waarop pokémon gespawned worden
	INT_GEO_MARKER_RADIUS = 0.00005,	// De radius waarin de speler dichtbij genoeg is om de pokémon te detecteren/vangen.
	INT_GEO_NUMBER_TO_SPAWN = 25,		// De maximale hoeveelheid pokémon die tegelijkertijd gespawned zijn.
	INT_GEO_AVANS_LAT = 51.6884714,		// <-- Avans' locatie
	INT_GEO_AVANS_LON = 5.2864208,
	INT_GEO_RARITY_LEVELS = 10;	
var IMG_GEO_POKEBALL = 'img/pokeball_icon.png';

var currentGeolocater;

// Waarschijnlijk iets van een timestamp implementen zodat om de zoveel tijd een nieuwe set gegenereerd wordt.
var PokemonGeolocater = function(map) 
{
    this.wildPokemon = [];
    this.map = map;
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

PokemonGeolocater.prototype.getSet = function()
{
	return this.wildPokemon;
}