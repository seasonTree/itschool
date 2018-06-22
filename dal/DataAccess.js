var mysql = require('mysql');
var config = require('../SiteConfig');
var DataAccess = function () {

};

DataAccess.getConn = function () {
    var cn = mysql.createConnection(config.mySql);
    cn.connect(function (err) {
        if (err) {
            Helper.log('db connect error: ' + err);
            return;
        }
    });
    cn.on('error', function (err) {
        Helper.log('db error: ' + err);
    });
    return cn;
};

//执行单个带参数的sql查询
DataAccess.prototype.exec = function (sql, sqlParams, callbackFun) {
    var cn = DataAccess.getConn();
    cn.query(sql, sqlParams, function () {
        callbackFun.apply(this, arguments);
        cn.end(function (err) {
            if (err) {
                Helper.log('db end error: exec(' + sql + ') ' + err);
                return;
            }
        });
    });
};

DataAccess.prototype._execMulti_single = function (idx, cn, sql, params, callbackFun) {
    cn.query(sql, params, function () {
        callbackFun(idx, arguments);
    });
};

// ary: [{sql:'xxxx', params:[1,2]}] 执行多个带参数的sql查询
DataAccess.prototype.execMulti = function (ary, callbackFun) {
    var cn = DataAccess.getConn(), results = [], n=0;
    for (var i = 0; i < ary.length; i++) {
        var item = ary[i];
        //cn.query(item.sql, item.params, function () {
        //    results.push(arguments);
        //    n++;
        //    if (n >= ary.length) {
        //        callbackFun.apply(this, results);
        //        cn.end(function (err) {
        //            if (err) {
        //                return;
        //            }
        //        });
        //    }
        //});
        this._execMulti_single(i, cn, item.sql, item.params, function (idx, args) {
            results[idx] = args;
            n++;
            if (n >= ary.length) {
                callbackFun(results);
                cn.end(function (err) {
                    if (err) {
                        Helper.log('db end error: execMulti(' + sql + ') ' + err);
                    }
                });
            }
        });
    }
};

DataAccess.prototype.execWithCn = function (cn, sql, sqlParams, callbackFun) {
    cn = cn || DataAccess.getConn();
    var _this = this;
    cn.query(sql, sqlParams, function () {
        var result = [cn];
        for (var k in arguments) {
            result.push(arguments[k]);
        }
        if (result[1]) {
            Helper.log('DataAccess.execWithCn(' + sql + ') throw err: ');
            Helper.log(result[1]);
            cn.end(function (err) {
                if (err) {
                    Helper.log('db end error: execWithCn(' + sql + ') ' + err);
                }
            });
        }
        callbackFun.apply(_this, result);
    });
};

//执行一条带参数的非查询sql，返回err/受影响的行数/插入的id
DataAccess.prototype.execNonQuery = function (sql, sqlParams, callbackFun) {
    var _this = this;
    this.exec(sql, sqlParams, function (err, result) {
        var ps = [err];
        if (!err) {
            ps.push(result.affectedRows);
            ps.push(result.insertId);
        }
        ps.push(result);
        callbackFun.apply(_this, ps);
    });
};

DataAccess.prototype.execNonQueryWithCn = function (cn, sql, sqlParams, callbackFun) {
    var _this = this;
    this.execWithCn(cn, sql, sqlParams, function (cn, err, result) {
        var ps = [cn, err];
        if (!err) {
            ps.push(result.affectedRows);
            ps.push(result.insertId);
        }
        ps.push(result);
        if (callbackFun) {
            callbackFun.apply(_this, ps);
        }
    });
};

DataAccess.prototype.execScalar = function (sql, sqlParams, callbackFun) {
    var _this = this;
    this.exec(sql, sqlParams, function (err, result) {
        var v = undefined;
        if (!err && result) {
            if (result.length > 0) {
                var row = result[0];
                for (var k in row) {
                    v = row[k];
                    break;
                }
            }
        }
        callbackFun.apply(_this, [err, v, result]);
    });
};

