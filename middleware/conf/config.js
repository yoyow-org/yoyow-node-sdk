module.exports = {
    // api服务器地址
    apiServer: "ws://47.52.155.181:10011",
    // 请求有效时间，单位s
    secure_ageing: 1000,
    // 平台安全请求验证key 由平台自定义
    secure_key: "",
    // 平台所有者active私钥
    active_key: "",
    // 平台所有者零钱私钥
    secondary_key: "",
    // 平台所有者备注私钥
    memo_key: "",
    // 平台id(yoyow id)
    platform_id: "",
    // 转账是否使用积分
    use_csaf: true,
    // 转账是否转到余额 否则转到零钱
    to_balance: false,
    // 钱包授权页URL
    wallet_url: "http://demo.yoyow.org:8000/#/authorize-service",
    // 允许接入的IP列表
    allow_ip: ["localhost", "127.0.0.1"]
};