import utils from './utils';
import config from '../conf/config';
import CryptoJS from 'crypto-js';
import CryptoJSAesJson from './aes-json-format';

class Secure {
    constructor(){
        this.validQueue = [
            this.validCipher,
            this.validTime
        ];
    }

    /**
     * 验证密文
     * @private
     */
    validCipher(req, res, next){
        let {ct, iv, s} = req.body;
        let cipher = {ct, iv, s};
        let send = CryptoJS.AES.decrypt(JSON.stringify(cipher), config.secure_key, {format: CryptoJSAesJson}).toString(CryptoJS.enc.Utf8);
        if(typeof send === 'string') send = JSON.parse(send);
        if(!send || null == send || send.trim() == '')
            res.json({code: 1005, message: '无效的操作签名', });
        else{
            try{
                req.decryptedData = JSON.parse(send);
            }catch(e){
                req.decryptedData = send;
            }finally{
                next();
            }
        }
    }

    /**
     * 验证操作时间
     * @private
     */
    validTime(req, res, next){
        let {time} = req.decryptedData;
        if(!time) {
            res.json({code: 1004, message: '无效的操作时间'});
            return;
        }
        let diff = (Date.now() - time) / 1000;
        if(diff > config.secure_ageing){
            res.json({code: 1003, message: '请求已过期.'});
            return;
        }
        next();
    }
}

let secure = new Secure();

export default secure;