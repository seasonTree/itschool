var BllAdminUser = require('../bll/BllAdminUser');
var BllAdminPermission = require('../bll/BllAdminPermission');
var BllAdminRole = require('../bll/BllAdminRole');
//var BllUser = require('../bll/BllUser');
//var BllMemberShipInfo = require('../bll/BllMemberShipInfo');
//var BllProject = require('../bll/BllProject');
//var BllStatisticsInfo = require('../bll/BllStatisticsInfo');
var BllSysCnf = require('../bll/BllSysCnf');
var Helper = require("../Helper");

exports.index = function (req, res) {
    BllAdminUser.checkLoginState(req, res, function (result) {
        if (result.err == 1) {
            var navs = [
            ];
            res.render('_mg', { navs: navs });
        } else {
            res.redirect('/_mg/login.htm');
        }
    });
};


exports.mglogin = function (req, res) {
    var uname = req.body.uname,
        pass = req.body.pass;//(string)密码。
    if (uname && pass) {
        BllAdminUser.get(uname, function (result) {
            if (result) {
                if (result.pass === Helper.sha1(pass)) {
                    res.cookie('adminauth', BllAdminUser.genToken(uname), { expires: new Date(Date.now() + 43200000), httpOnly: true });
                    res.send({ err: 0 });
                } else {
                    res.send({ err: 403 });//数据验证失败
                }
            } else {
                res.send({ err: 402 });//登录用户名不存在
            }
        });
    } else {
        res.send({ err: 401 });//参数不完整
    }
};


exports.mglogout = function (req, res) {
    var authCookie = req.cookies.adminauth;
    res.cookie('adminauth', null, { expires: new Date(Date.now() - 2000) });
    res.send({ err: 0 });
};





