'use strict';

define({
    templateUrl: 'mg_users/mg_users.htm',
    services: ['services/mg_users'],
    controller: ['$scope', '$http', '$mdDialog', '$mdToast', 'mg_users', function ($scope, $http, $mdDialog, $mdToast, mg_users) {
        $scope.title = '用户管理';
        $scope.userQueryModel = {};
        $scope.viewCrl = {};
        $scope.userTypeChange = function (val) {
            mg_users.filter($scope.viewCrl, function (data) {
                $scope.tbData.rows = data;
            });
        };
        $scope.query = function () {
            mg_users.query($scope.userQueryModel, function () {
                mg_users.filter($scope.viewCrl, function (data) {
                    $scope.tbData.rows = data;
                });
            });
        };

        $scope.set_max_project_num4person = function (user) {
            var outScope = $scope;

            function DialogController($scope, $mdDialog) {
                $scope.special_limit = user.special_limit;
                $scope.disableSet = true;
                if ($scope.special_limit == -1 || $scope.special_limit == 0) {
                    $scope.limitType = $scope.special_limit;
                } else {
                    $scope.limitType = -2;
                    $scope.special_limit_set = $scope.special_limit;
                    $scope.disableSet = false;
                }
                $scope.limitTypeChange = function () {
                    $scope.limitType = parseInt($scope.limitType);
                    if ($scope.limitType == -1 || $scope.limitType == 0) {
                        $scope.disableSet = true;
                        $scope.special_limit_set = $scope.limitType;
                    } else {
                        $scope.disableSet = false;
                        $scope.special_limit_set = 1;
                    }
                };
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
                $scope.submitDialog = function () {
                    mg_users.setSpecialLimit(user, $scope.special_limit_set, function (success) {
                        if (success) {
                            outScope.query();
                        }
                        $mdDialog.hide();
                    });
                };
            }

            function showDialog($event) {
                $mdDialog.show({
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    template: '<md-dialog aria-label="set max project num for person">' + '  <md-dialog-content>' + '    <form name="max_project_num" style="padding: 20px;">' + '       <p>' + '       <div style="font-size: 20px;margin-bottom: 15px;margin-top: -10px;">个人项目数限制' + '       </div>' + '       <md-radio-group ng-model="limitType" ng-change="limitTypeChange()">' + '           <md-radio-button value="-1">无限</md-radio-button>' + '           <md-radio-button value="0">不设置</md-radio-button>' + '           <md-radio-button value="-2">其他</md-radio-button>' + '       </md-radio-group>' + '       <md-input-container ng-show="!disableSet">' + '           <label>项目数设置</label>' + '           <input ng-disabled="disableSet" type="number" min="1" ng-model="special_limit_set" />' + '       </md-input-container>' + '       </p>' + '    </form>' + '  </md-dialog-content>' + '  <md-dialog-actions>' + '    <md-button ng-click="closeDialog()" class="md-primary">' + '      取消' + '    </md-button>' + '    <md-button ng-click="submitDialog()" class="md-warn md-raised">' + '      确认' + '    </md-button>' + '  </md-dialog-actions>' + '</md-dialog>',
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
            heads: [{
                tit: 'id',
                style: {
                    width: '5%'
                }
            }, {
                tit: '昵称',
                style: {
                    width: '10%'
                }
            }, {
                tit: '注册时间',
                style: {
                    width: '15%'
                }
            }, {
                tit: '是否QQ用户',
                style: {
                    width: '10%'
                }
            }, {
                tit: '会员等级',
                style: {
                    width: '10%'
                }
            }, {
                tit: '个人项目数限制',
                style: {
                    width: '15%'
                }
            }],
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
            fields: [{
                text: 'id'
            }, {
                text: 'display_name'
            }, {
                text: function text(row) {
                    // let ret = 
                    return new Date(row.create_time).toLocaleString();
                }
            }, {
                text: function text(row) {
                    // let ret = 
                    return row.qq_open_id == '' ? '否' : '是';
                }
            }, {
                text: function text(row) {
                    if (row.member_level == 0 || new Date(row.member_expire_time).getTime() < new Date().getTime()) {
                        return '普通会员';
                    } else {
                        if (row.member_level == 1) {
                            return '黄金会员';
                        }

                        if (row.member_level == 2) {
                            return '钻石会员';
                        }
                    }

                    return '数据错误';
                }
            }, {
                text: function text(row) {
                    if (row.special_limit == 0) {
                        return '未设置';
                    } else if (row.special_limit == -1) {
                        return '无限';
                    } else {
                        return row.special_limit + '';
                    }
                }
            }],
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
                style: {
                    width: '20%',
                    textAlign: 'center'
                },
                // 每一行中“管理栏”所显示的button的定义。是一个array。每一项就是一个button的定义。
                btns: [{
                    text: '更多信息',
                    'class': 'md-icon-button icon-btn-mini',
                    icon: 'info',
                    sref: function sref(row) {
                        return 'mg_users_check({id:"' + row.id + '"})';
                    },
                    target: 'right'
                }, {
                    text: '设置个人项目数',
                    'class': 'md-icon-button icon-btn-mini',
                    icon: 'perm_data_setting',
                    fn: function fn(row) {
                        $scope.set_max_project_num4person(row);
                    }
                }, {
                    text: '删除',
                    'class': 'md-icon-button icon-btn-mini md-warn',
                    icon: 'delete_forever',
                    confirm: '确定要删除此用户吗？',
                    fn: function fn(row) {
                        mg_users.remove(row.id);
                    }
                }]
                // --------------------------------------------
            } };

        // 读取用户列表
        mg_users.gets(function () {
            $scope.tbData.rows = mg_users.data;
        });

        $scope.showSimpleToast = function (message) {
            $mdToast.show($mdToast.simple().textContent(message).position('top right').hideDelay(2000));
        };
    }]
});