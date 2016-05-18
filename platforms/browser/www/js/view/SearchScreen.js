var INT_SEARCH_MAX_DISTANCE_LATLNG = 0.5;

var currentSearchScreen;
var pokemonGeolocater;

var SearchScreen = function() 
{
    currentSearchScreen = this;
	this.initialize();
}

SearchScreen.prototype.initialize = function()
{
	if (this.pokemonGeolocater == null)
    {
        this.pokemonGeolocater = new PokemonGeolocater(document.getElementById("pokemonSearchMapCanvas"));
    }

}

