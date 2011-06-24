(function(){

var hasData = (function(){
	var node = document.createElement('div');
	node.setAttribute('data-id', '1');
	return node.dataset && node.dataset.id && node.dataset.id == '1';
}());

[Element, Document, Window].invoke('implement', {

    setData: (hasData ? function(key, val){
        this.dataset[key.camelCase()] = val;
        return this;
    } : function(key, val){
        return this.setProperty('data-' + key.hyphenate(), val);
    }).overloadSetter(),

    getData: (hasData ? function(key){
        return this.dataset[key.camelCase()]
    } : function(key){
        return this.getProperty('data-' + key.hyphenate());
    }).overloadGetter(),

    getDataset: hasData ? function(){
        return Object.clone(this.dataset);
    } : function(){
        var attributes = item.attributes,
            i = attributes.length,
            collection = {};

        while(i--){
            var attribute = attributes[ i ],
                key = attribute.attributeName;

            if (!key.test(/^data-/)) continue;

            key = camelKey(key.replace(/^data-/));
            collection[ key ] = attribute.value;
        }

        return collection;
    },

    eraseData: function(key){
        return this.removeProperty('data-' + key.hyphenate());
    }
    
});

}());
