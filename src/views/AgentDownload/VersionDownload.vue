<template>
  <section class="down-version-page down-page">
    <main class="page-main block">
      <template v-if="type === 'windows'">
        <div class="title">在 windows 环境中部署 Tapdata agent</div>
        <p class="title-text pt-10">
          为了确保用户见的隔离，Tapdata 会为每个用户生成一个专用 agent 下载地址
        </p>

        <ElButton class="mt-5" type="primary" @click="handleDownLoad">下载快速部署工具</ElButton>

        <div class="text-style pt-10">安装方法</div>
        <ul class="pt-5 ul-style">
          <li>1. 请先通过上方按钮下载 agent 快速部署工具</li>
          <li>
            2. 在快速部署工具下载完毕后，请将该部署工具放入任意目录并执行下方命令即可实现 Tapdata agent 的快速部署
          </li>
          <li>
            <h4 class="s-title pt-3">
              下载地址
              <ElTooltip placement="top" manual content="已复制" popper-class="copy-tooltip" :value="showTooltip">
                <span
                  class="operaKey"
                  v-clipboard:copy="windowLink"
                  v-clipboard:success="onCopy"
                  @mouseleave="showTooltip = false"
                >
                  <i class="click-style">复制</i>
                </span>
              </ElTooltip>
            </h4>
          </li>
          <li class="box title-text">{{ windowLink }}</li>
          <li class="mt-3">3. 下载、部署 Tapdata agent 无需管理员权限</li>
          <li>4. 我们非常建议在一个独立、干净的文件夹内部署 tapdata agnet</li>
          <li>
            5. 上方命令执行完毕后，tapdata agent 会处于启动状态，我们可以通过以下命令对 agent 进行管理
          </li>
        </ul>
      </template>
      <template v-if="type === 'Linux'">
        <div class="title">在 linux 环境中部署 tapdata agent</div>
        <p class="title-text pt-10">
          为了确保用户见的隔离，Tapdata 会为每个用户生成一个专用 agent 下载地址
        </p>
        <ul class="pt-5 ul-style">
          <li>1. 在任意目录中执行下方命令即可实现 Tapdata agent 的快速部署</li>
          <li>
            <h4 class="s-title pt-10">
              下载地址
              <ElTooltip placement="top" manual content="已复制" popper-class="copy-tooltip" :value="showTooltip">
                <span
                  class="operaKey"
                  v-clipboard:copy="LinuxLink"
                  v-clipboard:success="onCopy"
                  @mouseleave="showTooltip = false"
                >
                  <i class="click-style">复制</i>
                </span>
              </ElTooltip>
            </h4>
          </li>
          <li class="box title-text">{{ LinuxLink }}</li>
          <li>
            2. 下载、部署 Tapdata agent 无需 root 权限
          </li>
          <li class="mt-5">
            3. 我们非常建议在一个独立、干净的文件夹内部署 Tapdata agnet
          </li>
          <li>
            4. 上方命令执行完毕后，Tapdata agent 会处于启动状态，你可以通过以下命令对 agent 进行管理
          </li>
        </ul>
      </template>

      <template v-if="type === 'Docker'">
        <div class="title">在 docker 中部署 Tapdata agent</div>
        <p class="title-text pt-10">
          为了确保用户见的隔离，Tapdata 会为每个用户生成一个专用 agent 下载地址
        </p>

        <div class="text-style pt-10">安装方法</div>
        <ul class="pt-5 ul-style">
          <li>1. 在任意目录中执行下方命令即可实现 Tapdata agent 的快速部署</li>

          <li>
            <h4 class="s-title pt-3">
              下载地址
              <ElTooltip placement="top" manual content="已复制" popper-class="copy-tooltip" :value="showTooltip">
                <span
                  class="operaKey"
                  v-clipboard:copy="dockerLink"
                  v-clipboard:success="onCopy"
                  @mouseleave="showTooltip = false"
                >
                  <i class="click-style">复制</i>
                </span>
              </ElTooltip>
            </h4>
          </li>
          <li class="box title-text">{{ dockerLink }}</li>
          <li class="mt-5">
            2. 下载、部署 Tapdata agent 无需 root 权限
          </li>
          <li>3. 下我们非常建议在一个独立、干净的文件夹内部署 Tapdata agnet</li>
          <li>
            4. 上方命令执行完毕后，Tapdata agent 会处于启动状态，你可以通过以下命令对 agent 进行管理
          </li>
        </ul>
      </template>
      <div class="box mt-20" v-if="downLoadType !== 'Docker'">
        <div class="text-style">#关闭 agent</div>
        <p class="pt-5">./tapdata stop</p>
        <div class="text-style pt-20">#启动 agent</div>
        <p class="pt-5">./tapdata start</p>
        <div class="text-style pt-20">#查看 agent 状态</div>
        <p class="pt-5">./tapdata status</p>
      </div>
      <div class="box mt-20" v-else>
        <div class="text-style">
          #关闭 agent ,需要通过 docker exec 进入容器对应目录并执行
        </div>
        <p class="pt-5">./tapdata stop</p>
        <div class="text-style pt-20">
          #启动 agent,需要通过 docker exec 进入容器对应目录并执行
        </div>
        <p class="pt-5">./tapdata start</p>
        <div class="text-style pt-20">
          #查看 agent 状态,需要通过 docker exec 进入容器对应目录并执行
        </div>
        <p class="pt-5">./tapdata status</p>
      </div>
      <div class="box line">
        <div class="text-style">注意</div>
        <p>每个用用户同一时刻只可运行一个 tapdata agent</p>
      </div>
    </main>
    <footer class="footer">
      <ElButton @click="handlePrevious()">上一步</ElButton>
      <ElButton type="primary" @click="handleNextSetp()">下一步</ElButton>
    </footer>
  </section>
