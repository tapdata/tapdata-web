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
        <div class="box">
          <div>#1.找到原Agent的docker容器ID</div>
          <div>Tapdata-MacBook:~ tapdata$ docker ps -a|grep tapdata</div>
          <div>9a8a9a2ffa75 ccr.ccs.tencentyun.com/tapdata/flow-engine:0.1</div>
          <div>#2.通过容器ID进入容器</div>
          <div>Tapdata-MacBook:~ tapdata$ docker exec -it 9a8a9a2ffa75 bash</div>
          <div>root@9a8a9a2ffa75:/#</div>
          <div>#3.如果容器已停止运行，可以先启动容器再进入容器进行升级</div>
          <div>Tapdata-MacBook:~ tapdata$ docker start 9a8a9a2ffa75</div>
          <div>Tapdata-MacBook:~ tapdata$ docker exec -it 9a8a9a2ffa75 bash</div>
          <div>root@9a8a9a2ffa75:/#</div>
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
      version: '',
      token: ''
      // user: window.__USER_INFO__ || {}
    }
  },
  computed: {
    comUrl() {
      let version = this.version
      let token = this.token
      let map = {
        windows:
          './tapdata start backend --downloadUrl ' +
          `http://resource.tapdata.net/package/feagent/${version}/ --token ` +
          token,
        Linux:
          './tapdata start backend --downloadUrl ' +
          `http://resource.tapdata.net/package/feagent/${version}/ --token ` +
          token,
        Docker:
          './tapdata start backend --downloadUrl ' +
          `http://resource.tapdata.net/package/feagent/${version}/ --token ` +
          token +
          `'`
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
        this.version = data.version
        this.token = data.token
      })
    },
    // 选择下载安装类型
    chooseDownLoadType(val) {
      this.downLoadType = val
    },
    // 复制命令行
    onCopy() {
      this.showTooltip = true
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
    padding: 0 20% 20px;
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
.content-container {
  > div {
    margin-bottom: 10px;
  }
  .com-url {
    word-wrap: break-word;
    width: 100%;
  }
}
</style>
