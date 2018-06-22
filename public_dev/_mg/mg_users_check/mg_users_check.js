'use strict';

define({
    templateUrl: 'mg_users_check/mg_users_check.htm',
    services: ['services/mg_users'],
    controller: ['$scope', '$http', '$mdDialog', '$mdToast', 'mg_users', function ($scope, $http, $mdDialog, $mdToast, mg_users) {
        $scope.title = '用户详情';
        // 读取用户列表
        mg_users.get($scope.$params.id, function (user) {
            $scope.userModel = user;
        });
    }]
});