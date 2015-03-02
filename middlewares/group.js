var JogGroup = require('../models/joggroup');
var User = require('../models/user');
var restful = require('node-restful');
var mongoose = restful.mongoose;

/**
 * 加入群
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.join = function (req, res, next){
   var groupid=mongoose.Types.ObjectId(req.body.groupid);
   var user=req.user;
   
   User.findOne({
        _id: user._id
    }, function(err, user) {
        if (err) {
            next(err);
        }
        if (user){
            var join_groups=user.join_groups;
            if (!join_groups){
                join_groups=[];
            }

            if (!join_groups.contain(groupid)){
                join_groups.push(groupid);
            }
            user.join_groups=join_groups;
            user.update(function(err, _user) {
                if (err)
                    return next(false,err);
                 next(true,null,_user);
            });
        }else{
            next(false,'用户不存在');
        }
    });
};

