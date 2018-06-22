var DbAdminPermission = require('../dal/DbAdminPermission');


var dbInstance = DbAdminPermission.getInstance();

var BllAdminPermission = function () { };

BllAdminPermission.get = function (name, callbackFun) {
    dbInstance.get(name, function (err, row) {
        if (!err) {
            // TODO:
        }
        callbackFun(row);
    });
};


BllAdminPermission.gets = function (callbackFun) {
    dbInstance.gets(callbackFun);
};



BllAdminPermission.remove = function (name, callbackFun) {
    dbInstance.remove(name, function (err) {
        if (!err) {
            // TODO:
        }
        callbackFun(err);
    });
};


BllAdminPermission.add = function (name, info, callbackFun) {
    dbInstance.add(name, info, callbackFun);
};


BllAdminPermission.update = function (name, info, callbackFun) {
    dbInstance.update(name, info, function (err) {
        if (!err) {
            // TODO:
        }
        callbackFun(err ? 500 : 0);
    });
};


module.exports = BllAdminPermission;