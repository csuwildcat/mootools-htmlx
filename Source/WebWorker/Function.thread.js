/*
---

name: Function.thread

description: An augmented version of the Web Worker API.

license: MIT-style license.

copyright: Copyright (c) 2006-2010 [Valerio Proietti](http://mad4milk.net/).

authors: Daniel Buchner 

inspiration:
  - Programming Motherfucker, as it is the only thing that matters
  
provides: Function.thread

...
*/

Function.implement({
	thread: function(options){
		var self = this,
			thread = new Thread(options);
			
		return function(){
			thread.send({
				fn: self,
				arguments: arguments
			});
		}
	}
});