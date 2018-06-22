var express = require('express');
var router = express.Router();
var BllUser = require('../bll/BllUser');
var SiteConfig = require('../SiteConfig');

router.get('/', function (req, res) {
    BllUser.checkLoginState(req, res, function (state) {
        if (state.err == 1) {// 登录状态
            BllUser.getById(state.uid, function (user) {
				var homeUrl = '#gohome/editinfo',
					blogUrl = '#blog/editinfo',
					courseUrl = '#course/editinfo';
				if (user.sitename) {
					homeUrl = 'http://' + user.sitename + '.' + SiteConfig.domain;
					blogUrl = '#blog';
					courseUrl = '#course';
				}
                res.render('my', { urlmyhome: homeUrl, urlblog: blogUrl, urlcourse: courseUrl });
            });
        } else {
            res.redirect('/login?f=' + encodeURIComponent('/my'));
        }
    });
});

module.exports = router;