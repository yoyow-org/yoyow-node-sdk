"use strict"
import assert from 'assert';
import auth from '../lib/Auth'
import config from '../conf/config';
import {Apis} from 'yoyowjs-ws';

let signObj ;

/**
 * 测试 授权
 * @test {Auth}
 */
describe('Auth test', function(){

    before(() => {
        return Apis.instance(config.apiServer, true).init_promise.then(function (result) {
            console.log('before Connect success');
        });
    });

    after(() => {
        Apis.close();
        signObj = null;
    });

    /**
     * 平台签名
     * @test {Auth#sign}
     */
    it('平台签名', () => {
        return new Promise((resolve, reject) => {
            auth.sign('platform', 217895094, '5Jo6fBSUwgssbyuvEP9RYSpNnrbH7sPXmJkiWCixQ8mueSQKqqc').then(signObj => {
                console.log('签名结果');
                console.log(signObj);
                assert(signObj['platform'] == config.platform_id);
                resolve();
            }).catch(e => {
                reject(e);
            });
        });
    });

    /**
     * 平台验签
     * @test {Auth#verify}
     */
    it('平台验签', () => {
        return new Promise((resolve, reject) => {
            auth.verify('platform', '1f226c9a767cae068148fda17f18ef685caca0bfb53c38e017a70cb1cebe8eb6a71f6ce32bf01745d17b22bea5459cd06109dd910a24a542be1f5e2e0326aa230e', 1521003258415, 217895094).then(vObj => {
                console.log('验签结果');
                console.log(vObj);
                assert(vObj.verify)
                resolve();
            }).catch(e => {
                reject(e);
            });
        });
    });

    /**
     * yoyow签名
     * @test {Auth#sign}
     */
    // it('yoyow签名', () => {
    //     return new Promise((resolve, reject) => {
    //         auth.sign('yoyow', 217895094, '5Jo6fBSUwgssbyuvEP9RYSpNnrbH7sPXmJkiWCixQ8mueSQKqqc').then(signObj => {
    //             console.log('签名结果 ',signObj);
    //             resolve();
    //         }).catch(e => {
    //             reject(e);
    //         });
    //     })
    // })

    /**
     * yoyow验签
     * @test {Auth#verify}
     */
    // it('yoyow验签', () => {
    //     return new Promise((resolve, reject) => {
    //         auth.verify('yoyow', '1f1d65854c5262545b031dd2acd4c0b29494d8efae133520fe7b8e5c71273b48de533035f639e9577114cbc6dd9c5295f4b803b9ceadb6954ce32f9f2caf14fae2', 1520995016533, 217895094).then(vObj => {
    //             console.log('验签结果');
    //             console.log(vObj);
    //             assert(vObj.verify)
    //             resolve();
    //         }).catch(e => {
    //             reject(e);
    //         });
    //     });
    // })
});