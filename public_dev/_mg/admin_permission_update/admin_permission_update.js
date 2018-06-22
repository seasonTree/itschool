'use strict';

define({
    templateUrl: 'admin_permission_update/admin_permission_update.htm',
    services: ['services/adminPermissions'],
    btns: [{ txt: '提交', fn: 'btnSubmit' }],
    //autoClose:false,
    //size:'xxxl',
    controller: ['$scope', 'adminPermissions', function ($scope, adminPermissions) {

        $scope.title = '修改权限';

        adminPermissions.get($scope.$params.name, function (item) {
            if (item) {
                $scope.name = item.name;
                $scope.info = item.info;
            }
        });

        $scope.btnSubmit = function () {
            var name = $scope.name,
                info = $scope.info || '';
            if (name) {
                adminPermissions.update(name, info, function (result) {
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