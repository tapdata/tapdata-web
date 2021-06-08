# demo-project

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Run Mock
```
npm run mock
```

### Run drs Dev
```
npm run drs
```

### Run dfs Dev
```
npm run dfs
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
