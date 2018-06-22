'use strict';

define({
    templateUrl: 'mg_sysconf_check/mg_sysconf_check.htm',
    services: ['services/mg_sysconf'],
    btns: [{ txt: '提交', fn: 'btnSubmit' }],
    controller: ['$scope', '$http', '$mdDialog', '$mdToast', 'mg_sysconf', function ($scope, $http, $mdDialog, $mdToast, mg_sysconf) {
        $scope.title = '详情';
        $scope.sysconfModel = {};
        // 读取
        mg_sysconf.get($scope.$params.id, function (model) {
            $scope.sysconfModel = angular.copy(model);
        });

        $scope.btnSubmit = function () {
            mg_sysconf.update($scope.sysconfModel);
            $scope.close();
        };
    }]
});