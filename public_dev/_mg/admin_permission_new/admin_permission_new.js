'use strict';

define({
    templateUrl: 'admin_permission_new/admin_permission_new.htm',
    services: ['services/adminPermissions'],
    btns: [{ txt: '提交', fn: 'btnSubmit' }],
    //autoClose:false,
    //size:'xxxl',
    controller: ['$scope', 'adminPermissions', function ($scope, adminPermissions) {

        $scope.title = '新增权限';
        $scope.btnSubmit = function () {
            var name = $scope.name,
                info = $scope.info || '';
            if (name) {
                adminPermissions.add(name, info, function (result) {
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