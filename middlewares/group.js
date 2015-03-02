var JogGroup = require('../models/joggroup');
var User = require('../models/user');
var restful = require('node-restful');
var mongoose = restful.mongoose;
var _ = require('underscore');
/**
 * 加入群
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */



exports.join = function(req, res, next) {
    var groupid = req.params.id;
    var user = req.user;
    User.findOne({
        _id: user._id
    }, function(err, _user) {
        if (err) {
            next(err);
        }
        if (_user) {
            if (!_user.join_groups) {
                _user.join_groups = [];
            }     
            if (!_user.join_groups.contains(groupid)){
                 _user.join_groups.push(mongoose.Types.ObjectId(groupid));
            }
            User.update({
                _id: _user._id
            }, {
                join_groups: _user.join_groups
            }, function(err, _user) {
                if (err) return next(false, err);
                if (_user) next(true, null, _user);
                else next(false, null);
            });
        } else {
            next(false, '用户不存在');
        }
    });
};