/*
---

name: Thread.Worker

description: An augmented version of the Web Worker API.

license: MIT-style license.

authors: Daniel Buchner

inspiration:
  - Programming Motherfucker, as it is the only thing that matters

provides: Thread

...
*/


this.onerror = function(event){
	throw event.data
};

this.onmessage = function(msg){
	var work = msg.data,
		fn = work.fn,
		args = fn.split('(')[1].split(')')[0].replace(/\s/g,'').split(',') || [];

	args.push(fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}')));

	if (work.require.length) importScripts.apply(this, work.require);

	postMessage({
		id: work.id,
		response: Function.apply(null, args).apply(this, work.arguments)
	});
};
