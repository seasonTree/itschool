var util = require("util");
var DataAccess = require('./DataAccess');
var AdminPermission = require('../entity/AdminPermission');


var DbAdminPermission = function () {

};
util.inherits(DbAdminPermission, DataAccess);

DbAdminPermission.instance = null;

DbAdminPermission.getInstance = function () {
    if (!DbAdminPermission.instance) {
        DbAdminPermission.instance = new DbAdminPermission();
    }
    return DbAdminPermission.instance;
};

DbAdminPermission.prototype.get = function (name, callbackFun) {
    this.execRow('select * from admin_permissions where `name`=?', [name], AdminPermission, callbackFun);
};

DbAdminPermission.prototype.gets = function (callbackFun) {
    this.execRows('select * from admin_permissions', null, AdminPermission, callbackFun);
};

DbAdminPermission.prototype.remove = function (name, callbackFun) {
    this.execNonQuery('delete from admin_permissions where `name`=?', [name], callbackFun);
};

DbAdminPermission.prototype.add = function (name, info, callbackFun) {
    this.execNonQuery('insert into admin_permissions(`name`,`info`) values(?,?)', [name, info], callbackFun);
};

DbAdminPermission.prototype.update = function (name, info, callbackFun) {
    this.execNonQuery('update admin_permissions set info=? where name=?', [info, name], callbackFun);
};

module.exports = DbAdminPermission;