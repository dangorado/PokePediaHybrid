var URL_API_ADDRESS = "http://pokeapi.co/api/v2/",
	URL_GET_POKEMON = URL_API_ADDRESS + "pokemon/",
	URL_GET_SPRITE = "http://pokeapi.co/media/sprites/pokemon/",
	URL_GET_DESCRIPTIONS = URL_API_ADDRESS + "pokemon-species/",
	DEFAULT_POKEMON_COUNT = 151,
    DEFAULT_POKEMON_MAX = 721, // Hierna komen er speciale varianten en mega pokemon, etc., die niet dezelfde opmaak volgen
    OFFICIAL_POKEDEX = "http://www.pokemon.com/us/pokedex/";

var PokemonDatabase = function() 
{
	this.pokemonEntries = [];	// Array waar de entries in komen te zitten.
    this.pokemonTeam = [];
}

PokemonDatabase.prototype.initialize = function()
{
    this.retrieveLocalEntries();
    this.retrieveLocalTeamMembers();

    if (this.pokemonEntries.length == 0)
    {
        startLoadingIndicator('Loading Pokémon...');
        this.fetchAdditionalEntries(20); // Dit baseren op grootte scherm?
    }
}

PokemonDatabase.prototype.retrieveLocalEntries = function()
{
    var localEntries = localSettings.loadSetting('pokemonEntries');
    if (localEntries != null)
    {
        console.log('Local database loaded.');
        this.parseLocalEntries( JSON.parse(localEntries) );
    }
}

PokemonDatabase.prototype.saveLocalEntries = function()
{
    var localEntries = JSON.stringify(this.pokemonEntries);
    localSettings.saveSetting('pokemonEntries', localEntries);
}

PokemonDatabase.prototype.getNumberOfEntries = function()
{
	return this.pokemonEntries.length;
}

PokemonDatabase.prototype.retrieveLocalTeamMembers = function()
{
    var localTeamMembers = localSettings.loadSetting('pokemonTeamMembers');
    if (localTeamMembers != null)
    {
        console.log('Local team members loaded.');
        this.parseLocalTeamMembers( JSON.parse(localTeamMembers) );
    }
}

PokemonDatabase.prototype.saveLocalTeamMembers = function()
{
    var localMembers = JSON.stringify(this.pokemonTeam);
    localSettings.saveSetting('pokemonTeamMembers', localMembers);
}

PokemonDatabase.prototype.getPokemonTeam = function()
{
    return this.pokemonTeam;
}

PokemonDatabase.prototype.addPokemonTeamMember = function(entry, nickname)
{
    var teamMember = new PokemonTeamMember(entry.getID(), entry.getName(), nickname);
    this.pokemonTeam.push(teamMember);
    this.saveLocalTeamMembers();
}

// Delete een specifieke team member uit de team member array.
PokemonDatabase.prototype.releasePokemonTeamMember = function(index)
{
    this.pokemonTeam.splice(index, 1);
}

PokemonDatabase.prototype.getPokemonEntry = function(pokemonRealID)
{
    return this.pokemonEntries[pokemonRealID - 1];
}

// Retourneerd een entry's details. Als deze niet gedefineerd zijn retourneerd het NULL.
PokemonDatabase.prototype.getPokemonDetails = function(pokemonRealID)
{
    var pokemonEntry = this.pokemonEntries[pokemonRealID - 1];

    return pokemonEntry.getDetails();
}

// Retourneerd een pokemon entry uit de database, INCLUSIEF de flavor data. Als de data nog gefetched moet worden, dan retourneerd het NULL en begint het met fetchen.
// Als -1 wordt gespecificeert als invoer dan retourneerd het een compleet random pokémon.
PokemonDatabase.prototype.getSpecificEntry = function(pokemonRealID)
{
    var self = this;
    var pokemonIDNumber;

    if (pokemonRealID < 0)
    {
        pokemonIDNumber = Math.floor( ( Math.random() * ( DEFAULT_POKEMON_MAX - 1 ) ) ); 
    }
    else
    {
        pokemonIDNumber = pokemonRealID;
    }

    // Eerst kijken of het uberhaupt binnen de bestaande array valt.
    if (pokemonIDNumber < self.pokemonEntries.length)
    {
        // Nu checken of de data compleet is.
        if ( self.pokemonEntries[pokemonIDNumber].getCaptureRate() != null )
        {
            // Genoeg data beschikbaar, dus retourneer het meteen.
            return self.pokemonEntries[pokemonIDNumber];
        }
        else
        {
            // Species data is niet compleet dus fetch het.
            pokemonDatabase.fetchSpecificEntrySpecies( self.pokemonEntries[pokemonIDNumber] );
        }
    }
    else 
    {
        pokemonDatabase.fetchSpecificEntry(pokemonIDNumber);
    }

    // Laten weten dat er gefetched moet worden via een null return.
    return null;
}

