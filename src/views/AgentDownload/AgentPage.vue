<template>
  <section :class="['agent-page', $PLATFORM]">
    <TheHeader></TheHeader>
    <div class="agent-body">
      <div class="agent-main">
        <DownInstall
          :downLoadType="downLoadType"
          v-if="installFlag"
          @nextStep="handleNextStep"
        ></DownInstall>
        <VersionDownload
          :downLoadType="downLoadType"
          v-if="versionFalg"
          @nextStep="handleNextStep"
        ></VersionDownload>
        <AgentList
          :downLoadType="downLoadType"
          v-if="listFalg"
          @nextStep="handleNextStep"
        ></AgentList>
      </div>
    </div>
  </section>
</template>
<script>
import TheHeader from '@/components/TheHeader'
import DownInstall from './DownInstall'
import VersionDownload from './VersionDownload'
import AgentList from './AgentList'

export default {
  name: 'AgentPage',
  components: {
    TheHeader,
    DownInstall,
    VersionDownload,
    AgentList
  },
  data() {
    return {
      installFlag: true,
      versionFalg: false,
      listFalg: false,
      downLoadType: 'windows'
    }
  },
  methods: {
    // 上一步 下一步
    handleNextStep(page, type) {
      this.downLoadType = type
      if (page === 'downloadInstall') {
        this.installFlag = false
        this.versionFalg = true
      } else if (page === 'versionDown') {
        this.versionFalg = false
        this.listFalg = true
      } else if (page === 'listPage') {
        this.listFalg = false
        this.$router.push({ name: 'Dashboard' })
      } else if (page === 'previousVersion') {
        this.installFlag = true
        this.versionFalg = false
      } else if (page === 'previousList') {
        this.versionFalg = true
        this.listFalg = false
      } else {
        this.installFlag = false
        this.$router.push({ name: 'Dashboard' })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.agent-page {
  width: 100%;
  height: 100%;
  padding-top: 68px;
  overflow: hidden;
  box-sizing: border-box;
  &.drs {
    padding-top: 50px;
  }
  .agent-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    height: 100%;
    .agent-main {
      display: flex;
      flex: 1;
      height: 100%;

      background-color: #fff;
      box-sizing: border-box;
    }
  }
}
</style>
<style lang="scss">
.agent-page {
  .agent-body {
    .agent-main {
      .down-page {
        position: relative;
        width: 100%;
        .page-main {
          height: calc(100% - 80px);
          padding: 0 20% 100px 15%;
          box-sizing: border-box;
          overflow: auto;
        }
      }
      .title {
        padding-top: 60px;
        font-size: 28px !important;
        font-weight: bold;
        color: #333;
      }
      .title-text {
        line-height: 22px;
        font-size: 12px;
        color: #666;
      }
      .s-title {
        margin: 0;
        padding: 12px 0;
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }
      .ul-style {
        padding-left: 10px;
        li {
          padding: 3px 0;
          overflow-x: auto;
        }
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
    }
    .git-book {
      max-width: 550px;
      padding: 10px 20px;
      overflow-y: auto;
      background-color: rgba(250, 250, 250, 100);
      border: 1px solid rgba(222, 222, 228, 100);
      border-top: none;
      box-sizing: border-box;
      overflow: hidden;
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
}
</style>
