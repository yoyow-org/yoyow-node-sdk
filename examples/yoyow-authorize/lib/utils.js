let utils = {
    isEmpty: (obj) => {
        return obj == undefined || obj == null || obj == 'null' || obj == '' || obj.length == 0;
    },
    resJson: (res, code = 0, data = null, message = null) => {
        let obj = {code: code, data: data};
        if (message != null) obj.message = message;
        res.json(obj);
    },
    reqJson: (query) => {
        if (typeof(query) == "object") return query;
        if (!utils.isEmpty(query)) {
            return JSON.parse(query);
        }
        return {};
    }
};
export default utils;