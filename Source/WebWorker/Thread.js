/*
---

name: Thread

description: An augmented version of the Web Worker API.

license: MIT-style license.

authors: Daniel Buchner 

inspiration:
  - Programming Motherfucker, as it is the only thing that matters

provides: Thread

...
*/

(function(){

this.Thread = new Class({

	Implements: [Options, Events, Chain],

	options: {
		url: 'js/Thread.Worker.js',
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

		Object.merge({
			require: this.require,
			id: String.uniqueID()
		}, work, {
			fn: work.fn.toString().replace(/\n/g, ''),
			arguments: Array.from(work.arguments),
		});

		if (work.onComplete) {
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

})();