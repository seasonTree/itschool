var UID = null, UOPENID = null, UTOKEN = null, UEMAIL = null, UNNAME = null, UPHOTO = null, UGENDER = null,
    LOCALKEY_INVITE = 'beinv';

function afterLogon(pF, funCallback) {
    var invite = localStorage.getItem(LOCALKEY_INVITE);
    $.post("/api/user/reg", { plat: pF, openid: UOPENID, token: UTOKEN, invite: invite, email: UEMAIL, nname: UNNAME, avatar: UPHOTO, gender: UGENDER }, function (data) {
        if (data.err == 0 || data.err == 1) {
            UID = data.uid;
            funCallback(data);
        } else {
            // 发生错误了
            funCallback(data);
        }
    });
}

// -------- qq ----------------
var qq_token = null, qq_clienId = 101468127, qq_login_callback_callback = null, qq_auth_callback_url = "http://localhost:3000/qq_auth_callback.htm";
function qq_login_callback(openId, accessToken) {
    UOPENID = openId;
    UTOKEN = accessToken;
    qq_getUsetInfo(qq_login_callback_callback);
}
function qq_bindLogin(eleId) {
    if (window.QC) {
        QC.Login({
            btnId: eleId
        });
    } else {
        setTimeout(function () { qq_bindLogin(eleId); }, 500);
    }
}
function qq_Login(callbackFun) {
    qq_login_callback_callback = callbackFun;

    var jsEle = document.getElementById('js_qq');
    if (!jsEle) {
        jsEle = document.createElement('script');
        jsEle.id = 'js_qq';
        jsEle.type = 'text/javascript';
        jsEle.dataset['appid'] = qq_clienId;
        jsEle.dataset['redirecturi'] = qq_auth_callback_url;
        jsEle.charset = 'utf-8';
        jsEle.dataset['callback'] = true;
        jsEle.async = true;
        jsEle.src = 'http://qzonestyle.gtimg.cn/qzone/openapi/qc_loader.js';
        document.body.appendChild(jsEle);
    }
    
    var _chk_jsqq = function () {
        if (window.QC) {
            var _url = "https://graph.qq.com/oauth2.0/show?which=Login&display=pc&client_id=" + qq_clienId + "&response_type=token&scope=all&redirect_uri=" + encodeURIComponent(qq_auth_callback_url);
            window.open(_url, "qqauth", "height=600,width=700,top=100,left=200,toolbar=no,menubar=no,scrollbars=no,location=no,status=no");
        } else {
            setTimeout(_chk_jsqq, 200);
        }
    };
    _chk_jsqq();

    //QC.Login.showPopup();
    // https://graph.qq.com/oauth2.0/show?which=Login&display=pc&client_id=101468127&response_type=token&scope=all&redirect_uri=http%3A%2F%2Fcode666.me%2Fapi%2Fcallback%2Fqq_login
    // var _url = "http://openapi.qzone.qq.com/oauth/show?which=ConfirmPage&display=pc&client_id=" + qq_clienId + "&response_type=token&scope=all&redirect_uri=" + encodeURIComponent(qq_auth_callback_url);
    //var _url = "https://graph.qq.com/oauth2.0/show?which=Login&display=pc&client_id=" + qq_clienId + "&response_type=token&scope=all&redirect_uri=" + encodeURIComponent(qq_auth_callback_url);
    //window.open(_url, "qqauth", "height=600,width=700,top=100,left=200,toolbar=no,menubar=no,scrollbars=no,location=no,status=no");
}
function qq_getUsetInfo(callbackFun) {
    QC.api("get_user_info", {}).success(function (resp) {
        if (resp.data) {
            UEMAIL = resp.data.email || "";
            UNNAME = resp.data.nickname || UOPENID;
            UPHOTO = resp.data.figureurl_1 || '';
            //UPLACE = '';
            UGENDER = resp.data.gender == "女" ? 2 : 1;
            afterLogon(1, callbackFun);
        }
    });
}
// -------- qq end ------------

var getQueryParams = function (url) {
    var ps = {},
        q = url.split('?')[1];
    if (q) {
        var ary = q.split('&');
        for (var i = 0; i < ary.length; i++) {
            var item = ary[i].split('=');
            ps[item[0]] = item[1];
        }
    }
    return ps;
};