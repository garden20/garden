var jam = {
    "packages": [
        {
            "name": "async",
            "location": "jam/async",
            "main": "./lib/async"
        },
        {
            "name": "bootstrap",
            "location": "jam/bootstrap"
        },
        {
            "name": "bowser",
            "location": "jam/bowser",
            "main": "./bowser.js"
        },
        {
            "name": "couchr",
            "location": "jam/couchr",
            "main": "couchr-browser.js"
        },
        {
            "name": "director",
            "location": "jam/director",
            "main": "director.js"
        },
        {
            "name": "domReady",
            "location": "jam/domReady",
            "main": "domReady.js"
        },
        {
            "name": "events",
            "location": "jam/events",
            "main": "events.js"
        },
        {
            "name": "garden-dashboard-core",
            "location": "jam/garden-dashboard-core",
            "main": "garden-dashboard-core.js"
        },
        {
            "name": "garden-default-settings",
            "location": "jam/garden-default-settings",
            "main": "garden-default-settings.js"
        },
        {
            "name": "garden-menu",
            "location": "jam/garden-menu",
            "main": "garden-menu.js"
        },
        {
            "name": "garden-menu-widget",
            "location": "jam/garden-menu-widget",
            "main": "garden-menu-widget.js"
        },
        {
            "name": "garden_menu_widget_css",
            "location": "jam/garden-menu-widget",
            "main": "src/garden-menu-widget.css.js",
            "local": true
        },
        {
            "name": "garden_menu_widget_extra_css",
            "location": "jam/garden-menu-widget",
            "main": "dist/compiled_css.js",
            "local": true
        },
        {
            "name": "garden-views",
            "location": "jam/garden-views",
            "main": "garden-views.js"
        },
        {
            "name": "gravatar",
            "location": "jam/gravatar",
            "main": "gravatar.js"
        },
        {
            "name": "handlebars",
            "location": "jam/handlebars",
            "main": "handlebars.js"
        },
        {
            "name": "hbt",
            "location": "jam/hbt",
            "main": "hbt.js"
        },
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "jquery.js"
        },
        {
            "name": "jscss",
            "location": "jam/jscss",
            "main": "lib/index.js"
        },
        {
            "name": "lessc",
            "location": "jam/lessc",
            "main": "lessc.js"
        },
        {
            "name": "md5",
            "location": "jam/md5",
            "main": "md5.js"
        },
        {
            "name": "modernizer",
            "location": "jam/modernizer",
            "main": "modernizr-development.js"
        },
        {
            "name": "pouchdb",
            "location": "jam/pouchdb",
            "main": "dist/pouchdb.amd-nightly.js"
        },
        {
            "name": "querystring",
            "location": "jam/querystring",
            "main": "querystring.js"
        },
        {
            "name": "ractive",
            "location": "jam/ractive",
            "main": "Ractive.js"
        },
        {
            "name": "simple-uuid",
            "location": "jam/simple-uuid",
            "main": "uuid.js"
        },
        {
            "name": "stately",
            "location": "jam/stately",
            "main": "Stately.js"
        },
        {
            "name": "svg",
            "location": "jam/svg",
            "main": "dist/svg.js"
        },
        {
            "name": "sync-status-icon",
            "location": "jam/sync-status-icon",
            "main": "sync-status-icon.js"
        },
        {
            "name": "text",
            "location": "jam/text",
            "main": "text.js"
        },
        {
            "name": "underscore",
            "location": "jam/underscore",
            "main": "underscore.js"
        },
        {
            "name": "url",
            "location": "jam/url",
            "main": "url.js"
        }
    ],
    "version": "0.2.17",
    "shim": {
        "director": {
            "exports": "Router"
        }
    }
};

