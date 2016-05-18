var STR_TEAMSCREEN_ISEMPTY = "You have no pokémon!";

var PokemonTeamScreen = function() 
{
	this.initialize();
}

PokemonTeamScreen.prototype.initialize = function()
{
	// Voor de onderstaande $ functions.
	var self = this;

	// Listener toevoegen die activeert wanneer de pagina klaar is met laden.
    $(document).on('pagebeforeshow', self.updatePokemonTeamMembers );
    // Listener toevoegen om de laad indicator te laten zien.
    // $(document).on('pagebeforeshow', self.showLoadingIndicator );
}

PokemonTeamScreen.prototype.updatePokemonTeamMembers = function()
{
	if (pokemonDatabase.getPokemonTeam().length > 0)
	{
		var pokemonTeam = pokemonDatabase.getPokemonTeam();

	    var pokemonTeamListHtml = ' ';
	    for (var i = 0; i < pokemonTeam.length; i++) 
	    {
	        var realID = pokemonTeam[i].getPokemonEntry().getID();
	        var pokemonNick = pokemonTeam[i].getNickname();
	        var pokemonName = pokemonTeam[i].getPokemonEntry().getName();
	        // De list item opmaken met de link naar de pokedex detail scherm.
	        pokemonTeamListHtml += '<li><a href="" data-transition="slide"><img src="' + URL_GET_SPRITE + realID + '.png"/><h3>' + pokemonNick + '</h3><p>' + pokemonName + '</p></a></li>';
	    };

	    $('#pokemonTeamList').html( pokemonTeamListHtml ).enhanceWithin();
	}
	else
	{
		var nothingAvailableStr = STR_TEAMSCREEN_ISEMPTY;
		var emptyList = '<li><h3>' + nothingAvailableStr + '</h3></li>';

		$('#pokemonTeamList').html( emptyList ).enhanceWithin();
	}
	$('#pokemonTeamList').listview('refresh');
};