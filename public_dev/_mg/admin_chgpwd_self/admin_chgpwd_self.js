'use strict';

define({
    templateUrl: 'admin_chgpwd_self/admin_chgpwd_self.htm',
    services: ['services/adminUsers'],
    controller: ['$scope', 'adminUsers', function ($scope, adminUsers) {

        $scope.title = '修改密码';
        $scope.submit = function () {
            var oldpwd = $scope.oldpwd,
                pwd = $scope.newpwd,
                pwd2 = $scope.newpwd2;
            if (oldpwd && pwd && pwd == pwd2) {
                adminUsers.chgSelfPwd(oldpwd, pwd, function (result) {
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