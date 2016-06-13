
var STR_WILD_ENCOUNTER_EVENT_HEADER_PREFIX = "A wild ",
	STR_WILD_ENCOUNTER_EVENT_HEADER_SUFFIX	= " appeared!",
	STR_WILD_ENCOUNTER_EVENT_QUESTION = "Attempt to catch it?",
	STR_WILD_ENCOUNTER_EVENT_YES_BUTTON = "Yes",
	STR_WILD_ENCOUNTER_EVENT_NO_BUTTON = "No";

var SearchScreen = function() 
{
	this.currentPokemonRarity = -1;
    currentSearchScreen = this;
}

SearchScreen.prototype.showWildEncounterPopup = function(rarity)
{
	var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");
	this.currentPokemonRarity = rarity;
	
    // Eerst kijken of de gebruiker zich uberhaupt op de map pagina bevindt.
    if (activePage[0].id == "pokemonSearchScreenPage")
    {
    	// Alle strings goed zetten. Later dit via een taal setting/database doen.
		$('#pokemonSearchEncounterHeader').html( STR_WILD_ENCOUNTER_EVENT_HEADER_PREFIX + /*entry.getName()*/ "pokémon" + STR_WILD_ENCOUNTER_EVENT_HEADER_SUFFIX );
		$('#pokemonSearchEncounterQuestion').html( STR_WILD_ENCOUNTER_EVENT_QUESTION );
		$('#pokemonSearchEncounterStartButton').html( STR_WILD_ENCOUNTER_EVENT_YES_BUTTON );   
		$('#pokemonSearchEncounterCancelButton').html( STR_WILD_ENCOUNTER_EVENT_NO_BUTTON );

		// Delayed de popup laten zien, omdat de app nog in een transitie kan zijn.
		setTimeout(function()
		{
        	$('#pokemonSearchEncounterPopup').popup('open', {positionTo: '#pokemonSearchMapCanvas'});
    	}, 500);
	}
}

SearchScreen.prototype.hideWildEncounterPopup = function()
{
	this.currentPokemonRarity = -1;
	$('#pokemonSearchEncounterPopup').popup('close');
}

SearchScreen.prototype.confirmWildEncounterPopup = function()
{
	// pokemon-capture-screen.html
	// $('#pokemonSearchEncounterPopup').popup('close');
	var pokemonRarity = this.currentPokemonRarity;
	currentCaptureScreen = new PokemonCaptureScreen(pokemonRarity);
	this.currentPokemonRarity = -1;

	$.mobile.pageContainer.pagecontainer("change", "pokemon-capture-screen.html", { transition: "slide", changeHash: true } );
}

wildEncounterEventListener.on('encounterEvent', function (event, rarity) 
{
	console.log('Pokemon found!');
	currentSearchScreen.showWildEncounterPopup(rarity);
});