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
	
		this.Thread = new Class({
			
			Implements: [Options, Events, Chain],
			
			options: {
				file: 'Thread',
				require: null
			},
			
			initialize: function(options){
				this.setOptions(options);
				this.setUrl();
				this.worker = new Worker(this.url);
				this.require = Array.from(this.options.require);
				this.attach();
			},
			
			setUrl: function(){
				var self = this, sources = $$('script').get('src').clean();
				this.url = sources.each(function(e, i, a){
					if(e.split('.js')[0].split('/').getLast() == self.options.file) a[0] = sources[i];
				})[0];
				return this;
			},
			
			attach: function(){
				var self = this;
				this.worker.onerror = function(){
					self.fireEvent('error', arguments)
				};
				this.worker.onmessage = function(msg){
					var data = msg.data;
					self.fireEvent(data.id, data.response)
						.fireEvent('complete', data.response)
						.removeEvents(data.id);
				};
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
		
		Function.implement('thread', function(options){
			var self = this, thread = new Thread(options);

			return function(){
				thread.send({
					fn: self,
					arguments: arguments
				});
			};
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