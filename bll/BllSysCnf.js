var util = require('util');
var DbSysCnf = require('../dal/DbSysCnf');

var dbInstance = DbSysCnf.getInstance();

var BllSysCnf = function () { };

BllSysCnf.get = function (id, callbackFun) {
    //var cacheKey = 'syscnf_' + id;
    //Helper.cache.get(cacheKey, function (data) { 
    //    if (data) {
    //        callbackFun(data);
    //    } else {
    dbInstance.get(id, function (err, row) {
        if (!err && row) {
            //Helper.cache.set(cacheKey, row);
        }
        callbackFun(row);
    });
    //    }
    //});
};

BllSysCnf.getByStrv0 = function (strv0, callbackFun) {
    dbInstance.getByStrv0(strv0, function (err, row) {
        if (!err && row) {
            //Helper.cache.set(cacheKey, row);
        }
        callbackFun(row);
    });
};

BllSysCnf.gets = function (callbackFun) {
    dbInstance.gets(callbackFun);
};

BllSysCnf.query = function (queryModel, callbackFun) {
    dbInstance.query(queryModel, callbackFun);
};

BllSysCnf.remove = function (id, callbackFun) {
    dbInstance.remove(id, function (err) {
        if (!err) {
            //Helper.cache.remove('syscnf_' + id);
        }
        callbackFun(err);
    });
};


BllSysCnf.set = function (id, intv0, intv1, strv0, strv1, callbackFun) {
    dbInstance.set(id, intv0, intv1, strv0, strv1, function (err) {
        if (!err) {
            //Helper.cache.remove('syscnf_' + id);
        }
        callbackFun(err);
    });
};

//BllSysCnf.getMemberLelCnf = function (callbackFun) {
//    BllSysCnf.get(1, function (row) {
//        if (row && row.strv0) {
//            callbackFun(JSON.parse(row.strv0));
//        } else { 
//            callbackFun([]);
//        }
//    });
//};

BllSysCnf.genUID = function (callbackFun) {
    dbInstance.genUID(callbackFun);
};


module.exports = BllSysCnf;