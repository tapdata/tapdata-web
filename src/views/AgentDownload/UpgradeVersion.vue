<template>
  <section class="upgrade-version">
    <TheHeader></TheHeader>
    <main class="page-main block">
      <div class="title">Agent 版本升级</div>
      <p class="title-text pt-10">
        系统检测到您的Agent不是最新版本，请按照指引进行升级
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
      <!--	windowns  -->
      <div v-if="downLoadType === 'windows'" class="content-container">
        <div class="py-2 text-style">升级前</div>
        <div>1.备份现有程序的tapdata.exe</div>
        <div>
          2.下载新版的tapdata.exe程序放到程序目录<ElLink class="ml-3" type="primary" @click="handleDownLoad"
            >点击下载</ElLink
          >
        </div>
        <div>3.按照升级步骤操作</div>
        <div class="py-2 text-style">升级步骤</div>
        <div>1.打开cmd窗口，进入原Agent安装目录</div>
        <div>2.复制下方的升级命令并在目录下执行，该升级命令会自动进行备份、升级和启动，如果升级失败会自动回退版本</div>
        <div>
          <div class="box title-text">
            <span class="com-url">{{ comUrl }}</span>
            <ElTooltip placement="top" manual content="已复制" popper-class="copy-tooltip" :value="showTooltip">
              <span
                class="operaKey"
                v-clipboard:copy="comUrl"
                v-clipboard:success="onCopy"
                @mouseleave="showTooltip = false"
              >
                <i class="click-style">复制</i>
              </span>
            </ElTooltip>
          </div>
        </div>
        <div>3.待升级命令执行完毕后，出现如下所示则代表Agent升级成功：Update finished.</div>
      </div>
      <!--   Linux   -->
      <div v-else-if="downLoadType === 'Linux'" class="content-container">
        <div class="py-2 text-style">升级步骤</div>
        <div>1.进入原Agent安装目录下</div>
        <div>2.复制下方的升级命令并在目录下执行，该升级命令会自动进行备份、升级和启动，如果升级失败会自动回退版本</div>
        <div>
          <div class="box title-text">
            <span class="com-url">{{ comUrl }}</span>
            <ElTooltip placement="top" manual content="已复制" popper-class="copy-tooltip" :value="showTooltip">
              <span
                class="operaKey"
                v-clipboard:copy="comUrl"
                v-clipboard:success="onCopy"
                @mouseleave="showTooltip = false"
              >
                <i class="click-style">复制</i>
              </span>
            </ElTooltip>
          </div>
        </div>
        <div>3.待升级命令执行完毕后，出现如下所示则代表Agent升级成功：Update finished.</div>
      </div>
      <!--   Docker   -->
      <div v-else-if="downLoadType === 'Docker'" class="content-container">
        <div class="py-2 text-style">升级步骤</div>
        <div>1.进入原Agent的docker容器内</div>
        <div class="box docker-command">
          <div class="desc">(1)找到原Agent的docker容器CONTAINER ID</div>
          <div>docker ps -a|grep tapdata|awk -F' ' '{print $1}'</div>
          <div class="desc">(2)通过容器ID进入容器</div>
          <div>docker exec -it 容器ID bash</div>
          <div class="desc">(3)如果容器已停止运行，可以先启动容器再进入容器进行升级</div>
          <div class="desc">启动容器</div>
          <div>docker start 容器ID</div>
          <div class="desc">进入容器</div>
          <div>docker exec -it 容器ID bash</div>
        </div>
        <div>
          2.复制下方的升级命令直接在容器内执行，该升级命令会自动进行备份、升级和启动，如果升级失败会自动回退版本
        </div>
        <div>
          <div class="box title-text">
            <span class="com-url">{{ comUrl }}</span>
            <ElTooltip placement="top" manual content="已复制" popper-class="copy-tooltip" :value="showTooltip">
              <span
                class="operaKey"
                v-clipboard:copy="comUrl"
                v-clipboard:success="onCopy"
                @mouseleave="showTooltip = false"
              >
                <i class="click-style">复制</i>
              </span>
            </ElTooltip>
          </div>
        </div>
        <div>3.待升级命令执行完毕后，出现如下所示则代表Agent升级成功：Update finished.</div>
      </div>
    </main>
    <footer class="footer">
      <ElButton type="primary" @click="goBack()">完成</ElButton>
    </footer>
  </section>
</template>
<script>
import TheHeader from '@/components/TheHeader'

export default {
  name: 'UpgradeVersion',
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
      agentId: '',
      downloadUrl: '',
      token: '',
      version: ''
      // user: window.__USER_INFO__ || {}
    }
  },
  computed: {
    comUrl() {
      let { token } = this
      let downloadUrl = (this.downloadUrl || '').replace(/\/$/, '') + '/' // 去掉末尾的/
      let map = {
        windows: `tapdata start backend --downloadUrl ${downloadUrl} --token ${token}`,
        Linux: `./tapdata stop agent && rm -f tapdata-v1.0.2 && mv tapdata tapdata-v1.0.2 && rm -f .tapdata-agent && wget "${downloadUrl}tapdata" && chmod +x tapdata && ./tapdata start backend --downloadUrl ${downloadUrl} --token ${token}`,
        Docker: `./tapdata stop agent && rm -f tapdata-v1.0.2 && mv tapdata tapdata-v1.0.2 && rm -f .tapdata-agent && wget "${downloadUrl}tapdata" && chmod +x tapdata && ./tapdata start backend --downloadUrl ${downloadUrl} --token ${token}`
      }
      return map[this.downLoadType]
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      let agentId = this.$route.query.agentId
      this.$axios.get('api/tcm/config/version/latest/' + agentId).then(data => {
        this.token = data.token
        this.version = data.version
        this.$axios.get(`api/tcm/productRelease/${data.version}`).then(downloadUrl => {
          this.downloadUrl = downloadUrl
        })
      })
    },
    // 选择下载安装类型
    chooseDownLoadType(val) {
      this.downLoadType = val
    },
    // 复制命令行
    onCopy() {
      this.showTooltip = true
    },
    goBack() {
      this.$router.push({ name: 'Instance' })
    },
    // windows下载
    handleDownLoad() {
      // let version = this.version
      let downloadUrl = (this.downloadUrl || '').replace(/\/$/, '') + '/' // 去掉末尾的/
      window.open(`${downloadUrl}tapdata.exe`, '_blank')
      // window.location = `https://resource.tapdata.net/package/feagent/${version}/tapdata.exe`
    }
  }
}
</script>
<style lang="scss" scoped>
.upgrade-version {
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
    //height: calc(100% - 80px);
    margin: 0 auto;
    padding: 0 20% 90px;
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
      padding: 30px 0;
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
.content-container {
  > div {
    margin-bottom: 10px;
  }
  .com-url {
    word-wrap: break-word;
    width: 100%;
  }
  .docker-command {
    > div {
      margin-bottom: 8px;
    }
    .desc {
      color: darkgoldenrod;
    }
  }
}
</style>
