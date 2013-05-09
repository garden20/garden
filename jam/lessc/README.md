# lessc

This Jam package will allow your web app to load LESS files, compile them to CSS, and apply the styles to your page, on the file.

But that's not all, the LESS code will actually be embedded onto your optimized version of your app.

## Installation and Usage.

Since it's a jam package, you would install it just like any other.

    $ jam install lessc

And you would use it like so.

    require('lessc!less/style.less', function () {
        // Just loading a less text file will compile it for you,
        // and apply it to the current page.
    });

And what about optmization? Well, just calling `jam compile` should do the trick.