if (typeof require !== "undefined" && require.config) {
    require.config({
    "packages": [
        {
            "name": "async",
            "location": "jam/async",
            "main": "./lib/async"
        },
        {
            "name": "bootstrap",
            "location": "jam/bootstrap"
        },
        {
            "name": "bowser",
            "location": "jam/bowser",
            "main": "./bowser.js"
        },
        {
            "name": "couchr",
            "location": "jam/couchr",
            "main": "couchr-browser.js"
        },
        {
            "name": "director",
            "location": "jam/director",
            "main": "director.js"
        },
        {
            "name": "domReady",
            "location": "jam/domReady",
            "main": "domReady.js"
        },
        {
            "name": "events",
            "location": "jam/events",
            "main": "events.js"
        },
        {
            "name": "garden-dashboard-core",
            "location": "jam/garden-dashboard-core",
            "main": "garden-dashboard-core.js"
        },
        {
            "name": "garden-default-settings",
            "location": "jam/garden-default-settings",
            "main": "garden-default-settings.js"
        },
        {
            "name": "garden-menu",
            "location": "jam/garden-menu",
            "main": "garden-menu.js"
        },
        {
            "name": "garden-menu-widget",
            "location": "jam/garden-menu-widget",
            "main": "garden-menu-widget.js"
        },
        {
            "name": "garden_menu_widget_css",
            "location": "jam/garden-menu-widget",
            "main": "src/garden-menu-widget.css.js",
            "local": true
        },
        {
            "name": "garden_menu_widget_extra_css",
            "location": "jam/garden-menu-widget",
            "main": "dist/compiled_css.js",
            "local": true
        },
        {
            "name": "garden-views",
            "location": "jam/garden-views",
            "main": "garden-views.js"
        },
        {
            "name": "gravatar",
            "location": "jam/gravatar",
            "main": "gravatar.js"
        },
        {
            "name": "handlebars",
            "location": "jam/handlebars",
            "main": "handlebars.js"
        },
        {
            "name": "hbt",
            "location": "jam/hbt",
            "main": "hbt.js"
        },
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "jquery.js"
        },
        {
            "name": "jscss",
            "location": "jam/jscss",
            "main": "lib/index.js"
        },
        {
            "name": "lessc",
            "location": "jam/lessc",
            "main": "lessc.js"
        },
        {
            "name": "md5",
            "location": "jam/md5",
            "main": "md5.js"
        },
        {
            "name": "modernizer",
            "location": "jam/modernizer",
            "main": "modernizr-development.js"
        },
        {
            "name": "pouchdb",
            "location": "jam/pouchdb",
            "main": "dist/pouchdb.amd-nightly.js"
        },
        {
            "name": "querystring",
            "location": "jam/querystring",
            "main": "querystring.js"
        },
        {
            "name": "ractive",
            "location": "jam/ractive",
            "main": "Ractive.js"
        },
        {
            "name": "simple-uuid",
            "location": "jam/simple-uuid",
            "main": "uuid.js"
        },
        {
            "name": "stately",
            "location": "jam/stately",
            "main": "Stately.js"
        },
        {
            "name": "svg",
            "location": "jam/svg",
            "main": "dist/svg.js"
        },
        {
            "name": "sync-status-icon",
            "location": "jam/sync-status-icon",
            "main": "sync-status-icon.js"
        },
        {
            "name": "text",
            "location": "jam/text",
            "main": "text.js"
        },
        {
            "name": "underscore",
            "location": "jam/underscore",
            "main": "underscore.js"
        },
        {
            "name": "url",
            "location": "jam/url",
            "main": "url.js"
        }
    ],
    "shim": {
        "director": {
            "exports": "Router"
        }
    }
});
}
else {
    var require = {
    "packages": [
        {
            "name": "async",
            "location": "jam/async",
            "main": "./lib/async"
        },
        {
            "name": "bootstrap",
            "location": "jam/bootstrap"
        },
        {
            "name": "bowser",
            "location": "jam/bowser",
            "main": "./bowser.js"
        },
        {
            "name": "couchr",
            "location": "jam/couchr",
            "main": "couchr-browser.js"
        },
        {
            "name": "director",
            "location": "jam/director",
            "main": "director.js"
        },
        {
            "name": "domReady",
            "location": "jam/domReady",
            "main": "domReady.js"
        },
        {
            "name": "events",
            "location": "jam/events",
            "main": "events.js"
        },
        {
            "name": "garden-dashboard-core",
            "location": "jam/garden-dashboard-core",
            "main": "garden-dashboard-core.js"
        },
        {
            "name": "garden-default-settings",
            "location": "jam/garden-default-settings",
            "main": "garden-default-settings.js"
        },
        {
            "name": "garden-menu",
            "location": "jam/garden-menu",
            "main": "garden-menu.js"
        },
        {
            "name": "garden-menu-widget",
            "location": "jam/garden-menu-widget",
            "main": "garden-menu-widget.js"
        },
        {
            "name": "garden_menu_widget_css",
            "location": "jam/garden-menu-widget",
            "main": "src/garden-menu-widget.css.js",
            "local": true
        },
        {
            "name": "garden_menu_widget_extra_css",
            "location": "jam/garden-menu-widget",
            "main": "dist/compiled_css.js",
            "local": true
        },
        {
            "name": "garden-views",
            "location": "jam/garden-views",
            "main": "garden-views.js"
        },
        {
            "name": "gravatar",
            "location": "jam/gravatar",
            "main": "gravatar.js"
        },
        {
            "name": "handlebars",
            "location": "jam/handlebars",
            "main": "handlebars.js"
        },
        {
            "name": "hbt",
            "location": "jam/hbt",
            "main": "hbt.js"
        },
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "jquery.js"
        },
        {
            "name": "jscss",
            "location": "jam/jscss",
            "main": "lib/index.js"
        },
        {
            "name": "lessc",
            "location": "jam/lessc",
            "main": "lessc.js"
        },
        {
            "name": "md5",
            "location": "jam/md5",
            "main": "md5.js"
        },
        {
            "name": "modernizer",
            "location": "jam/modernizer",
            "main": "modernizr-development.js"
        },
        {
            "name": "pouchdb",
            "location": "jam/pouchdb",
            "main": "dist/pouchdb.amd-nightly.js"
        },
        {
            "name": "querystring",
            "location": "jam/querystring",
            "main": "querystring.js"
        },
        {
            "name": "ractive",
            "location": "jam/ractive",
            "main": "Ractive.js"
        },
        {
            "name": "simple-uuid",
            "location": "jam/simple-uuid",
            "main": "uuid.js"
        },
        {
            "name": "stately",
            "location": "jam/stately",
            "main": "Stately.js"
        },
        {
            "name": "svg",
            "location": "jam/svg",
            "main": "dist/svg.js"
        },
        {
            "name": "sync-status-icon",
            "location": "jam/sync-status-icon",
            "main": "sync-status-icon.js"
        },
        {
            "name": "text",
            "location": "jam/text",
            "main": "text.js"
        },
        {
            "name": "underscore",
            "location": "jam/underscore",
            "main": "underscore.js"
        },
        {
            "name": "url",
            "location": "jam/url",
            "main": "url.js"
        }
    ],
    "shim": {
        "director": {
            "exports": "Router"
        }
    }
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}