DataAccess.prototype.execScalarWithCn = function (cn, sql, sqlParams, callbackFun) {
    var _this = this;
    this.execWithCn(cn, sql, sqlParams, function (cn1, err, result) {
        var v = undefined;
        if (!err && result) {
            if (result.length > 0) {
                var row = result[0];
                for (var k in row) {
                    v = row[k];
                    break;
                }
            }
        }
        callbackFun.apply(_this, [cn1, err, v, result]);
    });
};

DataAccess.prototype.execRows = function (sql, sqlParams, classFun, callbackFun) {
    var _this = this;
    this.exec(sql, sqlParams, function (err, result) {
        var rows = [];
        if (!err) {
            result.forEach(function (T) {
                //var o = new classFun(), ary = [o];
                //for (var k in T) { 
                //    ary.push(T[k]);
                //}
                //classFun.call.apply(classFun, ary);
                //rows.push(o);
                if (classFun) {
                    rows.push(new classFun(T));
                } else {
                    rows.push(T);
                }
            });
        }
        callbackFun.apply(_this, [err, rows]);
    });
};

DataAccess.prototype.execRowsWithCn = function (cn, sql, sqlParams, classFun, callbackFun) {
    var _this = this;
    this.execWithCn(cn, sql, sqlParams, function (cn1, err, result) {
        var rows = [];
        if (!err) {
            result.forEach(function (T) {
                //var o = new classFun(), ary = [o];
                //for (var k in T) { 
                //    ary.push(T[k]);
                //}
                //classFun.call.apply(classFun, ary);
                //rows.push(o);
                if (classFun) {
                    rows.push(new classFun(T));
                } else {
                    rows.push(T);
                }
            });
        }
        callbackFun.apply(_this, [cn1, err, rows]);
    });
};

DataAccess.prototype.execRow = function (sql, sqlParams, classFun, callbackFun) {
    var _this = this;
    this.exec(sql, sqlParams, function (err, result) {
        var row = null;
        if (!err && result.length > 0) {
            if (classFun) {
                row = new classFun(result[0]);
            } else {
                row = result[0];
            }
        }
        callbackFun.apply(_this, [err, row]);
    });
};

DataAccess.prototype.execRowWithCn = function (cn, sql, sqlParams, classFun, callbackFun) {
    var _this = this;
    this.execWithCn(cn, sql, sqlParams, function (cn1, err, result) {
        var row = null;
        if (!err && result.length > 0) {
            if (classFun) {
                row = new classFun(result[0]);
            } else {
                row = result[0];
            }
        }
        callbackFun.apply(_this, [cn1, err, row]);
    });
};


// execFun 为需在transaction中执行的方法。两个参数，第一个为cn，
//          第二个为function， 在execFun的结尾需调用此function， 
//              此function有两个参数， 第一个参数决定是否需回滚，true表示执行成功，提交，false表示执行失败，回滚。第二个参数为需在callbackFun中返回的参数
// callbackFun 回调function，有两个参数。第一个为transaction是否成功，第二个为执行后返回的数据
DataAccess.prototype.execInTrans = function (execFun, callbackFun) {
    var cn = DataAccess.getConn(), _this = this,
        execCallback = function (re, result) {
            cn.end(function (err) {
                if (err) {
                    Helper.log('DataAccess.execInTrans Exception(0):' + err.message);
                }
                if (callbackFun) {
                    callbackFun.apply(_this, [re, result]);
                }
            });
        },
        execRollback = function (err, result) {
            cn.rollback(function () {
                if (err) {
                    Helper.log('DataAccess.execInTrans Exception(1): ' + err.message);
                }
                execCallback(false, result);
            });
        };
    cn.beginTransaction(function (err) {
        if (err) { throw err; }
        execFun.apply(_this, [cn, function (issuccess, result) {
            if (issuccess) {
                cn.commit(function (errCommit) {
                    if (errCommit) {
                        execRollback(errCommit);
                    } else {
                        execCallback(true, result);
                    }
                });
            } else {
                execRollback(null, result);
            }
        }]);
    });
};


module.exports = DataAccess;