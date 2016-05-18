var PokemonWildMarker = function(lat, lng, rarity, map, icon) 
{
    var latlng = {lat: lat, lng: lng};
    this.rarity = rarity;

    this.marker = new google.maps.Marker
    ({
    	position: latlng,
    	map: map,
        icon: icon,
    	title: 'Pokémon with rarity: ' + rarity
    });
}

PokemonWildMarker.prototype.getMarker = function()
{
	return this.marker;
}

PokemonWildMarker.prototype.getRarity = function()
{
	return this.rarity;
}