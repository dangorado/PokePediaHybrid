var currentPokedex;
var currentPokedexDetails;

var Pokedex = function() 
{
    currentPokedex = this;
    currentPokedex.bindEvents();
};

Pokedex.prototype.bindEvents = function()
{
    document.addEventListener('deviceready', currentPokedex.onDeviceReady, false);
};

Pokedex.prototype.onDeviceReady = function()
{
    currentPokedex.receivedEvent('deviceready');
};

Pokedex.prototype.receivedEvent = function(id)
{
    // Listener op het scrollen toevoegen.
    $(document).on('scrollstop', currentPokedex.pokedexListScrollCheck);
    // Listener toevoegen die activeert wanneer de pagina klaar is met laden.
    $(document).on('pagebeforeshow', currentPokedex.initializePokedexPage );
    // Listener toevoegen om de laad indicator te laten zien.
    $(document).on('pagebeforeshow', currentPokedex.showLoadingIndicator );
};

Pokedex.prototype.initializePokedexPage = function()
{
    currentPokedex.updatePokedexPage();
};

// Laat een loading indicator zien.
Pokedex.prototype.showLoadingIndicator = function()
{
    var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");

    // Eerst kijken of de gebruiker zich uberhaupt op de pokedex pagina bevindt.
    if (activePage[0].id == "pokedexPage")
    {
        startLoadingIndicator('Loading Pokémon...');
    }
}

// Handler function voor wanneer een "scrollstop" gedetecteerd is.
Pokedex.prototype.pokedexListScrollCheck = function() 
{
    var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");

    // Eerst kijken of de gebruiker zich uberhaupt op de pokedex pagina bevindt.
    if (activePage[0].id == "pokedexPage")
    {
        // Hoogte van het scherm.
        var screenHeight = $.mobile.getScreenHeight();
        // De content div hoogte inclusief padding.
        var contentHeight = $(".ui-content", activePage).outerHeight(),
        // Hoogte van het gescrollde content.
        scrolled = $(window).scrollTop(),
        // Hoogte van de header. De -1 kan misschien overbodig zijn.
        header = $(".ui-header", activePage).outerHeight() - 1,
        // Kijken of het einde van de al geladen content bereikt is.
        scrollEnd = contentHeight - screenHeight + header;
        // Meer content inladen wanneer de bodem van de list bereikt is.
        if (scrolled >= scrollEnd) 
        {
            currentPokedex.pokedexAddEntries();
        }  
    }
};

Pokedex.prototype.pokedexAddEntries = function() 
{
    // Een laad dialog laten zien, om te laten weten dat er meer entries opgehaald worden.
    currentPokedex.showLoadingIndicator();

    // De scrollstop event listener tijdelijk weghalen, anders blijft hij pokémon ophalen als de gebruiker blijft scrollen.
    $(document).off("scrollstop");

    // NOTE: De entries hoeveelheid baseren op contentHeight later
    pokemonDatabase.fetchAdditionalEntries(20);

    this.updatePokedexPage();

    // Na het laden de event listener weer toepassen.
    $(document).on("scrollstop", currentPokedex.pokedexListScrollCheck);
};

// Checked of de gebruiker zich op dit moment op de pokedex pagina bevindt. Zo ja, update dan de inhoud.
Pokedex.prototype.updatePokedexPage = function()
{
    var currentPage = $.mobile.pageContainer.pagecontainer("getActivePage");

    // Eerst kijken of de gebruiker zich uberhaupt op de pokedex pagina bevindt.
    if (currentPage[0].id == "pokedexPage")
    {
        this.addMissingEntries(currentPage);
    }

    // De laad dialoog verbergen.
    stopLoadingIndicator();
};

// Vult de lijst op de "pagina" met de ontbrekende pokemon entries die in de database staan.
Pokedex.prototype.addMissingEntries = function(page)
{
    var listEntries = $("li", page).length;
    var missingEntries = pokemonDatabase.getMissingEntries(listEntries);

    for (var i = 0; i < missingEntries.length; i++) 
    {
        var realID = missingEntries[i].getID();
        var pokemonName = missingEntries[i].getName();
        // De list item opmaken met de link naar de pokedex detail scherm.
        $('#pokemonList').append('<li><a href="pokemon-info.html" onclick=currentPokedex.openPokemonInfoPage(' + realID + ') data-transition="slide"><img src="' + URL_GET_SPRITE + realID + '.png"/><h3>' + pokemonName + '</h3></a></li>');
    };
    
    $('#pokemonList').listview('refresh');
};

// Opent de pokemon detail pagina.
Pokedex.prototype.openPokemonInfoPage = function(pokemonRealID)
{
    // Naam ophalen. Had het eerst in de onclick link maar hij vond het niet leuk dat ik meerdere arguments had?
    var pokemonName = pokemonDatabase.getPokemonEntry(pokemonRealID).getName();

    // De huidige infoScreen object clearen.
    currentInfoScreen = new PokemonInfoScreen(pokemonName, pokemonRealID);

    // Kijken of er al details/etc. gefetched waren.
    var details = pokemonDatabase.getPokemonDetails(pokemonRealID);
    var descriptions = pokemonDatabase.getPokemonEntry(pokemonRealID).getDescriptions();

    // Standaard interface dingen pre-loaden.
    currentInfoScreen.preloadInterface();
    
    // Kijken of de data al opgehaald was. Zo niet, doe dat dan nu. Anders gewoon de bestaande data toepassen op de page.
    if (details == null)
    {
        console.log('Fetching new details...');
        pokemonDatabase.fetchPokemonDetails(pokemonRealID);
    }
    else
    {
        currentInfoScreen.applyDetails(details);
    }

    if (descriptions == null)
    {
        console.log('Fetching descriptions...');
        pokemonDatabase.fetchPokemonDescriptions(pokemonRealID);
    }
    else
    {
        currentInfoScreen.applyDescriptions(descriptions);
    }
};

Pokedex.prototype.updatePokemonDetails = function(newDetails)
{
    currentPokedexDetails = newDetails;
};

entryFetchListener.on('entriesReady', function (event, details) 
{
    if (currentPokedex != null)
    {
        currentPokedex.updatePokedexPage();
    }
});
