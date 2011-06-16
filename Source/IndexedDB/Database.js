/*
---

name: Database

description: An augmented version of the IndexedDB API.

license: MIT-style license.

copyright: Copyright (c) 2006-2010 [Valerio Proietti](http://mad4milk.net/).

authors: Daniel Buchner 

inspiration:
  - Programming Motherfucker, as it is the only thing that matters
  
provides: Database

...
*/

IDBObjectStore.extend = Object.extend;

new Type('IDBObjectStore', IDBObjectStore);

IDBObjectStore.implement(new Chain).implement({
		store: function(data){
			this.put((typeof data == 'function') ? data.call(this) : data);
			return this;
		},
		
		retrieve: function(key, fn){
			var self = this;
			this.get(key).onsuccess = function(event){
				fn.call(self, event, event.target.result);
				self.callChain();
			};
			return this;
		},
		
		each: function(fn, bind, internal){
			var self = this,
				returned = [],
				bind = (typeof bind === 'undefined') ? this : bind;
				
			this.openCursor().onsuccess = function(e) {
				var data = e.target.result;
				if(data) {
					returned.push(fn.call(bind, data.value, data.key, data));
					data.continue();
				}
				else{
					if(internal) internal.call(self, returned);
					self.callChain();
				}
			};
			
			return this;
		},
		
		getKeys: function(fn){
			this.each(function(value, key){
				return key;
			}, this, fn);
		},
		
		getValues: function(fn){
			this.each(function(value){
				return value;
			}, this, fn);
		}
});

Database = new Class({
			
	Implements: [Options, Events, Chain],
	
	options: {
		version: '0.1',
		schema: [  // This schema is an example and should be removed before release
			{
				name: 'users',
				options: {
					keyPath: 'id'
				},
				indexes: {
					'UsersByName': {
						keyPath: 'username',
						options: {
							'unique': true
						}
					}
				}
			},
			{
				name: 'projects',
				options: {
					keyPath: 'id'
				},
				indexes: {
					'ProjectsByType': {
						keyPath: 'type'
					}
				}
			}
		]
	},
	
	initialize: function(name, options){
		this.setOptions(options);
		this.name = name;
		this.open();
	},
	
	errors: {
		1: 'unknown',
		2: 'nonTransient',
		3: 'notFound',
		4: 'constraint',
		5: 'data',
		6: 'notAllowed',
		7: 'transactionInactive',
		8: 'abort',
		9: 'readonly',
		10: 'recoverable',
		11: 'serial',
		12: 'timeout'
	},
	
	open: function(existing){
		var self = this,
			options = this.options,
			request = (mozIndexedDB || webkitIndexedDB).open(this.name);
		
		request.onerror = function(error) {
			self.fireEvent('openFailure', error);
		}; 
		
		request.onblocked = function(){
			console.log('***BLOCKED***');
		};
		
		request.onsuccess = function(event) {
			var db = request.result;
				db.instance = self;
				self.db = db;
			
			db.onversionchange = function(e){
				if(db.version != self.previousVersion) self.fireEvent('versionChange', e);
				self.close();
				self.open(true);
			};
			
			db.onerror = function(e) {
				self.fireEvent(self.errors[e.target.errorCode], [e, request]);
			};
			
			if(options.schema && !existing) {
				self.setVersion(options.version || db.version, function(){
					options.schema.each(function(e){
						if(!db.objectStoreNames.contains(e.name)) {
							var object = self.create(e.name, e.options);
							if(e.indexes){
								Object.each(e.indexes, function(args, index){
									object.createIndex(index, args.keyPath, args.options || {});
								});
							}
						}
					});
				});
			}
			
			self.fireEvent('open', event);
		}; 
	},
	
	setVersion: function(version, fn) {
		this.previousVersion = this.db.version;
		this.db.setVersion(version || this.db.version).onsuccess = (fn || function(){}).bind(this);
		return this;
	},
	
	create: function(object, options){
		return (!this.db.objectStoreNames.contains(object)) ? this.db.createObjectStore(object, options || {}) : this.access(object);
	},
	
	access: function(object){
		return this.db.transaction([object], IDBTransaction.READ_WRITE, 0).objectStore(object);
	},
	
	close: function(){
		this.fireEvent('close');
		this.db.close();
	}
	
});