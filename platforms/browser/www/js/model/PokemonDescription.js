var PokemonDescription = function(description, language, version) 
{
	this.description = description;
	this.language = language;
	this.version = version;
}

PokemonDescription.prototype.getDescription = function()
{
	return this.description;
}

PokemonDescription.prototype.getLanguage = function()
{
	return this.language;
}

PokemonDescription.prototype.getVersion = function()
{
	return this.version;
}