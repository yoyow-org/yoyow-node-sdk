"use strict"
import assert from 'assert';
import config from '../conf/config';
import api from '../lib/Api';
import {yoyowSDK} from '../lib/yoyow-node-sdk'

let {Apis, ChainStore} = yoyowSDK;

Apis.instance(config.apiServer, true).init_promise.then(function (result) {
    api.transfer(25638, null, config.platform_id, 100, true, 'aha', config.memo_key).then(() => {
        console.log('转账完成');
    }).catch(e => {
        console.log('转账失败');
        console.log(e);
    });
});