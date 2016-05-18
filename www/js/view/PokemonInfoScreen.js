var currentInfoScreen;

var PokemonInfoScreen = function(name, realID) 
{
	this.pokemonName = name;
	this.pokemonID = realID;
	this.pokemonDetails;
	this.pokemonDescriptions;
	this.loadingState = 2;
};

PokemonInfoScreen.prototype.preloadInterface = function()
{
	$(document).on('pagebeforeshow', currentInfoScreen.initializeInterface );
	$(document).on('pageshow', currentInfoScreen.showLoadingIndicator );
}

PokemonInfoScreen.prototype.initializeInterface = function()
{
	var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");

    // Eerst kijken of de gebruiker zich uberhaupt op de pokedex pagina bevindt.
    if (activePage[0].id == "pokemonInfoPage")
    {
		$('#pokemonInfoHeader').html(currentInfoScreen.pokemonName).enhanceWithin();
		$('#infoPageID').html( currentInfoScreen.addLeadingZeros(currentInfoScreen.pokemonID, 3) );
		$('#infoPageSprite').html('<img src="' + URL_GET_SPRITE + currentInfoScreen.pokemonID + '.png"/>');

		// Als de details/descriptions al geladen waren, voeg die dan nu toe. Gebeurd alleen als de pokemon's detail pagina herbezocht wordt nadat de data al gefetched was.
		if (currentInfoScreen.pokemonDetails != null)
		{
			currentInfoScreen.updateDetails();
		}
		if (currentInfoScreen.pokemonDescriptions != null)
		{
			currentInfoScreen.updateDescriptions();
		}
    }
}

PokemonInfoScreen.prototype.openOfficialPokedex = function()
{
	//var link = '<a href="#" onclick="window.open(encodeURI('http://www.google.com/'), '_system')">Test link 2</a>
	window.open(OFFICIAL_POKEDEX + currentInfoScreen.pokemonID, '_system');
}

// Laat een loading indicator zien als de details nog op null staan.
PokemonInfoScreen.prototype.showLoadingIndicator = function()
{
	var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");

	// Eerst kijken of de gebruiker zich uberhaupt op de pokedex pagina bevindt.
    if (activePage[0].id == "pokemonInfoPage")
    {
    	if (currentInfoScreen.pokemonDetails == null)
		{
			startLoadingIndicator('Loading Pokémon...');
		}
    }
}

PokemonInfoScreen.prototype.loadingCheck = function()
{
	this.loadingState--;

	if (this.loadingState <= 0)
	{
		this.loadingState = 0;
		stopLoadingIndicator();
	}
}

PokemonInfoScreen.prototype.applyDetails = function(details)
{
	currentInfoScreen.pokemonDetails = details;
	currentInfoScreen.updateDetails();
}

PokemonInfoScreen.prototype.applyDescriptions = function(descriptions)
{
	currentInfoScreen.pokemonDescriptions = descriptions;
	currentInfoScreen.updateDescriptions();
}

PokemonInfoScreen.prototype.updateDetails = function()
{
	if (currentInfoScreen.pokemonDetails != null)
	{
		currentInfoScreen.loadingCheck();

		$('#infoPageHeight').html(currentInfoScreen.pokemonDetails.getHeight()).enhanceWithin();
		$('#infoPageWeight').html(currentInfoScreen.pokemonDetails.getWeight()).enhanceWithin();

		$('#infoPageHP').html(currentInfoScreen.pokemonDetails.getStat(5)).enhanceWithin();
		$('#infoPageAtk').html(currentInfoScreen.pokemonDetails.getStat(4)).enhanceWithin();
		$('#infoPageDef').html(currentInfoScreen.pokemonDetails.getStat(3)).enhanceWithin();
		$('#infoPageSpAtk').html(currentInfoScreen.pokemonDetails.getStat(2)).enhanceWithin();
		$('#infoPageSpDef').html(currentInfoScreen.pokemonDetails.getStat(1)).enhanceWithin();
		$('#infoPageSpd').html(currentInfoScreen.pokemonDetails.getStat(0)).enhanceWithin();

		var types = currentInfoScreen.pokemonDetails.getTypes();
		if (types.length == 1)
		{
			$('#infoPageTypes').html( types[0] ).enhanceWithin();
		}
		else
		{
			$('#infoPageTypes').html( types[1] + ', ' + types[0] ).enhanceWithin();
		}
	}
}

PokemonInfoScreen.prototype.addLeadingZeros = function(num, size)
{
    var s = "00000" + num;
    return s.substr(s.length-size);
}

PokemonInfoScreen.prototype.updateDescriptions = function()
{
	if (currentInfoScreen.pokemonDescriptions != null)
	{
		currentInfoScreen.loadingCheck();
		for (var i = currentInfoScreen.pokemonDescriptions.length - 1; i > 0; i--)
		{
			var selectedDesc = currentInfoScreen.pokemonDescriptions[i];

			// Opgeslagen taal ophalen.
			var savedLanguage = localSettings.loadSetting('languageSetting');

			if (savedLanguage != null)
			{
				// Checken of de taal overeenkomt.
				if (selectedDesc.getLanguage() == savedLanguage)
				{
					currentInfoScreen.displayDescription(selectedDesc);
				}
			}
		}
	}
}

PokemonInfoScreen.prototype.displayDescription = function(description)
{
	$('#infoPageDescription').append( '<p><h3>' + description.getVersion() + ':</h3>' + description.getDescription() + '</p>' ).enhanceWithin();
}

// NOTE: DEBUG CODE - Dit wordt later via de map screen gedaan.
PokemonInfoScreen.prototype.openCatchScreen = function()
{
	var pokemonEntry = pokemonDatabase.getPokemonEntry(this.pokemonID);
	currentCaptureScreen = new PokemonCaptureScreen(pokemonEntry);
}

detailsFetchListener.on('detailsReady', function (event, details) 
{
	// Later checken of de gebruiken op dit moment op de pokemon-info pagina bevindt.
	currentInfoScreen.applyDetails(details);
});

descriptionsFetchListener.on('descriptionsReady', function (event, realID) 
{
	var entry = pokemonDatabase.getPokemonEntry(realID);
	var descriptions = entry.getDescriptions();
	// Later checken of de gebruiken op dit moment op de pokemon-info pagina bevindt.
	currentInfoScreen.applyDescriptions( descriptions );
});