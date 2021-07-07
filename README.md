# `tapdata-web-core`

## 初始化子模块

```
# 初次clone项目后，对应子模块文件夹是空的，需要执行初始化
git submodule init
# 初始化子模块后拉去对应版本的子模块代码（并不一定是最新的，而是拉取项目所依赖的版本号）
git submodule update

# 以下命令首次拉取时需要执行一遍
# git pull 默认不拉取子模块，需要submodule.recurse设置为true
git config submodule.recurse true
# git status 默认不展开子模块的变更信息，需要status.submodulesummary设置为1
git config status.submodulesummary 1
# 设置别名，执行git sdiff 查看子模块差异
git config alias.sdiff '!'"git diff && git submodule foreach 'git diff'"
# 设置别名，执行git sstatus 查看子模块状态
git config alias.sstatus "submodule foreach git status"
# 设置别名，执行git sadd 暂存子模块代码
git config alias.sadd "submodule foreach git add"
# 设置别名，执行git scommit 提交子模块代码
git config alias.scommit "submodule foreach git commit"
# 设置别名，执行git scommit 更新子模块代码
git config alias.spull "submodule update --remote --merge"
# 设置别名，执行git spush 发布子模块代码
git config alias.spush "submodule foreach git push origin HEAD:release"

# 创建本地修改的分支，以便做修改提交，只存在本地，不存在远端，不要把该分支推送到远端
git submodule foreach git checkout -b stable
# 同步最新的代码(注意： 若子模块有改动，请 commit 之后再执行此操作，并留意可能导致的冲突（跟维护另一个仓库的规则一致）)
git spull
```

### 若子模块仓库地址变了需要执行以下操作

```
git submodule sync --recursive  // 将新的 URL 复制到本地配置中
git submodule update --init --recursive
```
