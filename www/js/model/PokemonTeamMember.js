// Kan potentieel ook moves, level en stat diversity toevoegen
var PokemonTeamMember = function(entry, nickname) 
{
	this.pokemonEntry = entry;
	this.pokemonNick;

	if (nickname != null)
	{
		this.pokemonNick = nickname;
	}
	else
	{
		this.pokemonNick = this.pokemonEntry.getName();
	}
}

PokemonTeamMember.prototype.getPokemonEntry = function()
{
	return this.pokemonEntry;
}

PokemonTeamMember.prototype.getNickname = function()
{
	return this.pokemonNick;
}