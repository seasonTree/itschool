'use strict';

define({
    templateUrl: 'mg_sysconf/mg_sysconf.htm',
    services: ['services/mg_sysconf'],
    controller: ['$scope', '$http', '$mdDialog', '$mdToast', 'mg_sysconf', function ($scope, $http, $mdDialog, $mdToast, mg_sysconf) {
        $scope.title = '系统管理';
        $scope.queryModel = {};
        $scope.query = function () {
            mg_sysconf.query($scope.queryModel, function () {
                $scope.tbData.rows = mg_sysconf.data;
            });
        };
        $scope.check = function (strv0) {
            mg_sysconf.query({ strv0: strv0 }, function () {
                var sysconfig = mg_sysconf.data[0];
                if (strv0 === 'max_project_num') {
                    $scope.set_max_project_num(sysconfig);
                }
            });
        };

        $scope.set_max_project_num = function (sysconfig) {
            var outScope = $scope;
            function DialogController($scope, $mdDialog) {
                $scope.sysconf = sysconfig;
                $scope.confObj = JSON.parse(sysconfig.strv1);
                $scope.lv0num = $scope.confObj[0];
                $scope.lv1num = $scope.confObj[1];
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
                $scope.submitDialog = function () {
                    $scope.sysconf.strv1 = JSON.stringify({
                        0: $scope.lv0num,
                        1: $scope.lv1num
                    });
                    mg_sysconf.update($scope.sysconf, function () {
                        outScope.query();
                    });
                    $mdDialog.hide();
                };
            }

            function showDialog($event) {
                $mdDialog.show({
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    template: '<md-dialog aria-label="set max project num">' + '  <md-dialog-content>' + '    <form name="max_project_num" style="padding: 20px;">' + '       <p>' + '       <md-input-container>' + '           <label>普通会员最大项目数</label>' + '           <input name="lv0num" type="number" min="10" ng-model="lv0num" />' + '       </md-input-container>' + '       </p>' + '       <p>' + '       <md-input-container>' + '           <label>一级会员最大项目数</label>' + '           <input name="lv1num" type="number" min="10" ng-model="lv1num" />' + '       </md-input-container>' + '       </p>' + '    </form>' + '  </md-dialog-content>' + '  <md-dialog-actions>' + '    <md-button ng-click="closeDialog()" class="md-primary">' + '      取消' + '    </md-button>' + '    <md-button ng-click="submitDialog()" class="md-warn md-raised">' + '      确认' + '    </md-button>' + '  </md-dialog-actions>' + '</md-dialog>',
                    controller: DialogController
                });
            }

            showDialog();
        };

        $scope.tbData = {
            // <button ui-sref="aaa" my-target="dialog"></button>
            // 可设置自己的 class，默认是 mytb，
            // 这个值可以是字符串，如：'yourtb'、'yourtb mintb red'
            // 也可以是一个object，如： { yourtb:true, mintb: true }
            // 'class': 'YOUR_CLASS_NAME',
            // -----------------------------------------
            // 定义table的标题，是一个array，
            // array中的每一项即为一列的标题，其中：
            // tit 为显示在标题行中的文字,
            // style 为样式，它是一个 object, 如：{ color: red, width: '500px' }
            // 标题中的文字默认居中对齐
            heads: [{ tit: 'id', style: { width: '5%' } }, { tit: 'intv0', style: { width: '10%' } }, { tit: 'intv1', style: { width: '10%' } }, { tit: 'strv0', style: { width: '20%' } }, { tit: 'strv1', style: { width: '20%' } }],
            // -----------------------------------------
            // 每一行的每一个单元格中显示的数据是什么，
            // 它是一个 array，其中每一个项即表示每一列的定义。
            // text: 可以是一个string，也可以是一个function。
            //      当是一个string时，会将数据中对应字段名的值显示在这里，
            //      当是一个function时，会将该function执行后的返回值显示在这里，这个function在执行时会将当行数据传入进入
            //          示例：{ text: function(row){ return row.name + row.age; } }
            // style: 单元格的样式。可以是一个 object，也可以是一个 function。
            //      object 的示例：{ text: 'name', style: {color:'red'} }
            //      function 的示例：
            //          {
            //              text: 'name',
            //              style: function(row){ // 显示在这里的行的数据会被传入到此function
            //                  return { color: row.age > 10 ? 'red' : 'blue'; };
            //              }
            //          }
            fields: [{ text: 'id' }, { text: 'intv0' }, { text: 'intv1' }, { text: 'strv0' }, { text: 'strv1' }],
            // -----------------------------------------
            // 要显示在表格中的数据，它是一个 array。
            // 如： [ { name: 'aaa', age: 10 }, { name: 'bbb', age: 20 } ]
            rows: $scope.tbDataList,
            // -----------------------------------------
            // 如果有配置此字段，则会在每一行最后有一个“管理栏”
            action: {
                // “管理栏”的样式（是指“管理栏”头部的样式），是一个 object
                title: '操作',
                // 示例： { width: '300px', backgroundColor: '#444' }
                style: { width: '35%', textAlign: 'center' },
                // 每一行中“管理栏”所显示的button的定义。是一个array。每一项就是一个button的定义。
                btns: [{
                    text: '更多信息',
                    'class': 'md-icon-button icon-btn-mini',
                    icon: 'settings',
                    sref: function sref(row) {
                        return 'mg_sysconf_check({id:"' + row.id + '"})';
                    },
                    target: 'right'
                }]
                // --------------------------------------------
            } };

        // 读取列表
        mg_sysconf.gets(function () {
            $scope.tbData.rows = mg_sysconf.data;
        });

        $scope.showSimpleToast = function (message) {
            $mdToast.show($mdToast.simple().textContent(message).position('top right').hideDelay(2000));
        };
    }]
});