# Tapdata Web


## Quick Start


1. **Install [pnpm](https://pnpm.io/)**
```bash
npm install -g pnpm
```

2. **Install dependencies (for the entire workspace)**
```bash
pnpm i
```

3. **Start**
```bash
# Start the open source version
pnpm dev:oss
# Start daas
pnpm start:daas
```

4. **Command Line Arguments**
Common parameters include `--port` and `--dest`，For more details [vue-cli](https://cli.vuejs.org/zh/guide/cli-service.html#%E4%BD%BF%E7%94%A8%E5%91%BD%E4%BB%A4)
```bash
# In the root directory, start with a specified port (an additional `--` may be needed on Windows)
pnpm start:daas --port=8100
# Equivalent to
cd apps/daas
pnpm start:test --port=8100
```

5. **Set Registry**
```bash
# Using nrm
npm i -g nrm
nrm use taobao
# Or set manually
pnpm set registry https://registry.npmmirror.com/ 
# Check the set source
pnpm get registry
```

## Use [git worktree](https://git-scm.com/docs/git-worktree) to develop multiple branches simultaneously

- For example, to check out the ``main`` branch into a specified directory:

```bash
git worktree add ../main main

# Develop in the main directory:
cd ../main
pnpm i
pnpm dev:oss
``` 

- Prune an abandoned checked-out branch

```bash
rm -rf ../dfs
git worktree prune

# 或者
git worktree remove ../dfs
``` 

### Advantages of worktree

- git worktree allows for rapid parallel development, with multiple branches of the same project evolving in parallel.
- Commits from git worktree can be shared within the same project.
- Compared to cloning the project separately, git worktree saves hard drive space and, because it uses hard links, is much faster than cloning.

## pnpm

### [Command Line](https://pnpm.io/pnpm-cli)

| npm                   | pnpm                   |
|-----------------------|------------------------|
| `npm install`         | `pnpm install`         |
| `npm i <pkg>`         | `pnpm add <pkg>`       |
| `npm run <cmd>`       | `pnpm <cmd>`           |
| `npm uninstall <pkg>` | `pnpm remove <pkg>`    |
| `npm update <pkg>`    | `pnpm update/up <pkg>` |

### [Workspace](https://pnpm.io/workspaces)

```yaml
# pnpm-workspace.yaml
packages:
  # Module packages
  - 'packages/*'
  # Application packages
  - 'apps/*'
```

### [Dependency Management](https://pnpm.io/cli/add)

| Command              | 含义                          |
| -------------------- | ----------------------------- |
| `pnpm add sax`       | Save to `dependencies`         |
| `pnpm add -D sax`    | Save to `devDependencies`      |
| `pnpm add -O sax`    | Save to `optionalDependencies` |
| `pnpm add sax@next`  | Install from the `next` tag       |
| `pnpm add sax@3.0.0` | Specify version `3.0.0`          |

- Add dependencies in the root workspace:
```bash
# -D --> devDependencies
pnpm add prettier -w -D
```

- Add a dependency in daas with [--filter](https://pnpm.io/filtering)
```bash
pnpm add qs --filter daas
```

- Add a dependency in all packages:
```bash
pnpm add qs -r
```

### Run the package:scripts command:

```bash
pnpm run start
# The `run` can be omitted
pnpm start
# Partial execution
pnpm start --filter daas
```
