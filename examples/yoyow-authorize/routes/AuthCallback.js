import {yoyowSDK} from "../lib/yoyow-node-sdk";

var express = require('express');
var router = express.Router();
var {PublicKey, Signature, ChainStore} = yoyowSDK;


router.get('/', function (req, res, next) {
    var yoyow = req.query.yoyow;
    var time = req.query.time;
    var sign = req.query.sign;

    if (yoyow && time && sign) {
        ChainStore.fetchAccountByUid(yoyow).then(uObj => {
            if (uObj.secondary && uObj.secondary.key_auths && uObj.secondary.key_auths.length > 0) {
                let secondary = uObj.secondary.key_auths[0][0];
                if (secondary == null) {
                    res.render('error', {message: "无效的yoyow账号"});
                    return;
                }
                //验证是否过期
                let cur = (new Date()).getTime();
                let req = (new Date(parseInt(time))).getTime();
                if (cur - req > 2 * 60 * 1000) {//请求时间与当前时间相关2分钟被视为过期
                    res.render('error', {message: "请求已经过期"});
                    return;
                }
                //验证签名
                let pars = JSON.stringify({yoyow, time});
                let ePkey = PublicKey.fromPublicKeyString(secondary);
                let verify = Signature.fromHex(sign).verifyBuffer(new Buffer(pars), ePkey);
                //console.log("verify.......", verify)
                if (!verify) {
                    res.render('error', {message: "签名验证失败"});
                } else {
                    //TODO:写入cookie,或者跳转到绑定注册页面
                    //res.cookie('resc', '设置到cookie里的值', { expires: new Date(Date.now() + 900000) });
                    res.end("OK");
                }
            } else {
                res.render('error', {message: "无效的yoyow账号"});
            }
        });
    } else {
        res.render('error', {message: "无效请求参数"});
    }
});

module.exports = router;