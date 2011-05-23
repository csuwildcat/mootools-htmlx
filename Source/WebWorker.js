/*
---

name: WebWorker

description: An augmented version of the Web Worker API.

license: MIT-style license.

copyright: Copyright (c) 2006-2010 [Valerio Proietti](http://mad4milk.net/).

authors: Daniel Buchner 

inspiration:
  - Programming Motherfucker, as it is the only thing that matters
  
provides: WebWorker

...
*/

(function(){
	var isWorker;
	try{ window }
	catch(e){ isWorker = true; }
	
	if(!isWorker) {
		
		WebWorker = new Class({
			
			Implements: [Options, Events],
			
			options: {
				url: 'WebWorker.js',
				require: null
			},
			
			initialize: function(options){
				this.setOptions(options);
				this.worker = new Worker(this.options.url);
				this.require = Array.from(this.options.require);
				this.attach();
			},
			
			attach: function(){
				var self = this;
				this.worker.onerror = function(){ self.fireEvent('error', arguments) };
				this.worker.onmessage = function(obj){ self.fireEvent('complete', obj.data) };
			},
			
			send: function(work){
				work.fn = work.fn.toString();
				work.arguments = Array.from(work.arguments);
				work.require = this.require;
				this.worker.postMessage(work);
				return this;
			},
			
			cancel: function(){
				this.worker.terminate();
				return this;
			}
			
		});
		
	}
	else {
		onerror = function(event){ throw event.data };
		onmessage = function(msg){
			var work = msg.data,
				fn = work.fn,
				args = fn.split('(')[1].split(')')[0].replace(/\s/g,'').split(',') || [];
				
			args.push(fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}')));
			if(work.require.length) importScripts.apply(this, work.require);	
			postMessage(
				Function.apply(null, args).apply((typeof work.bind != 'undefined') ? work.bind : this, work.arguments)
			);
		}	
	}

})();