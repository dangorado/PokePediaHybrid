var URL_API_ADDRESS = "http://pokeapi.co/api/v2/",
	URL_GET_POKEMON = URL_API_ADDRESS + "pokemon/",
	URL_GET_SPRITE = "http://pokeapi.co/media/sprites/pokemon/",
	URL_GET_DESCRIPTIONS = URL_API_ADDRESS + "pokemon-species/",
	DEFAULT_POKEMON_COUNT = 151,
    OFFICIAL_POKEDEX = "http://www.pokemon.com/us/pokedex/";
var iPokemonCount = DEFAULT_POKEMON_COUNT; // Dit wordt later overschreven via een fetch van de JSON database.

var PokemonDatabase = function() 
{
	this.pokemonEntries = [];	// Array waar de entries in komen te zitten.
};

PokemonDatabase.prototype.initialize = function()
{
    this.retrieveLocalEntries();

    if (this.pokemonEntries.length == 0)
    {
        startLoadingIndicator('Loading Pokémon...');
        this.fetchAdditionalEntries(20); // Dit baseren op grootte scherm?
    }
};

PokemonDatabase.prototype.retrieveLocalEntries = function()
{
    var localEntries = localSettings.loadSetting('pokemonEntries');
    if (localEntries != null)
    {
        console.log('Local database loaded.');
        this.parseLocalEntries( JSON.parse(localEntries) );
    }
};

PokemonDatabase.prototype.saveLocalEntries = function()
{
    var localEntries = JSON.stringify(this.pokemonEntries);
    localSettings.saveSetting('pokemonEntries', localEntries);
};

// Accessor methode
PokemonDatabase.prototype.getNumberOfEntries = function()
{
	return this.pokemonEntries.length;
};

// Fetched een hoeveelheid pokemon op van de JSON database. Ze worden op volgorde bovenop de bestaande entries array gezet.
PokemonDatabase.prototype.fetchAdditionalEntries = function(amount)
{
	var self = this;
	var jsonAddress = URL_GET_POKEMON + '?limit=' + amount + '&offset=' + self.pokemonEntries.length;
	console.log('Fetching with address: ' + jsonAddress);

	$.ajax
	({
        url: jsonAddress,
        dataType: "json",
        async: true,
        success: function (result) 
        {
            self.parseAdditionalEntries(result, self.pokemonEntries.length);
        },
        error: function (request, error) 
        {
            alert('Could not connect to the PokeAPI!');
        }
    });
};

// Verwerkt al bestaande entries.
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
        
        self.pokemonEntries.push( entry );
        additionalEntries.push( entry );
    });

    entryFetchListener.notify(additionalEntries);
};

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
};

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
};


// Verwerkt de entries en geeft daarna door aan de listener dat het klaar is.
PokemonDatabase.prototype.parseAdditionalEntries = function(json, offset)
{
	// Voor de closures e.d.
	var self = this;

	var additionalEntries = [];

	// De pokemon count updaten indien nodig.
	if (iPokemonCount == DEFAULT_POKEMON_COUNT)
	{
		iPokemonCount = json.count;
	};

	// Elke pokemon in de json results afgaan.
    $.each( json.results, function(i, poke)
    {
        // console.log(JSON.stringify(poke));
        var name = poke.name.charAt(0).toUpperCase() + poke.name.slice(1);
        var entry = new PokemonEntry ( offset + i + 1, name );
        self.pokemonEntries.push( entry );
        additionalEntries.push( entry );
    });
    // Aan de listener doorgeven dat het klaar is met laden, en verder de nieuwe entries doorgeven.
    entryFetchListener.notify(additionalEntries);
};

// Retourneerd een hoeveelheid database entries gebaseerd op hoeveel er missen in de html pagina list.
PokemonDatabase.prototype.getMissingEntries = function(currentNumberOfEntries)
{
	// Voor de closures e.d.
	var self = this;
	var missingEntries = [];

	// Voor de zekerheid maar checken.
	if (currentNumberOfEntries < self.pokemonEntries.length)
	{
		for (var i = currentNumberOfEntries; i < self.pokemonEntries.length; i++)
		{
			missingEntries.push( self.pokemonEntries[i] );
		}
	}
    

	return missingEntries;
};

PokemonDatabase.prototype.getPokemonEntry = function(pokemonRealID)
{
    return this.pokemonEntries[pokemonRealID - 1];
}

/*
 *	De pokemon detail stuff begint hier:
 */
// Retourneerd de entry's details. Als deze niet gedefineerd zijn retourneerd het NULL.
PokemonDatabase.prototype.getPokemonDetails = function(pokemonRealID)
{
	var pokemonEntry = this.pokemonEntries[pokemonRealID - 1];

	return pokemonEntry.getDetails();
};

// Fetched de pokemon details asynchroon. Dit kan lang duren, dus laat een prompt zien.
PokemonDatabase.prototype.fetchPokemonDetails = function(pokemonRealID)
{
	var self = this; // Voor in de ajax call te gebruiken
	var jsonDetailsAddress = URL_GET_POKEMON + pokemonRealID;
	console.log('Fetching details with address: ' + jsonDetailsAddress);

	$.ajax
	({
        url: jsonDetailsAddress,
        dataType: "json",
        async: true,
        success: function (result) 
        {
            self.parsePokemonDetails(result);
        },
        error: function (request, error) 
        {
            alert('Could not connect to the PokeAPI!');
        }
    });
};

// Fetched de pokemon descriptions asynchroon. Dit kan lang duren, dus laat een prompt zien.
PokemonDatabase.prototype.fetchPokemonDescriptions = function(pokemonRealID)
{
    var self = this; // Voor in de ajax call te gebruiken
    var jsonDescAddress = URL_GET_DESCRIPTIONS + pokemonRealID;
    console.log('Fetching flavor text with address: ' + jsonDescAddress);

    $.ajax
    ({
        url: jsonDescAddress,
        dataType: "json",
        async: true,
        success: function (result) 
        {
            self.parsePokemonDescriptions(result);
        },
        error: function (request, error) 
        {
            alert('Could not connect to the PokeAPI!');
        }
    });
};

// Verwerkt de details json.
PokemonDatabase.prototype.parsePokemonDetails = function(json)
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
        // console.log(JSON.stringify(statRoot.base_stat));
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

    // De details "opslaan".
    this.pokemonEntries[realID - 1].setDetails(details);

    // Aan de listener weten dat de data klaar is om gebruikt te worden.
    detailsFetchListener.notify(details);
};

// Verwerkt de descriptions json.
PokemonDatabase.prototype.parsePokemonDescriptions = function(json)
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
    // De descriptions "opslaan".
    this.pokemonEntries[realID - 1].setDescriptions(descriptions);

    // De pokemon's catch rate ophalen.
    var captureRate = json.capture_rate;
    // De pokemon's catch rate "opslaan".
    this.pokemonEntries[realID - 1].setCaptureRate(captureRate);

    // Aan de listener weten dat de data klaar is om gebruikt te worden.
    descriptionsFetchListener.notify( realID );
};

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

// De listeners extenden.
$.extend(entryFetchListener, eventInterface);
$.extend(detailsFetchListener, eventInterface);
$.extend(descriptionsFetchListener, eventInterface);