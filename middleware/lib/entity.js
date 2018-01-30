"use strict"

/**
 * 签名对象
 */
export class SignObj{
    constructor(sign, time, uid){
        /**
         * 签名结果
         * @type {String}
         */
        this.sign = sign;
        /**
         * 签名时间
         * @type {Number}
         */
        this.time = time;
        /**
         * yoyow id
         * @type {Number|String}
         */
        this.uid = uid;
    }
}

/**
 * 验签对象
 */
export class VerifyObj{
    constructor(verify, name){
        /**
         * 签名是否成功
         * @type {boolean}
         */
        this.verify = verify;
        /**
         * 平台拥有者yoyow账号name
         * @type {String}
         */
        this.name = name;
    }
}