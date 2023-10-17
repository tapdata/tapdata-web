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

> 环境服务映射。
> 如需代理其他地址，可在启动命令后面追加 `--origin 代理地址`

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

## git 分支规范

### branch

> 主分支：master 、dev；临时分支：feat 、release 、hotfix、bugfix

- master 受保护，不直接提交代码。代码和生产环境一一对应。
- dev 受保护，主分支，不能直接提交代码，在这个分支只能增加从 feat 合并 过来的 commit。紧急 bug 除外，紧急 bug 处理方式看后文 bugfix。
- feat 分支需要从 dev 切出，然后开发完成后，提交合并请求到 release 分支进行提测。发布 Release 分支时，合并 release 到 master 和 dev
- release 分支需要从 dev 切出，用来对项目中各个需求进行合并提测，改 bug 等均在此分支进行，测试成功后，提交合并请求到 dev。
- hotfix 分支需要 master 切出，解决线上紧急 bug，待 bug 修复完成后，提交合并请求到 master。
- bugfix 分支需要 dev 切出，待 bug 修复完成后，提交合并请求到 dev。

```text
master
dev
feat/xxx
release/xxx
hotfix/xxx
bugfix/xxx
```

### Tag

- 对应每个发布版本的源代码 tag。tag 版本号与需求版本一致，从 dev 分支打 tag，命名 release 版本号日期，如：release_1.0_20200426
- 对应每个发布版本的上线文件 tag。tag 版本号与需求版本一致，命名 dist 版本号日期，如：dist_1.0_20200426

### 开发流程

- 从 dev 分支根据需求，检出分支 feat/xxx，即 dev --\> feat/xxx
- 从 dev 分支检出预发环境测试分支 release/xxx ，即 dev --\> release/xxx

- 开发完成后将各个开发分支合并至此，即 feat/xxx --\> release/xxx, feat/yyyy --\> release/xxx

- 测试通过后，发起 merge request，待 code review 通过后，负责人 merge 代码，即 release/xxx --\> dev

### 上线流程

- 确保所有研发分支 都已经 merge 到 release；

- 使用 release branch 的代码进行测试，如果发现 bug，把对应的 bugfix merge 到 release，测试成功后合并至 dev 分支；

- 在 dev/master 分支编译构建

- 发布完成后在当前的 dev branch 打上对应版本的 tag，master 分支打上对应的上线文件版本的 tag。

### Bugfix 流程

- master 的 bug，直接检出 hotfix/xxx 修正,修复完成测试通过后，merge 进 master 分支； 即 master --\> hotfix/xxx --\> master
- dev 的 bug，直接检出 bugfix/xxx 修正,修复完成测试通过后，merge 进 dev 分支； 即 dev --\> bugfix/xxx --\> master

- feat 分支中的 bug，直接在 feat/xxx 分支修复

## git 提交规范

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
