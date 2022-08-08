# Daas Monorepo

> Data as a service

## Last Release Branch
release-v2.7

## 快速开始

1. **安装 [pnpm](https://pnpm.io/zh/motivation)**
```bash
npm install -g pnpm
```

2. **安装依赖（整个 workspace）**
```bash
pnpm i
```

3. **启动应用**
```bash
# 启动 daas
pnpm start:daas
# 启动 dfs
pnpm start:dfs
```

4. **命令传参**
常用的参数有 `--port` 和 `--dest`，详见[vue-cli文档](https://cli.vuejs.org/zh/guide/cli-service.html#%E4%BD%BF%E7%94%A8%E5%91%BD%E4%BB%A4)
```bash
# 在根目录，指定端口启动（windows下可能要多加一个--）
pnpm start:daas -- -- --port=8100
# 等效于
cd apps/daas
pnpm start:test -- --port=8100
```

5. **设置淘宝镜像源**
```bash
# 使用nrm
npm i -g nrm
nrm use taobao
# 或者手动设置
pnpm set registry https://registry.npm.taobao.org/ 
# 查看设置的源
pnpm get registry
```

## 同步老仓库代码

### daas

1. 将frontend-el目录拆成独立分支
```bash
# cd 到 daas 项目目录下执行，-P: 目录、-b 分支名，这一步比较耗时
git subtree split -P frontend-el -b split-frontend-el-2.0
```

2. 在daas-web下拉取上面拆分好的分支
```bash
# cd 到 daas-web 项目目录下执行
git pull ../daas split-frontend-el-2.0 -r
```

### dfs

1. 在 daas-web 下设置dfs项目远程地址
```bash
git remote add dfs git@e.coding.net:tapdata/dfs/dfs-web.git
```

2. 拉取 dfs 代码，并检出要同步的分支
```bash
git fetch dfs
git checkout -b import-dfs-to-daas-web dfs/release
```

3. 调整成 daas-web 的目录结构
```bash
# 举个 🌰
git mv src public README.md vue.config.js package.json .env apps/dfs
```

4. 上一步调整完提交之后，切换到 daas-web 的主分支，开始合并
```bash
git merge import-dfs  --allow-unrelated-historie
```

## 使用 [git worktree](https://git-scm.com/docs/git-worktree) 同时开发多个分支

- 比如将dfs分支检出到指定目录

```bash
git worktree add ../dfs dfs-v2.0.2

# 在 dfs 目录下进行开发
cd ../dfs
pnpm i
pnpm start:dfs
``` 

- 废弃某个检出的分支

```bash
rm -rf ../dfs
git worktree prune

# 或者
git worktree remove ../dfs
``` 

### worktree 的优点

- git worktree 可以快速进行并行开发，同一个项目多个分支同时并行演进
- git worktree 的提交可以在同一个项目中共享
- git worktree 和单独 clone 项目相比，节省了硬盘空间，又因为 git worktree 使用 hard link 实现，要远远快于 clone

## pnpm

### [命令行](https://pnpm.io/zh/pnpm-cli)

| npm                   | pnpm                   |
|-----------------------|------------------------|
| `npm install`         | `pnpm install`         |
| `npm i <pkg>`         | `pnpm add <pkg>`       |
| `npm run <cmd>`       | `pnpm <cmd>`           |
| `npm uninstall <pkg>` | `pnpm remove <pkg>`    |
| `npm update <pkg>`    | `pnpm update/up <pkg>` |

### [工作空间](https://pnpm.io/zh/workspaces)

```yaml
# pnpm-workspace.yaml
packages:
  # 模块包
  - 'packages/*'
  # 应用包
  - 'apps/*'
```

### [依赖管理](https://pnpm.io/zh/cli/add)

| Command              | 含义                          |
| -------------------- | ----------------------------- |
| `pnpm add sax`       | 保存到 `dependencies`         |
| `pnpm add -D sax`    | 保存到 `devDependencies`      |
| `pnpm add -O sax`    | 保存到 `optionalDependencies` |
| `pnpm add sax@next`  | 从 `next` tag 下安装          |
| `pnpm add sax@3.0.0` | 安装指定版本 `3.0.0`          |

- 在 root workspace 添加依赖
```bash
# -D --> devDependencies
pnpm add prettier -w -D
```

- 在 daas 下添加依赖 [--filter](https://www.pnpm.cn/filtering)
```bash
pnpm add qs --filter daas
```

- 在所有包下添加依赖
```bash
pnpm add qs -r
```

### 运行命令 package:scripts

```bash
pnpm run start
# run 可以省略
pnpm start
# 局部执行
pnpm start --filter daas
```
