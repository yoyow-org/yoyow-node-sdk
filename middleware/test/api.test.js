"use strict"
import assert from 'assert';
import config from '../conf/config';
import api from '../lib/api';
import {yoyowSDK} from '../lib/yoyow-node-sdk';

let {Apis, ChainStore} = yoyowSDK;

/**
 * 测试 api 
 * @test {Api}
 */
describe('Api test', () => {
    before(function() {
        return Apis.instance(config.apiServer, true).init_promise.then(function (result) {
            console.log('before Connect success');
        });
    });

    after(function() {
        Apis.close();
    });

    /**
     * 获取账户信息
     * @test {Api#getAccount}
     */
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

    /**
     * 转账
     * @test {Api#transfer}
     */
    it('测试转账', () => {
        return new Promise((resolve, reject) => {
            let now = new Date();
            api.transfer(config.platform_id, config.secondary_key, 9638251, 100, false, 'hello yoyow '+now.toISOString(), config.memo_key).then(block_num => {
                console.log('交易块号');
                console.log(block_num);
                resolve();
            }).catch(e => {
                reject(e);
            });
        });
    })

    /**
     * 获取账户历史记录
     * @test {Api#getHistory}
     */
    it('获取账户历史记录', () => {
        return new Promise((resolve, reject) => {
            api.getHistory(config.platform_id, 1, 10).then(pw => {
                console.log(pw);
                resolve();
            }).catch(e => {
                reject(e);
            });
        });
    });

    /**
     * 验证当前块是否不可退回
     * @test {Api#confirmBlock}
     */
    it('验证当前块是否不可退回', () => {
        return new Promise((resolve, reject) => {
            let block_num = 4271077;
            api.confirmBlock(block_num).then(flag => {
                console.log(`验证块 ${block_num} 是否不可退回 : ${flag}`);
                resolve();
            }).catch(e => {
                reject(e);
            })
        });
    });
})