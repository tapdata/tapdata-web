const { join } = require('path')
const fs = require('fs')
const cp = require('child_process')

// 删掉 config 里面的子模块分支配置，防止覆盖 .gitmodules
cp.exec(`git config --unset submodule.src/_packages/tapdata-web-core.branch`)

cp.exec(
  `git submodule update --init --recursive & git config submodule.recurse true & git config status.submodulesummary 1`
)

// 删除alias重建
cp.exec(`git conLfig --remove-section alias`, function () {
  fs.readFile(join(__dirname, './.git/config'), 'utf8', function (err, data) {
    if (err) throw err
    let lines = data.split('\n').filter(str => !!str)
    lines.push(
      '[alias]',
      "\tsdiff = !git diff && git submodule foreach 'git diff'",
      '\tsstatus = submodule foreach git status',
      '\tsadd = submodule foreach git add',
      '\tscommit = submodule foreach git commit',
      '\tspull = submodule update --remote --merge',
      "\tspush = submodule foreach 'git push origin HEAD:$(git config -f ../../../.gitmodules submodule.src/_packages/tapdata-web-core.branch)'",
      "\tsinit = submodule foreach 'git checkout -B $(git -C ../../../ rev-parse --abbrev-ref HEAD)-webcore && git config -f ../../../.gitmodules submodule.src/_packages/tapdata-web-core.branch $(git rev-parse --abbrev-ref HEAD)'",
      '\tsu = submodule update'
    )

    fs.writeFile(join(__dirname, './.git/config'), lines.join('\n'), function (err) {
      if (err) throw err
      // eslint-disable-next-line no-console
      console.log('写入git别名成功: sdiff, sstatus, sadd, scommit, spull, spush, sinit, su')
    })
  })
})
