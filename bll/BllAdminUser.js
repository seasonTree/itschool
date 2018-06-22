var DbAdminUser = require('../dal/DbAdminUser');

var dbInstance = DbAdminUser.getInstance();

var BllAdminUser = function () { };

BllAdminUser.get = function (uid, callbackFun) {
    dbInstance.get(uid, function (err, row) {
        if (!err) {
        }
        callbackFun(row);
    });
};

// 取得所有管理员
BllAdminUser.gets = function (callbackFun) {
    dbInstance.gets(callbackFun);
};

// 拥有权限的管理员可修改任意用户的密码
BllAdminUser.chgPass = function (adminUID, uid, newPass, callbackFun) {

    // TODO: 检测权限

    newPass = Helper.sha1(newPass);
    dbInstance.chgPass(uid, newPass, function (err) {
        if (!err) {
        }
        callbackFun(err);
    });
};


// 修改指定用户的密码，用在“修改自己的密码”
BllAdminUser.chgSelfPass = function (uid, oldPwd, newPwd, callbackFun) {
    oldPwd = Helper.sha1(oldPwd);
    BllAdminUser.get(uid, function (u) {
        if (u) {
            if (u.pass == oldPwd) {
                dbInstance.chgPass(uid, Helper.sha1(newPwd), function (err) {
                    if (err) {
                        Helper.log(err);
                    }
                    callbackFun({err: err ? 500 : 0});
                });
            } else {
                callbackFun({err: 403}); // 输入的旧密码不正确
            }
        } else {
            callbackFun({err: 402});// 登录用户不存在
        }
    });
};


// 删除指定的管理员
BllAdminUser.remove = function (uid, callbackFun) {
    dbInstance.remove(uid, function (err) {
        if (!err) {
        }
        callbackFun(err);
    });
};

// 新增管理员
BllAdminUser.add = function (uid, pass, roles, callbackFun) {
    pass = Helper.sha1(pass);
    dbInstance.add(uid, pass, roles, callbackFun);
};


// 修改除密码之外的信息
BllAdminUser.update = function (uid, roles, callbackFun) {
    dbInstance.update(uid, roles, callbackFun);
};



BllAdminUser.genToken = function (uid) {
    return Helper.aes((Date.now() + 43200000) + '$' + uid);
};

// return: {
//      err: 0:token不正确；1:有效的token；2:token已过期或没有权限
//      [ uid ]
// }
BllAdminUser.checkToken = function (token, callbackFun) {
    var str = Helper.deAes(token),
        idx = str.indexOf('$'),
        re = { err: 0 };
    if (idx > 0) {
        var t = str.substr(0, idx), uid = str.substr(idx + 1);
        if (uid) {
            t = parseInt(t);
            if (t > Date.now()) {
                re.err = 1;
                re.uid = uid;
                re.dt = t;
                BllAdminUser.get(uid, function (user) {
                    if (user) {
                        callbackFun(re);
                    } else {
                        re.err = 2;
                        callbackFun(re);
                    }
                });
            } else {
                re.err = 2;
                callbackFun(re);
            }
        } else {
            callbackFun(re);
        }
    } else {
        callbackFun(re);
    }
};

/**
 * return :{
 *      err: 0:未登入或凭证过期或没有权限，1:登入状态
 *      [ uid ]
 * }
 * */
BllAdminUser.checkLoginState = function (req, res, callbackFun) {
    var authCookie = req.cookies.adminauth;
    var re = { err: 0 };
    if (authCookie) {
        BllAdminUser.checkToken(authCookie, function (state) {
            if (state.err == 1) {
                re.err = 1;
                re.uid = state.uid;
                if (state.dt - Date.now() < 7200000) {
                    res.cookie('adminauth', BllAdminUser.genToken(re.uid), { expires: new Date(Date.now() + 43200000) });
                }
            }
            callbackFun(re);
        });
    } else {
        callbackFun(re);
    }
};


module.exports = BllAdminUser;