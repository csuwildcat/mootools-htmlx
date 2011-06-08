/*
---

name: Drag.Events
description: Provide HTML5 Drag Events
license: MIT-style license.
authors: Arian Stolwijk
requires: [Element.Event, Event]
provides: Drag.Events

...
*/

Object.append(Element.NativeEvents, {
	dragstart: 2, dragenter: 2, dragover: 2, dragleave: 2, drag: 2, drop: 2, dragend: 2
});

Event.implement('getDataTransfer', function(){
	return this.event.dataTransfer;
});
