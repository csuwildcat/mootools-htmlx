/*
---

name: MediaQuery

description: A JavaScript API for testing and interacting with CSS Media Queries

license: MIT-style license.

copyright: Copyright (c) 2006-2010 [Valerio Proietti](http://mad4milk.net/).

authors: Daniel Buchner 

inspiration:
  - Programming Motherfucker, as it is the only thing that matters
  
provides: MediaQuery

...
*/

var MediaQuery = new Class({
			
	Implements: [Options, Events],
	
	options: {
		queries: []
	},
	
	initialize: function(options){
		this.setOptions(options);
		
		this.results = {};
		this.sheet = document.id('media_query_element') || new Element('style', {
			id: 'media_query_element',
			text: '#media_query_element{ z-index: 0; }'
		}).inject(document.head);
		
		Object.each(this.options.queries, function(v, k){
           		this.test(k, v);
        	}, this);
	},
	
	test: function(expression, fn){
		this.sheet.set('media', expression);
		var result = this.results[expression] = this.sheet.getStyle('z-index') == 0;
		this.sheet.set('media', '');
		
		if(fn && result) fn(expression);
		
		return this.results[expression];
	}
	
});