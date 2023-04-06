<template>
  <ElContainer :class="['layout-wrap', $i18n && $i18n.locale]">
    <TheHeader ref="theHeader" class="layout-header"></TheHeader>
    <ElAside class="left-aside" width="220px">
      <ElMenu :default-active="activeMenu" @select="menuTrigger">
        <template v-for="menu in menus">
          <ElSubmenu v-if="menu.children" :key="menu.title" :index="menu.name">
            <template slot="title">
              <span class="mr-4" slot v-if="menu.icon"
                ><VIcon class="v-icon" size="17">{{ menu.icon }}</VIcon></span
              >
              <span slot="title">{{ menu.title }}</span>
            </template>
            <template v-for="cMenu in menu.children">
              <ElMenuItem :key="cMenu.title" :index="cMenu.path">
                <div class="submenu-item">{{ cMenu.title }}</div>
              </ElMenuItem>
            </template>
          </ElSubmenu>
          <ElMenuItem v-else :key="menu.title" :index="menu.path" class="flex align-center">
            <span class="mr-4" v-if="menu.icon"
              ><VIcon class="v-icon" size="17">{{ menu.icon }}</VIcon></span
            >
            <span class="flex-fill">
              {{ menu.title }}
              <VIcon v-if="menu.beta" size="30" style="margin-bottom: 5px">beta</VIcon>
            </span>
            <template v-if="menu.name === 'Instance' && showAgentWarning">
              <ElTooltip placement="top" popper-class="agent-tooltip__popper" :visible-arrow="false" effect="light">
                <VIcon size="14" class="agent-warning-icon color-warning">warning </VIcon>
                <template #content>
                  <div class="font-color-dark">
                    <VIcon size="14" class="mr-2 color-warning" style="vertical-align: -0.125em"> warning </VIcon
                    >{{ $t('agent_tip_no_running') }}
                  </div>
                </template>
              </ElTooltip>
            </template>
          </ElMenuItem>
        </template>
        <ElMenuItem v-if="!isDemoEnv" key="goDemo" index="goDemo" class="flex align-center border-top">
          <span class="mr-4"><VIcon class="v-icon" size="17">open-in-new</VIcon></span>
          <span class="text-decoration-underline">{{ $t('dfs_agent_download_agentguidedialog_tiyan') + ' Demo' }}</span>
        </ElMenuItem>
        <ElMenuItem key="goGuide" index="goGuide" class="flex align-center border-top">
          <span class="mr-4"><VIcon class="v-icon" size="17">open-in-new</VIcon></span>
          <span class="text-decoration-underline">产品引导</span>
        </ElMenuItem>
      </ElMenu>
    </ElAside>
    <ElContainer direction="vertical" class="layout-main position-relative">
      <PageHeader class="border-bottom"></PageHeader>
      <ElMain class="main">
        <RouterView @agent_no_running="onAgentNoRunning"></RouterView>
      </ElMain>
    </ElContainer>
    <ConnectionTypeDialog :dialogVisible.sync="dialogVisible" @databaseType="createConnection"></ConnectionTypeDialog>
    <AgentGuideDialog :visible.sync="agentGuideDialog" @openAgentDownload="openAgentDownload"></AgentGuideDialog>
    <AgentDownloadModal :visible.sync="agentDownload.visible" :source="agentDownload.data"></AgentDownloadModal>
    <BindPhone :visible.sync="bindPhoneVisible" @success="bindPhoneSuccess"></BindPhone>
    <!--    <CheckLicense :visible.sync="aliyunMaketVisible" :user="userInfo"></CheckLicense>-->
  </ElContainer>
</template>

<script>
import TheHeader from '@/components/the-header'
import { VIcon } from '@tap/component'
import { PageHeader } from '@tap/business'

import ConnectionTypeDialog from '@/components/ConnectionTypeDialog'
import AgentDownloadModal from '@/views/agent-download/AgentDownloadModal'
import AgentGuideDialog from '@/views/agent-download/AgentGuideDialog'
import BindPhone from '@/views/user/components/BindPhone'
import Cookie from '@tap/shared/src/cookie'

