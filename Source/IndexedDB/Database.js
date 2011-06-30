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

(function(){

	var errorTypes = {
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
	IDBMethods = {
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
		
		each: function(fn, bind, range, relay){
			var self = this,
				returned = [],
				bind = (typeof bind === 'undefined') ? this : bind;
				
			this.openCursor(range).onsuccess = function(e) {
				var data = e.target.result;
				if(data) {
					returned.push(fn.call(bind, data.value, data.key, data));
					data.continue();
				}
				else{
					if(relay) relay.call(bind, returned);
					self.callChain();
				}
			};
			
			return this;
		},
		
		getRange: function(start, end, fn, bind){
			var range = {};
			this.each(function(v, k){
				range[k] = v;
			}, this, IDBKeyRange.bound(start, end, false, false), fn.bind(bind, range));
			return this;
		},
		
		getKeys: function(fn){
			this.each(function(value, key){
				return key;
			}, this, null, fn);
			return this;
		},
		
		getValues: function(fn){
			this.each(function(value){
				return value;
			}, this, null, fn);
			return this;
		},
		
		getIndex: function(name){
			var index = this.index(name);
			index.instance = this.instance;
			return index;
		}
	},
	revive = function(object){
		var revived = (object.objectStore) ? object.instance.getObject(object.objectStore.name).getIndex(object.name) : object.instance.getObject(object.name);
			revived.$chain = object.$chain;
		return object = revived;
	};
	
	[
		{ type: 'IDBObjectStore', methods: IDBMethods },
		{ type: 'IDBIndex', methods: Object.subset(IDBMethods, ['retrieve', 'each', 'getRange', 'getKeys', 'getValues']) }
	].each(function(object){
		var global = window[object.type];
		global.extend = Object.extend;
		new Type(object.type, global);
		global.implement(new Chain).implement(Object.map(object.methods, function(method){
			return function(){
				return method.apply(((this.objectStore || this).inactive) ? revive(this) : this, arguments);
			}
		}));
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
		
		open: function(restart){
			var self = this,
				options = this.options,
				request = (mozIndexedDB || webkitIndexedDB).open(this.name);
			
			request.onerror = function(error) {
				self.fireEvent('openFailure', error);
			}; 
			
			request.onblocked = function(){
				console.log('***BLOCKED***'); // remove console before release
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
					self.fireEvent(errorTypes[e.target.errorCode], [e, request]);
				};
				
				if(options.schema && !restart) {
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
		
		create: function(name, options){
			return(!this.db.objectStoreNames.contains(name)) ? this.db.createObjectStore(name, options || {}) : this.getObject(name);
		},
		
		getObject: function(name){
			var object = this.db.transaction([name], IDBTransaction.READ_WRITE, 0).objectStore(name);
			object.instance = this;
			object.transaction.oncomplete = function(){
				object.inactive = true;
			};
			return object;
		},
		
		close: function(){
			this.fireEvent('close');
			this.db.close();
		}
		
	});

})();