define('lessc', ['text', 'require',  './less-rhino'], function (text, require) {
    'use strict';

    var lessr = require('./less-rhino'),
        buildMap = {},
        dirMap = {};


    /**
     * Convenience function for compiling LESS code.
     */
    var compileLess = function (lessSrc, parentRequire, config, callback) {

        require(['./less'], function (less) {
                var lessParser = new less.Parser({
                     paths: ['']
                 });

                lessParser.parse(lessSrc, function (e, css) {
                    callback(e, css.toCSS({ compress: true }).trim());
                });

        });
    };

    /**
     * Convenience function for injecting stylesheet into the DOM.
     */
    var outputStylesheet = function (css) {
        var styleTag = document.createElement('style');

        styleTag.type = 'text/css';
        if (styleTag.styleSheet) {
            styleTag.styleSheet.cssText = css();
        } else {
            styleTag.appendChild(document.createTextNode(css));
        }

        document.getElementsByTagName('head')[0].appendChild(styleTag);
    };

    var loadFile = function (name, parentRequire, callback) {
        // Instead of re-inventing the wheel, let's just conveniently use
        // RequireJS' `text` plugin.
        text.get(parentRequire.toUrl(name), function(text) {
                callback(text);
        });
    };

    var jsEscape = function (content) {
        return content.replace(/(['\\])/g, '\\$1')
            .replace(/[\f]/g, "\\f")
            .replace(/[\b]/g, "\\b")
            .replace(/[\n]/g, "\\n")
            .replace(/[\t]/g, "\\t")
            .replace(/[\r]/g, "\\r");
    };

    return {

        write: function (pluginName, moduleName, writeBuild) {
            if (moduleName in buildMap) {

                var dirBaseUrl = dirMap[moduleName];
                var lessParser = new lessr.Parser({
                    paths: ['']
                });
                lessParser.parse(buildMap[moduleName], function (e, css) {

                    var result = css.toCSS({ compress: true }).trim();
                    var text = jsEscape(result);

                    writeBuild(
                        ";(function () {" +
                            "var theStyle = '" + text + "';" +
                            "var styleTag = document.createElement('style');" +
                            "styleTag.type = 'text/css';" +
                            "if (styleTag.styleSheet) {" +
                                "styleTag.styleSheet.cssText = theStyle;" +
                            "} else {" +
                                "styleTag.appendChild(document.createTextNode(theStyle));" +
                            "}" +
                            "document.getElementsByTagName('head')[0].appendChild(styleTag);" +
                            "define('" + pluginName + "!" + moduleName + "', function () {" +
                                "return theStyle;" +
                            "});" +
                        "}());"
                    );

                });

            }
        },

        load: function (name, parentRequire, onLoad, config) {

            loadFile(name, parentRequire, function (text) {
                if (config.isBuild) {
                    buildMap[name] = text;
                    dirMap[name] = config.baseUrl;
                    return onLoad(text);
                }
                compileLess(text, parentRequire,  config, function (e, css) {
                    if (e) {
                        onLoad.error(e);
                        return;
                    } else {
                        outputStylesheet(css);
                        onLoad();

                    }
                });
            });
        }
    };
});
