<template>
  <section class="upgrade-version">
    <TheHeader></TheHeader>
    <main class="page-main block">
      <div class="title">{{ $t('agent_upgrade_title') }}</div>
      <p class="title-text pt-10">{{ $t('agent_upgrade_select_tip') }}</p>
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
        <div class="py-2 text-style">{{ $t('agent_upgrade_before_title') }}</div>
        <div>{{ $t('agent_upgrade_before_windows_first') }}</div>
        <div>
          {{ $t('agent_upgrade_before_windows_second')
          }}<ElLink class="ml-3" type="primary" @click="handleDownLoad">{{
            $t('agent_upgrade_before_windows_second_download')
          }}</ElLink>
        </div>
        <div>{{ $t('agent_upgrade_before_windows_third') }}</div>
        <div class="py-2 text-style">{{ $t('agent_upgrade_step_title') }}</div>
        <div>{{ $t('agent_upgrade_step_windows_first') }}</div>
        <div>{{ $t('agent_upgrade_step_windows_second') }}</div>
        <div v-if="agentId">
          <div class="box title-text">
            <span class="com-url">{{ comUrl }}</span>
            <ElTooltip
              placement="top"
              manual
              :content="$t('agent_deploy_upgrade_button_copied')"
              popper-class="copy-tooltip"
              :value="showTooltip"
            >
              <span
                class="operaKey"
                v-clipboard:copy="comUrl"
                v-clipboard:success="onCopy"
                @mouseleave="showTooltip = false"
              >
                <i class="click-style">{{ $t('agent_deploy_upgrade_button_copy') }}</i>
              </span>
            </ElTooltip>
          </div>
        </div>
        <div>{{ $t('agent_upgrade_step_windows_third') }}</div>
      </div>
      <!--   Linux   -->
      <div v-else-if="downLoadType === 'Linux'" class="content-container">
        <div class="py-2 text-style">{{ $t('agent_upgrade_step_title') }}</div>
        <div>{{ $t('agent_upgrade_step_linux_first') }}</div>
        <div>{{ $t('agent_upgrade_step_linux_second') }}</div>
        <div v-if="agentId">
          <div class="box title-text">
            <span class="com-url">{{ comUrl }}</span>
            <ElTooltip
              placement="top"
              manual
              :content="$t('agent_deploy_upgrade_button_copied')"
              popper-class="copy-tooltip"
              :value="showTooltip"
            >
              <span
                class="operaKey"
                v-clipboard:copy="comUrl"
                v-clipboard:success="onCopy"
                @mouseleave="showTooltip = false"
              >
                <i class="click-style">{{ $t('agent_deploy_upgrade_button_copy') }}</i>
              </span>
            </ElTooltip>
          </div>
        </div>
        <div>{{ $t('agent_upgrade_step_linux_third') }}</div>
      </div>
      <!--   Docker   -->
      <div v-else-if="downLoadType === 'Docker'" class="content-container">
        <div class="py-2 text-style">{{ $t('agent_upgrade_step_title') }}</div>
        <div>{{ $t('agent_upgrade_step_docker_first') }}</div>
        <div class="box docker-command">
          <div class="desc">{{ $t('agent_upgrade_step_docker_first_one') }}</div>
          <div>docker ps -a|grep tapdata|awk -F' ' '{print $1}'</div>
          <div class="desc">{{ $t('agent_upgrade_step_docker_first_two') }}</div>
          <div>{{ $t('agent_download_UpgradeVersion_dOCKE') }}</div>
          <div class="desc">{{ $t('agent_upgrade_step_docker_first_three') }}</div>
          <div class="desc">{{ $t('agent_upgrade_step_docker_first_four') }}</div>
          <div>{{ $t('agent_download_UpgradeVersion_dOCKE2') }}</div>
          <div class="desc">{{ $t('agent_upgrade_step_docker_first_five') }}</div>
          <div>{{ $t('agent_download_UpgradeVersion_dOCKE') }}</div>
        </div>
        <div>
          {{ $t('agent_upgrade_step_docker_second') }}
        </div>
        <div v-if="agentId">
          <div class="box title-text">
            <span class="com-url">{{ comUrl }}</span>
            <ElTooltip
              placement="top"
              manual
              :content="$t('agent_deploy_upgrade_button_copied')"
              popper-class="copy-tooltip"
              :value="showTooltip"
            >
              <span
                class="operaKey"
                v-clipboard:copy="comUrl"
                v-clipboard:success="onCopy"
                @mouseleave="showTooltip = false"
              >
                <i class="click-style">{{ $t('agent_deploy_upgrade_button_copy') }}</i>
              </span>
            </ElTooltip>
          </div>
        </div>
        <div>{{ $t('agent_upgrade_step_docker_third') }}</div>
      </div>
    </main>
    <footer class="footer">
      <ElButton type="primary" @click="goBack()">{{ $t('button_finish') }}</ElButton>
    </footer>
  </section>
</template>
<script>
import TheHeader from '@/components/the-header'

export default {
  name: 'UpgradeVersion',
  components: { TheHeader },
  data() {
    return {
      downLoadType: 'Linux',
      downType: [
        { name: 'Linux (64 bit)', value: 'Linux' },
        { name: 'Docker', value: 'Docker' },
        { name: 'Windows (64 bit)', value: 'windows' }
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
        Linux: `./tapdata stop agent && rm -f tapdata-bak && mv tapdata tapdata-bak && rm -f .tapdata-agent && wget "${downloadUrl}tapdata" && chmod +x tapdata && ./tapdata start backend --downloadUrl ${downloadUrl} --token ${token}`,
        Docker: `./tapdata stop agent && rm -f tapdata-bak && mv tapdata tapdata-bak && rm -f .tapdata-agent && wget "${downloadUrl}tapdata" && chmod +x tapdata && ./tapdata start backend --downloadUrl ${downloadUrl} --token ${token}`
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
      this.agentId = agentId
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
