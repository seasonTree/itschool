var express = require('express');
var router = express.Router();

var SiteConfig = require('../SiteConfig');

router.get('/:id', function (req, res) {
    // 参数 id 为被访问的主页所属用户的ID
    var id = req.params.id;
    res.render('home', { title: id + ' 的主页' });
});

router.get('/', function (req, res) {
    // 没有参数，表示是进入自己的主页，
    // 如果没有登录，要跳转到登录页
    // 如果已经登录，则跳转到 主页名/domain
    // res.redirect('/home/123');
    
    var homename = 'cyf';
    res.redirect('http://' + homename + '.' + SiteConfig.domain);
});

module.exports = router;