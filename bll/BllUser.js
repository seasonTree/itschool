var util = require('util');
var DbUser = require('../dal/DbUser');

var dbInstance = DbUser.getInstance();

var BllUser = function () { };


BllUser.__loginCaches = {};

BllUser.setLoginCache = function (uid, cookieVal, callbackFun) {
    BllUser.__loginCaches[uid] = cookieVal;
    callbackFun(true);
};

BllUser.getLoginCache = function (uid, callbackFun) {
    callbackFun(BllUser.__loginCaches[uid]);
};


BllUser.genToken = function (uid) {
    return Helper.aes((Date.now() + 43200000) + '$' + uid);
};


// return: {
//      err: 0:token不正确；1:有效的token；2:token已过期
//      [ uid ]
// }
BllUser.checkToken = function (token, callbackFun) {
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
                callbackFun(re);
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
 *      err: 0:未登入或凭证过期，1:登入状态
 *      [ uid ]
 * }
 * */
BllUser.checkLoginState = function (req, res, callbackFun) {
    var authCookie = req.cookies.user_auth;
    var re = { err: 0 };
    if (authCookie) {
        BllUser.checkToken(authCookie, function (state) {
            if (state.err == 1) {
                re.uid = state.uid;
                BllUser.getLoginCache(state.uid, function (ck) {
                    if (ck) {
                        re.err = 1;
                        if (state.dt - Date.now() < 7200000) {
                            var cookieVal = BllUser.genToken(re.uid);
                            res.cookie('user_auth', BllUser.genToken(re.uid), { expires: new Date(Date.now() + 43200000) });
                            BllUser.setLoginCache(uid, cookieVal, function (v) {
                                //callbackFun(v ? 1 : 3);
                            });
                        }
                        callbackFun(re);
                    } else {
                        callbackFun(re);
                    }
                });
            } else {
                callbackFun(re);
            }
        });
    } else {
        callbackFun(re);
    }
};


// 将当前用户设为登录状态
// uid: 需登录的用户的ID。如果为null，表示需从cookie中获取。
// obliged: 是否强制登录。如果为 true，不管是否已在其它地方登录，都会设为登录状态，并将其它登录者踢出
// callbackFun 回调参数：
//          1: 成功
//          2: 已在其它地方登录
//          3: 存储Cache时发生错误了
//          4: 为有传uid参数，并且在cookie中也找不到
BllUser.setLogon = function (uid, obliged, req, res, callbackFun) {
    var check = function () {
        if (uid) {
            BllUser.getLoginCache(uid, function (ck) {
                var cookieVal = BllUser.genToken(uid);
                res.cookie('user_auth', cookieVal, { expires: new Date(Date.now() + 43200000) });
                if (ck && !obliged) {
                    callbackFun(2); // 已在其它地方登录
                } else {
                    BllUser.setLoginCache(uid, cookieVal, function (v) {
                        callbackFun(v ? 1 : 3);
                    });
                }
            });
        } else {
            callbackFun(4);
        }
    };

    if (!uid) {
        var authCookie = req.cookies.user_auth;
        if (authCookie) {
            BllUser.checkToken(authCookie, function (data) {
                uid = data.uid;
                check();
            });
        } else {
            check();
        }
    } else {
        check();
    }
};


// 将当前用户设为登出状态
BllUser.setLogout = function (req, res, callbackFun) {
    BllUser.checkLoginState(req, res, function (re) {
        if (re.err == 1) {
            res.cookie('user_auth', null, { expires: new Date(Date.now() - 2000) });
            BllUser.setLoginCache(uid, undefined, function (v) {
                callbackFun();
            });
        } else {
            callbackFun();
        }
    });
};




// 根据平台ID和平台openId获得本系统内的帐户
// callbackFun 回调参数：
//          一个参数。如果有值，表示正常，否则表示获取失败或该用户不存在
BllUser.get = function (plat, openid, callbackFun) {
    //var cacheKey = 'syscnf_' + id;
    //Helper.cache.get(cacheKey, function (data) { 
    //    if (data) {
    //        callbackFun(data);
    //    } else {
    dbInstance.get(plat, openid, function (err, row) {
        if (!err && row) {
            //Helper.cache.set(cacheKey, row);
        }
        callbackFun(row);
    });
    //    }
    //});
};


// 根据用户的唯一标识符取得本系统内的帐户
// callbackFun 回调参数：
//          一个参数。如果有值，表示正常。否则表示获取失败或该用户不存在
BllUser.getById = function (id, callbackFun) {
    dbInstance.getById(id, function (err, row) {
        callbackFun(row);
    });
};


// 可接受三个或四个参数。
// 前两个分别是 pageIndex、pageSize。
// 如果传三个参数，第三个参数需是回调function。
// 如果传四个参数，第三个是state，第四个是回调function。
// 回调参数：
//          err：若发生错误，则此参数不为null，否则表示操作正常
//          rows：若操作正常，此参数是查询得到的数据
BllUser.gets = function () {
    dbInstance.gets(arguments);
};


// 用户使用第三方平台的账户登录后，在本系统做个记录
// plat：平台ID。1:QQ；2:微信
// openid：平台openId
// beinvite：邀请者的ID，如果没有邀请者，则传0
// nname：昵称。如果没有设置，则传从平台获得的昵称，如果仍然没有，则传''
// avatar：图像。如果没有设置，则传从平台获得的图像，如果仍然没有，则传''
// sitename：主页名。如果没有设置，则传''
// sitetit：主页标题。如果没有设置，则传''
// callbackFun 回调参数（object）：
//          err: 
//              0: 成功；1: 用户已存在；2: 获取当前最大用户ID时发生了错误；3: 往users表写入数据时发生了错误；
//          v:
//              当 err 的值为 0 或 1 时，有此值。
//              如果 err 的值为 1，则 v 的值为已经存在的用户的 ID。
//              如果 err 的值为 0，则 v 的值为新注册的用户的 ID。
BllUser.add = function (plat, openid, beinvite, nname, avatar, sitename, sitetit, callbackFun) {
    if (sitename) {
        sitename = sitename.toLowerCase();
    }
    dbInstance.add(plat, openid, beinvite, nname, avatar, sitename, sitetit, function (obj) {
        callbackFun(obj);
    });
};

// 根据用户的唯一标识符禁用账户
// callbackFun 回调参数：
//          第一个参数是err。如果该参数存在，则表示发生错误了，否则表示成功
BllUser.disable = function (id, callbackFun) {
    dbInstance.disable(id, callbackFun);
};


// 修改某些字段
// callbackFun 回调参数：
//         　err：如果有值，表示发生错误了。否则表示成功
BllUser.update = function (id, nname, avatar, sitename, sitetit, callbackFun) {
    if (sitename) {
        sitename = sitename.toLowerCase();
    }
    dbInstance.update(id, nname, avatar, sitename, sitetit, function (err) {
        callbackFun(err);
    });
};


module.exports = BllUser;