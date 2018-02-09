# yoyow-middleware

### 开始

#### 1. 创建测试网账号

测试网地址 [http://demo.yoyow.org:8000](http://demo.yoyow.org:8000 "yoyow钱包测试网").

![创建测试网账号](https://github.com/bulangnisi/yoyow-node-sdk/blob/master/middleware/public/images/step1.png)

平台所有者的各权限私钥获取方式 登录钱包 》 左侧菜单设置 》 账号 》 查看权限 》 在对应权限密钥的右侧点击显示私钥 》 输入密码显示私钥 》 将看到的私钥拷贝进配置中.
    
![获取对应私钥](https://github.com/bulangnisi/yoyow-node-sdk/blob/master/middleware/public/images/step3.png)

#### 2. 创建平台

    创建平台商需要最少 10000 YOYO 为抵押押金（测试网络注册赠送12000 测试币）

##### 2.1 启动cli钱包
###### 2.1.1 带参数启动

    打开控制台

    cd ~/yoyow-node-sdk/cli

    Mac

    ./yoyow_client.mac -s"ws://47.52.155.181:8090" --chain-id f48c65c9fe6e8a5e30f5135e8d68a8d18004acc877ab622cac09542a8b7f2c98

    Ubuntu

    ./yoyow_client.linux -s ws://47.52.155.181:8090 --chain-id f48c65c9fe6e8a5e30f5135e8d68a8d18004acc877ab622cac09542a8b7f2c98

    如若提示权限不足 

    sudo chmod a+x * 

  

###### 2.1.2 以配置文件启动

    cli 钱包 同路径下创建wallet.json 文件

    写入

    {
      "chain_id": "f48c65c9fe6e8a5e30f5135e8d68a8d18004acc877ab622cac09542a8b7f2c98",
      "pending_account_registrations": [],
      "pending_witness_registrations": [],
      "labeled_keys": [],
      "blind_receipts": [],
      "ws_server": "ws://47.52.155.181:8090",
      "ws_user": "",
      "ws_password": ""
    }

    Mac 

    ./yoyow_client.mac

    Ubuntu

    ./yoyow_client.linux

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

#### 3. 修改中间件配置 
  
    ~/yoyow-node-sdk/middleware/conf/config.js
    
    secondary_key: "" 平台所有者零钱私钥
 
    memo_key: "" 平台所有者备注私钥
    
    platform_id: "" 平台所有者yoyow id
    
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

    2000 api底层异常

    2001 账号不存在

    2002 无效的账号

    2003 无效的转账金额
      
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
      data: yoyow 用户对象
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

##### 1.3. 转账到指定用户 transfer

  请求类型：GET
  
  请求参数：

    {Number} uid - 指定用户id

    {Number} amount - 转出金额

    {Number} memo - 备注
    
  请求示例：
  
    localhost:3000/api/v1/transfer?uid=9638251&amount=100&memo=yoyowgod
    
  返回结果：
  
    {
      code: 操作结果,
      message: 返回消息,
      data: 该交易广播成功后所属块号
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
        platform: 签名平台所有人id
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
        name: 验签此时用户的用户名
      }
    }