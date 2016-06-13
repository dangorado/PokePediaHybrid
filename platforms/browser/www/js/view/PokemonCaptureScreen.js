var	STR_POKEMON_BUTTON_OK = "OK!",
	STR_POKEMON_BUTTON_DONE = "Done!",
	STR_POKEMON_CAPTURED_EVENT = "You caught ",
	STR_POKEMON_GIVE_NICKNAME = "Give them a nickname?",
	STR_POKEMON_NICKNAME_FIELD = "Nickname: ",
	STR_POKEMON_THE_PREFIX = "The ",
	STR_POKEMON_BROKE_FREE_EVENT = " broke free!",
	STR_POKEMON_ANNOYED_EVENT = " became annoyed!",
	STR_POKEMON_DISTRACT_EVENT = " is distracted!",
	STR_POKEMON_ESCAPE_EVENT = " fled!",
	STR_NO_POKEBALL_EVENT = "You have no pokéballs left!",
	STR_NO_BAIT_EVENT = "You have no more bait!",
	STR_LOADING = "...",
	STR_FETCHING = "Fetching Pokémon...";

var currentCaptureScreen;

var PokemonCaptureScreen = function(pokemonRarity) 
{
	this.isReady = false;
	this.pokemonID;
	this.pokemonName;
	this.pokemonRarity = pokemonRarity;
	this.initialize();
}

PokemonCaptureScreen.prototype.initialize = function()
{
	// Voor de onderstaande $ functions.
	var self = this;

	if (pokemonCatcher == null)
	{
		pokemonCatcher = new PokemonCatcher();
	}
	pokemonCatcher.preload(this.pokemonRarity);

	// Listener toevoegen die activeert wanneer de pagina klaar is met laden.
    $(document).on('pagebeforeshow', self.initializeCaptureScreen );
    $(document).on('pageshow', self.showLoadingIndicator );
}

PokemonCaptureScreen.prototype.initializeCaptureScreen = function()
{
	var self = this;
	var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");

    // Eerst kijken of de gebruiker zich uberhaupt op de capture screen pagina bevindt.
    if (activePage[0].id == "capturePage")
    {
    	if ( pokemonCatcher.isReady )
    	{
    		// End loading indicator here
    		stopLoadingIndicator();
    		self.isReady = true;
    		
    		var wildPokemon = pokemonCatcher.getWildPokemon();
    		currentCaptureScreen.pokemonID = wildPokemon.getID();
	    	currentCaptureScreen.pokemonName = wildPokemon.getName();
	    	// De pokémon's sprite laten zien.
			$('#capturePokemonSprite').html('<img src="' + URL_GET_SPRITE + currentCaptureScreen.pokemonID + '.png"/>');
			$('#capturePokemonName').html(currentCaptureScreen.pokemonName).enhanceWithin();
			// Hoeveelheid balls en bait ook tonen.
			currentCaptureScreen.updateCaptureScreen();
    	}
    	else
    	{
    		self.isReady = false;

    		// place holder sprite laten zien
    		$('#capturePokemonSprite').html('<img src="' + URL_GET_SPRITE + 1 + '.png"/>');
			$('#capturePokemonName').html( STR_LOADING ).enhanceWithin();
    	}
    }

}

// Update de hoeveelheid bait/balls dat de speler over heeft.
PokemonCaptureScreen.prototype.updateCaptureScreen = function()
{
	$('#captureRemainingBallsCount').html( pokemonCatcher.getBallCount() ).enhanceWithin();
	$('#captureRemainingBaitCount').html( pokemonCatcher.getBaitCount() ).enhanceWithin();
}

// De juiste popup openen wanneer een speler de pokemon gevangen heeft ja/nee na het gooien van een bal.
PokemonCaptureScreen.prototype.updatePokeballPopup = function(success)
{
	if (success)
	{
		// Alle strings goed zetten. Later dit via een taal setting/database doen.
		$('#captureUsePokeballSuccess').html( STR_POKEMON_CAPTURED_EVENT + currentCaptureScreen.pokemonName + "!" );
		$('#captureGiveNicknameHeader').html( STR_POKEMON_GIVE_NICKNAME );
		$('#captureGiveNicknameLabel').html( STR_POKEMON_NICKNAME_FIELD );   
		$('#captureGiveNicknameButton').html( STR_POKEMON_BUTTON_DONE );
		$('#capturePokeballSuccessPopup').popup('open');
	}
	else
	{
		$('#captureUsePokeballFailed').html( STR_POKEMON_THE_PREFIX + currentCaptureScreen.pokemonName + STR_POKEMON_BROKE_FREE_EVENT );
		$('#capturePokeballFailedPopup').popup('open');
	}
}