// =======================================================================================================================
// ============================================ Begin van de parsing methodes ============================================
// =======================================================================================================================

// Deze methode parsed json data die een standaard pokemon get bevat; dus dat wil zeggen alleen de naam en detail adres hier in zitten.
PokemonDatabase.prototype.parsePokemonEntryJson = function(json, databaseStartIndex)
{
    var parsedEntries = [];

    // Elke pokemon in de json results afgaan.
    $.each( json.results, function(i, poke)
    {
        var name = poke.name.charAt(0).toUpperCase() + poke.name.slice(1); // De pokemon's naam pakken en capitalizeren.
        var detailsAddress = poke.url; // Adres met de details over de pokemon.
        var entry = new PokemonEntry ( databaseStartIndex + i + 1, name, detailsAddress ); // De entry aan maken. De id wordt bepaald via de offsets.
        parsedEntries.push( entry ); // Entry toevoegen aan de array.
    });

    return parsedEntries; // De array met entries retourneren.
}

// Haalt de details van een pokemon op, en koppelt deze vervolgens aan de opgegeven pokemon entry.
PokemonDatabase.prototype.parsePokemonDetailsJson = function(json, entry)
{
    var realID = json.id;
    var name = json.name;
    name = name.charAt(0).toUpperCase() + name.slice(1); // De pokémon's naam capitalizeren.

    var height = json.height;
    var weight = json.weight;

    var details = new PokemonDetails(realID, name, height, weight); // De details object initializeren.

    var stats = []; // Array voor de stats.

    // Elke stat in de stats array afgaan.
    $.each( json.stats, function(i, statRoot)
    {
        stats.push(statRoot.base_stat); // De stat toevoegen aan de stat array.
    });
    // De stat array toevoegen aan het details object.
    details.addStats(stats);

    var types = []; // Array voor de 1 of 2 types wat de pokemon heeft.

    // Elke stat in de stats array afgaan.
    $.each( json.types, function(i, typeRoot)
    {
        var typeString = typeRoot.type.name; // De base type naam.
        typeString = typeString.charAt(0).toUpperCase() + typeString.slice(1); // De type capitalizeren.
        types.push(typeString); // De type toevoegen aan de type array.
    });
    details.addTypes(types);

    // De boel retourneren.
    entry.setDetails(details);

    return details;
}

// Haalt de "species data" uit de json string, en koppelt deze vervolgens aan de opgegeven pokemon entry.
PokemonDatabase.prototype.parsePokemonDescriptionsJson = function(json, entry)
{
    var realID = json.id;
    
    // Array met alle flavor text entries.
    var descriptions = [];

    // Elke description in de flavor text array afgaan.
    $.each( json.flavor_text_entries, function(i, descRoot)
    {
        var description = descRoot.flavor_text;
        var language = descRoot.language.name;
        var version = descRoot.version.name;
        version = version.charAt(0).toUpperCase() + version.slice(1); // De naam van de version capitalizeren.
        descriptions.push(new PokemonDescription(description, language, version));
    });

    // De descriptions "opslaan" in de desbetreffende entry object.
    entry.setDescriptions(descriptions);

    // De pokemon's catch rate "opslaan".
    var captureRate = json.capture_rate;
    entry.setCaptureRate(captureRate);

    return descriptions;
}

// Verwerkt al bestaande entries. Omdat lokale json data een heel andere opmaak heeft dan de json die online staat, hebben deze 
// aparte methodes hiervoor. Deze methode is de "master" methode voor het parsen van local data, en op het eind laat hij aan een listener weten dat het klaar is.
// NOTE TO SELF: Misschien volgende keer de model klassen direct 1-op-1 transleren van de JSON database entries zodat hiervoor geen aparthe methodes voor nodig zijn
PokemonDatabase.prototype.parseLocalEntries = function(json)
{
    // Voor de closures e.d.
    var self = this;

    var additionalEntries = [];

    // Elke pokemon in de json results afgaan.
    $.each( json, function(i, poke)
    {
        var realID = poke.iRealID;
        var name = poke.strName.charAt(0).toUpperCase() + poke.strName.slice(1);
        var entry = new PokemonEntry( realID, name );

        if ( poke.pokemonDetails != null )
        {
            // Nu ook de opgeslagen detail data ophalen.
            var entryDetails = self.parseLocalDetails( poke.pokemonDetails );
            entry.setDetails(entryDetails);
        }
        if ( poke.pokemonDescriptions != null )
        {
            var entryDescriptions = self.parseLocalDescriptions( poke.pokemonDescriptions );
            entry.setDescriptions(entryDescriptions);
        }
        if ( poke.pokemonCaptureRate != null )
        {
            entry.setCaptureRate( poke.pokemonCaptureRate );
        }
        
        self.pokemonEntries.push( entry );
        additionalEntries.push( entry );
    });

    entryFetchListener.notify( additionalEntries );
}