</template>
<script>
export default {
  name: 'VersionDownload',
  props: {
    downLoadType: {
      type: String
    }
  },
  data() {
    return {
      showTooltip: false,
      windowLink: '',
      LinuxLink: '',
      dockerLink: ''
    }
  },
  created() {
    let version = window._TAPDATA_OPTIONS_.version
    this.windowLink =
      'tapdata start backend --downloadUrl ' + `http://resource.tapdata.net/package/feagent/${version}/ --token`
    this.LinuxLink =
      'wget "' +
      `http://resource.tapdata.net/package/feagent/${version}/tapdata` +
      '" && chmod +x tapdata && ./tapdata start backend --downloadUrl ' +
      `http://resource.tapdata.net/package/feagent/${version}/ --token `
    this.dockerLink =
      'docker run -itd ' +
      `ccr.ccs.tencentyun.com/tapdata/flow-engine:${version} '` +
      'wget "' +
      `http://resource.tapdata.net/package/feagent/${version}/tapdata` +
      '" && chmod +x tapdata && ./tapdata start backend --downloadUrl ' +
      `http://resource.tapdata.net/package/feagent/${version}/ --token ` +
      `'`
  },
  methods: {
    // windows下载
    handleDownLoad() {
      let version = window._TAPDATA_OPTIONS_.version
      window.location = `https://resource.tapdata.net/package/feagent/${version}/tapdata.exe`
    },
    // 复制命令行
    onCopy() {
      this.showTooltip = true
    },
    // 上一步
    handlePrevious() {
      this.$emit('nextStep', 'previousVersion', this.type)
    },

    // 下一步
    handleNextSetp() {
      this.$emit('nextStep', 'versionDown', this.type)
    }
  }
}
</script>
<style lang="scss" scoped>
.down-version-page {
  .page-main {
    .box {
      padding: 10px 20px;
      background-color: #fafafa;
    }
    .box.title-text {
      padding: 10px 20px;
    }
    .line {
      margin: 20px 0 0 15px;
      border-left: 3px solid map-get($color, primary);
      p {
        padding-top: 5px;
      }
    }
  }
}
</style>
