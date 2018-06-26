# Deploy middleware by docker

### Pull the newest code

```
$ git clone https://github.com/yoyow-org/yoyow-node-sdk.git
```

### Edit the configure

```
$ cd middleware
$ vim conf/config.js
```

### Build image

```
$ cd middleware
$ docker build -t yoyow-middleware .
```

### Run container

```
$ docker run -itd --name yoyow-middleware-1 -v CONFIG_FILE_PATH:/app/conf -p 3001:3001 --restart always yoyow-middleware
```

# Issues

* In MacOSX container cannot get real remote client IP. The container will only get docker0 IP.
