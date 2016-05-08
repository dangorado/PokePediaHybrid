var currentSettingsScreen;

var SettingsScreen = function() 
{
	currentSettingsScreen = this;
	this.initialize();
}

SettingsScreen.prototype.initialize = function()
{
	this.bindEvents();
	var savedLanguage = localSettings.loadSetting('languageSetting');

	if (savedLanguage != null)
	{
		this.setLanguage(savedLanguage);
	}
	else
	{
		localSettings.saveSetting('languageSetting', 'en');
	}
}

SettingsScreen.prototype.setLanguage = function(language)
{
	$('#radiolanguage-' + language).prop('checked', true);
}

SettingsScreen.prototype.languageSelected = function(selectedLanguage)
{
	localSettings.saveSetting('languageSetting', selectedLanguage);
}



SettingsScreen.prototype.bindEvents = function()
{
	$("input[type='radio']").bind( "change", function(event, ui) 
	{
		currentSettingsScreen.languageSelected( $(this).val() );
	});
}