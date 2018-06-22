var util = require("util");
var DataAccess = require('./DataAccess');
var SysCnf = require('../entity/SysCnf');


var DbSysCnf = function () {

};
util.inherits(DbSysCnf, DataAccess);

DbSysCnf.instance = null;

DbSysCnf.getInstance = function () {
    if (!DbSysCnf.instance) {
        DbSysCnf.instance = new DbSysCnf();
    }
    return DbSysCnf.instance;
};

DbSysCnf.prototype.get = function (id, callbackFun) {
    this.execRow('select * from syscnf where `id`=?', [id], SysCnf, callbackFun);
};

DbSysCnf.prototype.getByStrv0 = function (strv0, callbackFun) {
    this.execRow('select * from syscnf where `strv0`=?', [strv0], SysCnf, callbackFun);
};

DbSysCnf.prototype.gets = function (callbackFun) {
    this.execRows('select * from syscnf', null, SysCnf, callbackFun);    
};

DbSysCnf.prototype.query = function (query, callbackFun) {
    let sql = 'select * from syscnf '
    let arrtArr = Object.keys(query);
    if (arrtArr.length > 0) {
        sql += 'where '
        arrtArr.forEach((attr,index) => {
            sql += `\`${attr}\` like '%${query[attr]}%' `
            if(index < arrtArr.length - 1) {
                sql += 'and '
            }
        })
    }
    this.execRows(sql, null, SysCnf, callbackFun);
};

DbSysCnf.prototype.remove = function (id, callbackFun) {
    this.execNonQuery('delete from syscnf where `id`=?', [id], callbackFun);
};

DbSysCnf.prototype.set = function (id, intv0, intv1, strv0, strv1, callbackFun) {
    this.execNonQuery('replace into syscnf values(?,?,?,?,?)', [id, intv0, intv1, strv0, strv1], callbackFun);
};

DbSysCnf.prototype.genUID = function (callbackFun) {
    var _this = this;
    this.execInTrans(function (cn, transFun) {
        var callbackToTrans = function (issuccess, re) {
            transFun.apply(_this, [issuccess, re]);
        };
        this.execRowWithCn(cn, 'select * from syscnf where `id`=120 for update', null, SysCnf, function (cn, err, cnf) {
            if (err) {
                Helper.log('DbSysCnf.genUID() Exception(0): ' + err.message);
                callbackToTrans(false);
            } else {
                if (!cnf) {
                    cnf = {};
                }
                var jsonv0 = cnf.strv0 ? JSON.parse(cnf.strv0) : {},
                    t = Math.floor(Math.random() * 90 + 10), strt = t + '', v1 = jsonv0[strt];
                if (v1) {
                    jsonv0[strt] = ++v1;
                } else {
                    v1 = jsonv0[strt] = 0;
                }
                this.execNonQueryWithCn(cn, 'replace into syscnf values(?,?,?,?,?)', [120, 0, 0, JSON.stringify(jsonv0), v1 > 90 ? 'Warning' : ''], function () {
                    callbackToTrans(true, t * 1000 + v1 * 10 + Math.floor(Math.random() * 10));
                });
            }
        });
    }, function (issuccess, result) {
        callbackFun(issuccess, result);
    });
};

module.exports = DbSysCnf;