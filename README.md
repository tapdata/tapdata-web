# tapdaas

> Data as a service

## 快速开始

1. **安装依赖**

```bash
yarn install
```

2. **启动应用**

```bash
yarn start          # 启动应用和mock，代理为mock环境
yarn start:dev      # 启动应用，代理为dev环境
yarn start:test     # 启动应用，代理为test环境
```

> 环境代理映射。如需代理其他地址，可在启动命令后面追加 `--origin 代理地址`
```json
{
  "mock": "http://localhost:30300",
  "dev": "http://backend:3030",
  "test": "http://192.168.1.181:30300"
}
```

3. **打包**

```bash
yarn build
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

## git提交规范

### 格式: type (scope): subject

```text
  - type
    - 用于说明 `commit` 的类别
      - feat：新功能（feature）
      - fix：修补bug
      - docs：文档（documentation）
      - style： 格式（不影响代码运行的变动）
      - refactor：重构（即不是新增功能，也不是修改bug的代码变动）
      - perf：性能优化
      - test：增加测试
      - chore：构建过程或辅助工具的变动
      - revert：回退
      - build：打包
  - scope(可选)
    - 用于说明 `commit` 影响的范围，比如Button组件、store、首页、路由等等，视项目不同而不同。
  - subject(可选))
    - 是 `commit` 目的的简短描述，不超过50个字符。
      - 以动词开头，使用第一人称现在时，比如change，而不是changed或changes
      - 第一个字母小写
      - 结尾不加句号（.）
```
