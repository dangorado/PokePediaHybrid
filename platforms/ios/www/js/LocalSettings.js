var localSettings;

var LocalSettings = function() 
{
	console.log('Local settings ready.');
}

LocalSettings.prototype.loadSetting = function(key)
{
	return window.localStorage.getItem(key);
}

LocalSettings.prototype.saveSetting = function(key, value)
{
	window.localStorage.setItem(key, value);
}