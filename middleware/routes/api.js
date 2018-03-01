import Api from '../lib/Api';
import config from '../conf/config';
import utils from '../lib/utils';
import Secure from '../lib/Secure';

var express = require('express');
var router = express.Router();

router.get('/getAccount', (req, res, next) => {
    let {uid} = req.query;
    Api.getAccount(uid).then(uObj => {
        utils.success(res, uObj);        
    }).catch(e => {
        utils.error(res, e);
    });
});

router.post('/transfer', Secure.validQueue, (req, res, next) => {
    let {uid, amount, memo} = req.decryptedData;
    if(uid && amount && memo){
        Api.transfer(config.platform_id, config.secondary_key, uid, amount, config.use_csaf, memo, config.memo_key).then(block_num => {
            utils.success(res, block_num);
        }).catch(e => {
            utils.error(res, e);
        });
    }else{
        utils.error(res, {code: 1005, message: '无效的操作签名'});
    }

});

router.get('/getHistory', (req, res, next) => {
    let {uid, page, size} = req.query;
    Api.getHistory(uid, page, size).then(data => {
        utils.success(res, data);
    }).catch(e => {
        utils.error(res, e);
    });
});

router.get('/confirmBlock', (req, res, next) => {
    let {block_num} = req.query;
    Api.confirmBlock(block_num).then(bool => {
        utils.success(res, bool);
    }).catch(e => {
        utils.error(res, e);
    });
});

module.exports = router;
