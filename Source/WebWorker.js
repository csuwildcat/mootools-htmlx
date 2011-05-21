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
			
			Implements: [Events, Options],
			
			options: {
				url: 'WebWorker.js',
				require: null
			},
			
			initialize: function(options){
				thread = this;
				this.setOptions(options);
				this.require = Array.from(this.options.require);
				this.worker = new Worker(this.options.url);
				['message', 'error'].each(function(type){
					thread.worker['on' + type] = function(){ thread.fireEvent(type, arguments) };
				});
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
		
		onmessage = function(msg){
			var work = msg.data,
				fn = work.fn,
				args = fn.split('(')[1].split(')')[0].replace(/\s/g,'').split(',') || [];
			
			if(work.require.length) importScripts.apply(this, work.require);
			
			args.push(fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}')));
			
			postMessage(
				Function.apply(null, args).apply((typeof work.bind != 'undefined') ? work.bind : this, work.arguments)
			);
		}
		
		onerror = function(event){ throw event.data }
		
	}

})();
