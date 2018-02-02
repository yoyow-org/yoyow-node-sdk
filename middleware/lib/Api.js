import { yoyowSDK } from "./yoyow-node-sdk";
import config from "../conf/config";
import secureRandom from 'secure-random';
import { Long } from 'bytebuffer';
import { PageWrapper } from './entity';
import utils from './utils';

var {
    PublicKey,
    Signature,
    ChainStore,
    ChainTypes,
    PrivateKey,
    AccountUtils,
    Aes,
    TransactionBuilder,
    TransactionHelper,
    Apis
    } = yoyowSDK;

let dynamic_global_params_type = `2.${parseInt(ChainTypes.impl_object_type.dynamic_global_property, 10)}.0`;

/**
 * Api 操作
 */
class Api {
    constructor() { }

    /**
     * 获取账户信息
     * @param {Number|String} uid yoyow账号
     * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(uObj yoyow用户对象), reject(e 异常信息)
     */
    getAccount(uid) {
        return new Promise((resolve, reject) => {
            if (AccountUtils.validAccountUID(uid)) {
                ChainStore.fetchAccountByUid(uid).then(uObj => {
                    if (null == uObj) {
                        reject({code: 2001, message: '账号不存在'});
                    } else {
                        resolve(uObj);
                    }
                }).catch(err => {
                    reject({code: 2000, message: `操作失败:\n${err.message}`});
                });
            } else {
                reject({code: 2002, message: '无效的账号'});
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
     * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(block_num 交易所属块号), reject(e 异常信息)
     */
    transfer(from_uid, from_key, to_uid, amount, use_csaf = true, memo, memo_key) {

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
            if (!utils.isNumber(amount)) {
                reject({code: 2003, message: '无效的转账金额'});
            } else if (memo && !memo_key) {
                reject({code: 2004, message: '无效的备注私钥'});
            } else {
                Promise.all([fetchFromKey, fetchToKey]).then(res => {
                    let memoFromKey = res[0].memo_key;
                    let memoToKey = res[1].memo_key;
                    let retain_count = 100000; //资产精度参数
                    let asset = { amount: Math.round(amount * retain_count), asset_id: 0 };
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

                    if (memo && memo.trim() != '') {

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
                            resolve(b_res[0].block_num);
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
    getHistory(uid, page = 1, size = 10) {
        return this.getAccount(uid).then(uObj => {
            return ChainStore.fetchRelativeAccountHistory(uid, null, 0, 1, 0).then(res => {
                let headInx = res[0][0];
                let total = headInx;
                if(size > 100) size = 100;
                let maxPage = Math.ceil(total * 1.0 / size);
                if (page <= 1) page = 1;
                if (page >= maxPage) page = maxPage;
                let start = headInx - (page - 1) * size;

                return ChainStore.fetchRelativeAccountHistory(uid, null, 0, size, start).then(list => {
                    return new PageWrapper(page, maxPage, total, size, list);
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

    /**
     * 验证块是否为不可退回
     * - 如 将交易所属块号传入，以验证次交易为不可退回
     * @param {Number} block_num 查询交易所属块号
     * @returns {Promise<PageWrapper>|Promise.<T>|*|Promise} resolve(bool 是否不可退回), reject(e 异常信息)
     */
    confirmBlock(block_num) {
        return Apis.instance().db_api().exec("get_objects", [[dynamic_global_params_type]]).then(global_params => {
            let irreversible_block_num = global_params[0].last_irreversible_block_num;
            return block_num <= irreversible_block_num;
        }).catch(e => {
            return Promise.reject(e);
        });
    }
}

export default new Api();