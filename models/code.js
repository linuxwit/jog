var restful = require('node-restful');
var mongoose = restful.mongoose;
var Schema = mongoose.Schema;

var codeSchema = mongoose.Schema({
    posted: { type: Date, default: Date.now },
    author: { type: Schema.Types.ObjectId, ref: 'User', require: true },
    text: {type: String, require: true}
});
