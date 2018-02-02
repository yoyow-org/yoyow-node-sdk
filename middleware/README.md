# yoyow-middleware

### 开始

#### 1. 创建测试网账号

测试网地址 [http://demo.yoyow.org:8000](http://demo.yoyow.org:8000 "yoyow钱包测试网").

![创建测试网账号](https://github.com/bulangnisi/yoyow-node-sdk/blob/master/middleware/public/images/step1.png)

#### 2. 申请平台商

平台商申请地址 [http://demo.yoyow.org/manage/apply](http://demo.yoyow.org/manage/apply "yoyow平台商申请").
  
![申请平台商](https://github.com/bulangnisi/yoyow-node-sdk/blob/master/middleware/public/images/step2.png)

#### 3. 申请平台商审核通过后会收到来自yoyow发送的审核通过邮件.

#### 4. 修改中间件配置 
  
    ~/yoyow-node-sdk/middleware/conf/config.js
    
    secondary_key: "" 平台所有者零钱私钥
 
    memo_key: "" 平台所有者备注私钥
    
    platform_id: "" 平台所有者yoyow id
    
    平台所有者的各权限私钥获取方式 登录钱包 》 左侧菜单设置 》 账号 》 查看权限 》 在对应权限密钥的右侧点击显示私钥 》 输入密码显示私钥 》 将看到的私钥拷贝进配置中.
    
![获取对应私钥](https://github.com/bulangnisi/yoyow-node-sdk/blob/master/middleware/public/images/step3.png)
    
#### 5. 安装中间件服务所需node库

     进入 ~/yoyow-node-sdk/middleware/ 目录
    
     npm install
    
#### 6. 启动中间件服务

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