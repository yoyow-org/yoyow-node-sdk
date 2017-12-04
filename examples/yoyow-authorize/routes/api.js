import {yoyowSDK} from "../lib/yoyow-node-sdk";
import config from "../conf/config";
import utils from "../lib/utils";

var express = require('express');
var router = express.Router();
var {PublicKey, Signature, ChainStore, PrivateKey} = yoyowSDK;

router.get("/getAccount", (req, res, next) => {
    let query = utils.reqJson(req.query);
    if (query["uid"]) {
        ChainStore.fetchAccountByUid(query.uid).then(uObj => {
            if (null == uObj) {
                utils.resJson(res, 2001, uObj, "账号不存在");
            } else {
                utils.resJson(res, 0, uObj, "操作成功");
            }
        }).catch(err => {
            utils.resJson(res, 2002, null, "操作失败:" + err.message);
        });
    } else {
        utils.resJson(res, 2000, null, "参数错误");
    }

});


module.exports = router;