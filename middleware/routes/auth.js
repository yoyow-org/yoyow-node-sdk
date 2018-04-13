import Auth from '../lib/Auth';
import config from '../conf/config';
import utils from '../lib/utils';
import QRImage from "qr-image";

var express = require('express');
var router = express.Router();

router.get("/sign", (req, res, next) => {
    Auth.sign('platform', config.platform_id, config.secondary_key).then(signObj => {
        signObj.url = config.wallet_url;
        utils.success(res, signObj);
    }).catch(e => {
        utils.error(res, e);
    });
});

router.get("/signQR", (req, res, next) => {
    let {state} = req.query;

    Auth.sign('platform', config.platform_id, config.secondary_key).then(signObj => {
        signObj.state = state;
        let qrBuffer = QRImage.imageSync(JSON.stringify(signObj), { type: 'png' });
        utils.success(res, qrBuffer.toString('base64'));
    }).catch(e => {
        utils.error(res, e);
    });
});

router.get('/verify', (req, res, next) => {
    let {yoyow, time, sign} = req.query;
    console.log('授权验证');
    Auth.verify('yoyow', sign, time, yoyow).then(verifyObj => {
        utils.success(res, verifyObj);
    }).catch(e => {
        utils.error(res, e);
    });
});

module.exports = router;
