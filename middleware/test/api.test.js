"use strict"
import assert from 'assert';
import config from '../conf/config';
import api from '../lib/api';
import {ChainStore} from "yoyowjs-lib";
import {Apis} from "yoyowjs-ws";

/**
 * 测试 api 
 * @test {Api}
 */
describe('Api test', () => {
    before(function() {
        return Apis.instance(config.apiServer, true).init_promise.then((result) => {
            console.log('before Connect success');
            ChainStore.init();
        });
    });

    after(() => {
        Apis.close();
    });

    // /**
    //  * 获取账户信息
    //  * @test {Api#getAccount}
    //  */
    // it('获取账户信息', () => {
    //     return new Promise((resolve, reject) => {
    //         api.getAccount(config.platform_id).then(obj => {
    //             assert(obj.uid == config.platform_id)
    //             resolve();
    //         }).catch(e => {
    //             reject(e);
    //         });
    //     });
    // });

    // /**
    //  * 转账
    //  * @test {Api#transfer}
    //  */
    // it('测试转账', () => {
    //     return new Promise((resolve, reject) => {
    //         let now = new Date();
    //         api.transfer(config.platform_id, 10 ,config.active_key, 221970467, 0.0001, false, true, 'hello yoyow '+now.toISOString(), config.memo_key).then(block_num => {
    //             console.log('交易块号');
    //             console.log(block_num);
    //             resolve();
    //         }).catch(e => {
    //             reject(e);
    //         });
    //     });
    // })

    // /**
    //  * 获取账户历史记录
    //  * @test {Api#getHistory}
    //  */
    // it('获取账户历史记录', () => {
    //     return new Promise((resolve, reject) => {
    //         api.getHistory(config.platform_id, 1, 10).then(pw => {
    //             console.log(pw);
    //             resolve();
    //         }).catch(e => {
    //             reject(e);
    //         });
    //     });
    // });

    // /**
    //  * 验证当前块是否不可退回
    //  * @test {Api#confirmBlock}
    //  */
    // it('验证当前块是否不可退回', () => {
    //     return new Promise((resolve, reject) => {
    //         let block_num = 4271077;
    //         api.confirmBlock(block_num).then(flag => {
    //             console.log(`验证块 ${block_num} 是否不可退回 : ${flag}`);
    //             resolve();
    //         }).catch(e => {
    //             reject(e);
    //         })
    //     });
    // });

    // it('test post', () => {
    //     return new Promise((resolve, reject) => {
    //         api.post(217895094, 210425155, 4, `title${Date.now()}`, `body ${new Date().toLocaleDateString()}`, '{a:"im zf"}').then(block_num => {
    //             console.log('发文成功 block_num : '+block_num);
    //             resolve();
    //         }).catch(e => {
    //             reject(e);
    //         })
    //     });
    // });

    // it('test post update', () => {
    //     return new Promise((resolve, reject) => {
    //         api.postUpdate(217895094, 210425155, 1, 'update title xxxxx').then(block_num => {
    //             console.log('修改成功 block_num : '+block_num);
    //             resolve();
    //         }).catch(e => {
    //             reject(e);
    //         });
    //     });
    // });

    // it('get post list', () => {
    //     return new Promise((resolve, reject) => {
    //         api.getPostList(217895094).then(res => {
    //             console.log(res);
    //             resolve(res);
    //         }).catch(e => {
    //             reject(e);
    //         });
    //     });
    // });

    // it('get post by platform and poster', () => {
    //     return new Promise((resolve, reject) => {
    //         api.getPost(217895094, 25638, 5).then(res => {
    //             console.log(res);
    //             resolve();
    //         }).catch(e => {
    //             reject(e);
    //         });
    //     });
    // });

    // it('update account assets whitelist', () => {
    //     return new Promise((resolve, reject) => {
    //        api.updateAllowedAssets(9638251, 155).then(res => {
    //            console.log(res);
    //            resolve();
    //        }).catch(err => reject(err));
    //     });
    // });


});


/**

210425155
active      YYW72ZYtzkFbCDDX6XhgyjPngo9MipKbhfbnSVbjkbua6ZVv4MR1B 5KHiiQs8V7q6SCa6NRnibHcAd32mSn953PKcC88aXBxbvEfKLSP
secondary   YYW7gEvymRQZmeNEjsNE4BggZqd5CXszqoPAQDT5hTbSNWkUZTZN7 5KZpNkZGZdJWTQ7Y4m2sf4yEx7EAXwkRLPjTKS9W7bRhMLhM2LU
memo        YYW6AgNqiRHoaNC3YsdH4r43tG9yS717D9CxpgQ88rQPztW13BpFf 5HuahHraSyuBwAoMgHVWqtgCdNuV7eSq1qEcqRLZgbn33pHkkdQ

*/