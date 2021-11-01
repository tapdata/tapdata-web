const { join } = require('path')
const fs = require('fs')
const cp = require('child_process')

// 删掉 config 里面的子模块分支配置，防止覆盖 .gitmodules
cp.exec(`git config --unset submodule.frontend-el/src/_packages/tapdata-web-core.branch`)

cp.exec(
  `git submodule update --init --recursive & git config submodule.recurse true & git config status.submodulesummary 1`
)
cp.exec(`git config --remove-section alias`, function () {
  fs.readFile(join(__dirname, './.git/config'), 'utf8', function (err, data) {
    if (err) throw err
    let lines = data.split('\n')
    let array = []
    for (let i = 0; i < lines.length; i++) {
      const str = lines[i]
      if (str) {
        array.push(str)
      }
    }
    lines = array
    let index = lines.findIndex(str => str === '[alias]')
    if (index == -1) {
      lines.push('[alias]')
      index = lines.length
    }
    const spushIndex = lines.findIndex(str => str.includes('\tspush = submodule foreach git push origin HEAD:release'))
    if (~spushIndex) {
      lines.splice(
        spushIndex,
        1,
        "\tspush = submodule foreach 'git push origin HEAD:$(git config -f ../../../.gitmodules submodule.src/_packages/tapdata-web-core.branch)'",
        "\tsinit = submodule foreach 'git checkout -b $(git -C ../../../ rev-parse --abbrev-ref HEAD)-webcore'"
      )
    } else {
      lines.splice(
        index,
        0,
        "\tsdiff = !git diff && git submodule foreach 'git diff'",
        '\tsstatus = submodule foreach git status',
        '\tsadd = submodule foreach git add',
        '\tscommit = submodule foreach git commit',
        '\tspull = submodule update --remote --merge',
        "\tspush = submodule foreach 'git push origin HEAD:$(git config -f ../../../.gitmodules submodule.src/_packages/tapdata-web-core.branch)'",
        "\tsinit = submodule foreach 'git checkout -b $(git -C ../../../ rev-parse --abbrev-ref HEAD)-webcore'",
        '\tsu = submodule update'
      )
      lines.push('\n')
    }

    fs.writeFile(join(__dirname, './.git/config'), lines.join('\n'), function (err) {
      if (err) throw err
      console.log('写入git别名成功: sdiff, sstatus, sadd, scommit, spull, spush')
    })
  })
})
