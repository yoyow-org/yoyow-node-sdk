import { yoyowSDK } from "./yoyow-node-sdk";
import config from "../conf/config";
import secureRandom from 'secure-random';
import { Long } from 'bytebuffer';
import { PageWrapper } from './entity';
import utils from './utils';
import ErrorUtils from './ErrorUtils';

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
    Apis,
    hash
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
                    }else{
                        ChainStore.fetchAccountStatisticsByUid(uid).then(statistics => {
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
     * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(block_num 广播所属块号), reject(e 异常信息)
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
                tr.broadcast().then(b_res => {
                    resolve(b_res[0].block_num);
                }).catch(e => {
                    reject(ErrorUtils.formatError(e));
                });
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
     * @returns {Promise<U>|Promise.<T>|*|Promise} resolve(block_num 广播所属块号), reject(e 异常信息)
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
                tr.broadcast().then(b_res => {
                    resolve(b_res[0].block_num);
                }).catch(e => {
                    reject(ErrorUtils.formatError(e));
                });
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


}

export default new Api();