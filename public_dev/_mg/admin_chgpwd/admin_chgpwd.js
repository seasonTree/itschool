'use strict';

define({
    templateUrl: 'admin_chgpwd/admin_chgpwd.htm',
    services: ['services/adminUsers'],
    btns: [{ txt: '提交', fn: 'btnSubmit' }],
    controller: ['$scope', 'adminUsers', function ($scope, adminUsers) {
        var uid = decodeURIComponent($scope.$params.uid);
        $scope.title = '修改密码';
        $scope.uid = uid;
        $scope.btnSubmit = function () {
            var pwd = $scope.pwd;
            if (uid && pwd) {
                adminUsers.chgPwd(uid, pwd, function (result) {
                    if (result.err == 0) {
                        $scope.close();
                    } else {
                        // TODO: error
                    }
                });
            }
        };
    }]
});