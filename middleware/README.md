# yoyow-middleware

### 开始

#### 1. 创建测试网账号

测试网地址 [http://demo.yoyow.org:8000](http://demo.yoyow.org:8000 "yoyow钱包测试网").

测试网CLI下载 [https://github.com/yoyow-org/yoyow-core-testnet/releases/](https://github.com/yoyow-org/yoyow-core-testnet/releases/).

![创建测试网账号](https://github.com/bulangnisi/yoyow-node-sdk/blob/master/middleware/public/images/step1.png)

平台所有者的各权限私钥获取方式 登录钱包 》 左侧菜单设置 》 账号 》 查看权限 》 在对应权限密钥的右侧点击显示私钥 》 输入密码显示私钥 》 将看到的私钥拷贝进配置中.
    
![获取对应私钥](https://github.com/bulangnisi/yoyow-node-sdk/blob/master/middleware/public/images/step3.png)

#### 2. 创建平台

    创建平台商需要最少 11000 YOYO，其中10000 为最低抵押押金，1000为创建平台手续费（测试网络注册赠送12000 测试币）

##### 2.1 启动cli钱包
###### 2.1.1 带参数启动

    Ubuntu

    ./yoyow_client -s ws://47.52.155.181:10011 --chain-id 3505e367fe6cde243f2a1c39bd8e58557e23271dd6cbf4b29a8dc8c44c9af8fe

    如若提示权限不足 

    sudo chmod a+x * 

  

###### 2.1.2 以配置文件启动

    cli 钱包 同路径下创建wallet.json 文件

    写入

    {
      "chain_id": "3505e367fe6cde243f2a1c39bd8e58557e23271dd6cbf4b29a8dc8c44c9af8fe",
      "pending_account_registrations": [],
      "pending_witness_registrations": [],
      "labeled_keys": [],
      "blind_receipts": [],
      "ws_server": "ws://47.52.155.181:10011",
      "ws_user": "",
      "ws_password": ""
    }

    Ubuntu

    ./yoyow_client

##### 2.2 设置钱包密码

    连接成功出现

    Please use the set_password method to initialize a new wallet before continuing

    new >>>

    执行

    new >>> set_password 你的密码

    返回

    set_password 你的密码
    null
    locked >>> 

    执行

    locked >>> unlock 你的密码

    返回

    unlock 123
    null
    unlocked >>>

    表示解锁成功

##### 2.3 导入资金私钥

    unlocked >>> import_key yoyow账号uid 资金密钥

    例:

    unlocked >>> import_key 120252179 5JwREzpwb62iEcD6J6WXs2fbn1aSKWQWvGLNCqAEYwS31EHD7i4

    返回

    1937037ms th_a       wallet.cpp:820                save_wallet_file     ] saving wallet to file wallet.json
    true

    如果没返回true，请检查你的uid和私钥是否正确

##### 2.4 创建平台

    unlocked >>> create_platform yoyow账号uid "平台名称" 抵押金额 货币符号 "平台url地址" "平台拓展信息json字符串" true

    例:

    unlocked >>> create_platform 235145448 "myPlatform" 10000 YOYO "www.example.com" "{}" true

    返回

    {
      "ref_block_num": 33094,
      "ref_block_prefix": 2124691028,
      "expiration": "2018-02-07T08:40:30",
      "operations": [[
          20,{
            "fee": {
              "total": {
                "amount": 1029296,
                "asset_id": 0
              },
              "options": {
                "from_csaf": {
                  "amount": 1029296,
                  "asset_id": 0
                }
              }
            },
            "account": 235145448,
            "pledge": {
              "amount": 1000000000,
              "asset_id": 0
            },
            "name": "myPlatform",
            "url": "www.example.com",
            "extra_data": "{}"
          }
        ]
      ],
      "signatures": [
        "1f08b704dd5ccf7e05e5dec45b06ad41e6382f5dd528e3f644d52ff4fb29c2040507544d5e94b84d77d70edcd68bb35b0cded0db87816ae64979ba98eeb641d5d7"
      ]
    }

##### 2.5 更新平台

    unlocked >>> update_platform yoyow账号uid "平台名称" 抵押金额 货币符号 "平台url地址" "平台拓展信息json字符串" true

    例:

    unlocked >>> update_platform 235145448 "newplatformname" 10000 YOYO null null true

    返回与创建平台一样

    平台名称、平台url地址和平台拓展信息如没有变动则填入null，如示例操作，不会改变平台url地址和拓展信息

##### 2.6 平台扫码登录协议

    平台属性 extra_data 拓展信息 JSON对象格式字符串 中

    约定 "login" 为平台扫码登录接口地址

    如 "extra_data": "{\"login\":\"http://localhost:8280/login\"}",
    注：地址后不加 "/" 斜杠，以上地址实际为 http://localhost:8280/login

    App扫码授权登录将访问该地址 ，发送回用户签名对象

    {

      {Number} yoyow - 当前操作用户账号id

      {String} time - 签名时间戳字符串

      {String} sign - 签名字符串

      {String} state - 平台签名时传入的自定义信息 (参考 Auth 相关 2.3 - signQR)

    }

    约定 平台提供的接口必须返回以下信息

    {

      {Number} code - 操作结果 0 为通过 任何非 0 情况视为错误处理
      
      {String} message - 操作结果描述

    }

#### 3. 修改中间件配置 
  
    ~/yoyow-node-sdk/middleware/conf/config.js

    // api服务器地址
    apiServer: "ws://47.52.155.181:10011",

    // 安全请求有效时间，单位s
    secure_ageing: 60,

    // 平台安全请求验证key 由平台自定义
    secure_key: "",

    // 平台所有者零钱私钥（获取方式参考1. 创建测试网账号）
    secondary_key: "", 

    // 平台所有者备注私钥（获取方式参考1. 创建测试网账号）
    memo_key: "",

    // 平台id(yoyow id)
    platform_id: "",

    // 转账是否使用积分
    use_csaf: true,

    // 转账是否转到余额 否则转到零钱
    to_balance: true,

    // 钱包授权页URL
    wallet_url: "http://demo.yoyow.org:8000/#/authorize-service",

    // 允许接入的IP列表
    allow_ip: ["localhost", "127.0.0.1"]
    
#### 4. 安装中间件服务所需node库

     进入 ~/yoyow-node-sdk/middleware/ 目录
    
     npm install
    
#### 5. 启动中间件服务

     npm start
    
启动正常情况如下图

![启动正常情况如图](https://github.com/bulangnisi/yoyow-node-sdk/blob/master/middleware/public/images/step4.png)
     
### 请求返回 error code 状态说明
 
    1001 无效的签名类型

    1002 无效的签名时间

    1003 请求已过期

    1004 无效的操作时间

    1005 无效的操作签名

    1006 账号信息与链上不匹配（常见于私钥恢复之后，使用其他电脑的本地数据或旧的备份文件进行授权操作导致）

    1007 未授权该平台

    2000 api底层异常

    2001 账号不存在

    2002 无效的账号

    2003 无效的转账金额

    2004 零钱和积分不足支付操作手续费

    2005 零钱不足

    3001 文章ID必须为该平台该发文人的上一篇文章ID +1（平台管理发文id）
      
### 请求文档及示例

#### 1. Api 相关

##### 1.1. 获取指定账户信息 getAccount

  请求类型：GET
  
  请求参数：
  
    {Number} uid - 账号id
    
  请求示例：
  
    localhost:3000/api/v1/getAccount?uid=25638

  返回结果：
  
    {
      code: 作结果,
      message: 返回消息,
      data: { // 用户信息
        uid: 账号uid
        name: 账号名称
        owner: 主控权限
        active: 资金权限
        secondary: 零钱权限
        memo_key: 备注密钥公钥
        reg_info: 注册信息
        can_post: 是否可发帖
        can_reply: 是否可回帖
        can_rate: 是否可评价
        is_full_member: 是否会员
        is_registrar: 是否注册商
        is_admin: 是否管理员
        statistics: { //用户资产
          obj_id: 资产对象id
          core_balance: 余额
          prepaid: 零钱
          csaf: 积分
          total_witness_pledge: 见证人总抵押（用户创建见证人抵押数量）
          total_committee_member_pledge: 理事会总抵押（用户创建理事会成员抵押数量）
          total_platform_pledge: 平台总抵押（用户创建平台抵押数量）
          releasing_witness_pledge: 见证人抵押待退回
          releasing_committee_member_pledge: 理事会抵押待退回
          releasing_platform_pledge: 平台抵押待退回
        }
      }
    }

##### 1.2. 获取指定账户近期活动记录 getHistory

  请求类型：GET
  
  请求参数：
  
    {Number} uid - 账号id

    {Number} page - 页码

    {Number} size - 每页显示条数

  请求示例：
  
    localhost:3000/api/v1/getHistory?uid=25638&page=1&size=10

  返回结果：
  
    {
      code: 操作结果,
      message: 返回消息,
      data: {
        maxPage: 最大页数,
        curPage: 当前页数,
        total: 总条数,
        size: 每页显示条数,
        list: 近期活动数据集合
      }
    }

##### 1.3. 转账到指定用户 transfer （需要安全验证的请求）

  请求类型：POST
  
  请求参数：

    {Object} cipher - 请求对象密文对象

             {

               ct, - 密文文本 16进制

               iv, - 向量 16进制

               s   - salt 16进制

             }

    请求对象结构:

    {Number} uid - 指定用户id

    {Number} amount - 转出金额

    {string} memo - 备注

    {Number} time - 操作时间
  
  请求示例：参照 安全请求验证
    
  返回结果：
  
    {
      code: 操作结果,
      message: 返回消息,
      data: {
        block_num: 操作所属块号
        txid: 操作id
      }
    }

##### 1.4. 验证块是否不可退回 confirmBlock

  请求类型：GET
  
  请求参数：
  
    {Number} block_num - 验证的块号
  
  请求示例：
  
    localhost:3000/api/v1/confirmBlock?block_num=4303231
  
  返回结果：
  
    {
      code: 操作结果,
      message: 返回消息,
      data: 此块是否不可退回 
    }

##### 1.5. 发送文章 post（需要安全验证的请求）

  请求类型：POST

  请求参数：


    {Object} cipher - 请求对象密文对象

             {

               ct, - 密文文本 16进制

               iv, - 向量 16进制

               s   - salt 16进制

             }

  请求对象结构:

    {Number} platform - 平台账号

    {Number} poster - 发文人账号

    {Number} post_pid - 文章编号

    {String} title - 文章标题

    {String} body - 文章内容

    {String} extra_data - 文章拓展信息

    {String} origin_platform - 原文平台账号（默认 null）

    {String} origin_poster - 原文发文者账号（默认 null）
    
    {String} origin_post_pid - 原文文章编号（默认 null）

    {Number} time - 操作时间

  请求示例：参照 安全请求验证
    
  返回结果：
  
    {
      code: 操作结果,
      message: 返回消息,
      data: {
        block_num: 操作所属块号
        txid: 操作id
      }
    }

##### 1.6. 更新文章 postUpdate（需要安全验证的请求）

请求类型：POST

  请求参数：


    {Object} cipher - 请求对象密文对象

             {

               ct, - 密文文本 16进制

               iv, - 向量 16进制

               s   - salt 16进制

             }

  请求对象结构:

    {Number} platform - 平台账号

    {Number} poster - 发文人账号

    {Number} post_pid - 文章编号

    {String} title - 文章标题

    {String} body - 文章内容

    {String} extra_data - 文章拓展信息

    {Number} time - 操作时间

  备注：修改文章操作时，title，body 和 extra_data 必须出现至少一个，并且与原文相同字段的内容不同

  请求示例：参照 安全请求验证
    
  返回结果：
  
    {
      code: 操作结果,
      message: 返回消息,
      data: {
        block_num: 操作所属块号
        txid: 操作id
      }
    }

##### 1.7. 获取文章 getPost

  请求类型：GET

  请求参数：
    
    {Number} platform - 平台账号

    {Number} poster -发文者账号

    {Number} post_pid - 文章编号

  请求示例：

    http://localhost:3001/api/v1/getPost?platform=217895094&poster=210425155&post_pid=3

  返回结果：

    {
      code: 操作结果,
      message: 返回消息,
      data: {
        "id":"1.7.12", - 文章ObjectId
        "platform":217895094, - 平台账号
        "poster":210425155, - 发文者账号
        "post_pid":5, - 文章编号
        "hash_value":"bb76a28981710f513479fa0d11fee154795943146f364da699836fb1f375875f", - 文章body hash值
        "extra_data":"{}", - 拓展信息
        "title":"test title in js for update", - 文章title
        "body":"test boyd in js for update", - 文章内容
        "create_time":"2018-03-12T10:22:03", - 文章创建时间
        "last_update_time":"2018-03-12T10:23:24", - 文章最后更新时间
        "origin_platform", - 原文平台账号 （仅对于创建文章时为转发时存在）
        "origin_poster", - 原文发文者账号 （仅对于创建文章时为转发时存在）
        "origin_post_pid" - 原文发文编号 （仅对于创建文章时为转发时存在）
      }
    }

##### 1.8. 获取文章列表 getPostList

  请求类型：GET

  请求参数：
    
    {Number} platform - 平台账号

    {Number} poster -发文者账号（默认null，为null时查询该平台所有文章）

    {Number} limit - 加载数（默认20）

    {String} start - 开始时间 'yyyy-MM-ddThh:mm:ss' ISOString （加载下一页时将当前加载出的数据的最后一条的create_time传入，不传则为从头加载）

  请求示例：

    http://localhost:3001/api/v1/getPostList?platform=217895094&poster=210425155&limit=2&start=2018-03-12T09:35:36

  返回结果：

    {
      code: 操作结果,
      message: 返回消息,
      data: [文章对象（参考获取单个文章返回的数据结构）]
    }
##### 1.9. 用户对用户通过平台转账 transferFromUser（需要安全验证的请求）

  请求类型：POST

  请求参数：

    {Object} cipher - 请求对象密文对象

             {

               ct, - 密文文本 16进制

               iv, - 向量 16进制

               s   - salt 16进制

             }

  请求对象结构：

    {Number} from - 转账发起账号 yoyow id

    {Number} to - 转账目标账号 yoyow id

    {Number} amount - 转账金额

    {String} memo - 备注

    {Number} time - 操作时间
  
  请求示例：参照 安全请求验证
    
  返回结果：
  
    {
      code: 操作结果,
      message: 返回消息,
      data: {
        block_num: 操作所属块号
        txid: 操作id
      }
    }

#### 2. Auth 相关

##### 2.1. 签名平台 sign

  请求类型：GET

  请求参数：无

  请求示例：
  
    localhost:3000/auth/sign

  返回结果：

    {
      code: 操作结果,
      message: 返回消息,
      data: {
        sign: 签名结果,
        time: 操作时间毫秒值,
        platform: 签名平台所有人id,
        url: 钱包授权url
      }
    }

##### 2.2 签名验证 verify

  请求类型：GET

  请求参数：

    {Number} yoyow - 账号id
    
    {Number} time - 操作时间毫秒值
    
    {String} sign - 签名结果

  请求示例：

    localhost:3000/auth/verify?sign=20724e65c0d763a0cc99436ab79b95c02fbb3f352e3f9f749716b6dac84c1dc27e5e34ff8f0499ba7d94f1d14098c6a60f21f2a24a1597791d8f7dda47559c39a0&time=1517534429858&yoyow=217895094

  返回结果：

    {
      code: 操作结果,
      message: 返回消息,
      data: {
        verify: 签名是否成功,
        name: 签名的yoyow用户名
      }
    }

##### 2.3 签名平台 返回二维码 signQR

  请求类型：GET

  请求参数：

    {String} state - 拓展信息，将在调用平台登录接口时与用户签名信息一同发送到平台，用于平台登陆接口需要自定义的参数时使用，若无此需求可不传

  请求示例：

    localhost:3000/auth/signQR?state=platformCustomParams

  返回结果：

    {
      code: 操作结果,
      message: 返回消息,
      data: 二维码图片base64 字符串
    }

### 安全请求验证

    涉及到资金安全相关的操作会在中间件服务中验证其有效性

    使用方自定义key配置于 config 中的 secure_key 里

    将操作对象加密传入

    加密示例(javascript的 crypto-js 版，其他语言使用类似的AES加密方式)

    默认 mode CBC , padding scheme Pkcs7

    transfer操作

    let key = 'customkey123456'; // 此key与中间件中的config 里 secure_key相同

    let sendObj = {
      "uid": 9638251,
      "amount": 100,
      "memo": "hello yoyow",
      "time": Date.now()
    }

    time 字段 操作时间取当前时间毫秒值 加密操作须带有此字段 用于验证操作时效

    let cipher = CryptoJS.AES.encrypt(JSON.stringify(sendObj), key);

    $.ajax({
      url: 'localhost:3000/api/v1/transfer',
      type: 'POST',
      data: {
        ct: cipher.ciphertext.toString(CryptoJS.enc.Hex),
        iv: cipher.iv.toString(),
        s: cipher.salt.toString()
      },
      success: function(res){
        // do something ...
      }
    })

    PHP加密方式

    function cryptoJsAesEncrypt($passphrase, $value){
      $salt = openssl_random_pseudo_bytes(8);
      $salted = '';
      $dx = '';
      while (strlen($salted) < 48) {
          $dx = md5($dx.$passphrase.$salt, true);
          $salted .= $dx;
      }
      $key = substr($salted, 0, 32);
      $iv  = substr($salted, 32,16);
      $encrypted_data = openssl_encrypt($value, 'aes-256-cbc', $key, true, $iv);
      $data = array("ct" => bin2hex($encrypted_data), "iv" => bin2hex($iv), "s" => bin2hex($salt));
      return json_encode($data);
    }
    
    如 请求文档及示例 1.3. 转账到指定用户 transfer

    其他需要安全请求验证的操作根据文档改动sendObj