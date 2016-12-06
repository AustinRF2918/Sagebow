const EXPRESS_ROOT = require('../configuration.js').EXPRESS_ROOT;

module.exports = {
    // A simple way to serve a static file.
    serveFile: function(uri, res) {
        res.set('Content-Type', 'text/html');
        res.sendFile(uri, {
            root: EXPRESS_ROOT,
            dotfiles: 'allow',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        });
    }
};
