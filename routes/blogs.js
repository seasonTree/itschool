var express = require('express');
var router = express.Router();


router.get('/', function (req, res) {
    res.render('blogs', { title: '百家争鸣｜百家之言｜百家博文' });
});

module.exports = router;