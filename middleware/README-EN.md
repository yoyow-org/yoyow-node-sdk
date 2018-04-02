# yoyow-middleware

### Start

#### 1. Create test-net account

Address of test-net is [http://demo.yoyow.org:8000](http://demo.yoyow.org:8000 "test-net address of yoyow wallet").

The CLI program can be obtained from [https://github.com/yoyow-org/yoyow-core-testnet/releases/](https://github.com/yoyow-org/yoyow-core-testnet/releases/).

![create account](https://github.com/chen188/yoyow-node-sdk/blob/master/middleware/public/images/step1-en.png)

Steps to find all your public/private keys:

- log into [wallet](http://demo.yoyow.org:8000 "test-net address of yoyow wallet").
- goto `Settings` on the left side
- click the `Account` and all public keys come to you, including `Owner`, `Active`,`Secondary` and `Memo` key
- if you want to check the private key, click `Show Private Key` besides public key and type in you `wallet password` accordingly.
    
![find all keys](https://github.com/chen188/yoyow-node-sdk/blob/master/middleware/public/images/step3-en.png)

#### 2. Create platform

To create a platform, 11000 YOYOs(TESTs in test-net) are needed at least, 10000 YOYOs for deposition and 1000 YOYOs for the registration fee.
 (12000 TESTs are transferred to you when your registration is finished, which is enough to create a platform)

##### 2.1 Run cli-wallet
###### 2.1.1 run with parameters

    # for Ubuntu
    ./yoyow_client -s ws://47.52.155.181:10011 --chain-id 3505e367fe6cde243f2a1c39bd8e58557e23271dd6cbf4b29a8dc8c44c9af8fe

    # used when the permission problem comes to you
    sudo chmod a+x * 
  

###### 2.1.2 run with configuration file

create file `wallet.json` under the same directory with `cli-wallet`, filling it with:

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

and then choose the corresponding command of your OS,

    # for Ubuntu
    ./yoyow_client

##### 2.2 set wallet password

Connect to the server successfully and you will see:

    Please use the set_password method to initialize a new wallet before continuing
    new >>>

Setup your password by:

    new >>> set_password <your password>
    <ENTER>

    set_password <your password>
    null
    locked >>> 

and then unlock your wallet:

    locked >>> unlock <your password>
    <ENTER>

    unlock <your password>
    null
    unlocked >>>


##### 2.3 Import active private key

    unlocked >>> import_key <yoyow uid> <private key of active key>

for example:

    unlocked >>> import_key 120252179 5JwREzpwb62iEcD6J6WXs2fbn1aSKWQWvGLNCqAEYwS31EHD7i4

will give you:

    1937037ms th_a       wallet.cpp:820                save_wallet_file     ] saving wallet to file wallet.json
    true

if not `true` returned, please make sure your uid and private key are correct.

##### 2.4 Create platform

    unlocked >>> create_platform <yoyow uid> <"platform name"> <pledge amount> <symbol of coin> "<url for platform>" "<json string of platform's extra information>" true

for example:

    unlocked >>> create_platform 235145448 "myPlatform" 10000 YOYO "www.example.com" "{}" true

will gives you:

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

##### 2.5 Update platform

    unlocked >>> update_platform <yoyow uid> <"platform name"> <pledge amount> <symbol of coin> "<url for platform>" "<json string of platform's extra information>" true

For example:

    unlocked >>> update_platform 235145448 "newplatformname" 10000 YOYO null null true

The result returned is same as `Create platform`.

> Note: leave `platform name`, `url for platform` or `extra information` to `null` will not change the corresponding value，
that's to say, as in the previous example，the `url for platform` and `extra information` won't be changed.

##### 2.6 Login by scanning QR code 平台扫码登录协议

The `login` field in platform property `extra_data` is used by platform login through scanning QR code, e.g. ```"extra_data": "{\"login\":\"http://localhost:8280/login\"}```

Authorization by scanning QR code in APP will access this address and send back the user signature object.

    {
      {Number} yoyow - the yoyow id of current user
      {String} time  - signature timestramp in ms
      {String} sign  - signation
      {String} state - platform defined information when requesting(See chapter 2.3 - signQR)
    }

Following information is expected from platform specified API

    {
      {Number} code    - operation result. 0 indicates passing, any non-zero condition should be treated as an error.
      {String} message - operation comment.
    }
    
#### 3. Customize configuration of middleware
  
    ~/yoyow-node-sdk/middleware/conf/config.js

    // api server
    apiServer: "ws://47.52.155.181:10011",

    // seconds for a valid secure request
    secure_ageing: 60,

    // platform specified secure key used for safe request
    secure_key: "",

    // Platform's Secondary key(can be obtained as chapter 1. Create test-net account)
    secondary_key: "", 

    // Platform's MEMO key(can be obtained as chapter 1. Create test-net account)
    memo_key: "",

    // Platform's uid(yoyow id)
    platform_id: "",

    // whether to use csaf for transfer operation fee or not
    use_csaf: true,

    // transfer to balance? otherwise to tipping
    to_balance: true,

    // authorizing url of wallet
    wallet_url: "http://demo.yoyow.org:8000/#/authorize-service",

    // IPs allow to access
    allow_ip: ["localhost", "127.0.0.1"]
    
#### 4. Install dependencies of middleware

     cd ~/yoyow-node-sdk/middleware/
     npm install
    
#### 5. Start middleware service

     npm start
    
When startup normally and successfully, you'll see:

![startup normally and successfully](https://github.com/chen188/yoyow-node-sdk/blob/master/middleware/public/images/step4.png)
     
### Details on response code(error code)
 
    1001 Invalid signature
    1002 Invalid time of signature
    1003 Expired request
    1004 Invalid operation time
    1005 Invalid signature of the request
    1006 Inconsistent with On-Chain account information(Mostly caused by using other computers' local data or old backup files for authorization operations after private key recovery)
    1007 Unauthorized platform
    2000 Internal API error
    2001 Account not exists
    2002 Invalid account
    2003 Invalid transfer amount 
    2004 Insufficient Tipping and Bonus Point to afford fees
    2005 Insufficient Tipping
    3001 Article ID must equal with this platform's latest article id + 1. (these IDs are managed by platform)
      
### Documents on API

#### 1. API relevant

##### 1.1. getAccount - get yoyow account information specified by `uid`

  type: GET
  
  params: 
  
    {Number} uid - yoyow id
    
  example：
  
    localhost:3000/api/v1/getAccount?uid=25638

    # response：
    {
      code: res_code,
      message: res_message,
      data: { // account info.
        uid: yoyow id
        name: account name
        owner: owner permission
        active: active permission
        secondary: secondary permission
        memo_key: public key of memo key
        reg_info: registration information
        can_post: able to post articels
        can_reply: able to reply to articels
        can_rate: able to rate articels
        is_full_member: is full member
        is_registrar: is registrar
        is_admin: is admin
        statistics: { //account's balances
          obj_id: balance object id
          core_balance: balance
          prepaid: tipping
          csaf: csaf
          total_witness_pledge: witess's total pledge(pledged when creating witness)
          total_committee_member_pledge: committee's total pledges(pledged when creating committee)
          total_platform_pledge: platform's total pledge(pledged when creating platform)
          releasing_witness_pledge: releasing witness pledge
          releasing_committee_member_pledge: releasing committee member pledge
          releasing_platform_pledge: releasing platform pledge
        }
      }
    }

##### 1.2. getHistory - get recently activity records of account `uid`

  type: GET
  
  params: 
  
    {Number} uid  - yoyow id
    {Number} page - page number
    {Number} size - records number per page

  example: 
  
    localhost:3000/api/v1/getHistory?uid=25638&page=1&size=10

  response: 
  
    {
      code: res_code,
      message: res_message,
      data: {
        maxPage: max page number,
        curPage: current page number,
        total: total records,
        size: records per page,
        list: recently activity records
      }
    }

##### 1.3. transfer - transfer to uid (security verification needed)

  type: POST
  
  params: 

    {Object} cipher - cipher object of request

             {
               ct, - Hexadecimal ciphertext
               iv, - Hexadecimal vector
               s   - Hexadecimal salt
             }

    #structure of request:

    {Number} uid    - transfer to `uid`
    {Number} amount - amount to transfer
    {string} memo   - memo
    {Number} time   - operation time
  
  example: see chapter `Verification of request`
    
  response: 
  
    {
      code: res_code,
      message: res_message,
      data: {
        block_num: which block this operation belongs to
        txid: transaction id of this operation
      }
    }

##### 1.4. confirmBlock - check the `block_number` block is irreversible(confirmed)

  type: GET
  
  params: 
  
    {Number} block_num - block to check
  
  example: 
  
    localhost:3000/api/v1/confirmBlock?block_num=4303231
  
  response: 
  
    {
      code: res_code,
      message: res_message,
      data: whether block is irreversible 
    }

##### 1.5. post - post an post(security verification needed)

  type: POST

  params: 

    {Object} cipher - cipher object of request

             {
               ct, - Hexadecimal ciphertext
               iv, - Hexadecimal vector
               s   - Hexadecimal salt
             }

    #structure of request:

    {Number} platform     - yoyow id of platform
    {Number} poster       - yoyow id of poster
    {Number} post_pid     - id of this post
    {String} title        - title of this post
    {String} body         - content of this post
    {String} extra_data   - extra info of this post
    {String} origin_platform - origin platform of post(defaults to null)
    {String} origin_poster   - origin poster of post(defaults to null)
    {String} origin_post_pid - origin post id(defaults to null)
    {Number} time         - operation time

  example: see chapter `Verification of request`
    
  response: 
  
    {
      code: res_code,
      message: res_message,
      data: {
        block_num: which block this operation belongs to
        txid: transaction id of this operation
      }
    }

##### 1.6. postUpdate - update Post (security verification needed)

type: POST

  params: 

    {Object} cipher - cipher object of request

             {
               ct, - Hexadecimal ciphertext
               iv, - Hexadecimal vector
               s   - Hexadecimal salt
             }

    #structure of request:

    {Number} platform - yoyow id of platform
    {Number} poster   - yoyow id of poster
    {Number} post_pid - id of this post
    {String} title    - title of this post
    {String} body     - content of this post
    {String} extra_data - extra info of this post
    {Number} time     - operation time

  > Note: when updating a post, at least one field of title, body, and extra_data should be present and different with original

  example: see chapter `Verification of request`
    
  response: 
  
    {
      code: res_code,
      message: res_message,
      data: {
        block_num: which block this operation belongs to
        txid: transaction id of this operation
      }
    }

##### 1.7. getPost - get a specified post

  type: GET

  params: 
    
    {Number} platform - yoyow id of platform
    {Number} poster   - poster id
    {Number} post_pid - id of this post

  example: 

    http://localhost:3001/api/v1/getPost?platform=217895094&poster=210425155&post_pid=3

  response: 

    {
      code: res_code,
      message: res_message,
      data: {
        "id":"1.7.12",        - ObjectId of this post
        "platform":217895094, - yoyow id of platform
        "poster":210425155,   - yoyow id of poster
        "post_pid":5,         - id of this post
        "hash_value":"bb76a28981710f513479fa0d11fee154795943146f364da699836fb1f375875f", - hash value of the content
        "extra_data":"{}", - extra information of post
        "title":"test title in js for update", - title of this post
        "body":"test boyd in js for update",   - content of this post
        "create_time":"2018-03-12T10:22:03",   - created at
        "last_update_time":"2018-03-12T10:23:24", - last updated at
        "origin_platform", - origin platform where the post firstly came to people(only used when reposting an existing post)
        "origin_poster",   - poster id in orgin platform (only used when reposting an existing post)
        "origin_post_pid"  - post id in origin platform (only used when reposting an existing post)
      }
    }

##### 1.8. getPostList - get a list of posts

  type: GET

  params: 
    
    {Number} platform - yoyow id of platform
    {Number} poster   - poster id(default to null and get all posts of this platform)
    {Number} limit    - limit to(default to 20)
    {String} start    - start from 'yyyy-MM-ddThh:mm:ss' ISOString
                        (`create_time` of the last record should be used as `start` in next request to traverse all records)

  example: 

    http://localhost:3001/api/v1/getPostList?platform=217895094&poster=210425155&limit=2&start=2018-03-12T09:35:36

  response: 

    {
      code: res_code,
      message: res_message,
      data: [object of post（see `getPost`）]
    }
##### 1.9. transferFromUser - transfer between users through platform (security verification needed)

  type: POST

  params: 

    {Object} cipher - cipher object of request

             {
               ct, - Hexadecimal ciphertext
               iv, - Hexadecimal vector
               s   - Hexadecimal salt
             }

    #structure of request:

    {Number} from - transfer from yoyow id
    {Number} to   - transfer to yoyow id
    {Number} amount - amount to transfer
    {String} memo   - memo
    {Number} time   - operation time
  
  example: see chapter `Verification of request`
    
  response: 
  
    {
      code: res_code,
      message: res_message,
      data: {
        block_num: which block this operation belongs to
        txid: transaction id of this operation
      }
    }

#### 2. Auth relevant

##### 2.1. sign - sign platform

  type: GET

  params: NULL

  example: 
  
    localhost:3000/auth/sign

  response: 

    {
      code: res_code,
      message: res_message,
      data: {
        sign: the result of sign,
        time: operation time in ms,
        platform: yoyow id of the platform owner,
        url: authorizing URL of wallet
      }
    }

##### 2.2 verify - verify the signature

  type: GET

  params: 

    {Number} yoyow - yoyow id
    {Number} time - operation time in ms
    {String} sign - the result of sign

  example: 

    localhost:3000/auth/verify?sign=20724e65c0d763a0cc99436ab79b95c02fbb3f352e3f9f749716b6dac84c1dc27e5e34ff8f0499ba7d94f1d14098c6a60f21f2a24a1597791d8f7dda47559c39a0&time=1517534429858&yoyow=217895094

  response: 

    {
      code: res_code,
      message: res_message,
      data: {
        verify: is signature vaild,
        name: yoyow name of this signature
      }
    }
    
##### 2.3 signQR - sign platform and returned as QR code

  type：GET

  params：

    {String} state - optional extension inforamation in addition to signature data sended to platform login interface, 
                     only used when platform defined paramenters are needed.
    
  example：

    localhost:3000/auth/signQR?state=platformCustomParams

  response：

    {
      code: res_code,
      message: res_message,
      data: base64 encoded QR code image
    }

### Verification of request

Operations manipulating money will be validated in middleware service.

`secure_key` in `config` is the place where the platform can customize the key.

Encrypt the operation object for sending a request.

Encryption example(JS version).

> Default mode is CBC, padding scheme is Pkcs7.

    #transfer operation

    let key = 'customkey123456'; // the `secure_key` in `config`

    let sendObj = {
      "uid": 9638251,
      "amount": 100,
      "memo": "hello yoyow",
      "time": Date.now(), // the current time in ms, required
    }

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

Encryption example in PHP:

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
    
    
> Any other operation needs security verification should replace the `sendObj` accordingly.