# tapdaas

> Data as a service

## 快速开始

1. **安装依赖**
``` bash
yarn install
```
2. **启动应用**
```bash
yarn start 启动并打开应用
// or
yarn start --dev 开启dev环境的接口代理
yarn start:ws --dev 开启dev环境的接口代理,ws表示模拟websocket数据
```

3. **打包**
```bash
yarn build
```

4. **开启mock**
```bash
yarn mock  开启daas的mock
yarn mock -- --dfs 开启dfs的mock
```

### 项目结构
```
.
├── README.md
├── babel.config.js
├── package.json
├── public
│   ├── editor
│   ├── index.html
│   └── js
├── src
│   ├── App.vue
│   ├── api
│   ├── assets
│   ├── components
│   ├── directives
│   ├── editor
│   ├── i18n
│   ├── log.js
│   ├── main.js
│   ├── plugins
│   ├── router
│   ├── styles
│   ├── theme
│   ├── utils
│   ├── views
│   └── vuex
├── templateSetting.js
├── test
│   ├── e2e
│   └── unit
├── text.md
├── vue.config.js
└── yarn.lock

```
