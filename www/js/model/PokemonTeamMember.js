// Kan potentieel ook moves, level en stat diversity toevoegen
var PokemonTeamMember = function(realID, pokemonName, nickname) 
{
	this.pokemonID = realID;
	this.pokemonName = pokemonName;
	this.pokemonNick;

	if (nickname != null)
	{
		this.pokemonNick = nickname;
	}
	else
	{
		this.pokemonNick = this.pokemonName;
	}
}

PokemonTeamMember.prototype.getPokemonRealID = function()
{
	return this.pokemonID;
}

PokemonTeamMember.prototype.getNickname = function()
{
	return this.pokemonNick;
}

PokemonTeamMember.prototype.getPokemonName = function()
{
	return this.pokemonName;
}