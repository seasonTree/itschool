'use strict';

define({
    templateUrl: 'admin_update/admin_update.htm',
    services: ['services/adminUsers', 'services/adminRoles'],
    btns: [{ txt: '提交', fn: 'btnSubmit' }],
    //autoClose:false,
    //size:'xxxl',
    controller: ['$scope', 'adminUsers', 'adminRoles', function ($scope, adminUsers, adminRoles) {

        $scope.title = '修改管理员';
        $scope.btnSubmit = function () {
            var name = $scope.uname;
            if (name) {
                var roles = [];
                for (var k in $scope.checked) {
                    if ($scope.checked[k]) {
                        roles.push(k);
                    }
                }
                adminUsers.update(name, roles, function (result) {
                    if (result.err == 0) {
                        $scope.close();
                    } else {
                        // TODO: error
                    }
                });
            }
        };

        $scope.checked = {};

        adminUsers.get($scope.$params.uid, function (user) {
            $scope.uname = user.uid;
            if (user.roles) {
                for (var _i = 0; _i < user.roles.length; _i++) {
                    $scope.checked[user.roles[_i]] = true;
                }
            }
        });

        adminRoles.gets(function () {
            $scope.roles = adminRoles.data;
        });
    }]
});