var util = require("util");
var DataAccess = require('./DataAccess');
var User = require('../entity/User');


var DbUser = function () {

};
util.inherits(DbUser, DataAccess);

DbUser.instance = null;

DbUser.getInstance = function () {
    if (!DbUser.instance) {
        DbUser.instance = new DbUser();
    }
    return DbUser.instance;
};

DbUser.prototype.get = function (plat, openid, callbackFun) {
    this.execRow('select * from users where `plat`=? and `openid`=?', [plat, openid], User, callbackFun);
};

DbUser.prototype.getById = function (id, callbackFun) {
    this.execRow('select * from users where `id`=?', [id], User, callbackFun);
};

// 可接受三个或四个参数。
// 前两个分别是 pageIndex、pageSize。
// 如果传三个参数，第三个参数需是回调function。
// 如果传四个参数，第三个是state，第四个是回调function。
DbUser.prototype.gets = function () {
    var pageIndex = arguments[0],
        pageSize = arguments[1];
    if (arguments.length == 3) {
        this.execRows('select * from users limit ?,?', [pageIndex * pageSize, pageSize], User, arguments[2]);
    } else {
        this.execRows('select * from users where `state`=? limit ?,?', [arguments[2], pageIndex * pageSize, pageSize], User, arguments[4]);
    }
};


// 新增
DbUser.prototype.add = function (plat, openid, beinvite, nname, avatar, sitename, sitetit, callbackFun) {
    var re = { err: 0 };
    this.execInTrans(function (cn, funCb) {
        this.execRowWithCn(cn, 'select * from users where plat=? and openid=?', [plat, openid], User, function (cn1, err, row) {
            if (!row) {
                this.execScalarWithCn(cn, 'select max(id) from users for update', null, function (cn2, err, v) {
                    if (err) {
                        re.err = 2;
                        funCb(false);//获取当前最大用户ID时发生错误了
                    } else {
                        var newId = 10000;
                        if (v) {
                            newId = v + 1;
                        }
                        var ctime = Helper.Date.toNumber(new Date());
                        var cols = ['`plat`', '`openid`', '`id`'];
                        var vals = ['?', '?', '?'];
                        var ps = [plat, openid, newId];
                        if (beinvite) {
                            cols.push('`beinvite`');
                            vals.push('?');
                            ps.push(beinvite);
                        }
                        if (nname) {
                            cols.push('`nname`');
                            vals.push('?');
                            ps.push(nname);
                        }
                        if (avatar) {
                            cols.push('`avatar`');
                            vals.push('?');
                            ps.push(avatar);
                        }
                        cols.push('`ctime`');
                        vals.push('?');
                        ps.push(ctime);
                        cols.push('`lstlogin`');
                        vals.push('?');
                        ps.push(ctime);
                        if (sitename) {
                            cols.push('`sitename`');
                            vals.push('?');
                            ps.push(sitename);
                        }
                        if (sitetit) {
                            cols.push('`sitename`');
                            vals.push('?');
                            ps.push(sitetit);
                        }
                        this.execNonQueryWithCn(cn, 'insert into users(' + cols.join(',') + ') value(' + vals.join(',') + ')', ps, function (cn3, err) {
                            if (err) {
                                re.err = 3;
                                funCb(false);//往users表写入数据时发生错误了
                            } else {
                                funCb(true, newId);//成功，将newId输出
                            }
                        });
                    }
                });
            } else {
                re.err = 1;
                funCb(false, row.id);//该用户已经存在
            }
        });

        //this.execNonQueryWithCn('replace into syscnf values(?,?,?,?,?)', [id, intv0, intv1, strv0, strv1], callbackFun);
    }, function (isSuccess, vals) {
        re.v = vals;
        callbackFun(re);
    });
};


// 禁用某个用户
DbUser.prototype.disable = function (id, callbackFun) {
    this.execNonQuery('update users set `state`=0 where `id`=?', [id], callbackFun);
};


// 修改某些字段
DbUser.prototype.update = function (id, nname, avatar, sitename, sitetit, callbackFun) {
    this.execNonQuery('update users set `nname`=?, `avatar`=?, `sitename`=?, `sitetit`=? where `id`=?', [nname, avatar, sitename, sitetit, id], callbackFun);
};

module.exports = DbUser;