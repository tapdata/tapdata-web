# Daas Monorepo

> Data as a service

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
