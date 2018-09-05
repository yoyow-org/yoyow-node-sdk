import { ChainStore, ChainTypes, PrivateKey, AccountUtils, Aes, TransactionBuilder, hash } from "yoyowjs-lib";
import { Apis } from "yoyowjs-ws";
import config from "../conf/config";
import secureRandom from 'secure-random';
import { Long } from 'bytebuffer';
import { PageWrapper } from './entity';
import utils from './utils';
import ErrorUtils from './ErrorUtils';

let dynamic_global_params_type = `2.${parseInt(ChainTypes.impl_object_type.dynamic_global_property, 10)}.0`;

let _getAssetPrecision = (precision) => {
    return Math.pow(10, precision);
}

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
                    }else{
                        Promise.all([
                            ChainStore.fetchAccountStatisticsByUid(uid),
                            ChainStore.fetchAccountBalances(uid, [])
                        ]).then(res => {
                            let [statistics, assets] = res;
                            uObj.statistics = {
                                obj_id: statistics.id,
                                core_balance: statistics.core_balance,
                                csaf: statistics.csaf,
                                prepaid: statistics.prepaid,
                                total_witness_pledge: statistics.total_witness_pledge,
                                total_committee_member_pledge: statistics.total_committee_member_pledge,
                                total_platform_pledge: statistics.total_platform_pledge,
                                releasing_witness_pledge: statistics.releasing_witness_pledge,
                                releasing_committee_member_pledge: statistics.releasing_committee_member_pledge,
                                releasing_platform_pledge: statistics.releasing_platform_pledge
                            }
                            uObj.assets = assets;
                            resolve(uObj);
                        }).catch(e => {
                            reject(e);
                        });
                    }
                }).catch(err => {
                    reject(err);
                });
            } else {
                reject({code: 2002, message: '无效的账号'});
            }
        });
    }
    
    /**
     * 转账
     * @param {Number|String} from_uid 转出yoyow账号
     * @param {Number} asset_id 资产id
     * @param {String} from_key 转出账号零钱私钥
     * @param {Number|String} to_uid 转入yoyow账号
     * @param {Number} amount 转账数额
     * @param {boolean} [use_csaf = true] 是否使用积分 - 默认为 true
     * @param {boolean} [toBlance = true] 是否转账到零钱
     * @param {String} [memo] 转账备注
     * @param {String} [memo_key] 备注密钥 - 需要写入备注时必填
     * @returns {Promise<U>|Promise.<T>|*|Promise} resolve({block_num 操作所属块号, txid 操作id}), reject(e 异常信息)
     */
    transfer(from_uid, asset_id, from_key, to_uid, amount, use_csaf = true, toBlance = true, memo, memo_key) {
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

        let fetchAsset = new Promise((resolve, reject) => {
           return this.getAsset(asset_id).then(asset => {
               resolve(asset);
           }).catch(e => {
               reject(e);
           })
        });

        return new Promise((resolve, reject) => {
            if (!utils.isNumber(amount)) {
                reject({code: 2003, message: '无效的转账金额'});
            } else if (memo && !memo_key) {
                reject({code: 2004, message: '无效的备注私钥'});
            } else {
                Promise.all([fetchFromKey, fetchToKey, fetchAsset]).then(res => {
                    let memoFromKey = res[0].memo_key;
                    let memoToKey = res[1].memo_key;
                    let retain_count = _getAssetPrecision(res[2].precision); //资产精度参数
                    let asset = { amount: Math.round(amount * retain_count), asset_id: asset_id };
                    let extensions_data = {
                        from_prepaid: asset,
                        to_balance: asset
                    }
                    if(!toBlance){
                        extensions_data = {
                            from_prepaid: asset,
                            to_prepaid: asset
                        }
                    }

                    let op_data = {
                        from: from_uid,
                        to: to_uid,
                        amount: asset
                    };
                    if(asset_id == 0) op_data.extensions = extensions_data;

                    if (memo && memo.trim() != '') {

                        let entropy = parseInt(secureRandom.randomUint8Array(1)[0]);
                        var long = Long.fromNumber(Date.now());
                        let nonce = long.shiftLeft(8).or(Long.fromNumber(entropy)).toString();

                        // TODO: 用户之间通过平台转账操作，不做签名，因为平台无法获取到用户私钥
                        let message = config.platform_id == from_uid ? Aes.encrypt_with_checksum(
                            PrivateKey.fromWif(memo_key),
                            memoToKey,
                            nonce,
                            new Buffer(memo, 'utf-8')
                        ):new Buffer('uncrypto'+memo, 'utf-8').toString('hex');
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
                        this.__broadCast(tr).then(res => resolve(res)).catch(err => reject(err));
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
     * @param {Number} uid yoyow账户id
     * @param {Number} op_type 查询op类型 '0' 为 转账op，默认为null 即查询所有OP类型
     * @param {Number} start 查询开始编号，为0时则从最新记录开始查询，默认为0
     * @param {Number} limit 查询长度，最大不可超过100条，默认为10
     * @returns {Promise<PageWrapper>|Promise.<T>|*|Promise} resolve(Array 历史记录对象数组), reject(e 异常信息)
     */
    getHistory(uid, op_type = null, start = 0, limit = 10) {
        return this.getAccount(uid).then(uObj => {
            return ChainStore.fetchRelativeAccountHistory(uid, op_type, 0, limit, start).then(res => {
                return res;
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
     * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(bool 是否不可退回), reject(e 异常信息)
     */
    confirmBlock(block_num) {
        return Apis.instance().db_api().exec("get_objects", [[dynamic_global_params_type]]).then(global_params => {
            let irreversible_block_num = global_params[0].last_irreversible_block_num;
            return block_num <= irreversible_block_num;
        }).catch(e => {
            return Promise.reject(e);
        });
    }

    /**
     * 发文章
     * - 若属于转发文章 则需传入转发参数
     * @param {Number} platform 平台 yoyow 账号
     * @param {Number} poster 发帖人 yoyow 账号
     * @param {Number} post_pid 文章编号 由平台管理和提供
     * @param {String} title 文章标题
     * @param {String} body 文章内容
     * @param {String} extra_data 拓展信息 JSON 字符串
     * @param {Number} [origin_platform = null] 原文章发文平台 
     * @param {Number} [origin_poster = null] 原文章发文人 
     * @param {Number} [origin_post_pid = null] 原文章编号 
     * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(block_num 操作所属块号, txid 操作id), reject(e 异常信息)
     */
    post(platform, poster, post_pid, title, body, extra_data, origin_platform = null, origin_poster = null, origin_post_pid = null){
        return new Promise((resolve, reject) => {
            let op_data = {
                post_pid: post_pid,
                platform: platform,
                poster: poster,
                hash_value: hash.sha256(body, 'hex').toString(),
                extra_data: extra_data,
                title: title,
                body: body
            };
            // 转发情况写入转发参数
            if(origin_post_pid && origin_platform && origin_poster){
                op_data.origin_post_pid = origin_post_pid;
                op_data.origin_platform = origin_platform;
                op_data.origin_poster = origin_poster;
            }

            let tr = new TransactionBuilder();
            tr.add_type_operation('post', op_data);
            tr.set_required_fees(poster, false, true).then(() => {
                tr.add_signer(PrivateKey.fromWif(config.secondary_key));
                this.__broadCast(tr).then(res => resolve(res)).catch(err => reject(err));
            }).catch(e => {
                reject({code: 2000, message: e.message});
            });
        });
        
    }

    /**
     * 更新文章
     * - title body extra_data 参数至少有一个不为空
     * @param {Number} platform 平台 yoyow 账号
     * @param {Number} poster 发帖人 yoyow 账号
     * @param {Number} post_pid 文章编号 由平台管理和提供
     * @param {String} [title = null] 文章标题
     * @param {String} [body = null] 文章内容
     * @param {String} [extra_data = null] 拓展信息 JSON 字符串
     * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(block_num 操作所属块号, txid 操作id), reject(e 异常信息)
     */
    postUpdate(platform, poster, post_pid, title = null, body = null, extra_data = null){
        return new Promise((resolve, reject) => {
            let op_data = {
                post_pid: post_pid,
                platform: platform,
                poster: poster
            };

            if(title) op_data.title = title;

            if(body){
                op_data.body = body;
                op_data.hash_value = hash.sha256(body, 'hex').toString();
            }

            if(extra_data) op_data.extra_data = extra_data;

            let tr = new TransactionBuilder();
            tr.add_type_operation('post_update', op_data);
            tr.set_required_fees(poster, false, true).then(() => {
                tr.add_signer(PrivateKey.fromWif(config.secondary_key));
                this.__broadCast(tr).then(res => resolve(res)).catch(err => reject(err));
            }).catch(e => {
                reject({code: 2000, message: e.message});
            });
        });
    }

    /**
     * 获取单个文章
     * @param {Number} platform  平台 yoyow 账号
     * @param {Number} poster 发文人 yoyow 账号
     * @param {Number} post_pid 文章编号
     * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(post 文章对象), reject(e 异常信息)
     */
    getPost(platform, poster, post_pid){
        return new Promise((resolve, reject) => {
            Apis.instance().db_api().exec("get_post", [platform, poster, post_pid]).then(post => {
                resolve(post);
            }).catch(e => {
                reject(e);
            });
        });
    }

    /**
     * 根据平台和发帖人获取文章列表
     * 首次加载开始时间不传
     * 其他次加载，将上次数据的最后一条的create_time传入
     * limit 最小 1 最大 99
     * @param {Number} platform 平台 yoyow 账号
     * @param {Number} [poster = null] 发文人 yoyow 账号
     * @param {Number} limit 查询条数
     * @param {String} start 开始时间 - 'yyyy-MM-ddThh:mm:ss' ISOString
     * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(list 文章列表), reject(e 异常信息)
     */
    getPostList(platform, poster = null, limit = 20, start = new Date().toISOString().split('.')[0]){
        if(limit < 0) limit = 0;
        if(limit > 99) limit = 99;
        limit ++;
        let flag = false; //开始时间是否为某一文章的创建时间（非首次加载情况）
        return new Promise((resolve, reject) => {
            Apis.instance().db_api().exec("get_posts_by_platform_poster", [platform, poster, [start, '1970-01-01T00:00:00'], limit]).then(posts => {
                posts.map(item => {
                    if(item.create_time == start) flag = true;
                });
                if(flag) posts.shift();
                else posts.pop();
                resolve(posts);
            }).catch(e => {
                reject(e);
            });
        });
    }

    /**
     * 添加资产到用户资产白名单中
     * @param {Number} uid - 目标账户id
     * @param {Number} asset_id - 资产id
     * @returns {Promise<U>|Promise.<T>|*|Promise} resolve({block_num 操作所属块号, txid 操作id}), reject(e 异常信息)
     */
    updateAllowedAssets(uid, asset_id){
        let op_data = {
            account: uid,
            assets_to_add: [asset_id],
            assets_to_remove: []
        };
        let tr = new TransactionBuilder();
        tr.add_type_operation('account_update_allowed_assets', op_data);
        return tr.set_required_fees(uid, false, true).then(() => {
            tr.add_signer(PrivateKey.fromWif(config.secondary_key));
            return this.__broadCast(tr);
        })
    }

    /**
     * 获取资产信息
     * @param {String | Number} search - 资产符号（大写） 或 资产id
     * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(asset 资产对象), reject(e 异常信息)
     */
    getAsset(search){
        return ChainStore.fetchAsset(search).then(asset => {
            if(asset) return asset;
            else return Promise.reject({code: 2006, message: '无效的资产符号或id'});
        });
    }

    /**
     * 获取平台信息
     * @param {Number} uid - 平台所有者账号uid
     * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(platform 平台对象), reject(e 异常信息)
     */
    getPlatformById(uid){
        return ChainStore.fetchPlatformByUid(uid);
    }

    /**
     * 获取转账二维码
     * @param {String | Number} toAccount - 平台所有者账号uid
     * @param {Number} amount - 转账金额
     * @param {String} memo - 转账备注
     * @param {String | Number} asset - 转账资产符号 或 资产id
     */
    getQRReceive(toAccount, amount, memo, asset){
        let canMemo = true;
        if(utils.isNumber(amount) && amount >= 0 && !utils.isEmpty(memo))
            canMemo = false;
        else{
            amount = 0;
            memo = '';
        }
        return this.getAsset(asset).then(a => {
            let {asset_id, precision, symbol} = a;
            let resultObj = {
                type: 'transfer-for-fix',
                toAccount,
                amount,
                memoText: memo,
                canMemo,
                transferBalance: true,
                tokenInfo: asset_id == 0 ? null : 
                    { asset_id, precision, symbol }
            }
            return JSON.stringify(resultObj);
        });
    }

    /**
     * 统一广播处理
     * @param {TransactionBuilder} tr 
     */
    __broadCast(tr){
        return new Promise((resolve, reject) => {

            let common_return = trx => {
                return {
                    block_num: trx.head_block_number(),
                    txid: trx.id()
                };
            }

            return tr.broadcast(() => resolve(common_return(tr)))
            .then(() => resolve(common_return(tr)))
            .catch(e => {
                if(e.message && e.message.indexOf('Insufficient Prepaid') >= 0)
                    e = {code: 2005, message: '零钱不足'}
                reject(e);
            });
        })
    }


}

export default new Api();