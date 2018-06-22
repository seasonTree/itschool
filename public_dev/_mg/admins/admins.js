'use strict';

define({
    // template: '<div>.........</div>', // 模板内容。如果配置了此项，则会忽略 templateUrl 的配置。
    templateUrl: 'admins/admins.htm', // 模板文件路径，实例路径是： window.CONFIG.root + templateUrl。如果配置了 template，则会忽略此配置。
    services: ['services/adminUsers', 'services/adminRoles'], // 需预加载的 serivces。
    // js: [], // 需预加载的JS（amd）
    // js_not_amd: [], // 需预加载的JS（非amd）
    // css: [], // 需预加载的css
    // autoClose: false, // 当窗口是从右侧滑出时，如果不希望点击外侧区域后关闭窗口，则将此值设为 false，默认为 true。
    // size: 'xxxl', // 当窗口是从右侧滑出时，可通过此配置设置窗口的宽度，'xxxl'表示全屏。
    btns: [// button的定义。在不同的 target 中，这些 button 将显示在不同的位置。当 target 为 'self' 和 'right' 时，显示在左上角，当 target 为 'dialog' 时，显示在右下角（底部）。
    // 当 target 为 'dialog' 时，详细说明请参考 views/_mg_index.htm 文件中的相关注释
    {
        txt: '权限管理', // button上显示的文字，默认为'确定'
        // 'class': '', // button的class属性的值，默认为'md-raised md-warn'
        sref: 'admin_permissions', // ui-sref属性的值，可以是一个 string，
        //                      也可以是一个 object，如：{ fn: 'getBtnSref' }，
        //                      其中，fn 是指 scope 中对应的 function 的名字。
        //                      因此在 scope 中应有一个对应的 function，如：
        //                          $scope.getBtnSref = function(){
        //                              return 'admin_new';
        //                          };
        // href: '#!/admin_new', // ng-href属性的值，不与sref同时使用，若sref与href都有配置，则会忽略href的配置
        // fn: 'submit', // 点击该button后所需执行的function的名字，必须是$scope中定义的一个function，一般不与sref、href一起使用
        target: 'right' // 打开窗口的位置，可选的值有：'self'（在主区域打开），'right'（在右侧打开），'dialog'（以对话框的形式打开）。默认为'self'
    }],
    // pager: 'pg',// 分页配置所对应的$scope中的数据
    controller: ['$scope', 'adminUsers', 'adminRoles', function ($scope, adminUsers, adminRoles) {
        $scope.title = '管理员';

        $scope.tbData = { // <button ui-sref="aaa" my-target="dialog"></button>
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
            heads: [{ tit: '用户名', style: { width: '110px' } }, { tit: '角色', style: { width: '250px' } }],
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
            fields: [{ text: 'uid' }, {
                text: function text(item) {
                    var str = '';
                    for (var i = 0; i < item.roles.length; i++) {
                        str += '<span class="mychip">' + item.roles[i] + '</span>';
                    }
                    return str;
                }
            }],
            // -----------------------------------------
            // 要显示在表格中的数据，它是一个 array。
            // 如： [ { name: 'aaa', age: 10 }, { name: 'bbb', age: 20 } ]
            rows: [],
            // -----------------------------------------
            // 如果有配置此字段，则会在每一行最后有一个“管理栏”
            action: {
                // “管理栏”的样式（是指“管理栏”头部的样式），是一个 object
                // 示例： { width: '300px', backgroundColor: '#444' }
                style: { width: '110px' },
                // 每一行中“管理栏”所显示的button的定义。是一个array。每一项就是一个button的定义。
                btns: [{
                    text: '修改密码', // button上所显示的文字，如果是icon button，则会以popup的方式显示此文字。
                    //                      可以是string，也可以是function：
                    //                          function(row){
                    //                              if(row.isLocked){
                    //                                  return '解锁';
                    //                              }else{
                    //                                  return '加锁';
                    //                              }
                    //                          }
                    'class': 'md-icon-button md-primary icon-btn-mini', // button的class，可以是string、object或function，默认为：'md-raised md-primary'。
                    //                                          object的示例：{ 'md-raised': true, 'md-primary': true }
                    //                                          function的示例：
                    //                                              function(row){ 
                    //                                                  if(row.isLocked){
                    //                                                      return 'btn_blue';
                    //                                                  } else{
                    //                                                      return 'btn_red';
                    //                                                  }
                    //                                              }
                    icon: 'settings_ethernet', // 如果配置了此项，则表示是个icon button。这是icon的设置。
                    //                              也可以是一个function：
                    //                                  function(row){
                    //                                      if(row.isLocked){
                    //                                          return 'lock_open';
                    //                                      }else{
                    //                                          return 'lock_outline';
                    //                                      }
                    //                                  }
                    //href: function (row) { // 此配置将会设置button的 ng-href 属性。
                    //    //                      可以是一个string，如：'#!/admin_chgpwd/aaa'，
                    //    //                      也可以是一个 function，如这里的这个示例。
                    //    return '#!/admin_chgpwd/' + encodeURIComponent(row.uid);
                    //},
                    sref: function sref(row) {
                        // 此配置将会设置button的 ui-sref 属性。
                        //                      可以是一个string，如：'admin_chgpwd({uid:"aaa"})'，
                        //                      也可以是一个 function，如这里的这个示例。
                        //                      sref 与 href 不要同时配置，如果两个都有配置，则会忽略 href 配置。
                        return 'admin_chgpwd({uid:"' + row.uid + '"})';
                    },
                    target: 'right' // 这个配置与 href或sref 配合使用，当希望点击此button后从在哪个地方展示，可配置的值有：'self'、'right'、'dialog'，默认为'self'。
                }, {
                    text: '修改角色',
                    'class': 'md-icon-button icon-btn-mini',
                    icon: 'border_clear',
                    sref: function sref(row) {
                        return 'admin_update({uid:"' + row.uid + '"})';
                    },
                    target: 'right'
                }, {
                    text: '删除',
                    'class': 'md-icon-button md-warn icon-btn-mini',
                    icon: 'delete_forever',
                    confirm: '确定要删除此管理员吗？', // 如果希望用户在点击 button 后弹出一个confirm确认框，只有当用户点击了确认框中的“确定”后才执行后面的操作的话，则配置此项。
                    //                                      可以是一个 string，表示confirm确认框中的文字。
                    //                                      也可以是一个object，如：
                    //                                          {
                    //                                              msg: 'Message'， // confirm确认框中的文字
                    //                                              style: { // confirm确认框的样式
                    //                                                  color: 'red',
                    //                                                  width: '500px' // 默认为200px
                    //                                              }
                    //                                           }
                    fn: function fn(row) {
                        // 点击该 button 后所执行的方法。一般不与 href 同时使用。
                        //                      该方法在执行时，当显示的行的数据会作为参数传入进来。
                        adminUsers.remove(row.uid);
                    }
                }]
                // --------------------------------------------
            } };

        adminUsers.gets(function () {
            $scope.tbData.rows = adminUsers.data;
        });

        $scope.tbDataRoles = {
            heads: [{ tit: '角色名', style: { width: '110px' } }, { tit: '权限', style: { width: '280px' } }],
            fields: [{ text: 'name' }, {
                text: function text(item) {
                    var str = '';
                    for (var i = 0; i < item.permissions.length; i++) {
                        str += '<span class="mychip">' + item.permissions[i] + '</span>';
                    }
                    return str;
                }
            }],
            rows: [],
            action: {
                style: { width: '80px' },
                btns: [{
                    text: '修改',
                    'class': 'md-icon-button md-primary icon-btn-mini',
                    icon: 'settings_ethernet',
                    sref: function sref(row) {
                        return 'admin_role_update({name:"' + row.name + '"})';
                    },
                    target: 'right'
                }, {
                    text: '删除',
                    'class': 'md-icon-button md-warn icon-btn-mini',
                    icon: 'delete_forever',
                    confirm: '确定要删除此角色吗？',
                    fn: function fn(row) {
                        adminRoles.remove(row.name);
                    }
                }]
            }
        };

        adminRoles.gets(function () {
            $scope.tbDataRoles.rows = adminRoles.data;
        });
    }]
});