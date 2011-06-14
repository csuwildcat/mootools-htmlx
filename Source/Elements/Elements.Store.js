(function (){
    
var collected = {}, storage = {};

var get = function(uid){
    return (storage[uid] || (storage[uid] = {}));
};

var store = function(item){
    if (item.dataset)
        return item.dataset
    
    return get($uid(item));
};

var clean = function(item){
    var uid = item.uid;
    if (item.removeEvents) item.removeEvents();
    if (item.clearAttributes) item.clearAttributes();
    if (uid != null){
        delete collected[uid];
        delete storage[uid];
    }
    return item;
};

[Element, Window, Document].invoke('implement', {
    
    addListener: function(type, fn){
        if (type == 'unload'){
            var old = fn, self = this;
            fn = function(){
                self.removeListener('unload', fn);
                old();
            };
        } else {
            collected[$uid(this)] = this;
        }
        if (this.addEventListener) this.addEventListener(type, fn, !!arguments[2]);
        else this.attachEvent('on' + type, fn);
        return this;
    },
    
    destroy: function(){
        var children = clean(this).getElementsByTagName('*');
        Array.each(children, clean);
        Element.dispose(this);
        return null;    
    },
    
    retrieve: function(property, dflt){
        var storage = store(this), prop = storage[property];
        if (dflt != null && prop == null) prop = storage[property] = dflt;
        return prop != null ? prop : null;
    },

    store: function(property, value){
        var storage = store(this);
        storage[property] = value;
        return this;
    },

    eliminate: function(property){
        var storage = store(this);
        delete storage[property];
        return this;
    }
    
});

/*<ltIE9>*/
if (window.attachEvent && !window.addEventListener) window.addListener('unload', function(){
    Object.each(collected, clean);
    if (window.CollectGarbage) CollectGarbage();
});
/*</ltIE9>*/

}.call(this));
