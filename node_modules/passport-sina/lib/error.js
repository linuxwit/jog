var util = require('util');
function SinaAPIError(err) {
    Error.call(this);
    Error.captureStackTrace(this, arguments.callee);
    this.name = 'SinaAPIError';
    this.status = err.statusCode;
    var data = {};
    try {
        data = JSON.parse(err.data);
    } catch(_) {}

    this.message =  data.error + ' [' + data.request + ']';
    this.code = data.error_code;
}
util.inherits(SinaAPIError, Error);

module.exports = SinaAPIError;
