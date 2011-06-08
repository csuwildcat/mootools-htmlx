/*
---

name: FormData
description: A FormData Shim
license: MIT-style license.
authors: Arian Stolwijk
requires: [Core/Object]
provides: FormData

...
*/

(function(FormData){

	if (FormData) return;

	this.FormData = function(){

		var query = {};

		this.append = function(key, value){

			if (key.slice(-2) == '[]'){
				key = key.slice(0, -2);
				(query[key] || (query[key] = [])).push(value);
			} else {
				query[key] = value;
			}

		};

		this.toQueryString = function(){
			return Object.toQueryString(query);
		}

		this.shim = true;

	};

})(this.FormData);
