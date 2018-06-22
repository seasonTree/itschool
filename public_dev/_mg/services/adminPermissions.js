'use strict';

define({
    services: ['services/adminRoles'],
    name: 'adminPermissions',
    fn: ['$http', 'adminRoles', function ($http, adminRoles) {
        this.data = null;

        var _this = this;

        this.gets = function (callbackFun) {
            if (this.data) {
                callbackFun(_this.data);
            } else {
                $http.get('/mgapi/adminpermission_gets', { params: {} }).then(function (result) {
                    _this.data = result.data.data;
                    if (callbackFun) {
                        callbackFun(_this.data);
                    }
                });
            }
            return _this;
        };

        this.add = function (name, info, callbackFun) {
            $http.post('/mgapi/adminpermission_add', { name: name, info: info }).then(function (result) {
                if (result.data.err == 0) {
                    _this.data.push({
                        name: name,
                        info: info
                    });
                    callbackFun(result.data);
                }
            });
        };

        this.remove = function (name, callbackFun) {
            $http.post('/mgapi/adminpermission_remove', { name: name }).then(function (result) {
                if (result.data.err == 0) {
                    //_this.data = _this.data.filter(function (item) {
                    //    return item.uid != name;
                    //});
                    var idx = -1;
                    for (var i = 0; i < _this.data.length; i++) {
                        if (_this.data[i].name == name) {
                            idx = i;
                            break;
                        }
                    }
                    if (idx >= 0) {
                        _this.data.splice(idx, 1);
                    }

                    if (adminRoles.data) {
                        adminRoles.data.forEach(function (role) {
                            if (role.permissions) {
                                role.permissions = role.permissions.filter(function (pms) {
                                    if (pms != name) {
                                        return pms;
                                    }
                                });
                            }
                        });
                    }
                }
                callbackFun(result.data);
            });
        };

        this.get = function (name, callbackFun) {
            this.gets(function (lst) {
                var t = null;
                for (var i = 0; i < lst.length; i++) {
                    var item = lst[i];
                    if (item.name == name) {
                        t = item;
                        break;
                    }
                }
                callbackFun(t);
            });
        };

        this.update = function (name, info, callbackFun) {
            $http.post('/mgapi/adminpermission_update', { name: name, info: info }).then(function (result) {
                if (result.data.err == 0) {
                    for (var i = 0; i < _this.data.length; i++) {
                        if (_this.data[i].name == name) {
                            _this.data[i].info = info;
                            break;
                        }
                    }
                }
                callbackFun(result.data);
            });
        };
    }]
});