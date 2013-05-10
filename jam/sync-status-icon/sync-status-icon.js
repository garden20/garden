(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('svg'));
    } else if (typeof define === 'function' && define.amd) {
        define(['svg'],factory);
    } else {
        root.SyncIcon = factory(root.svg);
    }
}(this, function (svg) {

var icon = function(element, options) {
    var me = this;

    var defaults = {
        size: 294,
        disabled_color: '#ccc',
        mouseover_color: '#eee',
        online_color: '#090',
        sync_color: '#050',
        offline_color: '#900',
        state: 'disabled'
    };

    if (!options) options = defaults;
    if (!options.size) options.size = defaults.size;
    if (!options.disabled_color) options.disabled_color = defaults.disabled_color;
    if (!options.mouseover_color) options.mouseover_color = defaults.mouseover_color;
    if (!options.online_color) options.online_color = defaults.online_color;
    if (!options.offline_color) options.offline_color = defaults.offline_color;
    if (!options.state) options.state = defaults.state;


    this.options = options;
    this.callback = false;
    this.animating = false;

    var orginal_height = 256;
    var original_width = 294;

    me.options.height =  ( orginal_height/original_width ) * me.options.size;

    this.paper = svg(element).size(me.options.size, me.options.size);
    this.main_path = this.paper.path(main_icon);
    this.main_path.size(me.options.size  , me.options.height);
    this.main_path.attr({ fill: this.options.disabled_color });


    var rotate_on = function(callback){
        me.animating = true;
        me.main_path.animate(1000, '<>').rotate(0).after(function(){
            me.animating = false;
            if (callback) callback();
        });
    };

    var rotate_off = function(callback) {
        me.animating = true;
        me.main_path.animate(1000, '<>').rotate(-90).after(function(){
            me.animating = false;
            if (callback) callback();
        });
    };

    var online_state = function(){
        me.main_path.rotate(0);
        me.main_path.attr({fill: me.options.online_color});
        me.options.state = 'online';
    };

    var offline_state = function() {
        me.main_path.rotate(0);
        me.main_path.attr({fill: me.options.offline_color});
        me.options.state = 'offline';
    };

    var syncing_state = function() {
        me.main_path.rotate(0);
        var gradient = me.paper.gradient('linear', function(stop) {
          stop.at({ offset: 0, color: me.options.sync_color, opacity: 1 });
          stop.at({ offset: 100, color: me.options.online_color, opacity: 1 });
        });

        var count = 0;
        me.sync_interval = setInterval(function(){

            gradient.update(function(stop) {
              stop.at({ offset: count, color: me.options.online_color, opacity: 1 });
              stop.at({ offset: 100, color: me.options.sync_color, opacity: 1 });
              count+=10;
              if (count > 100) count = 0;
            });

        }, 100);

        me.main_path.attr({ fill: gradient.fill() });
        me.options.state = 'syncing';
    };

    var disabled_state = function(){
        me.main_path.rotate(-90);
        me.main_path.attr({fill: me.options.disabled_color});
        me.options.state = 'disabled';
    };

    this.state_change = function(to_state) {
        if (me.sync_interval && to_state !== 'syncing') {
            clearInterval(me.sync_interval);
            me.sync_interval = null;
        }
        // animation between transitions
        if (me.options.state === 'disabled' && to_state ==='online') {
            return rotate_on(online_state);
        }
        if (me.options.state === 'disabled' && to_state ==='offline') {
            return rotate_on(offline_state);
        }
        if (me.options.state === 'online' && to_state ==='disabled') {
            return rotate_off(disabled_state);
        }
        if (me.options.state === 'offline' && to_state ==='disabled') {
            return rotate_off(disabled_state);
        }
        if (to_state === 'online') return online_state();
        if (to_state === 'offline') return offline_state();
        if (to_state === 'syncing') return syncing_state();
        if (to_state === 'disabled') return disabled_state();
    };

    this.paper.on('mouseover', function(){
        if (me.animating) return;
        //me.main_path.animate(500, '>').attr({ fill: me.options.mouseover_color });
    });
    this.paper.on('mouseout', function(){
        if (me.animating) return;
        //me.state_change(me.options.state);
    });


    this.clicked = function() {
        if (me.callback) me.callback('click');
    };

    me.paper.touchstart(function(){
        me.clicked();
    });

    me.paper.click(function(){
        me.clicked();
    });

    me.state_change(me.options.state);
};

icon.prototype.disabled = function() {
    this.state_change('disabled');
};

icon.prototype.offline = function() {
    this.state_change('offline');
};

icon.prototype.online = function(){
    this.state_change('online');
};


icon.prototype.syncing = function() {
    this.state_change('syncing');
};

icon.prototype.click = function(callback) {
    this.callback = callback;
};

icon.prototype.getState = function() {
    return this.options.state;
};

var main_icon = "M294.1,79.0H246.3C226.7,31.9,180.0,0,128.1,0C57.5,0,0,57.4,0,128.1C0,198.8,57.5,256.3,128.1,256.3c51.9,0,98.5-31.8,118.2-79.0h47.7V79.0zM256.1,139.2H128.1c-6.1,0-11.1-4.9-11.1-11.1c0-6.1,4.9-11.1,11.1-11.1h127.9V139.2zM128.1,218.3c-49.7,0-90.1-40.4-90.1-90.1c0-49.7,40.4-90.1,90.1-90.1c30.8,0,59.1,16.0,75.5,41.0h-75.5c-27.0,0-49.1,22.0-49.1,49.1c0,27.0,22.0,49.1,49.1,49.1h75.5C187.3,202.3,159.0,218.3,128.1,218.3z";

var online_icon ="M-7.2727275,54.781471C-7.2727275,54.781471,-8.8503233,54.781471,-8.8503233,54.781471C-8.8503233,54.781471,-8.8503233,52.267212,-8.8503233,52.267212C-8.8503233,52.267212,-7.272727499999999,52.267212,-7.272727499999999,52.267212C-7.272727499999999,52.267212,-7.2727275,54.781471,-7.2727275,54.781471 M-9.6861906,54.780155C-9.6861906,54.780155,-11.263786,54.780155,-11.263786,54.780155C-11.263786,54.780155,-11.263786,52.265896,-11.263786,52.265896C-11.263786,52.265896,-9.6861906,52.265896,-9.6861906,52.265896C-9.6861906,52.265896,-9.6861906,54.780155,-9.6861906,54.780155 M-12.035547,54.779095C-12.035547,54.779095,-13.613142999999999,54.779095,-13.613142999999999,54.779095C-13.613142999999999,54.779095,-13.613142999999999,52.264835,-13.613142999999999,52.264835C-13.613142999999999,52.264835,-12.035547,52.264835,-12.035547,52.264835C-12.035547,52.264835,-12.035547,54.779095,-12.035547,54.779095";


return icon;
}));