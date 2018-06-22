'use strict';

define({
    services: ['services/adminUsers'],
    name: 'adminRoles',
    fn: ['$http', 'adminUsers', function ($http, adminUsers) {
        this.data = null;

        var _this = this;

        this.gets = function (callbackFun) {
            $http.get('/mgapi/adminrole_gets', { params: {} }).then(function (result) {
                _this.data = result.data.data;
                if (callbackFun) {
                    callbackFun(_this.data);
                }
            });
            return _this;
        };

        this.get = function (name, callbackFun) {
            var _get = function _get() {
                var _result = null;
                if (_this.data) {
                    for (var _i = 0; _i < _this.data.length; _i++) {
                        var _item = _this.data[_i];
                        if (_item.name == name) {
                            _result = _item;
                            break;
                        }
                    }
                }
                callbackFun(_result);
            };
            if (_this.data) {
                _get();
            } else {
                _this.gets(function () {
                    _get();
                });
            }
        };

        this.add = function (name, info, permissions, callbackFun) {
            var strPermissions = '';
            if (permissions) {
                strPermissions = permissions.join('|');
            }
            $http.post('/mgapi/adminrole_add', { name: name, info: info, permissions: strPermissions }).then(function (result) {
                if (result.data.err == 0) {
                    _this.data.push({
                        name: name,
                        info: info,
                        permissions: permissions
                    });
                    callbackFun(result.data);
                }
            });
        };

        this.remove = function (name) {
            $http.post('/mgapi/adminrole_remove', { name: name }).then(function (result) {
                if (result.data.err == 0) {
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

                    if (adminUsers.data) {
                        adminUsers.data.forEach(function (T) {
                            if (T.roles) {
                                T.roles = T.roles.filter(function (M) {
                                    if (M != name) {
                                        return M;
                                    }
                                });
                            }
                        });
                    }
                }
            });
        };

        this.update = function (name, info, permissions, callbackFun) {
            var strPermissions = '';
            if (permissions) {
                strPermissions = permissions.join('|');
            }
            $http.post('/mgapi/adminrole_update', { name: name, info: info, permissions: strPermissions }).then(function (result) {
                if (result.data.err == 0) {
                    if (_this.data) {
                        var _item = null;
                        for (var _i = 0; _i < _this.data.length; _i++) {
                            var _t = _this.data[_i];
                            if (_t.name == name) {
                                _item = _t;
                                break;
                            }
                        }
                        if (_item) {
                            _item.info = info;
                            _item.permissions = permissions;
                        }
                    }
                    callbackFun(result.data);
                }
            });
        };
    }]
});