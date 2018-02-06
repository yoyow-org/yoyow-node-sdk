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
    }
};
export default utils;