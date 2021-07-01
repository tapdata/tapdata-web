<template>
  <section :class="['fast-download', 'down-page']">
    <TheHeader></TheHeader>
    <main class="page-main block">
      <div class="title">Agent 下载与安装</div>
      <p class="title-text pt-10">
        Tapdata DFS 云版需要先在本地安装 Agent 以确保连接数据库和数据传输服务的正常运行,
        您可以根据要安装服务器的类型在下方选择相应的类型进行下载安装
      </p>

      <div class="down-type">
        <div
          v-for="down in downType"
          :key="down.value"
          :class="{ active: downLoadType === down.value }"
          @click="chooseDownLoadType(down.value)"
        >
          <span>{{ down.name }}</span>
        </div>
      </div>
      <div class="text-style">安装方法</div>
      <template v-if="downLoadType === 'windows'">
        <ul class="pt-5 ul-style">
          <li>1. 部署前请确认你的本地环境中已安装 java</li>
          <li>2. 请先点击下方的按钮下载 Tapdata Agent 至本地部署环境</li>
          <li>
            <ElButton class="mt-5" type="primary" @click="handleDownLoad">点击下载 Tapdata Agent</ElButton>
          </li>
          <li class="mt-5">
            3. 在 Tapdata Agent 下载完毕后，请将其放入任意目录并执行下方命令即可实现 Tapdata Agent 的自动部署及启动
          </li>
          <li>
            <h4 class="s-title">
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
          <li class="mt-3">4. 下载、部署 Tapdata Agent 无需管理员权限</li>
          <li>5. 我们非常建议在一个独立、干净的文件夹内部署 Tapdata Agent</li>
          <li>
            6. 待上方命令执行完毕后，Tapdata Agent 会处于启动状态，你可以通过以下命令对 Tapdata Agent 进行管理
          </li>
        </ul>
      </template>
      <template v-if="downLoadType === 'Linux'">
        <ul class="pt-5 ul-style">
          <li>1. 部署前请确认你的本地环境中已安装 java</li>
          <li>
            2. 请复制下方命令并在本地部署环境执行，其包含 Tapdata Agent 的下载、自动部署及启动
          </li>
          <li>3. 下载、部署 Tapdata Agent 无需 root 权限</li>
          <li>4. 我们非常建议在一个独立、干净的文件夹内部署 Tapdata Agent</li>
          <li>
            <h4 class="s-title">
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
            5. 待上方命令执行完毕后，Tapdata Agent 会处于启动状态，你可以通过以下命令对 Tapdata Agent 进行管理
          </li>
        </ul>
      </template>
      <template v-if="downLoadType === 'Docker'">
        <ul class="pt-5 ul-style">
          <li>1. 我们提供了包含 Tapdata Agent 运行所需环境的镜像</li>
          <li>
            2. 请复制下方命令并在本地部署环境执行，其包含镜像的下载及运行，Tapdata Agent 的下载、自动部署及启动
          </li>
          <li>3. 下载、部署 Tapdata Agent 无需 root 权限</li>
          <li>4. 我们非常建议在一个独立、干净的文件夹内部署 Tapdata Agent</li>
          <li>
            <h4 class="s-title">
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

          <li>
            5. 待上方命令执行完毕后，Tapdata Agent 会处于启动状态，你可以通过以下命令对 Tapdata Agent 进行管理
          </li>
        </ul>
      </template>
      <div class="box mt-5" v-if="downLoadType === 'windows'">
        <div class="text-style">#关闭 Tapdata Agent</div>
        <p class="pt-1">tapdata stop</p>
        <div class="text-style pt-5">#启动 Tapdata Agent</div>
        <p class="pt-1">tapdata start backend</p>
        <div class="text-style pt-5">#查看 Tapdata Agent 状态</div>
        <p class="pt-1">tapdata status</p>
      </div>
      <div class="box mt-5" v-if="downLoadType === 'Linux'">
        <div class="text-style">#关闭 Tapdata Agent</div>
        <p class="pt-1">./tapdata stop</p>
        <div class="text-style pt-5">#启动 Tapdata Agent</div>
        <p class="pt-1">./tapdata start backend</p>
        <div class="text-style pt-5">#查看 Tapdata Agent 状态</div>
        <p class="pt-1">./tapdata status</p>
      </div>
      <div class="box mt-5" v-if="downLoadType === 'Docker'">
        <div class="text-style">
          #关闭 Tapdata Agent ,需要通过 docker exec 进入容器对应目录并执行
        </div>
        <p class="pt-1">./tapdata stop</p>
        <div class="text-style pt-5">
          #启动 Tapdata Agent,需要通过 docker exec 进入容器对应目录并执行
        </div>
        <p class="pt-1">./tapdata start backend</p>
        <div class="text-style pt-5">
          #查看 Tapdata Agent 状态,需要通过 docker exec 进入容器对应目录并执行
        </div>
        <p class="pt-1">./tapdata status</p>
      </div>
      <div class="box line">
        <div class="text-style">注意</div>
        <p style="line-height: 28px">
          Tapdata Agent 运行后会在 Tapdata 官网 Agent
          管理页面自动注册，此时你可通过管理页面对其进行管控，也可在本地使用命令行方式对其进行管控，如果你的本地部署环境无法连通公网，那么你可能无法在
          Agent 管理页面看到对应 Tapdata Agent
        </p>
      </div>
      <div class="box line">
        <div class="text-style">注意</div>
        <p>每个免费用户同一时刻只可运行一个Tapdata Agent</p>
      </div>
    </main>
    <footer class="footer">
      <ElButton type="primary" @click="handleNextSetp()">完成</ElButton>
    </footer>
  </section>
