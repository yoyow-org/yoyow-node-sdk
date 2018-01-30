import {yoyowSDK} from "./yoyow-node-sdk";
import config from "../conf/config";
var {PublicKey, Signature, ChainStore, PrivateKey, AccountUtils, Aes, TransactionBuilder, TransactionHelper} = yoyowSDK;
import secureRandom from 'secure-random';
import { Long } from 'bytebuffer';
import {PageWrapper} from './entity';

/**
 * Api 操作
 */
class Api {
    constructor(){}

    /**
     * 获取账户信息
     * @param {Number|String} uid yoyow账号
     * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(uObj yoyow用户对象), reject(e 异常信息)
     */
    getAccount(uid){
        return new Promise((resolve, reject) => {
            if(AccountUtils.validAccountUID(uid)){
                ChainStore.fetchAccountByUid(uid).then(uObj => {
                    if (null == uObj) {
                        reject(new Error('yoyow id does not exsit'));
                    } else {
                        resolve(uObj);
                    }
                }).catch(err => {
                    reject(err);
                });
            }else{
                reject(new Error('invalid yoyow id'));
            }
        }); 
    }

    /**
     * 转账
     * @param {Number|String} from_uid 转出yoyow账号
     * @param {String} from_key 转出账号零钱私钥
     * @param {Number|String} to_uid 转入yoyow账号
     * @param {Number} amount 转账数额
     * @param {boolean} [use_csaf] 是否使用积分 - 默认为 true
     * @param {String} [memo] 转账备注
     * @param {String} [memo_key] 备注密钥 - 需要写入备注时必填
     * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(), reject(e 异常信息)
     */
    transfer(from_uid, from_key, to_uid, amount, use_csaf = true, memo, memo_key){

        let fetchFromKey = new Promise((resolve, reject) => {
            return this.getAccount(from_uid).then(uObj => {
                resolve(uObj);
            }).catch(e => {
                reject(e);
            });
        });

        let fetchToKey = new Promise((resolve, reject) => {
            return this.getAccount(to_uid).then(uObj => {
                resolve(uObj);
            }).catch(e => {
                reject(e);
            });;
        });

        return new Promise((resolve, reject) => {

            if(isNaN(Number(amount)) && Object.prototype.toString.call(amount) !== '[object Number'){
                reject(new Error('invalid transfer amount'));
            }else if(memo && !memo_key){
                reject(new Error('need memo_key'));
            }else{
                Promise.all([fetchFromKey, fetchToKey]).then(res => {
                    let memoFromKey = res[0].memo_key;
                    let memoToKey = res[1].memo_key;
                    let retain_count = 100000; //资产精度参数
                    let asset = {amount: Math.round(amount * retain_count), asset_id: 0};
                    let extensions_data = {
                        from_prepaid: asset,
                        to_balance: asset
                    }

                    let op_data = {
                        from: from_uid,
                        to: to_uid,
                        amount: asset,
                        extensions: extensions_data
                    };

                    if(memo && memo.trim() != ''){

                        let entropy = parseInt(secureRandom.randomUint8Array(1)[0]);
                        var long = Long.fromNumber(Date.now());
                        let nonce = long.shiftLeft(8).or(Long.fromNumber(entropy)).toString();

                        let message = Aes.encrypt_with_checksum(
                            PrivateKey.fromWif(memo_key),
                            memoToKey,
                            nonce,
                            new Buffer(memo, 'utf-8')
                        );
                        let memo_data = {
                            from: memoFromKey,
                            to: memoToKey,
                            nonce,
                            message: message
                        };

                        op_data.memo = memo_data;
                    }

                    let tr = new TransactionBuilder();
                    tr.add_type_operation('transfer', op_data);
                    return tr.set_required_fees(from_uid, false, use_csaf).then(() => {
                        tr.add_signer(PrivateKey.fromWif(from_key));
                        return tr.broadcast().then((b_res) => {
                            resolve();
                        }).catch(e => {
                            reject(e);
                        });
                    }).catch(e => {
                        reject(e);
                    });
                }).catch(e => {
                    reject(e);
                });
            }
        });
    }

    /**
     * 获取账户操作历史
     * @param {Number|String} uid yoyow账户id
     * @param {Number} page 页码
     * @param {Number} size 每页显示条数
     * @returns {Promise<PageWrapper>|Promise.<T>|*|Promise} resolve(PageWrapper 分页对象), reject(e 异常信息)
     */
    getHistory(uid, page, size){
        return this.getAccount(uid).then(uObj => {
            return ChainStore.fetchRelativeAccountHistory(uid, null, 0, 1, 0).then(res => {
                let headInx = res[0][0];
                let maxPage = Math.ceil(headInx * 1.0 / size);
                if(page <= 1) page = 1;
                if(page >= maxPage) page = maxPage;
                let start = headInx - (page - 1) * size;
                
                return ChainStore.fetchRelativeAccountHistory(uid, null, 0, size, start).then(res => {
                    return {
                        list: res,
                        curPage: page,
                        maxPage: Math.ceil(headInx * 1.0 / size)
                    };
                }).catch(e => {
                    return Promise.reject(e);
                });
            }).catch(e => {
                return Promise.reject(e);
            });
        }).catch(e => {
            return Promise.reject(e);
        });
        
    }
}

export default new Api();