var mgapicnf = {
    '/mgapi/adminuser_gets': {
        // 取得所有的管理员
        method: 'get',
        handler: function (req, res, data, callbackFun) {
            BllAdminUser.gets(function (err, result) {
                var rs = [];
                if (!err && result) {
                    result.forEach(function (T) {
                        if (T.uid != 'root') {
                            rs.push({ uid: T.uid, roles: T.roles });
                            //rs.push(T);
                        }
                    });
                }
                callbackFun.apply(null, [{ err: err ? 500 : 0, data: rs }]);
            });
        }
    },
    '/mgapi/adminuser_add': {
        method: 'post',
        handler: function (req, res, data, callbackFun) {
            var uid = req.body.uid, pass = req.body.pass, roles = req.body.roles;
            if (roles) {
                roles = roles.split('|');
            } else {
                roles = [];
            }
            if (uid && pass) {
                BllAdminUser.add(uid, pass, roles, function (issucess) {
                    callbackFun.apply(null, [{ err: issucess ? 0 : 500 }]);
                });
            } else {
                callbackFun.apply(null, [{ err: 401 }]);
            }
        }
    },
    '/mgapi/adminuser_chgpass': {
        method: 'post',
        handler: function (req, res, data, callbackFun) {
            var uid = req.body.uid, pass = req.body.pass;
            if (uid && pass) {
                BllAdminUser.chgPass(data.state.uid, uid, pass, function (err, result) {
                    callbackFun.apply(null, [{ err: err ? 500 : 0 }]);
                });
            } else {
                callbackFun.apply(null, [{ err: 401 }]);
            }
        }
    },
    '/mgapi/adminuser_chgpass_self': {
        method: 'post',
        handler: function (req, res, data, callbackFun) {
            var oldpwd = req.body.oldpwd, newpwd = req.body.newpwd;
            Helper.log();
            if (oldpwd && newpwd) {
                BllAdminUser.chgSelfPass(data.state.uid, oldpwd, newpwd, function (err, result) {
                    callbackFun.apply(null, [err]);
                });
            } else {
                callbackFun.apply(null, [{ err: 401 }]);
            }
        }
    },
    '/mgapi/adminuser_remove': {
        method: 'post',
        handler: function (req, res, data, callbackFun) {
            var uid = req.body.uid;
            if (uid) {
                BllAdminUser.remove(uid, function (err, result) {
                    callbackFun.apply(null, [{ err: err ? 500 : 0 }]);
                });
            } else {
                callbackFun.apply(null, [{ err: 401 }]);
            }
        }
    },
    '/mgapi/adminuser_update': {
        method: 'post',
        handler: function (req, res, data, callbackFun) {
            var uid = req.body.uid, roles = req.body.roles;
            if (uid) {
                if (roles) {
                    roles = roles.split('|');
                } else {
                    roles = [];
                }
                BllAdminUser.update(uid, roles, function (issuccess) {
                    callbackFun.apply(null, [{ err: issuccess ? 0 : 500 }]);
                });
            } else {
                callbackFun.apply(null, [{ err: 401 }]);
            }
        }
    },
    '/mgapi/adminpermission_gets': {
        method: 'get',
        handler: function (req, res, data, callbackFun) {
            BllAdminPermission.gets(function (err, result) {
                callbackFun.apply(null, [{ err: err ? 500 : 0, data: result }]);
            });
        }
    },
    '/mgapi/adminpermission_add': {
        method: 'post',
        handler: function (req, res, data, callbackFun) {
            var name = req.body.name, info = req.body.info || '';
            BllAdminPermission.add(name, info, function (err, result) {
                callbackFun.apply(null, [{ err: err ? 500 : 0 }]);
            });
        }
    },
    '/mgapi/adminpermission_remove': {
        method: 'post',
        handler: function (req, res, data, callbackFun) {
            var name = req.body.name;
            BllAdminPermission.remove(name, function (err, result) {
                callbackFun.apply(null, [{ err: err ? 500 : 0 }]);
            });
        }
    },
    '/mgapi/adminpermission_update': {
        method: 'post',
        handler: function (req, res, data, callbackFun) {
            var name = req.body.name, info = req.body.info;
            BllAdminPermission.update(name, info, function (err) {
                callbackFun.apply(null, [{ err: err }]);
            });
        }
    },
    '/mgapi/adminrole_gets': {
        method: 'get',
        handler: function (req, res, data, callbackFun) {
            BllAdminRole.gets(function (err, result) {
                callbackFun.apply(null, [{ err: err ? 500 : 0, data: result }]);
            });
        }
    },
    '/mgapi/adminrole_add': {
        method: 'post',
        handler: function (req, res, data, callbackFun) {
            var name = req.body.name, info = req.body.info || '', permissions = req.body.permissions;
            if (permissions) {
                permissions = permissions.split('|');
            } else {
                permissions = [];
            }
            BllAdminRole.add(name, info, permissions, function (err) {
                callbackFun.apply(null, [{ err: err }]);
            });
        }
    },
    '/mgapi/adminrole_remove': {
        method: 'post',
        handler: function (req, res, data, callbackFun) {
            var name = req.body.name;
            BllAdminRole.remove(name, function (err) {
                callbackFun.apply(null, [{ err: err }]);
            });
        }
    },
    '/mgapi/adminrole_update': {
        method: 'post',
        handler: function (req, res, data, callbackFun) {
            var name = req.body.name, info = req.body.info || '', permissions = req.body.permissions;
            if (permissions) {
                permissions = permissions.split('|');
            } else {
                permissions = [];
            }
            BllAdminRole.update(name, info, permissions, function (err) {
                callbackFun.apply(null, [{ err: err }]);
            });
        }
    },
    '/mgapi/mg_users/gets': {
        method: 'get',
        handler: function (req, res, data, callbackFun) {
            BllUser.gets(function (err, result) {
                callbackFun.apply(null, [{ err: err ? 500 : 0, data: result }]);
            });
        }
    },
    '/mgapi/mg_users/query': {
        method: 'get',
        handler: function (req, res, data, callbackFun) {
            BllUser.query(req.query, function (err, result) {
                callbackFun.apply(null, [{ err: err ? 500 : 0, data: result }]);
            });
        }
    },
    '/mgapi/mg_users/remove': {
        method: 'post',
        handler: function (req, res, data, callbackFun) {
            var id = req.body.id;
            BllUser.remove(id, function (err) {
                callbackFun.apply(null, [{ err: err }]);
            });
        }
    },
    //'/mgapi/mg_users/setSpecialLimit': {
    //    method: 'post',
    //    handler: function (req, res, data, callbackFun) {
    //        var id = req.body.id;
    //        var special_limit = req.body.special_limit;

    //        BllMemberShipInfo.getByUserId(id, function(err, row) {
    //            if(!err) {
    //                row.special_limit = special_limit;
    //                BllMemberShipInfo.update(row, function(success) {
    //                    if(success) {
    //                        callbackFun.apply(null, [{ err: 0 }]);
    //                    } else {
    //                        callbackFun.apply(null, [{ err: 500 }]);
    //                    }
    //                })
    //            }else{
    //                callbackFun.apply(null, [{ err: 500 }]);
    //            }
    //        })
    //    }
    //},
    '/mgapi/mg_sysconf/gets': {
        method: 'get',
        handler: function (req, res, data, callbackFun) {
            BllSysCnf.gets(function (err, result) {
                callbackFun.apply(null, [{ err: err ? 500 : 0, data: result }]);
            });
        }
    },
    '/mgapi/mg_sysconf/query': {
        method: 'get',
        handler: function (req, res, data, callbackFun) {
            BllSysCnf.query(req.query, function (err, result) {
                callbackFun.apply(null, [{ err: err ? 500 : 0, data: result }]);
            });
        }
    },
    '/mgapi/mg_sysconf/update': {
        method: 'post',
        handler: function (req, res, data, callbackFun) {
            var entity = req.body.model;
            BllSysCnf.set(entity.id, entity.intv0, entity.intv1, entity.strv0,entity.strv1, function(err){
                callbackFun.apply(null, [{ err: err ? 500 : 0 }]);
            });
        }
    }
};


exports.mgapi_router = function (req, res) {
    BllAdminUser.checkLoginState(req, res, function (state) {
        if (state.err == 1) {
            var cnf = mgapicnf[req._parsedUrl.pathname], method = req.method.toLowerCase();
            if (cnf && (!cnf.method || method == cnf.method)) {
                cnf.handler.apply(null, [req, res, { state: state }, function (result) {
                    res.send(result);
                }]);
            } else {
                res.send({ err: 400 });
            }
        } else {
            res.send({ err: 400 });
        }
    });
};
