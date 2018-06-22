var util = require("util");
var DataAccess = require('./DataAccess');
var AdminRole = require('../entity/AdminRole');


var DbAdminRole = function () {

};
util.inherits(DbAdminRole, DataAccess);

DbAdminRole.instance = null;

DbAdminRole.getInstance = function () {
    if (!DbAdminRole.instance) {
        DbAdminRole.instance = new DbAdminRole();
    }
    return DbAdminRole.instance;
};

DbAdminRole.prototype.get = function (name, callbackFun) {
    this.execRows('select A.*, B.permission_name from admin_roles A left join admin_role_permission B on A.name = B.role_name where A.name = ?', [name], AdminRole, function (err, result) {
        if (err) {
            callbackFun(err, result);
        } else {
            var role = null;
            for (var i = 0; i < result.length; i++) {
                var item = result[i];
                if (!role) {
                    role = item;
                    role.permissions = [];
                }
                if (item.permission_name) {
                    role.permissions.push(item.permission_name);
                }
            }
            if (role) {
                delete role.permission_name;
            }
            callbackFun(0, role);
        }
    });
};

DbAdminRole.prototype.gets = function (callbackFun) {
    this.execRows('select A.*, B.permission_name from admin_roles A left join admin_role_permission B on A.name = B.role_name', null, AdminRole, function (err, result) {
        if (err) {
            callbackFun(err, result);
        } else {
            var lst = [], obj = {};
            for (var i = 0; i < result.length; i++) {
                var item = result[i];
                var role = obj[item.name];
                if (!role) {
                    obj[item.name] = role = item;
                    role.permissions = [];
                    lst.push(role);
                }
                if (item.permission_name) {
                    role.permissions.push(item.permission_name);
                }
                delete role.permission_name;
            }
            callbackFun(0, lst);
        }
    });
};

DbAdminRole.prototype.remove = function (name, callbackFun) {
    this.execNonQuery('delete from admin_roles where `name`=?', [name], callbackFun);
};

DbAdminRole.prototype.add = function (name, info, permissions, callbackFun) {
    var _insertPermission = function (i, cn, cb) {
        if (permissions && i < permissions.length) {
            this.execNonQueryWithCn(cn, 'insert into admin_role_permission(`role_name`,`permission_name`) values(?,?)', [name, permissions[i]], function (cn, err, result) {
                if (err) {
                    cb(false);
                } else {
                    _insertPermission.apply(this, [i + 1, cn, cb]);
                }
            });
        } else {
            cb(true);
        }
    };

    this.execInTrans(function (cn, returnTransFun) {
        this.execNonQueryWithCn(cn, 'insert into admin_roles(`name`,`info`) values(?,?)', [name, info], function (cn, err, result) {
            if (err) {
                returnTransFun(false);
            } else {
                _insertPermission.apply(this, [0, cn, function (issuccess) {
                    returnTransFun(issuccess);
                }]);
            }
        });
    }, function (issuccess) {
        callbackFun(issuccess);
    });
};


DbAdminRole.prototype.update = function (name, info, permissions, callbackFun) {
    var _insertPermission = function (i, cn, cb) {
        if (permissions && i < permissions.length) {
            this.execNonQueryWithCn(cn, 'insert into admin_role_permission(`role_name`,`permission_name`) values(?,?)', [name, permissions[i]], function (cn, err, result) {
                if (err) {
                    cb(false);
                } else {
                    _insertPermission.apply(this, [i + 1, cn, cb]);
                }
            });
        } else {
            cb(true);
        }
    };

    this.execInTrans(function (cn, returnTransFun) {
        this.execNonQueryWithCn(cn, 'update admin_roles set info=? where name=?', [info, name], function (cn, err, result) {
            if (err) {
                returnTransFun(false);
            } else {
                this.execNonQueryWithCn(cn, 'delete from admin_role_permission where role_name=?', [name], function (cn, err, result) {
                    if (err) {
                        returnTransFun(false);
                    } else {
                        _insertPermission.apply(this, [0, cn, function (issuccess) {
                            returnTransFun(issuccess);
                        }]);
                    }
                });
            }
        });
    }, function (issuccess) {
        callbackFun(issuccess);
    });
};

module.exports = DbAdminRole;