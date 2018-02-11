import Api from '../lib/Api';
import config from '../conf/config';
import utils from '../lib/utils';

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

router.post('/transfer', (req, res, next) => {
    let {send} = utils.getParams(req);
    let {uid, amount, memo} = JSON.parse(send);
    Api.transfer(config.platform_id, config.secondary_key, uid, amount, config.use_csaf, memo, config.memo_key).then(block_num => {
        utils.success(res, block_num);
    }).catch(e => {
        utils.error(res, e);
    });

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
