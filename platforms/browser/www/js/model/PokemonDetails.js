var PokemonDetails = function(realID, name, height, weight) 
{
    this.pokemonId = realID;
    this.name = name;
    this.height = height;
    this.weight = weight;
    this.stats = []; // Array met de stats van de pokemon. Deze worden voor de duidelijkheid iets later toegevoegd.
    this.types = []; // Same, but the types.
};

PokemonDetails.prototype.addStats = function(pokemonStats)
{
	this.stats = pokemonStats;
};

PokemonDetails.prototype.addTypes = function(pokemonTypes)
{
	this.types = pokemonTypes;
};

PokemonDetails.prototype.getID = function()
{
	return this.pokemonId;
};

PokemonDetails.prototype.getName = function()
{
	return this.name;
};

PokemonDetails.prototype.getHeight = function()
{
	return this.height;
};

PokemonDetails.prototype.getWeight = function()
{
	return this.weight;
};

PokemonDetails.prototype.getStat = function(statIndex)
{
	return this.stats[statIndex];
};

PokemonDetails.prototype.getTypes = function()
{
	return this.types;
};