var DbAdminRole = require('../dal/DbAdminRole');


var dbInstance = DbAdminRole.getInstance();

var BllAdminRole = function () { };

BllAdminRole.get = function (name, callbackFun) {
    dbInstance.get(name, function (err, row) {
        if (!err) {
            // TODO:
        }
        callbackFun(row);
    });
};


BllAdminRole.gets = function (callbackFun) {
    dbInstance.gets(callbackFun);
};



BllAdminRole.remove = function (name, callbackFun) {
    if (name) {
        dbInstance.remove(name, function (err) {
            if (err) {
                err = 500;
            }
            callbackFun(err || 0);
        });
    } else {
        callbackFun(100);
    }
};


BllAdminRole.add = function (name, info, permissions, callbackFun) {
    var err = 0;
    if (name) {
        dbInstance.add(name, info || '', permissions, function (issuccess) {
            if (!issuccess) {
                err = 500;
            }
            callbackFun(err);
        });
    } else {
        err = 100;
        callbackFun(err);
    }
};


BllAdminRole.update = function (name, info, permissions, callbackFun) {
    var err = 0;
    if (name) {
        dbInstance.update(name, info || '', permissions, function (issuccess) {
            if (!issuccess) {
                err = 500;
            }
            callbackFun(err);
        });
    } else {
        err = 100;
        callbackFun(err);
    }
};



module.exports = BllAdminRole;