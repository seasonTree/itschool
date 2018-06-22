var express = require('express');
var router = express.Router();


router.get('/', function (req, res) {
    res.render('showtime', { title: '作品秀' });
});

module.exports = router;