</template>
<script>
import TheHeader from '@/components/TheHeader'
export default {
  name: 'FastDownload',
  components: { TheHeader },
  data() {
    return {
      downLoadType: 'windows',
      downType: [
        { name: 'Windows (64 bit)', value: 'windows' },
        { name: 'Linux (64 bit)', value: 'Linux' },
        { name: 'Docker', value: 'Docker' }
      ],
      showTooltip: false,
      windowLink: '',
      LinuxLink: '',
      dockerLink: '',
      downloadUrl: '',
      agentId: ''
      // user: window.__USER_INFO__ || {}
    }
  },
  created() {
    let filter = {
      where: {},
      size: 1,
      page: 0,
      sort: ['createAt desc']
    }
    this.$axios.get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter))).then(async data => {
      if (data.items && data.items.length) {
        let version = data.items[0].spec?.version
        this.downloadUrl = await this.getDownloadUrl(version)
        this.handleGetUrl(data.items[0].tmInfo)
      } else {
        this.getOrders()
      }
    })
  },
  methods: {
    getDownloadUrl(version) {
      return this.$axios.get(`api/tcm/productRelease/${version}`)
    },
    // 获取agent
    getOrders() {
      this.$axios
        .post('api/tcm/orders', {
          agentType: 'Local'
        })
        .then(data => {
          this.agentId = data.agentId
          this.getUrlLinks(data.agentId)
        })
        .catch(() => {
          this.$router.replace('/500')
        })
    },

    // 获取下载地址
    getUrlLinks(id) {
      let where = {}
      if (id) {
        where.id = id
      }
      let filter = {
        where
      }
      this.$axios.get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter))).then(async data => {
        if (data) {
          let tmInfo = '',
            spec = ''
          if (data.items && data.items.length > 0) {
            tmInfo = data.items[0].tmInfo
            spec = data.items[0].spec
          }
          let version = spec?.version
          this.downloadUrl = await this.getDownloadUrl(version)
          this.handleGetUrl(tmInfo)
        }
      })
    },
    // 获取路径地址
    handleGetUrl(data) {
      if (!data) {
        return
      }
      let downloadUrl = (this.downloadUrl || '').replace(/\/$/, '') + '/' // 去掉末尾的/
      this.downloadUrl = downloadUrl
      this.windowLink = 'tapdata start backend --downloadUrl ' + `${downloadUrl} --token ` + data.token
      this.LinuxLink =
        'wget "' +
        `${downloadUrl}tapdata` +
        '" && chmod +x tapdata && ./tapdata start backend --downloadUrl ' +
        `${downloadUrl} --token ` +
        data.token
      this.dockerLink =
        'docker run -itd ' +
        `ccr.ccs.tencentyun.com/tapdata/flow-engine:0.1 '` +
        'wget "' +
        `${downloadUrl}tapdata` +
        '" && chmod +x tapdata && ./tapdata start backend --downloadUrl ' +
        `${downloadUrl} --token ` +
        data.token +
        `'`
    },
    // windows下载
    handleDownLoad() {
      window.location = `${this.downloadUrl}tapdata.exe`
    },
    // 选择下载安装类型
    chooseDownLoadType(val) {
      this.downLoadType = val
    },
    // 复制命令行
    onCopy() {
      this.showTooltip = true
    },
    handleNextSetp() {
      this.$router.push({ name: 'Instance' })
    }
  }
}
</script>
<style lang="scss" scoped>
.fast-download {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding-top: 68px;
  overflow: hidden;
  background-color: #fff;
  box-sizing: border-box;
  .page-main {
    width: 100%;
    height: calc(100% - 80px);
    margin: 0 auto;
    padding: 0 20% 100px;
    box-sizing: border-box;
    overflow: auto;

    .title {
      padding-top: 60px;
      font-size: 28px !important;
      font-weight: bold;
      color: #333;
      text-align: center;
    }
    .title-text {
      line-height: 22px;
      font-size: 12px;
      color: #666;
    }
    .text-style {
      font-size: 12px;
      color: #333;
      font-weight: bold;
    }
    .ul-style {
      padding-left: 10px;
      li {
        padding: 3px 0;
        overflow-x: auto;
      }
    }
    .box {
      padding: 10px 20px;
      background-color: #fafafa;
    }
    .box.title-text {
      padding: 10px 20px;
    }
    .click-style {
      padding-left: 10px;
      font-size: 12px;
      font-style: normal;
      color: map-get($color, primary);
      font-weight: normal;
      cursor: pointer;
    }
    .text-style {
      font-size: 12px;
      color: #333;
      font-weight: bold;
    }
    .down-type {
      padding: 50px 0;
      div {
        position: relative;
        display: inline-block;
        overflow: hidden;
        margin-right: 20px;
        padding: 10px 50px;
        font-size: 12px;
        cursor: pointer;
        color: #666;
        border: 1px solid #dedee4;
        border-radius: 3px;
      }
      .active {
        border: 1px solid map-get($color, primary);
        background-color: map-get($color, primary);
        color: #fff;
      }
    }
    .line {
      margin: 20px 0 0 15px;
      border-left: 3px solid map-get($color, primary);
      p {
        padding-top: 5px;
      }
    }
  }
  .footer {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 80px;
    margin: auto;
    border-top: 1px solid #dedee4;
    background-color: #fff;
    .el-button {
      width: 250px;
      height: 42px;
      font-size: 14px;
    }
    .el-button + .el-button {
      margin-left: 30px;
      background-color: map-get($color, primary);
    }
    .el-button + .el-button:hover {
      background-color: map-get($color, lprimary);
    }
  }
}
</style>
