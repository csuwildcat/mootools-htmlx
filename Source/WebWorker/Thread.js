/*
---

name: Thread

description: An augmented version of the Web Worker API.

license: MIT-style license.

copyright: Copyright (c) 2006-2010 [Valerio Proietti](http://mad4milk.net/).

authors: Daniel Buchner 

inspiration:
  - Programming Motherfucker, as it is the only thing that matters
  
provides: Thread

...
*/

(function(){
	var isWorker;
	try{ window }
	catch(e){ isWorker = true; }
	
	if(!isWorker) {
	
		Thread = new Class({
			
			Implements: [Options, Events, Chain],
			
			options: {
				url: 'js/Thread.js',
				require: null
			},
			
			initialize: function(options){
				this.setOptions(options);
				this.worker = new Worker(this.options.url);
				this.require = Array.from(this.options.require);
				this.attach();
			},
			
			attach: function(){
				this.worker.onerror = function(){ self.fireEvent('error', arguments) };
				this.worker.onmessage = function(msg){
					var data = msg.data;
					this.fireEvent(msg.data.id, msg.data.response)
						.fireEvent('complete', msg.data.response)
						.removeEvents(msg.data.id);
				}.bind(this);
				return this;
			},
			
			send: function(work){
				work.fn = work.fn.toString().replace(/\n/g, '');
				work.arguments = Array.from(work.arguments);
				work.require = this.require;
				work.id = String.uniqueID();
				
				if(work.onComplete) {
					this.addEvent(work.id, work.onComplete);
					delete work.onComplete;
				}

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
			
			postMessage({
				id: work.id,
				response: Function.apply(null, args).apply(this, work.arguments)
			});
		}
	}

})();