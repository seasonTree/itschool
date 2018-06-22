var util = require("util");
var DataAccess = require('./DataAccess');
var AdminUser = require('../entity/AdminUser');


var DbAdminUser = function () {

};
util.inherits(DbAdminUser, DataAccess);

DbAdminUser.instance = null;

DbAdminUser.getInstance = function () {
    if (!DbAdminUser.instance) {
        DbAdminUser.instance = new DbAdminUser();
    }
    return DbAdminUser.instance;
};

DbAdminUser.prototype.get = function (uid, callbackFun) {
    this.execRows('select A.*, B.role_name from admin_users A left join admin_role_user B on A.uid = B.user_name where A.`uid`=?', [uid], AdminUser, function (err, result) {
        if (err) {
            callbackFun(err, result);
        } else {
            var user = null;
            for (var i = 0; i < result.length; i++) {
                var item = result[i];
                if (!user) {
                    user = item;
                    user.roles = [];
                }
                if (item.role_name) {
                    user.roles.push(item.role_name);
                }
            }
            if (user) {
                delete user.role_name;
            }
            callbackFun(0, user);
        }
    });
};

DbAdminUser.prototype.gets = function (callbackFun) {
    this.execRows('select A.*, B.role_name from admin_users A left join admin_role_user B on A.uid = B.user_name', null, AdminUser, function (err, result) {
        if (err) {
            callbackFun(err, result);
        } else {
            var lst = [], obj = {};
            for (var i = 0; i < result.length; i++) {
                var item = result[i];
                var user = obj[item.uid];
                if (!user) {
                    obj[item.uid] = user = item;
                    user.roles = [];
                    lst.push(user);
                }
                if (item.role_name) {
                    user.roles.push(item.role_name);
                }
                delete user.role_name;
            }
            callbackFun(0, lst);
        }
    });
};

DbAdminUser.prototype.remove = function (uid, callbackFun) {
    this.execNonQuery('delete from admin_users where `uid`=?', [uid], callbackFun);
};

DbAdminUser.prototype.chgPass = function (uid, newPass, callbackFun) {
    this.execNonQuery('update admin_users set `pass`=? where uid=?', [newPass, uid], callbackFun);
};

DbAdminUser.prototype.add = function (uid, pass, roles, callbackFun) {
    var _insertRole = function (i, cn, cb) {
        if (roles && i < roles.length) {
            this.execNonQueryWithCn(cn, 'insert into admin_role_user(`role_name`,`user_name`) values(?,?)', [roles[i], uid], function (cn, err, result) {
                if (err) {
                    cb(false);
                } else {
                    _insertRole.apply(this, [i + 1, cn, cb]);
                }
            });
        } else {
            cb(true);
        }
    };

    this.execInTrans(function (cn, returnTransFun) {
        this.execNonQueryWithCn(cn, 'insert into admin_users(`uid`,`pass`) values(?,?)', [uid, pass], function (cn, err, result) {
            if (err) {
                returnTransFun(false);
            } else {
                _insertRole.apply(this, [0, cn, function (issuccess) {
                    returnTransFun(issuccess);
                }]);
            }
        });
    }, function (issuccess) {
        callbackFun(issuccess);
    });
};


DbAdminUser.prototype.update = function (uid, roles, callbackFun) {
    var _insertRole = function (i, cn, cb) {
        if (roles && i < roles.length) {
            this.execNonQueryWithCn(cn, 'insert into admin_role_user(`role_name`,`user_name`) values(?,?)', [roles[i], uid], function (cn, err, result) {
                if (err) {
                    cb(false);
                } else {
                    _insertRole.apply(this, [i + 1, cn, cb]);
                }
            });
        } else {
            cb(true);
        }
    };

    this.execInTrans(function (cn, returnTransFun) {
        this.execNonQueryWithCn(cn, 'delete from admin_role_user where user_name=?', [uid], function (cn, err, result) {
            if (err) {
                returnTransFun(false);
            } else {
                _insertRole.apply(this, [0, cn, function (issuccess) {
                    returnTransFun(issuccess);
                }]);
            }
        });
    }, function (issuccess) {
        callbackFun(issuccess);
    });
};

module.exports = DbAdminUser;