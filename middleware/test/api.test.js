"use strict"
import assert from 'assert';
import config from '../conf/config';
import api from '../lib/api';
import {yoyowSDK} from '../lib/yoyow-node-sdk';

let {Apis, ChainStore} = yoyowSDK;

describe('Api test', () => {
    before(function() {
        return Apis.instance(config.apiServer, true).init_promise.then(function (result) {
            console.log('before Connect success');
        });
    });

    after(function() {
        Apis.close();
    });

    it('获取账户信息', () => {
        return new Promise((resolve, reject) => {
            api.getAccount(config.platform_id).then(obj => {
                assert(obj.uid == config.platform_id)
                resolve();
            }).catch(e => {
                reject(e);
            });
        });
    });

    it('测试转账', () => {
        return new Promise((resolve, reject) => {
            let now = new Date();
            api.transfer(config.platform_id, config.secondary_key, 9638251, 100, false, 'hello yoyow '+now.toISOString(), config.memo_key).then(() => {
                resolve();
            }).catch(e => {
                reject(e);
            });
        });
    })

    it('获取账户历史记录', () => {
        return new Promise((resolve, reject) => {
            api.getHistory(config.platform_id, 1, 10).then(res => {
                console.log(res);
                resolve();
            }).catch(e => {
                reject(e);
            });
        });
    });
})