// Submethode voor het parsen van details.
PokemonDatabase.prototype.parseLocalDetails = function(json)
{
    var realID = json.pokemonId;
    var name = json.name;
    var height = json.height;
    var weight = json.weight;

    var pokemonDetails = new PokemonDetails(realID, name, height, weight);

    if ( json.stats != null  )
    {
        var stats = [];
        $.each( json.stats, function(i, stat) 
        {
            stats.push( stat );
        });
        pokemonDetails.addStats( stats );
    }
    if ( json.types != null )
    {
        var types = [];
        $.each( json.types, function(i, type)
        {
            types.push( type );
        });
        pokemonDetails.addTypes( types );
    }
    
    return pokemonDetails;
}

// Submethode voor het parsen van descriptions.
PokemonDatabase.prototype.parseLocalDescriptions = function(json)
{
    var descriptions = [];

    $.each( json, function(i, descEntry)
    {
        var description = descEntry.description;
        var language = descEntry.language;
        var version = descEntry.version;
        var descriptionEntry = new PokemonDescription(description, language, version);
        descriptions.push(descriptionEntry);
    });

    return descriptions;
}

// De speler's gevangen pokemon ophalen.
PokemonDatabase.prototype.parseLocalTeamMembers = function(json)
{
    // Voor de closures e.d.
    var self = this;

    // Elke pokemon in de json results afgaan.
    $.each( json, function(i, poke)
    {
        var nickname = poke.pokemonNick;
        var pokemonName = poke.pokemonName;
        var pokemonID = poke.pokemonID;

        var teamMember = new PokemonTeamMember(pokemonID, pokemonName, nickname );
        self.pokemonTeam.push( teamMember );
    });
}

// =======================================================================================================================
// ============================================ Einde van de parsing methodes ============================================
// =======================================================================================================================

// Fetched een specifieke entry. Als de entries array niet groot genoeg is maakt deze methode de array groter.
// Nadat de entry gefetched is, wordt het door gepasseerd aan de volgende methode
PokemonDatabase.prototype.fetchSpecificEntry = function(arrayID)
{
    var self = this;
    
    var additionalNeeded = ( arrayID - self.pokemonEntries.length + 1 );
    var jsonAddress = URL_GET_POKEMON + '?limit=' + additionalNeeded + '&offset=' + self.pokemonEntries.length;

    var newEntries = [];

    $.ajax
    ({
        url: jsonAddress,
        dataType: "json",
        async: true,
        success: function (result) 
        {
            newEntries = self.parsePokemonEntryJson(result, self.pokemonEntries.length);
            self.addAdditionalEntries(newEntries, false);
            pokemonDatabase.saveLocalEntries();
            
            // Nu de entry die daadwerkelijk nodig is ophalen en dat dan doorpasseren.
            var theEntry = self.pokemonEntries[ arrayID ];
            pokemonDatabase.fetchSpecificEntrySpecies(theEntry);
        },
        error: function (request, error) 
        {
            alert('Could not connect to the PokeAPI!');
        }
    });
}

// Nadat een specifieke entry gefetched is, haal dan de entry's species data op en laat weten aan de listener wanneer dit klaar is.
PokemonDatabase.prototype.fetchSpecificEntrySpecies = function(entry)
{
    var self = this; // Voor in de ajax call te gebruiken
    var jsonDescAddress = URL_GET_DESCRIPTIONS + entry.getID();

    $.ajax
    ({
        url: jsonDescAddress,
        dataType: "json",
        async: true,
        success: function (result) 
        {
            var descriptions = self.parsePokemonDescriptionsJson(result, entry);
            specificEntryFetchListener.notify(entry);
        },
        error: function (request, error) 
        {
            alert('Could not connect to the PokeAPI!');
        }
    });
}

// Fetched een hoeveelheid pokemon op van de JSON database. Ze worden op volgorde bovenop de bestaande entries array gezet.
PokemonDatabase.prototype.fetchAdditionalEntries = function(amountToAdd)
{
    var self = this;

    var amount = amountToAdd;

    // Algorithme kan misschien niet kloppen bij de max
    // console.log('if ( ' + self.pokemonEntries.length + ' + ' + amountToAdd + ' + 1 ) > ' + DEFAULT_POKEMON_MAX);

    // Checken of er boven de maximale aantal pokemon aangevraagd wordt.
    if ( (self.pokemonEntries.length + amountToAdd + 1) > DEFAULT_POKEMON_MAX )
    {
        amountToAdd = DEFAULT_POKEMON_MAX - self.pokemonEntries.length + amountToAdd + 1;
    }

    var newEntries = [];

    // De maximum is bereikt.
    if (amountToAdd < 1)
    {
        // Lege array terug sturen.
        entryFetchListener.notify(newEntries);
        return;
    }

    // Als bovenstaande niet het geval is, gewoon door gaan.
    var jsonAddress = URL_GET_POKEMON + '?limit=' + amount + '&offset=' + self.pokemonEntries.length;

    $.ajax
    ({
        url: jsonAddress,
        dataType: "json",
        async: true,
        success: function (result) 
        {
            newEntries = self.parsePokemonEntryJson(result, self.pokemonEntries.length);
            self.addAdditionalEntries(newEntries, true);
        },
        error: function (request, error) 
        {
            alert('Could not connect to the PokeAPI!');
        }
    });
}

