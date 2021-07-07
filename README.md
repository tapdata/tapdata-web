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
