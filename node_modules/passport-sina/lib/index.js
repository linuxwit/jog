var util = require('util'),
    config = require('./config'),
    OAuth2Strategy = require('passport-oauth2'),
    SinaAPIError = require('./error');

function Strategy(options, verify) {
    options = options || {};
    options.authorizationURL = options.authorizationURL || config.authorizationURL;
    options.tokenURL = options.tokenURL || config.tokenURL;
    options.scopeSeparator = options.scopeSeparator || config.scopeSeparator;
    options.state = options.requireState === undefined ? config.requireState : options.requireState;

    OAuth2Strategy.call(this, options, verify);
    this.name = config.name;
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function(accessToken, callback) {
    var self = this;
    this._oauth2.getProtectedResource(config.getuidAPI, accessToken, function(err, body, res) {
        if (err) return callback(new SinaAPIError(err));

        try {
            body = JSON.parse(body);
        } catch(e) {
            return callback(e);
        }
        self._oauth2.getProtectedResource(config.getProfileAPI + '?uid=' + body.uid, accessToken, function(err, body, res) {
            if (err) return callback(new SinaAPIError(err));

            var _raw = body;
            try {
                body = JSON.parse(body);
            } catch(e) {
                return callback(e);
            }
            var _body = JSON.parse(_raw);
            body.provider = config.name;
            body._raw = _raw;
            body._json = _body;
            return callback(null, body);
        });
    });
};

exports = module.exports = Strategy;
exports.Strategy = Strategy;
