'use strict';

define({
  name: 'mg_users',
  fn: ['$http', function ($http) {
    this.data = null;
    this.filterData = null;

    var _this = this;

    this.gets = function (callbackFun) {
      $http.get('/mgapi/mg_users/gets', {}).then(function (result) {
        if (result.data.data != '') {
          _this.data = result.data.data;
          if (callbackFun) {
            callbackFun(_this.data);
          }
        }
      });
      return _this;
    };

    this.filter = function (condition, callbackFun) {
      this.filterData = this.data;
      if (condition.userType) {
        if (condition.userType == 'qq') {
          this.filterData = this.data.filter(function (value) {
            return !!value.qq_open_id;
          });
        } else if (condition.userType == 'kw') {
          this.filterData = this.data.filter(function (value) {
            return !!!value.qq_open_id;
          });
        }
      }

      if (callbackFun) callbackFun(_this.filterData);
    };

    this.get = function (id, callbackFun) {
      var _get = function _get() {
        var _item = null;
        if (_this.data) {
          for (var _i = 0; _i < _this.data.length; _i++) {
            var _t = _this.data[_i];
            if (_t.id == id) {
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

    this.query = function (queryModel, callbackFun) {
      $http.get('/mgapi/mg_users/query', {
        params: queryModel
      }).then(function (result) {
        if (result.data.err == 0) {
          console.log('query', result.data.data);
          _this.data = result.data.data;
          if (callbackFun) {
            callbackFun(_this.data);
          }
        }
      });
      return _this;
    };

    this.remove = function (uid) {
      $http.post('/mgapi/mg_users/remove', {
        id: uid
      }).then(function (result) {
        if (result.data.err == 0) {
          var idx = -1;
          for (var i = 0; i < _this.data.length; i++) {
            if (_this.data[i].id == uid) {
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

    this.setSpecialLimit = function (user, limit, cb) {
      if (user.special_limit == limit) {
        if (cb) cb(false);
      } else {
        $http.post('/mgapi/mg_users/setSpecialLimit', {
          id: user.id,
          special_limit: limit
        }).then(function (result) {
          if (result.data.err == 0) {
            if (cb) cb(true);
          } else {
            if (cb) cb(false);
          }
        });
      }
    };
  }]
});