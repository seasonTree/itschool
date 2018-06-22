'use strict';

define({
    name: 'adminUsers',
    fn: ['$http', function ($http) {
        this.data = null;

        var _this = this;

        this.gets = function (callbackFun) {
            $http.get('/mgapi/adminuser_gets', { params: {} }).then(function (result) {
                _this.data = result.data.data;
                if (callbackFun) {
                    callbackFun(_this.data);
                }
            });
            return _this;
        };

        this.get = function (uid, callbackFun) {
            var _get = function _get() {
                var _item = null;
                if (_this.data) {
                    for (var _i = 0; _i < _this.data.length; _i++) {
                        var _t = _this.data[_i];
                        if (_t.uid == uid) {
                            _item = _t;
                            break;
                        }
                    }
                }
                callbackFun(_item);
            };
            if (_this.data) {
                _get();
            } else {
                _this.gets(function () {
                    _get();
                });
            }
        };

        this.add = function (name, pwd, roles, callbackFun) {
            var strRoles = '';
            if (roles) {
                strRoles = roles.join('|');
            }
            $http.post('/mgapi/adminuser_add', { uid: name, pass: pwd, roles: strRoles }).then(function (result) {
                if (result.data.err == 0) {
                    _this.data.push({
                        uid: name,
                        cdate: Date.now(),
                        lstlogin: Date.now(),
                        state: 1,
                        roles: roles
                    });
                    callbackFun(result.data);
                }
            });
        };

        this.remove = function (name) {
            $http.post('/mgapi/adminuser_remove', { uid: name }).then(function (result) {
                if (result.data.err == 0) {
                    //_this.data = _this.data.filter(function (item) {
                    //    return item.uid != name;
                    //});
                    var idx = -1;
                    for (var i = 0; i < _this.data.length; i++) {
                        if (_this.data[i].uid == name) {
                            idx = i;
                            break;
                        }
                    }
                    if (idx >= 0) {
                        _this.data.splice(idx, 1);
                    }
                }
            });
        };

        this.chgPwd = function (name, newPwd, callbackFun) {
            $http.post('/mgapi/adminuser_chgpass', { uid: name, pass: newPwd }).then(function (result) {
                callbackFun(result.data);
            });
        };

        this.chgSelfPwd = function (oldPwd, newPwd, callbackFun) {
            $http.post('/mgapi/adminuser_chgpass_self', { oldpwd: oldPwd, newpwd: newPwd }).then(function (result) {
                callbackFun(result.data);
            });
        };

        this.update = function (name, roles, callbackFun) {
            var strRoles = '';
            if (roles) {
                strRoles = roles.join('|');
            }
            $http.post('/mgapi/adminuser_update', { uid: name, roles: strRoles }).then(function (result) {
                if (result.data.err == 0) {
                    for (var _i = 0; _i < _this.data.length; _i++) {
                        var item = _this.data[_i];
                        if (item.uid == name) {
                            item.roles = roles;
                            break;
                        }
                    }
                    callbackFun(result.data);
                }
            });
        };
    }]
});