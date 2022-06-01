# dfs-web

## 初始化项目

项目引入了 tapdata-web-core 核心子模块

克隆项目

```
git clone git@e.coding.net:tapdata/dfs/dfs-web.git --recurse-submodules
```

初始化子模块

```
# 初次clone项目后，对应子模块文件夹是空的，需要执行初始化
git submodule init
# 初始化子模块后拉去对应版本的子模块代码（并不一定是最新的，而是拉取项目所依赖的版本号）
git submodule update
```

## 命令说明

### 安装依赖

```
yarn
```

### 启动本地服务

```
yarn serve
```

### 构建生产环境代码

```
yarn build
```

### eslint 检查项目代码并修复

```
yarn lint
```

### 启动 mock 服务

```
yarn mock
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).


## 部署

### 部署到sit
1. 克隆 `daas-cloud` 项目，保证和dfs-web目录同级
```bash
git clone git@e.coding.net:tapdata/drs/daas-cloud.git
```
2. 切换到dfs-web相同的分支，如 `dfs-v2.0.0`
```bash
cd daas-cloud
git checkout dfs-v2.0.0
```
3. 首次执行需要登录下公司的docker镜像库, 密码是通用密码，你懂的！
```bash
docker login http://harbor.devops.tapdata.net:80
```
...windows使用下面命令
winpty docker login http://harbor.devops.tapdata.net:80
...

5. 执行build，要确保 `daas-cloud` 是最新的
```bash
git pull
./drs/build/build.sh -P dfs -v 2.1.7-202205311551-xf-001 -p test -c console
```
...windows
没有say语音包，执行前去sh文件中，注释掉
...
> -v 版本，可以按照版本号-日期-发布者-递增数的格式，每次更新记得的递增保证唯一

4. 详细参数说明
```
-p profile: the runtime environment. Can be one of the following: dev, prod, test, uat; default dev."
-v version: build version, default is the tag name of current git branch."
-P product: build the product, drs or dfs, default drs."
-c components: build on demand: tcm, tm, tm-java, agent, console; use commas to separate multiple component name, example -m tcm,tm; default for build all."
-d Build docker image, default true."
-u Update environment, default true."
```

### 目录

```
|-- README.md                    说明
|-- vue.config.js                webpack配置
|-- .eslintrc.js                 ESlint配置文件，代码格式化
|-- .gitignore                   忽略的文件
|-- babel.config.js              JS编译器，用于将高版本的js转换成兼容度高的版本
|-- jsconfig.json                JS项目的根目录文件，vs code 用于体验优化的文件
|-- package.json                 依赖包
|-- public                       静态资源
|-- mock                         模拟数据
|-- packages                     子模块
    |-- tapdata-web-core         前端核心模块
|-- src
    |-- components               公用的vue插件
    |-- pages                    多页面，定义对应页面的路由
    |-- plugins                  插件封装，axios、element、ws
    |-- router                   路由
    |-- views                    页面
    |-- .env.*                   环境配置，vue脚手架需要的配置文件
    |-- App.vue                  入口的vue文件
    |-- util.js                  工具类方法
    |-- init.js                  入口文件，引入vue以及其他公用资源
    |-- const.js                 常量
    |-- assets                   静态资源目录，引入字体、图标、图片、主题、css等资源
       |-- app.scss              样式入口
       |-- overrides.scss        重置样式
       |-- utilities.scss        原子类
       |-- var.scss              变量
       |-- font                  字体
       |-- icons                 图标
       |-- image                 图片
       |-- theme                 主题

```
