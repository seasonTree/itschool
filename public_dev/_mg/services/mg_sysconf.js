'use strict';

define({
  name: 'mg_sysconf',
  fn: ['$http', function ($http) {
    this.data = null;

    var _this = this;

    this.gets = function (callbackFun) {
      $http.get('/mgapi/mg_sysconf/gets', {}).then(function (result) {
        if (result.data.data != '') {
          _this.data = result.data.data;
          if (callbackFun) {
            callbackFun(_this.data);
          }
        }
      });
      return _this;
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
      $http.get('/mgapi/mg_sysconf/query', { params: queryModel }).then(function (result) {
        if (result.data.err == 0) {
          _this.data = result.data.data;
          if (callbackFun) {
            callbackFun(_this.data);
          }
        }
      });
      return _this;
    };

    this.update = function (model, callbackFun) {
      $http.post('/mgapi/mg_sysconf/update', { model: model }).then(function (result) {
        if (result.data.err == 0) {
          var idx = -1;
          for (var i = 0; i < _this.data.length; i++) {
            if (_this.data[i].id == model.id) {
              idx = i;
              break;
            }
          }
          if (idx >= 0) {
            _this.data[i] = model;
          }
          callbackFun();
        }
      });
      return _this;
    };
  }]
});