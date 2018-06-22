var express = require('express');
var BllUser = require('../bll/BllUser');

var router = express.Router();


// 用第三方帐户登录后，调用此接口在本系统内记录，
// 并设为登录状态
router.post('/reg', function (req, res) {
    // plat: pF, openid: UOPENID, token: UTOKEN, invite: invite, email: UEMAIL, nname: UNNAME, avatar: UPHOTO, gender: UGENDER
    var plat = req.body.plat,
        openid = req.body.openid,
        token = req.body.token,
        invite = req.body.invite,
        email = req.body.email,
        nname = req.body.nname,
        avatar = req.body.avatar,
        gender = req.body.gender;
    if (plat && openid && token) {

        // TODO: 调登录方的接口验证

        BllUser.add(plat, openid, invite, nname, avatar, '', '', function (obj) {
            var re = { err: 0, state: 0 };
            if (obj.err == 1) {
                re.state = 1; // 数据已存在
                re.uid = obj.v;
            } else if (obj.err == 0) {
                re.uid = obj.v;
            } else {
                re.err = 500; // 其它异常
            }

            // 设为登录状态
            if (obj.err == 1 || obj.err == 0) {
                BllUser.setLogon(obj.v, false, req, res, function (v) {
                    if (v == 2) {
                        re.state = 2; // 已在其它地方登录
                    } else if (v == 3) {
                        re.err = 500; // 其它异常（存储Cache时发生错误了）
                    }
                    res.send(re);
                });
            } else {
                res.send(re);
            }
        });
    } else {
        res.send({err: 400});// 参数错误
    }
});


// 登出
router.post('/logout', function (req, res) {
    BllUser.setLogout(req, res, function () {
        res.send({ err: 0 });
    });
});


// 强制在其它登录的同名帐户下线，自己登录
router.post('/obliged', function (req, res) {
    BllUser.setLogon(null, true, req, res, function (v) {
        var re = { err: 0 };
        if (v == 3) {
            re.err = 500;
        } else { }

        res.send(re);
    });
});


// 获取指定用户的相关用户资料。
// 参数：
//		[ uid ]: 用户唯一ID。如果不传，表示获取当前登录用户的资料
router.get('/get', function (req, res) {
	var uid = req.query.uid,
		result = { err: 0 },
		fnGetInfo = function () {
			if (uid) {
				BllUser.getById(uid, function (user) {
					result.data = user;
					res.send(result);
				});
			} else { 
				res.send(result);
			}
		};
	if (!uid) {
		BllUser.checkLoginState(req, res, function (state) {
			if (state.uid) {
				uid = state.uid;
			} else { // 未登入
				result.err = 490
			}
			fnGetInfo();
		});
	} else { 
		fnGetInfo();
	}
});


// 编辑个人资料
// 参数：
//		nname: 昵称
//		[ avatar ]: 图片URL
//		sitename: 主页名称
//		[ sitetit ]: 主页标题
// 返回：
//		err: 500 发生错误了；400 参数错误；490 未登入；0 成功；
router.post('/edit', function (req, res) {
	var nname = req.body.nname,
		avatar = req.body.avatar,
		sitename = req.body.sitename,
		sitetit = req.body.sitetit;
	if (nname && sitename) {
		BllUser.checkLoginState(req, res, function (state) {
			if (state.err == 1) { //登入状态
				BllUser.update(state.uid, nname, avatar, sitename, sitetit, function (errObj) {
					var result = {err:0};
					if (errObj) { //发生错误了
						result.err = 500;
					}
					res.send(result);
				});
			} else { // 未登入
				res.send({ err: 490 });
			}
		});
	} else {
		res.send({ err: 400 });// 参数错误
	}
});

module.exports = router;