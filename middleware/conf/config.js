module.exports = {
    // api服务器地址
    apiServer: "ws://47.52.155.181:8090",
    // 需要安全验证的路由
    secure_routes: ['/api/v1/transfer'],
    // 安全请求有效时间，单位s
    secure_ageing: 60,
    // 平台安全请求验证公钥
    secure_pubkey: "",
    // 平台所有者零钱私钥
    secondary_key: "",
    // 平台所有者备注私钥
    memo_key: "",
    // 平台id(yoyow id)
    platform_id: "",
    // 转账是否使用积分
    use_csaf: true,
    // 钱包授权页URL
    wallet_url: "http://demo.yoyow.org:8000/#/authorize-service",
    // 允许接入的IP列表
    allow_ip: ["127.0.0.1"],
    // 允许访问的域列表
    allow_origin: ["localhost"]
};