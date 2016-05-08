var PokemonTeamScreen = function() 
{
	this.pokemonTeam = [];
	this.initialize();
}

PokemonTeamScreen.prototype.initialize = function()
{
	var savedTeam = localSettings.loadSetting('savedPokemonTeam');
	
	if (savedTeam != null)
	{
		this.pokemonTeam = savedTeam;
		addPokemonTeamMembers();
	}
}

PokemonTeamScreen.prototype.addPokemonTeamMembers = function()
{
	var page = $.mobile.pageContainer.pagecontainer("getActivePage");

    var listEntries = $("li", page).length;

    for (var i = 0; i < pokemonTeam.length; i++) 
    {
        var realID = pokemonTeam[i].getID();
        var pokemonName = pokemonTeam[i].getName();
        // De list item opmaken met de link naar de pokedex detail scherm.
        $('#pokemonTeamList').append('<li><a href="pokemon-info.html" onclick=currentPokedex.openPokemonInfoPage(' + realID + ') data-transition="slide"><img src="' + URL_GET_SPRITE + realID + '.png"/><h3>' + pokemonName + '</h3></a></li>');
    };

    $('#pokemonTeamList').listview('refresh');
};