// Voegt de nieuwe entries toe aan de database en laat aan de listener weten dat de data klaar is voor gebruik.
PokemonDatabase.prototype.addAdditionalEntries = function(newEntries, notifyListener)
{
	// Voor de closures e.d.
	var self = this;

    // De entries in de database's array zetten.
    for (var i = 0; i < newEntries.length; i++)
    {
        self.pokemonEntries.push( newEntries[i] );
    }

    if (notifyListener)
    {
        // Aan de listener doorgeven dat het klaar is met laden, en verder de nieuwe entries doorgeven.
        entryFetchListener.notify(newEntries);
    }
}

// Retourneerd een hoeveelheid database entries gebaseerd op hoeveel er missen in de html pagina list.
PokemonDatabase.prototype.getMissingEntries = function(currentNumberOfEntriesInHtml)
{
	// Voor de closures e.d.
	var self = this;
	var missingEntries = [];

	// Voor de zekerheid maar checken.
	if (currentNumberOfEntriesInHtml < self.pokemonEntries.length)
	{
		for (var i = currentNumberOfEntriesInHtml; i < self.pokemonEntries.length; i++)
		{
			missingEntries.push( self.pokemonEntries[i] );
		}
	}
    
	return missingEntries;
}

// Fetched de pokemon details asynchroon. Dit kan lang duren, dus laat een prompt zien.
PokemonDatabase.prototype.fetchPokemonDetails = function(pokemonRealID)
{
	var self = this; // Voor in de ajax call te gebruiken
	var jsonDetailsAddress = URL_GET_POKEMON + pokemonRealID;

    var pokemonEntry = this.pokemonEntries[pokemonRealID - 1];

	$.ajax
	({
        url: jsonDetailsAddress,
        dataType: "json",
        async: true,
        success: function (result) 
        {
            var details = self.parsePokemonDetailsJson(result, pokemonEntry);
            detailsFetchListener.notify(details);
        },
        error: function (request, error) 
        {
            alert('Could not connect to the PokeAPI!');
        }
    });
}

// Fetched de pokemon descriptions en catch rate asynchroon. Dit kan lang duren, dus laat een prompt zien.
PokemonDatabase.prototype.fetchPokemonSpeciesData = function(pokemonRealID)
{
    var self = this; // Voor in de ajax call te gebruiken
    var jsonDescAddress = URL_GET_DESCRIPTIONS + pokemonRealID;

    var pokemonEntry = this.pokemonEntries[pokemonRealID - 1];

    $.ajax
    ({
        url: jsonDescAddress,
        dataType: "json",
        async: true,
        success: function (result) 
        {
            var descriptions = self.parsePokemonDescriptionsJson(result, pokemonEntry);
            descriptionsFetchListener.notify(pokemonRealID);
        },
        error: function (request, error) 
        {
            alert('Could not connect to the PokeAPI!');
        }
    });
}

// Event Listener functions
var eventInterface = 
{
    on: function(event, cb) 
    {
        $(this).on(event, cb);
    },
    trigger: function (event, args) 
    {
        $(this).trigger(event, args);
    }
};

var entryFetchListener =
{
	notify: function (entries) 
    {
        this.trigger('entriesReady', entries);
        pokemonDatabase.saveLocalEntries();
    }
};

var detailsFetchListener = 
{
    notify: function (details) 
    {
        this.trigger('detailsReady', details);
        pokemonDatabase.saveLocalEntries();
    }
};

var descriptionsFetchListener = 
{
    notify: function (realID) 
    {
        this.trigger('descriptionsReady', realID);
        pokemonDatabase.saveLocalEntries();
    }
};

var specificEntryFetchListener =
{
    notify: function (entry)
    {
        this.trigger('specificEntryReady', entry);
        pokemonDatabase.saveLocalEntries();
    }
};

// De listeners extenden.
$.extend(entryFetchListener, eventInterface);
$.extend(detailsFetchListener, eventInterface);
$.extend(descriptionsFetchListener, eventInterface);
$.extend(specificEntryFetchListener, eventInterface);