export default {
  inject: ['checkAgent', 'buried'],
  components: {
    TheHeader,
    VIcon,
    ConnectionTypeDialog,
    AgentDownloadModal,
    AgentGuideDialog,
    BindPhone,
    PageHeader
  },
  data() {
    const $t = this.$t.bind(this)
    return {
      activeMenu: '',
      menus: [],
      sortMenus: [
        {
          name: 'Workbench',
          title: $t('workbench_manage'),
          icon: 'workbench'
        },
        {
          name: 'Instance',
          title: $t('agent_manage'),
          icon: 'agent'
        },
        {
          name: 'connections',
          title: $t('connection_manage'),
          icon: 'connection'
        },
        {
          name: 'migrateList',
          title: $t('task_manage_migrate'),
          icon: 'migrate'
        },
        {
          name: 'dataflowList',
          title: $t('task_manage_etl'),
          icon: 'task',
          beta: true
        },
        {
          name: 'customNodeList',
          title: $t('page_title_custom_node'),
          icon: 'custom',
          beta: true
        },
        {
          name: 'OperationLog',
          title: $t('operation_log_manage'),
          icon: 'operation-log'
        }
      ],
      dialogVisible: false,
      agentDownload: {
        visible: false,
        data: {}
      },
      bindPhoneVisible: false,
      agentGuideDialog: false,
      showAgentWarning: false,
      userInfo: '',
      // aliyunMaketVisible: false,
      isDemoEnv: document.domain === 'demo.cloud.tapdata.net'
    }
  },
  created() {
    if (!window.__config__?.disabledOnlineChat) {
      this.loadChat()
    }
    if (window.__config__?.disabledDataService) {
      //海外版隐藏数据服务
      this.sortMenus = this.sortMenus.filter(item => item.name !== 'dataServerList')
    }
    if (!window.__config__?.showSwimLane) {
      let swimLane = {
        name: 'dataConsole',
        title: this.$t('page_title_data_console'),
        icon: 'process-platform',
        beta: true
      }
      this.sortMenus.push(swimLane)
    }
    this.loopLoadAgentCount()
    this.activeMenu = this.$route.path
    let children = this.$router.options.routes.find(r => r.path === '/')?.children || []
    const findRoute = name => {
      return children.find(item => item.name === name)
    }
    this.menus = this.sortMenus.map(el => {
      if (el.children?.length) {
        el.children.forEach((cMenu, idx) => {
          el.children[idx].path = findRoute(cMenu.name).path
        })
      } else {
        let findOne = findRoute(el.name)
        el.path = findOne.path
      }
      return el
    })
    this.$root.$on('select-connection-type', this.selectConnectionType)
    this.$root.$on('show-guide', this.showGuide)
    this.$root.$on('get-user', this.getUser)
  },
  mounted() {
    //获取cookie 是否用户有操作过 稍后部署 且缓存是当前用户 不在弹窗
    let user = window.__USER_INFO__
    this.userInfo = user
    //检查是云市场用户授权码有效期
    // if (user?.enableLicense) {
    //   this.checkLicense(user)
    // }
    let isCurrentUser = Cookie.get('deployLaterUser') === user?.userId
    if (Cookie.get('deployLater') == 1 && isCurrentUser) return
    this.checkDialogState()
  },
  beforeDestroy() {
    clearTimeout(this.loopLoadAgentCountTimer)
  },
  watch: {
    $route(route) {
      this.activeMenu = route.path
    }
  },
  methods: {
    //监听agent引导页面
    openAgentDownload() {
      this.agentGuideDialog = false
      this.agentDownload.visible = true
    },
    createConnection(item) {
      this.dialogVisible = false
      this.buried('connectionCreate')
      const { pdkHash } = item
      let query = {
        pdkHash
      }
      this.$router.push({
        name: 'connectionCreate',
        query
      })
    },
    showGuide() {
      this.$refs.theHeader?.showGuide?.()
    },
    getUser() {
      this.$refs.theHeader?.getUser?.()
    },
    selectConnectionType() {
      this.dialogVisible = true
    },
    menuTrigger(path) {
      if (['goDemo'].includes(path)) {
        this.goDemo()
        return
      }
      if (['goGuide'].includes(path)) {
        this.goGuide()
        return
      }
      if (this.$route.path === path) {
        return
      }
      this.$router.push(path)
    },
    back() {
      this.$router.back()
    },
    checkDialogState() {
      if (this.checkWechatPhone()) {
        return
      }
      this.checkAgentInstall()
    },
    // 检查微信用户，是否绑定手机号
    checkWechatPhone() {
      let user = window.__USER_INFO__
      if (window.__config__?.disabledBindingPhone) {
        //海外版不强制绑定手机号
        return
      }
      this.bindPhoneVisible = user?.registerSource === 'social:wechatmp-qrcode' && !user?.telephone
      return this.bindPhoneVisible
    },
    // 检查是否有安装过agent
    checkAgentInstall() {
      this.$axios.get('api/tcm/orders/checkAgent').then(data => {
        if (data.agentId) {
          this.agentGuideDialog = true
          this.agentDownload.data = data
        }
      })
    },
    bindPhoneSuccess(val) {
      if (val) {
        if (window.__USER_INFO__) {
          window.__USER_INFO__.telephone = val
        }
        this.checkDialogState()
      }
    },
    hideCustomTip() {
      setTimeout(() => {
        let tDom = document.getElementById('titlediv')
        if (tDom) {
          tDom.style.display = 'none'
        } else {
          this.hideCustomTip()
        }
      }, 5000)
    },

    loadChat() {
      let $zoho = $zoho || {}
      $zoho.salesiq = $zoho.salesiq || {
        widgetcode: '39c2c81d902fdf4fbcc9b55f1268168c6d58fe89b1de70d9adcb5c4c13d6ff4d604d73c57c92b8946ff9b4782f00d83f',
        values: {},
        ready: function () {}
      }
      window.$zoho = $zoho
      let d = document
      let s = d.createElement('script')
      s.type = 'text/javascript'
      s.id = 'zsiqscript'
      s.defer = true
      s.src = 'https://salesiq.zoho.com.cn/widget'
      let t = d.getElementsByTagName('script')[0]
      t.parentNode.insertBefore(s, t)
      this.hideCustomTip()

      $zoho.salesiq.ready = function () {
        const user = window.__USER_INFO__
        $zoho.salesiq.visitor.contactnumber(user.telephone)
        $zoho.salesiq.visitor.info({
          tapdata_username: user.nickname || user.username,
          tapdata_phone: user.telephone,
          tapdata_email: user.email
        })

        $zoho.salesiq.onload = function () {
          let siqiframe = document.getElementById('siqiframe')
          console.log('siqiframe', siqiframe) // eslint-disable-line

          if (siqiframe) {
            let style = document.createElement('style')
            style.type = 'text/css'
            style.innerHTML = `.botactions em { white-space: nowrap; }`
            siqiframe.contentWindow.document.getElementsByTagName('head').item(0).appendChild(style)
          }
        }

        /*$zoho.salesiq.floatbutton.click(function () {
          let siqiframe = document.getElementById('siqiframe')
          console.log('siqiframe', siqiframe) // eslint-disable-line

          if (siqiframe) {
            let style = document.createElement('style')
            style.type = 'text/css'
            style.innerHTML = `.botactions em { white-space: nowrap; }`
            siqiframe.contentWindow.document.getElementsByTagName('head').item(0).appendChild(style)
          }
        })*/
      }
    },

    onAgentNoRunning(flag) {
      this.showAgentWarning = flag
    },

    loopLoadAgentCount() {
      this.$axios
        .get('api/tcm/agent/agentCount')
        .then(data => {
          this.showAgentWarning = data.agentTotalCount && !data.agentRunningCount
        })
        .finally(() => {
          this.loopLoadAgentCountTimer = setTimeout(() => {
            this.loopLoadAgentCount()
          }, 10000)
        })
    },
    //检查云市场用户授权码是否过期
    checkLicense(user) {
      //未激活
      var licenseCodes = user?.licenseCodes || []
      if (!user?.licenseValid && licenseCodes?.length === 0) {
        //未激活
        this.aliyunMaketVisible = true
        this.userInfo = {
          showNextProcessing: false,
          licenseType: 'license',
          nearExpiration: []
        }
      }
      //已过期
      let expired = licenseCodes.filter(it => it.licenseStatus === 'EXPIRED')
      if (!user?.licenseValid && expired?.length > 0) {
        //授权码不可用 存在有临近授权码
        this.aliyunMaketVisible = true
        this.userInfo = {
          showNextProcessing: false,
          licenseType: 'checkCode',
          data: expired
        }
      }
    },

    goDemo() {
      this.buried('agentGuideDemo')
      window.open('https://demo.cloud.tapdata.net/console/v3/')
    },
    goGuide() {
      this.buried('agentGuideDemo')
      window.open('https://cloud.justinmind.com/usernote/tests/74235065/75024663/75024665/index.html')
    }
  }
}
</script>

