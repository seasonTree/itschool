'use strict';

define({
    templateUrl: 'admin_permissions/admin_permissions.htm',
    services: ['services/adminPermissions'],
    size: 'xxxl',
    btns: [{
        txt: '新增权限',
        sref: 'admin_permission_new',
        target: 'right'
    }],
    controller: ['$scope', 'adminPermissions', function ($scope, adminPermissions) {
        $scope.title = '权限管理';

        $scope.tbData = {
            heads: [{ tit: '权限名', style: { width: '180px' } }, { tit: '说明', style: { width: '400px' } }],
            fields: [{ text: 'name' }, { text: 'info' }],
            rows: [],
            action: {
                style: { width: '120px' },
                btns: [{
                    text: '修改',
                    'class': 'md-icon-button md-primary',
                    icon: 'settings_ethernet',
                    sref: function sref(row) {
                        return 'admin_permission_update({name:"' + row.name + '"})';
                    },
                    target: 'right'
                }, {
                    text: '删除',
                    'class': 'md-icon-button md-warn',
                    icon: 'delete_forever',
                    confirm: '确定要删除此权限吗？',
                    fn: function fn(row) {
                        adminPermissions.remove(row.name, function (result) {
                            // TODO:
                        });
                    }
                }]
            }
        };

        adminPermissions.gets(function () {
            $scope.tbData.rows = adminPermissions.data;
        });
    }]
});