<template>
  <section class="agent-download-content-wrap">
    <div class="title">
      <i class="iconLable"></i>
      <span>{{ $t('dialog.downAgent.downloadInstall') }}</span>
      <!-- <span class="downLoadText"
				>( {{ $t('dialog.downAgent.agentNum') }}: <i>{{ agentNum }}</i> )</span
			> -->
    </div>
    <div class="down-type">
      <div
        v-for="(down, index) in osList"
        :key="index"
        :class="{ active: activeOS === index }"
        @click="activeOS = index"
      >
        <span>{{ down.text }}</span>
        <span class="choose" v-show="activeOS === index">
          <i class="el-icon-upload-success el-icon-check"></i>
        </span>
      </div>
    </div>
    <div class="prompt">
      <span
        style="word-break: break-word"
        v-show="osList[activeOS].key === 'linux'"
        >{{ $t('dialog.downAgent.text') }}</span
      >
      <span
        v-show="osList[activeOS].key === 'windows'"
        @click="downLoadWindows"
      >
        <span class="operaKey">
          <i class="iconfont icon-xiazai clickIcont"></i>
          {{ $t('dialog.downAgent.downLoadAgent') }}</span
        >
        <span style="word-break: break-word">{{
          $t('dialog.downAgent.windowsText')
        }}</span>
      </span>
      <el-tooltip
        placement="top"
        manual
        :content="$t('dialog.downAgent.copied')"
        popper-class="copy-tooltip"
        :value="showTooltip"
      >
        <span
          class="operaKey"
          v-clipboard:copy="osList[activeOS].link"
          v-clipboard:success="() => (showTooltip = true)"
          @click.stop="() => {}"
          @mouseleave="showTooltip = false"
        >
          <i class="iconfont icon-fuzhi1 clickIcont"></i
          >{{ $t('dialog.downAgent.copy') }}
        </span>
      </el-tooltip>
    </div>

    <div class="copy-down-link">
      <span>{{ osList[activeOS].link }}</span>
    </div>

    <div class="title">
      <i class="iconLable"></i>
      <span>{{ $t('dialog.downAgent.downloadInstallInstructions') }}</span>
    </div>
    <ul class="installation-notes" v-show="osList[activeOS].key === 'linux'">
      <li style="color: #f56c6c">
        {{ $t('dialog.downAgent.linuxInstructionsText1') }}
      </li>
      <li>{{ $t('dialog.downAgent.linuxInstructionsText2') }}</li>
      <li>{{ $t('dialog.downAgent.linuxInstructionsText3') }}</li>
    </ul>
    <ul class="installation-notes" v-show="osList[activeOS].key === 'windows'">
      <li style="color: #f56c6c">
        {{ $t('dialog.downAgent.windowsInstructionsText1') }}
      </li>
      <li>{{ $t('dialog.downAgent.windowsInstructionsText2') }}</li>
      <li>{{ $t('dialog.downAgent.windowsInstructionsText3') }}</li>
      <li style="padding-top: 10px">{{ $t('dialog.downAgent.important') }}</li>
      <li>{{ $t('dialog.downAgent.windowsInstructionsText5') }}</li>
      <li>{{ $t('dialog.downAgent.windowsInstructionsText4') }}</li>
    </ul>
  </section>
</template>

<script>
export default {
  // props: {
  // 	agentNum: [Number, String]
  // },
  data() {
    let token = this.$cookie.get('token')
    let userId = this.$cookie.get('user_id')
    let version = window._TAPDATA_OPTIONS_.version
    return {
      showTooltip: false,
      activeOS: 0,
      osList: [
        {
          text: 'Windows (64 bit)',
          key: 'windows',
          link: `tapdata start backend --downloadUrl http://resource.tapdata.net/package/feagent/${version}/ --token ${token} ${userId}`
        },
        {
          text: 'Linux (64 bit)',
          key: 'linux',
          link: `wget "http://resource.tapdata.net/package/feagent/${version}/tapdata" && chmod +x tapdata && ./tapdata start backend --downloadUrl http://resource.tapdata.net/package/feagent/${version}/ --token ${token} ${userId}`
        }
      ]
    }
  },
  methods: {
    // windows下载
    downLoadWindows() {
      let version = window._TAPDATA_OPTIONS_.version
      window.location = `http://resource.tapdata.net/package/feagent/${version}/tapdata.exe`
    }
  }
}
</script>

<style lang="scss" scoped>
.agent-download-content-wrap {
  .title {
    font-size: 12px;
    color: #666;
    i.iconLable {
      display: inline-block;
      width: 6px;
      height: 13px;
      vertical-align: middle;
      background-color: #48b6e2;
      border-radius: 1px;
    }
    span {
      display: inline-block;
      vertical-align: middle;
    }
    .downLoadText {
      color: #9a9a9a;
      i {
        color: #48b6e2;
      }
    }
  }
  .down-type {
    padding: 20px 0;
    div {
      position: relative;
      display: inline-block;
      overflow: hidden;
      margin-right: 20px;
      padding: 10px 50px;
      font-size: 12px;
      cursor: pointer;
      border: 1px solid #eee;
    }
    .active {
      border: 1px solid #48b6e2;
      .choose {
        display: block;
        position: absolute;
        right: -13px;
        bottom: -13px;
        width: 32px;
        height: 26px;
        background: #48b6e2;
        text-align: center;
        transform: rotate(-40deg);
        box-shadow: 0 1px 1px #ccc;
        i {
          display: block;
          color: #fff;
          font-size: 12px;
          margin-bottom: 12px;
          transform: rotate(42deg);
        }
      }
    }
  }
  .prompt {
    padding-bottom: 8px;
    font-size: 12px;
    color: #666;
    .operaKey {
      padding: 0 10px;
      color: #48b6e2;
      cursor: pointer;
    }
    div {
      display: inline-block;
    }
    .clickIcont {
      font-size: 14px;
    }
  }
  .copy-down-link {
    padding: 20px;
    margin-bottom: 20px;
    font-size: 12px;
    color: #666;
    border-radius: 3px;
    border: 1px solid #dedee4;
  }
  .installation-notes {
    padding-top: 10px;
    font-size: 12px;
    color: #aaa;
    li {
      padding: 5px 0;
    }
  }
  .dialog-footer {
    text-align: center;
  }
}
</style>
