(function () {

    var factory = function (md5, querystring) {
        var gravatar = {};

        gravatar.BASE_AVATAR_URL = 'www.gravatar.com/avatar/';

        function isBrowser() {
            return (typeof(window) !== 'undefined');
        }

        gravatar.trim = function (str) {
            return str.replace(/^\s+/, '').replace(/\s+$/, '');
        };

        gravatar.hash = function (email) {
            return md5.hex(gravatar.trim(email).toLowerCase());
        };

        /**
         * Generates an avatar URL from an email address
         *
         * @param email {String}
         * @param options {Object} - (optional)
         *
         * Options:
         *
         * - email {String} - The email address to get the avatar for.
         * - hash {String} - The pre-hashed email address (alternative to using email)
         *
         * - size {Number} - Size in pixels of the desired avatar image.
         *     By default, images are presented at 80px by 80px if no size parameter
         *     is supplied
         *
         * - default_image {String} - a URL to a default image to use if the user has
         *     no avatar, can also be set to the following predefined options:
         *
         *     - 404:        do not load any image if none is associated with the email
         *                   hash, instead return an HTTP 404 (File Not Found) response
         *     - mm:         (mystery-man) a simple, cartoon-style silhouetted outline
         *                   of a person (does not vary by email hash)
         *     - identicon:  a geometric pattern based on an email hash
         *     - monsterid:  a generated 'monster' with different colors, faces, etc
         *     - wavatar:    generated faces with differing features and backgrounds
         *     - retro:      awesome generated, 8-bit arcade-style pixelated faces
         *
         * - force_default {Boolean} - forces the use of the default image
         *
         * - rating {String} - Gravatar allows users to self-rate their images so that
         *     they can indicate if an image is appropriate for a certain audience. By
         *     default, only 'G' rated images are displayed unless you indicate that
         *     you would like to see higher ratings. Available options:
         *
         *     - g:   suitable for display on all websites with any audience type.
         *     - pg:  may contain rude gestures, provocatively dressed individuals,
         *            the lesser swear words, or mild violence.
         *     - r:   may contain such things as harsh profanity, intense violence,
         *            nudity, or hard drug use.
         *     - x:   may contain hardcore sexual imagery or extremely disturbing
         *            violence.
         *
         * - secure {Boolean} - whether to use https, if not set, the current protocol
         *     is used (if running in the browser), otherwise defaults to http
         *
         * - extension {String} - optional image extension to use in the url (eg .jpg)
         */

        gravatar.avatarURL = function (options) {
            options = options || {};
            var hash = options.hash || gravatar.hash(options.email);
            var params = {};

            if (options.size) {
                params.size = options.size;
            }
            if (options.force_default) {
                params.forcedefault = 'y';
            }
            if (options.default_image) {
                params['default'] = options.default_image;
            }
            if (options.rating) {
                params.rating = options.rating;
            }
            if (options.secure === undefined && isBrowser()) {
                options.secure = location.protocol === 'https:';
            }
            var ext = '';
            if (options.extension) {
                ext = '.' + options.extension.replace(/^\./, '');
            }
            return (options.secure ? 'https://': 'http://') +
                   gravatar.BASE_AVATAR_URL + hash + ext + '?' +
                   querystring.stringify(params);
        };

        return gravatar;
    };

    if (typeof define !== 'undefined' && define.amd) {
        define('gravatar', ['md5', 'querystring'], factory);
    }
    else if (typeof module !== 'undefined' && typeof exports !== 'undefined') {
        module.exports = factory(require('md5'), require('querystring'));
    }
    else {
        this.gravatar = factory(md5, querystring);
    }

})();
