'use strict';
var util = require('util');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var log4js = require('log4js');
var request = require('request');
var CacheManager = require('./CacheManager');
var AppTimer = require('./AppTimer');

var Helper = {};

/**加密 */
Helper.encrypt = function (str, hashType) {
    if (!hashType) {
        hashType = 'md5';
    }
    var m = crypto.createHash(hashType);
    m.update(str, 'utf8');
    return m.digest('hex').toUpperCase();
};

Helper.md5 = function (str) {
    return Helper.encrypt(str, 'md5');
};

Helper.sha1 = function (str) {
    return Helper.encrypt(str, 'sha1');
};


Helper.__aes_cnf = {
    key: '2018061815452826',
    algorithm: 'aes-128-ecb',
    clearEncoding: 'utf8',
    iv: '',
    cipherEncoding: 'hex'
};
Helper.aes = function (str) {
    var cipher = crypto.createCipheriv(Helper.__aes_cnf.algorithm, Helper.__aes_cnf.key, Helper.__aes_cnf.iv),
        cipherChunks = [];
    cipherChunks.push(cipher.update(str, Helper.__aes_cnf.clearEncoding, Helper.__aes_cnf.cipherEncoding));
    cipherChunks.push(cipher.final(Helper.__aes_cnf.cipherEncoding));
    return cipherChunks.join('');
};

Helper.deAes = function (str) {
    var decipher = crypto.createDecipheriv(Helper.__aes_cnf.algorithm, Helper.__aes_cnf.key, Helper.__aes_cnf.iv),
        plainChunks = [];
    for (var i = 0; i < str.length; i += 2) {
        plainChunks.push(decipher.update(str.substr(i, 2), Helper.__aes_cnf.cipherEncoding, Helper.__aes_cnf.clearEncoding));
    }
    plainChunks.push(decipher.final(Helper.__aes_cnf.clearEncoding));
    return plainChunks.join('');
};


var s_chs = "abcdefghijklmnopqrstuvwxyz0123456789_-@.", t_chs = "01az2bc4dDeoCfi67kgnpBrshtulvwxqy3m5j8A9";

Helper.encryptStr = function (pStr) {
    pStr = pStr.toLowerCase();
    var _s = [], _len = pStr.length, _slen = s_chs.length;
    for (var _i = 0; _i < _len; _i++) {
        var _ch = pStr[_i], _index = -1;
        for (var _j = 0; _j < _slen; _j++) {
            if (s_chs[_j] == _ch) {
                _index = _j;
                break;
            }
        }
        _s[_i] = _index >= 0 ? t_chs[_index] : _ch;
    }
    var _m = Math.floor(_len / 2);
    for (var _n = 0; _n < _m; _n++) {
        var _tIndex = _m + _n;
        var _chT = _s[_n];
        _s[_n] = _s[_tIndex];
        _s[_tIndex] = _chT;
    }
    return _s.join("");
}

Helper.decryptStr = function (pStr) {
    var len = pStr.Length,
        m = len / 2;
    for (var i = 0; i < m; i++) {
        var tIndex = m + i,
            chT = pStr[i];
        pStr[i] = pStr[tIndex];
        pStr[tIndex] = chT;
    }
    for (var i = 0; i < len; i++) {
        var ch = pStr[i],
            idx = t_chs.indexOf(ch);
        if (idx >= 0) {
            pStr[i] = s_chs[idx];
        }
    }
    return pStr;
};


Helper.cache = {};

Helper.cache.get = function (key, callbackFun) {
    return CacheManager.get(key, callbackFun);
};

Helper.cache.set = function (key, value, exptime, callbackFun) {
    CacheManager.set(key, value, exptime, callbackFun);
};

Helper.cache.remove = function (key, callbackFun) {
    CacheManager.remove(key, callbackFun);
};

