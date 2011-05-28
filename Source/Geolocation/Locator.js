/*
---

name: Locator

description: An augmented version of the Web Worker API.

license: MIT-style license.

copyright: Copyright (c) 2006-2010 [Valerio Proietti](http://mad4milk.net/).

authors: Daniel Buchner 

inspiration:
  - Programming Motherfucker, as it is the only thing that matters
  
provides: Locator

...
*/

var Locator = new Class({
			
	Implements: [Options, Events],
	
	Binds: ['update', 'error'],
	
	options: {
		watch: false,
		autostart: false,
		position: {
			enableHighAccuracy: false,
			timeout: 30000,
			maximumAge: 120000 
		}
	},
	
	initialize: function(options){
		this.setOptions(options);
		this.geo = navigator.geolocation;
		this.errors = { 0: 'error', 1: 'denied', 2: 'unavailable', 3: 'timeout' };
		this.location = {};
		if(this.options.autostart) this[(this.options.watch) ? 'watch' : 'getPosition']();
	},
	
	getPosition: function(){
		this.geo.getCurrentPosition(this.update, this.error, this.options.position);
		return this;
	},
	
	watch: function(){
		this.watchID = this.geo.watchPosition(this.update, this.error, this.options.position);
		return this;
	},
	
	update: function(position){
		this.location = position;
		this.fireEvent('change', position);
		return this
	},
	
	error: function(error){
		this.fireEvent(this.errors[error.code], error);
		return this;
	},
	
	clear: function(){
		if(this.watchID || this.watchID == 0) this.geo.clearWatch(this.watchID);
		return this;
	}
	
});