PokemonCaptureScreen.prototype.updateItemThrowPopup = function(success)
{
	if ( success )
	{
		$('#captureThrowItemResult').html( STR_POKEMON_THE_PREFIX + currentCaptureScreen.pokemonName + STR_POKEMON_DISTRACT_EVENT );
	}
	else
	{
		$('#captureThrowItemResult').html( STR_POKEMON_THE_PREFIX + currentCaptureScreen.pokemonName + STR_POKEMON_ANNOYED_EVENT );
	}
}

PokemonCaptureScreen.prototype.noItemsLeftPopup = function(isPokeball)
{
	if ( isPokeball )
	{
		$('#captureNoItemsPopup').html( STR_POKEMON_THE_PREFIX + currentCaptureScreen.pokemonName + STR_POKEMON_ESCAPE_EVENT );
		$('#captureNoItemsPopup').popup('open');
	}
}

PokemonCaptureScreen.prototype.pokemonFleeCheck = function()
{
	if ( pokemonCatcher.escapeCheck() )
	{
		$('#captureFleeResult').html( STR_POKEMON_THE_PREFIX + currentCaptureScreen.pokemonName + STR_POKEMON_ESCAPE_EVENT );
		$('#captureFleePopup').popup('open');
	}
	else
	{
		return false;
	}
	return true;
}

// Een popup geldt als aparte history state, dus vandaar dat bij een geopende popup er 2 history states terug gegaan moeten worden.
PokemonCaptureScreen.prototype.stopCaptureAttempt = function(isFromPopup)
{
	var toGoBack = -1;
	if (isFromPopup)
	{
		toGoBack = -2;
	}
	window.history.go(toGoBack);
}

PokemonCaptureScreen.prototype.successfulCapture = function()
{
	var chosenNick = document.getElementById('nicknameField').value;

	// Nu in de database de pokemon toevoegen aan de speler's team.
	pokemonCatcher.pokemonCaught(chosenNick);

	this.stopCaptureAttempt(true);
}

PokemonCaptureScreen.prototype.usePokeball = function()
{
	var self = this;
	if (!self.isReady)
	{
		return;
	}

	// De speler heeft geen ballen over. Laat een popup zien.
	if (pokemonCatcher.getBallCount() < 1)
	{
		$('#captureNoItemsResult').html( STR_NO_POKEBALL_EVENT );
		$('#captureNoItemsPopup').popup('open');
		
		return;
	}

	var success = pokemonCatcher.throwPokeball(); // Eerst checken of de pokemon gevangen is.
	var fled = false;
	this.updateCaptureScreen();

	if ( !success )	// Hij is niet gevangen. Nu checken of het wegvlucht
	{
		if ( this.pokemonFleeCheck() )	// De pokemon is gevlucht, eind de encounter.
		{
			return;
		}
	}
	this.updatePokeballPopup(success);
}

PokemonCaptureScreen.prototype.throwBait = function()
{
	var self = this;
	if (!self.isReady)
	{
		return;
	}

	// De speler heeft geen ballen over. Laat een popup zien.
	if (pokemonCatcher.getBaitCount() < 1)
	{
		$('#captureNoItemsResult').html( STR_NO_BAIT_EVENT );
		$('#captureNoItemsPopup').popup('open');
		
		return;
	}

	pokemonCatcher.throwItem(false);
	this.updateCaptureScreen();

	if ( !this.pokemonFleeCheck() )
	{
		this.updateItemThrowPopup(true);
	}
}

PokemonCaptureScreen.prototype.throwRock = function()
{
	var self = this;
	if (!self.isReady)
	{
		return;
	}
	
	var annoyed = pokemonCatcher.throwItem(true);
	this.updateCaptureScreen();

	if ( !this.pokemonFleeCheck() )
	{
		this.updateItemThrowPopup(annoyed);
	}
}

PokemonCaptureScreen.prototype.closePopup = function(popupName)
{
	$('#' + popupName).popup('close');
}

// Laat een loading indicator zien als de details nog op null staan.
PokemonCaptureScreen.prototype.showLoadingIndicator = function()
{
	var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");

	// Eerst kijken of de gebruiker zich uberhaupt op de pokedex pagina bevindt.
    if (activePage[0].id == "capturePage")
    {
		startLoadingIndicator( STR_FETCHING );
    }
}

specificEntryFetchListener.on('specificEntryReady', function (event, entry) 
{
	pokemonCatcher.setWildPokemon(entry);
	currentCaptureScreen.initializeCaptureScreen();
});