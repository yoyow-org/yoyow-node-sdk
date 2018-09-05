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
    let {uid, amount, asset_id, memo} = req.decryptedData;
    let key = config.secondary_key;
    if(asset_id && asset_id != 0){
        key = config.active_key;
    }else{
        asset_id = 0;
    }
    Api.transfer(config.platform_id, asset_id, key, uid, amount, config.use_csaf, config.to_balance, memo, config.memo_key).then(tx => {
        utils.success(res, tx);
    }).catch(e => {
        console.log(e);
        utils.error(res, e);
    });
});

router.get('/getQRReceive', (req, res, next) => {
    let {amount, memo, asset} = req.query;
    Api.getQRReceive(config.platform_id, amount, memo, asset)
        .then(str => utils.success(res, str))
        .catch(err => utils.error(res, err));
})

router.get('/getHistory', (req, res, next) => {
    let {uid, op_type, start, limit} = req.query;
    Api.getHistory(uid, op_type, start, limit).then(data => {
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

router.post('/post', Secure.validQueue, (req, res, next) => {
    let {platform, poster, post_pid, title, body, extra_data, origin_platform, origin_poster, origin_post_pid} = req.decryptedData;
    Api.post(platform, poster, post_pid, title, body, extra_data, origin_platform, origin_poster, origin_post_pid).then( tx => {
        utils.success(res, tx);
    }).catch(e => {
        utils.error(res, e);
    });
});

router.post('/postUpdate', Secure.validQueue, (req, res, next) => {
    let {platform, poster, post_pid, title, body, extra_data} = req.decryptedData;
    Api.postUpdate(platform, poster, post_pid, title, body, extra_data).then(tx => {
        utils.success(res, tx);
    }).catch(e => {
        utils.error(res, e);
    });
});

router.get('/getPost', (req, res, next) => {
    let {platform, poster, post_pid} = req.query;
    Api.getPost(platform, poster, post_pid).then(post => {
        utils.success(res, post);
    }).catch(e => {
        utils.error(res, e);
    });
});

router.get('/getPostList', (req, res, next) => {
    let {platform, poster, limit, start} = req.query;
    Api.getPostList(platform, poster, limit, start).then(list => {
        utils.success(res, list);
    }).catch(e => {
        utils.error(res, e);
    });
});

router.post('/updateAllowedAssets', (req, res, next) => {
    let {uid, asset_id} = req.decryptedData;
    Api.updateAllowedAssets(uid, asset_id).then(tx => {
        utils.success(res, tx);
    }).catch(e => {
        utils.error(res, e);
    })
});

router.get('/getAsset', (req, res, next) => {
    let {search} = req.query;
    Api.getAsset(search).then(asset => {
        utils.success(res, asset);
    }).catch(e => {
        utils.error(res, e);
    })
});

router.get('/getPlatformById', (req, res, next) => {
    let {uid} = req.query;
    Api.getPlatformById(uid).then(platform => {
        utils.success(res, platform);
    }).catch(e => {
        utils.error(res, e);
    })
});

module.exports = router;
