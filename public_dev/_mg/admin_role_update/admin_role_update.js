'use strict';

define({
    templateUrl: 'admin_role_update/admin_role_update.htm',
    services: ['services/adminRoles', 'services/adminPermissions'],
    btns: [{ txt: '提交', fn: 'btnSubmit' }],
    //autoClose:false,
    //size:'xxxl',
    controller: ['$scope', 'adminRoles', 'adminPermissions', function ($scope, adminRoles, adminPermissions) {

        $scope.title = '修改角色';
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
                adminRoles.update(name, info, permissions, function (result) {
                    if (result.err == 0) {
                        $scope.close();
                    } else {
                        // TODO: error
                    }
                });
            }
        };

        $scope.checked = {};

        adminRoles.get($scope.$params.name, function (item) {
            if (item) {
                $scope.name = item.name;
                if (item.permissions) {
                    for (var _i = 0; _i < item.permissions.length; _i++) {
                        $scope.checked[item.permissions[_i]] = true;
                    }
                }
            }
        });

        adminPermissions.gets(function () {
            $scope.permissions = adminPermissions.data;
        });
    }]
});