/**
 * 对日期进行格式化，
 * @param date 要格式化的日期
 * @param format 进行格式化的模式字符串
 *     支持的模式字母有：
 *     y:年,
 *     M:年中的月份(1-12),
 *     d:月份中的天(1-31),
 *     h:小时(0-23),
 *     m:分(0-59),
 *     s:秒(0-59),
 *     S:毫秒(0-999),
 *     q:季度(1-4)
 * @return String
 * @author yanis.wang@gmail.com
 */
Helper.dateFormat = function (date, format) {
    if (format === undefined) {
        format = date;
        date = new Date();
    }
    var map = {
        "M": date.getMonth() + 1, //月份
        "d": date.getDate(), //日
        "h": date.getHours(), //小时
        "m": date.getMinutes(), //分
        "s": date.getSeconds(), //秒
        "q": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        }
        else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;
};
Helper.nowDate = Helper.dateFormat('yyyy') +
    Helper.dateFormat('-MM') +
    Helper.dateFormat('-dd') +
    Helper.dateFormat(' hh') +
    Helper.dateFormat(':mm') +
    Helper.dateFormat(':ss');
/**Date原型扩展方法，格式化*/
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1,
                RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};
//计算天数，昨天：GetDateStr(-1) 今天：GetDateStr(0) 明天：GetDateStr(1),计算结果类似：'2015-09-11'
Helper.calDate = function (AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;//获取当前月份的日期
    var d = dd.getDate();
    m = ('00' + m).length == 4 ? ('00' + m).substr(2) : ('00' + m).substr(1);
    d = ('00' + d).length == 4 ? ('00' + d).substr(2) : ('00' + d).substr(1);
    return y + "-" + m + "-" + d;
};

//计算天数，昨天：calDate(-1) 今天：calDate(0) 明天：calDate(1),计算结果类似：'20150911'
Helper.calDateNew = function (AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;//获取当前月份的日期
    var d = dd.getDate();
    m = ('00' + m).length == 4 ? ('00' + m).substr(2) : ('00' + m).substr(1);
    d = ('00' + d).length == 4 ? ('00' + d).substr(2) : ('00' + d).substr(1);
    return y + "" + m + "" + d;
};


Helper.GUID = function () {
};

//生成GUID的辅助函数
Helper.GUID.S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

//生成GUID
Helper.GUID.new = function () {
    return (Helper.GUID.S4() + Helper.GUID.S4() + "-" + Helper.GUID.S4() + "-" + Helper.GUID.S4() + "-" + Helper.GUID.S4() + "-" + Helper.GUID.S4() + Helper.GUID.S4() + Helper.GUID.S4());
};


Helper.Float = {};

Helper.Float.fromStr = function (str) {
    var i = str.indexOf('.'), len = str.length;
    if (i < 0) {
        return parseInt(str) * 100;
    }
    if (i == len - 1) {
        str += '00';
    }
    else if (i == len - 2) {
        str += '0';
    }
    else if (i < len - 3) {
        str = str.substr(0, i + 3);
    }
    str = str.replace('.', '');
    while (str[0] == '0') {
        str = str.substr(1);
    }
    if (str.length == 0) {
        return 0;
    }
    return parseInt(str);
};


Helper.Date = {};

Helper.Date.toNumber = function (dt) {
    return dt.getFullYear() * 10000000000
        + (dt.getMonth() + 1) * 100000000
        + dt.getDate() * 1000000
        + dt.getHours() * 10000
        + dt.getMinutes() * 100
        + dt.getSeconds();
};

Helper.Date.toShortNumber = function (dt) {
    return dt.getFullYear() * 10000
        + (dt.getMonth() + 1) * 100
        + dt.getDate();
};


/**去掉html标签*/
Helper.removeHTMLTag = function (str) {
    str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
    //str = str.replace(/[ | ]* /g,' '); //去除行尾空白
    //str = str.replace(/ [\s| | ]* /g,' '); //去除多余空行
    //str=str.replace(/ /ig,'');//去掉
    return str;
};


