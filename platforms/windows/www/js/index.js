/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var pokemonDatabase;

var app = 
{
    // Application Constructor
    initialize: function() 
    {
        pokemonDatabase = new PokemonDatabase();  
        localSettings = new LocalSettings();    
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() 
    {
        // De database initialiseren. Deze wordt op veel plekken in de app gebruikt, dus daarom gebeurd dit voor de device ready event.
        pokemonDatabase.initialize();

        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() 
    {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) 
    {
        app.addSwipeNavigation();
        console.log('Received Event: ' + id);
    },
    // Voegt swipe navigatie door de history toe. Werkt nog niet helemaal goed
    addSwipeNavigation: function()
    {
        $(document).on('swipeleft', '.ui-page', function(event)
        {
            if(event.handled !== true) // Voorkomen dat hij meerdere keren tegelijk triggered.
            {
                var nextpage = $.mobile.activePage.next('[data-role="page"]');

                if (nextpage.length > 0) 
                {
                    $.mobile.changePage(nextpage, {transition: "slide", reverse: false}, true, true);
                }
                event.handled = true;
            }
            return false;         
        });

        $(document).on('swiperight', '.ui-page', function(event)
        {
            if(event.handled !== true) // Voorkomen dat hij meerdere keren tegelijk triggered.
            {
                var prevpage = $(this).prev('[data-role="page"]');

                if (prevpage.length > 0) 
                {
                    $.mobile.changePage(prevpage, {transition: "slide", reverse: true}, true, true);
                }
                event.handled = true;
            }
            return false;            
        });
    }
};

var startLoadingIndicator = function(loadingText)
{
    // Een laad dialog laten zien, om te laten weten dat er data opgehaald moet worden.
    $.mobile.loading("show", 
        {
            text: loadingText,
            textVisible: true
        }
    );
};

var stopLoadingIndicator = function()
{
    // De laad dialoog verbergen.
    $.mobile.loading("hide", null);
};