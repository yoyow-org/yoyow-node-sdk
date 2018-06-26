# 基于 Docker 进行部署

### 拉取代码

```
$ git clone https://github.com/yoyow-org/yoyow-node-sdk.git
```

### 修改配置文件

```
$ cd middleware
$ vim conf/config.js
```

### 打包镜像

```
$ cd middleware
$ docker build -t yoyow-middleware .
```

### 启动容器

```
$ docker run -itd --name yoyow-middleware-1 -v CONFIG_FILE_PATH:/app/conf -p 3001:3001 --restart always yoyow-middleware
```

# 已知问题

* 在 MacOSX 下，容器无法获取客户端真实IP，只能获取到 docker0 的 IP
