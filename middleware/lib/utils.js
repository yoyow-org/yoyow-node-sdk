let utils = {
    base(obj, vType) {
        return Object.prototype.toString.call(obj) === `[object ${vType}]`;
    },

    isArray(obj) { return this.base(obj, 'Array'); },

    isFunction(obj) { return this.base(obj, 'Function'); },

    isString(obj) { return this.base(obj, 'String'); },

    isObject(obj) { return this.base(obj, 'Object'); },

    isNumber(obj) {
        let n = Number(obj);
        return this.base(n, 'Number') && !isNaN(n);
    },

    isEmpty(obj) {
        return obj == undefined || obj == null || obj == 'null' || obj == '' || obj.length == 0;
    },

    isEmptyObject(obj){
        for (var t in obj)
            return false;
        return true;
    },

    resJson(res, code = 0, data = null, message = null) {
        let obj = { code: code, data: data };
        if (message != null) obj.message = message;
        res.json(obj);
    },

    reqJson(query) {
        if (typeof (query) == "object") return query;
        if (!utils.isEmpty(query)) {
            return JSON.parse(query);
        }
        return {};
    },

    success(res, obj) {
        utils.resJson(res, 0, obj, '操作成功');
    },

    error(res, err) {
        utils.resJson(res, err.code || 2000, null, err.message);
    },

    getRealIp(req) {
        let real_ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
        if (real_ip === "::1") real_ip = "127.0.0.1";
        return real_ip.match(/\d+/g).join('.');
    },

    getParams(req){
        let paramsFrom ;
        if(!utils.isEmptyObject(req.query)) paramsFrom = req.query;
        if(!utils.isEmptyObject(req.body)) paramsFrom = req.body;
        if(!utils.isEmptyObject(req.params)) paramsFrom = req.params;
        return paramsFrom;
    }
};
export default utils;