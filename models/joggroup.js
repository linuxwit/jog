var restful = require('node-restful');
var mongoose = restful.mongoose;
var Schema = mongoose.Schema;
/**
 * 增加微信群打卡功能
 * [JosGroupSchema 微信群]
 * @type {[type]}
 */
var JosGroupSchema = mongoose.Schema({
	name: {
		type: String,
		require: true
	}, //微信群名称
	summary: {
		type: String,
		require: false
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		require: true
	},
	local_qr_url: {
		type: String
	}, //本地二维码地址
	qiniu_qr_url: {
		type: String
	},//远程二维码地址
	meta: {
		create_at: {
			type: Date,
			default: Date.now()
		},
		update_at: {
			type: Date,
			default: Date.now()
		}
	}
});
var Post = restful.model("joggroup", JosGroupSchema).methods(['get', 'put', 'delete', 'post']);
module.exports = Post;