<style lang="scss" scoped>
.layout-wrap {
  height: 100%;
  padding-top: 52px;
  word-wrap: break-word;
  word-break: break-word;
  .left-aside {
    border-right: 1px map-get($borderColor, aside) solid;
    background: map-get($bgColor, disable);
    .el-menu-item {
      height: 50px;
      line-height: 50px;
      ::v-deep .v-icon {
        color: map-get($iconFillColor, normal);
      }
      &.is-active {
        background-color: #eaf0ff;
      }
      &.is-active {
        ::v-deep .v-icon {
          color: map-get($color, primary);
        }
      }
    }
    .el-submenu {
      ::v-deep {
        .el-submenu__title {
          font-size: 12px;
        }
      }
      .submenu-item {
        padding-left: 8px;
      }
    }
    .product-name {
      padding-left: 20px;
      font-size: 14px;
      font-weight: 700;
      line-height: 60px;
      color: map-get($fontColor, normal);
    }
  }
  .header {
    display: flex;
    align-items: center;
    font-size: 14px;
  }
  .main {
    display: flex;
    flex-direction: column;
    flex-basis: 0%;
    margin: 0;
    padding: 0;
    //background: rgba(239, 241, 244, 1);
  }
  .breadcrumb {
    padding: 24px 0 24px 24px;
    //height: 40px;
    box-sizing: border-box;
    &.one-breadcrumb {
      font-size: 18px;
      ::v-deep {
        .el-breadcrumb__inner {
          color: #000;
        }
      }
    }
    ::v-deep {
      .el-breadcrumb__separator {
        color: map-get($fontColor, sub);
      }
    }
  }
  .btn-back {
    padding: 0;
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .el-menu-item.is-active .agent-warning-icon {
    display: none;
  }
}
</style>
