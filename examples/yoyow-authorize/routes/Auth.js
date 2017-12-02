import {yoyowSDK} from "../lib/yoyow-node-sdk";
import config from "../conf/config";

var express = require('express');
var router = express.Router();
var {PublicKey, Signature, ChainStore, PrivateKey} = yoyowSDK;

var json = (res, code = 0, data = null, message = null) => {
    let obj = {code: code, data: data};
    if (message != null) obj.message = message;
    res.json(obj);
};

/**
 * 返回签名后的跳转参数
 */
router.get("/login", (req, res, next) => {
    let key = PrivateKey.fromWif(config.secondary_key);
    let time = (new Date()).getTime().toString();
    let sendObj = {
        "platform": config.platform_id,
        "time": time
    }
    let strObj = JSON.stringify(sendObj);
    let signed = Signature.sign(strObj, key);
    json(res, 0, {sign: signed.toHex(), time: time, platform: config.platform_id});
});

/**
 * 验证用户提交的签名
 */
router.get('/verify', (req, res, next) => {
    var yoyow = req.query.yoyow;
    var time = req.query.time;
    var sign = req.query.sign;

    if (yoyow && time && sign) {
        ChainStore.fetchAccountByUid(yoyow).then(uObj => {
            if (uObj.secondary && uObj.secondary.key_auths && uObj.secondary.key_auths.length > 0) {
                let secondary = uObj.secondary.key_auths[0][0];
                if (secondary == null) {
                    json(1001, null, "无效的yoyow账号");
                    return;
                }
                //验证是否过期
                let cur = (new Date()).getTime();
                let req = (new Date(parseInt(time))).getTime();
                if (cur - req > 2 * 60 * 1000) {//请求时间与当前时间相关2分钟被视为过期
                    json(1002, null, "请求已经过期");
                    return;
                }
                //验证签名
                let pars = JSON.stringify({yoyow, time});
                let ePkey = PublicKey.fromPublicKeyString(secondary);
                let verify = Signature.fromHex(sign).verifyBuffer(new Buffer(pars), ePkey);
                //console.log("verify.......", verify)
                if (!verify) {
                    json(1003, null, "签名验证失败");
                } else {
                    json(0, true);
                }
            } else {
                json(1001, null, "无效的yoyow账号");
            }
        });
    } else {
        json(1000, null, "无效请求参数");
    }
});

module.exports = router;