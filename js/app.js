define('js/app',[
    'require',
    'jquery',
    'underscore',
    'events',
    'director',
    'js/controller',
    'garden-menu-widget',
    'lessc!css/main.less'
],
function(require, $, _,  events, director,   controller, garden_menu_widget){
    var exports = {},
        emitter = new events.EventEmitter(),

        // blend the known module routes together.
        routes = _.extend({}, controller.routes()),
        router = director.Router(routes),

        opts = {
            selector : '.main',
            emitter : emitter,
            router : router
        },
        settings_pouchdb;


    // This is where you will put things you can do before the dom is loaded.
    exports.init = function(callback) {

        // init the known modules with the options
        _.invoke([controller], 'init', opts);

        // init loaded plugins
        require(['_ddoc/plugin_config'], function(plugins) {
            _.each(plugins, function(plugin){
                if (_.isFunction(plugin.init)) {
                    plugin.init(opts);
                }
            });
        });

        callback(null);
    };


    // This that occur after the dom has loaded.
    exports.on_dom_ready = function() {
        // start the app on the /, which is the main, menu
        router.init('/');
        var garden_ui = new garden_menu_widget('http://localhost:5984/dashboard');
        garden_ui.init(function(err){

        });
    };

    // for modules we dont know about
    exports.getOptions = function() {
        return opts;
    };

    return exports;
});