// 日志
Helper.logger = function () {
};
Helper.logger.init = function () {
    if (!Helper.logger._logger) {
        log4js.configure({
            appenders: {
                everything: {
                    type: 'file',
                    filename: 'public/log/log.log',
                    maxLogSize: 204800000,
                    backups: 3,
                    compress: true
                }
            },
            categories: {
                default: { appenders: ['everything'], level: 'debug' }
            }
        });
        Helper.logger._logger = log4js.getLogger("deploy");
    }
    return Helper.logger._logger;
};
Helper.log = function (msg) {
    Helper.logger.init().info(msg);
};


// 发短信
// to: 接收短信的手机号，多个手机号之间用英文逗号分隔
// templateId: 短信模板ID
// params: 应用到模板中的参数。多个参数之间用英文逗号分隔
// callbackFun 可不传。参数类似于：{"resp":{"respCode":"000000","templateSMS":{"createDate":"20150804192422","smsId":" c864fcab8d2450b53887ceb18cc9b64e "}}}
Helper.sendSMS = function (to, templateId, params, callbackFun) {
    var dt = new Date(), y = dt.getFullYear() + '', M = dt.getMonth() + 1, d = dt.getDate(),
        h = dt.getHours(), m = dt.getMinutes(), s = dt.getSeconds(), S = dt.getMilliseconds();
    if (M < 10) {
        M = '0' + M;
    }
    if (d < 10) {
        d = '0' + d;
    }
    if (h < 10) {
        h = '0' + h;
    }
    if (m < 10) {
        m = '0' + m;
    }
    if (s < 10) {
        s = '0' + s;
    }
    if (S < 10) {
        S = '00' + S;
    } else if (S < 100) {
        S = '0' + S
    }
    var time = y + M + d + h + m + s + S;
    var sid = '6eb4cd1e4fdb67994ea873b82dee2c8f',
        appId = '0590368328a24548b8ca68930ef103fb',
        token = 'cf99780d3b8f8d7065aee05301e39891',
        sign = Helper.md5(sid + time + token).toLowerCase();
    request.post('http://www.ucpaas.com/maap/sms/code',
        {
            form: {
                sid: sid,
                appId: appId,
                sign: sign,
                time: time,
                templateId: templateId,
                to: to,
                param: params
            }
        }, function (error, response, body) {
            if (callbackFun) {
                callbackFun(body);
            }
        });
};


Helper.appendTimer = function (funDo, args) {
    AppTimer.append(funDo, args);
};

Helper.copyDir = function (src, dst) {
    let stat = fs.stat;
    let copy = function (src, dst) {
        fs.readdir(src, function (err, paths) {
            if (err) {
                Helper.log('Helper.copyDir err:' + err);
            } else {
                paths.forEach(function (path) {
                    let _src = src + '/' + path;
                    let _dst = dst + '/' + path;
                    let readable;
                    let writable;
                    stat(_src, function (err, st) {
                        if (err) {
                            Helper.log('Helper.copyDir err:' + err);
                        }
                        if (st.isFile()) {
                            readable = fs.createReadStream(_src);//创建读取流
                            writable = fs.createWriteStream(_dst);//创建写入流
                            readable.pipe(writable);
                        } else if (st.isDirectory()) {
                            Helper.copyDir(_src, _dst);
                        }
                    });
                });
            }
        });
    }
    fs.exists(dst, function (exists) {
        if (exists) {
            copy(src, dst);
        } else {
            fs.mkdir(dst, function () {
                copy(src, dst)
            })
        }
    })
};

Helper.createFolder = function (fileAbsoluteDir) {
    var sep = path.sep;
    var folders = path.dirname(fileAbsoluteDir).split(sep);
    var tempPath = '';
    while (folders.length) {
        tempPath += folders.shift() + sep;
        if (!fs.existsSync(tempPath)) {
            fs.mkdirSync(tempPath);
        }
    }
};

module.exports = Helper;