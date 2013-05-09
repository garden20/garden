define(['underscore', 'couchr'], function(_, couchr) {


    var controller = {},
        options,
        emitter;

    controller.init = function(opts) {
        options = opts;
        emitter = opts.emitter;
    };

    controller.routes =  function() {
        return {
            //server routes
            '/apps' : controller.app_list
        };
    };


    controller.app_list = function(couch) {
        emitter.emit('app_list', couch);
    };


    return controller;
});