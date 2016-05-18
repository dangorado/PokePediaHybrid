var INT_CATCHER_ESCAPE_THRESHOLD = 70, 	// Dit + de herberkende pokemon catch rate maken de kans dat een pokémon NIET vlucht. Dus als er BOVEN dit nummer wordt gerold, dan vlucht het.
	INT_CATCHER_ESCAPE_DIVIDER = 8, 	// De capture rate delen door dit getal, + het bovengenoemde threshold getal geeft de kans dat een pokémon blijft.
	INT_CATCHER_ANNOYANCE_CHANCE = 50,	// De kans in procent dat een pokémon geirriteerd raakt na het gooien van een rock. Dit maakt de kans dat de pokemon weg gaat hoger.
	INT_CATCHER_VARIANCE_MIN = 5,
	INT_CATCHER_VARIANCE_MAX = 10,		// <-- Deze drie bepalen de variatie van de random nummer generator die hier gebruikt wordt.
	INT_CATCHER_VARIANCE_STATIC = 5,
	INT_CATCHER_BASE_BALL_COUNT = 3,	// <-- Basis hoeveelheid ballen/lokaas dat de speler krijgt.
	INT_CATCHER_BASE_BAIT_COUNT = 6,
	INT_CATCHER_CATCH_RNG_MAX = 280;	// De maximum nummer dat de rng kan rollen bij het catchen van een pokemon. Hoe hoger dit getal, hoe lager de kans. 280 = ~90% kans als de poke een catchrate heeft van 255.

var pokemonCatcher;

var PokemonCatcher = function() 
{
	this.wildPokemon;
	this.iCurrentCaptureRate;
	this.iCurrentEscapeRate;
	this.iBaitCount;
	this.iBallCount;
}

// Accessors
PokemonCatcher.prototype.getBallCount = function()
{
	return this.iBallCount;
}

PokemonCatcher.prototype.getBaitCount = function()
{
	return this.iBaitCount;
}

// Initialiseerd een nieuwe "catch session".
PokemonCatcher.prototype.initialize = function(pokemonEntry)
{
	// NOTE: Iets doen voor als de pokemon's species data (en dus capture rate) nog niet ingeladen is.
	this.wildPokemon = pokemonEntry;
	this.iCurrentCaptureRate = pokemonEntry.getCaptureRate();
	this.iCurrentEscapeRate = this.calculateBaseEscapeChance(this.iCurrentCaptureRate);
	this.iBaitCount = INT_CATCHER_BASE_BAIT_COUNT;
	this.iBallCount = INT_CATCHER_BASE_BALL_COUNT;
}

PokemonCatcher.prototype.calculateBaseEscapeChance = function(captureRate)
{
	var escapeChance = INT_CATCHER_ESCAPE_THRESHOLD + captureRate / INT_CATCHER_ESCAPE_DIVIDER;
	return escapeChance;
}

// Kijken of de pokemon wegvlucht of niet.
PokemonCatcher.prototype.escapeCheck = function()
{
	var randomNumber = Math.floor( ( Math.random() * 100 ) ); // Genereert een nummer tussen 0 en 100;

	if ( randomNumber > this.iCurrentEscapeRate )
	{
		return true;
	}
	
	return false;
}

PokemonCatcher.prototype.throwItem = function(isRock)
{
	var randomNumber = Math.floor( ( Math.random() * 100 ) ); // Genereert een nummer tussen 0 en 100;
	var becameAnnoyed = false;

	// Als het een steen was, heb je een kans dat de pokemon sneller zal wegvluchten.
	if (isRock)
	{
		var annoyanceNumber = Math.floor( ( Math.random() * 100 ) );
		if (annoyanceNumber < INT_CATCHER_ANNOYANCE_CHANCE)
		{
			becameAnnoyed = true;
			this.iCurrentEscapeRate += this.getRateBonus(true);
		}
	}
	else
	{
		// Bait gegooid.
		this.iBaitCount--;
		// Bait maakt de kans juist hoger dat de pokemon blijft.
		this.iCurrentEscapeRate += this.getRateBonus(false);
	}

	// Ongeacht de gebruikte item, de capture rate wordt verhoogd.
	this.iCurrentCaptureRate += this.getRateBonus(false);

	return becameAnnoyed;
}

// Retourneerd of de pokemon succesvul gevangen was of niet.
PokemonCatcher.prototype.throwPokeball = function()
{
	// Bal gegooid.
	this.iBallCount--;

	var catchRN = Math.floor( ( Math.random() * INT_CATCHER_CATCH_RNG_MAX ) );

	if (catchRN < this.iCurrentCaptureRate )
	{
		return true; // De pokémon is gevangen!
	}

	return false;
}

// Geeft een nieuw nummer terug tussen de opgegeven waardes. Kan ook een negatief nummer retourneren als isPenalty = true.
PokemonCatcher.prototype.getRateBonus = function(isPenalty)
{
	var randomNumber;
	// Geeft een random nummer terug wat tussen de min en de max ligt + de statische bonus erbij.
	randomNumber = Math.floor( ( Math.random() * (INT_CATCHER_VARIANCE_MAX - INT_CATCHER_VARIANCE_MIN) + INT_CATCHER_VARIANCE_MIN ) + INT_CATCHER_VARIANCE_STATIC );

	if (isPenalty)
	{
		// Maakt de "bonus" negatief.
		randomNumber = randomNumber - randomNumber * 2; // om één of andere reden lukt het niet als ik simpelweg * -1 doe...
	}

	return randomNumber;
}

// De pokemon is gevangen, voeg het toe aan de speler's team.
PokemonCatcher.prototype.pokemonCaught = function(nickname)
{
	pokemonDatabase.addPokemonTeamMember(this.wildPokemon, nickname);
}