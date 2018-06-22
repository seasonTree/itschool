'use strict';

define({
    templateUrl: 'admin_role_new/admin_role_new.htm',
    services: ['services/adminRoles', 'services/adminPermissions'],
    btns: [{ txt: '提交', fn: 'btnSubmit' }],
    //autoClose:false,
    //size:'xxxl',
    controller: ['$scope', 'adminRoles', 'adminPermissions', function ($scope, adminRoles, adminPermissions) {

        $scope.title = '新增角色';
        $scope.btnSubmit = function () {
            var name = $scope.name,
                info = $scope.info || '';
            if (name) {
                var permissions = [];
                for (var k in $scope.checked) {
                    if ($scope.checked[k]) {
                        permissions.push(k);
                    }
                }
                adminRoles.add(name, info, permissions, function (result) {
                    if (result.err == 0) {
                        $scope.close();
                    } else {
                        // TODO: error
                    }
                });
            }
        };

        $scope.checked = {};

        adminPermissions.gets(function () {
            $scope.permissions = adminPermissions.data;
        });
    }]
});