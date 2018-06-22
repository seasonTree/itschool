'use strict';

define({
    templateUrl: 'admin_new/admin_new.htm',
    services: ['services/adminUsers', 'services/adminRoles'],
    btns: [{ txt: '提交', fn: 'btnSubmit' }],
    //autoClose:false,
    //size:'xxxl',
    controller: ['$scope', 'adminUsers', 'adminRoles', function ($scope, adminUsers, adminRoles) {

        $scope.title = '新增管理员';
        $scope.btnSubmit = function () {
            var name = $scope.uname,
                pwd = $scope.pwd;
            if (name && pwd) {
                var roles = [];
                for (var k in $scope.checked) {
                    if ($scope.checked[k]) {
                        roles.push(k);
                    }
                }
                adminUsers.add(name, pwd, roles, function (result) {
                    if (result.err == 0) {
                        $scope.close();
                    } else {
                        // TODO: error
                    }
                });
            }
        };

        $scope.checked = {};

        adminRoles.gets(function () {
            $scope.roles = adminRoles.data;
        });
    }]
});