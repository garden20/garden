sync-status-icon
================

The idea of this project is to create a visual metaphor for offline enabled webapps to communicate their state with the user.

[demo](http://garden20.github.com/sync-status-icon)

It revolves around the already published offline & storage icon produced by the w3, available here: http://www.w3.org/html/logo/.

It is in the spirit of spin.js in that is uses no images, and should be easy to integrate with your own project.

Getting Started
---------------

Using requirejs?

```
jam install sync-status-icon

define(['sync-status-icon'], SyncIcon) {

}
```

Using npm?

```
npm install sync-status-icon

var SyncIcon = require('sync-status-icon');
```

Browser
```
<script type="text/javascript" src="sync-status-icon.js"></script>
```

API
---


```
var sync_icon = new SyncIcon('sync');

// respond to the user clicking the icon
sync_icon.click(function(){
    var current_state = sync_icon.getState();
    // maybe if disabled, enable offline support?
})

// visually represent what state your webapp is in
sync_icon.disabled();
sync_icon.online();
sync_icon.offline();
sync_icon.syncing();


```