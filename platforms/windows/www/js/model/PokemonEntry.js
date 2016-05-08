var PokemonEntry = function(realID, name) 
{
	this.iRealID = realID;
    this.strName = name;
    this.pokemonSpriteAddress = URL_GET_SPRITE + realID;
    this.pokemonDetails;
    this.pokemonDescriptions;
    this.pokemonCaptureRate;
}

PokemonEntry.prototype.setDetails = function(details)
{
	this.pokemonDetails = details;
}

PokemonEntry.prototype.setDescriptions = function(descriptions)
{
	this.pokemonDescriptions = descriptions;
}

PokemonEntry.prototype.setCaptureRate = function(rate)
{
	this.pokemonCaptureRate = rate;
}

PokemonEntry.prototype.getID = function()
{
	return this.iRealID;
}

PokemonEntry.prototype.getName = function()
{
    return this.strName;
}

PokemonEntry.prototype.getDetails = function()
{
	return this.pokemonDetails;
}

PokemonEntry.prototype.getSpriteAddress = function()
{
	return this.pokemonSpriteAddress;
}

PokemonEntry.prototype.getDescriptions = function()
{
	return this.pokemonDescriptions;
}

PokemonEntry.prototype.getCaptureRate = function()
{
	return this.pokemonCaptureRate;
}