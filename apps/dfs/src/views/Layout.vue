<script>
import { PageHeader, SceneDialog, UpgradeFee } from '@tap/business'
import { VIcon } from '@tap/component'
import Cookie from '@tap/shared/src/cookie'
import { defineComponent } from 'vue'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import AgentGuide from '@/components/guide/index'

import Header from '@/components/layout/Header.vue'
import MarketplaceGuide from '@/components/MarketplaceGuide'
import TaskAlarmTour from '@/components/TaskAlarmTour'
import tour from '@/mixins/tour'
import AgentDownloadModal from '@/views/agent-download/AgentDownloadModal'
// import AgentGuideDialog from '@/views/agent-download/AgentGuideDialog'
import BindPhone from '@/views/user/components/BindPhone'
import { $emit, $off, $on, $once } from '../../utils/gogocodeTransfer'

export default defineComponent({
  name: 'Layout',
  components: {
    UpgradeFee,
    Header,
    VIcon,
    SceneDialog,
    AgentDownloadModal,
    AgentGuide,
    PageHeader,
    TaskAlarmTour,
    MarketplaceGuide,
  },
  mixins: [tour],
  inject: ['checkAgent', 'buried'],
  data() {
    const $t = this.$t.bind(this)
    return {
      activeMenu: '',
      menus: [],
      sortMenus: [
        {
          name: 'Dashboard',
          title: $t('tap_home'),
          icon: 'workbench',
        },
        {
          name: 'migrate',
          title: $t('task_manage_migrate'),
          icon: 'migrate',
        },
        {
          name: 'dataflowList',
          title: $t('task_manage_etl'),
          icon: 'task',
        },
        {
          name: 'dataVerification',
          title: $t('page_title_data_verify'),
          icon: 'data-validation',
        },
        {
          name: 'dataConsole',
          title: this.$t('page_title_data_hub'),
          icon: 'datastore',
          beta: true,
        },
        // {
        //   name: 'customNodeList',
        //   title: $t('page_title_custom_node'),
        //   icon: 'custom',
        //   beta: true
        // },
      ],
      subMenu: [],
      dialogVisible: true,
      agentDownload: {
        visible: false,
        data: {},
      },
      bindPhoneVisible: false,
      agentGuideDialog: false,
      showAgentWarning: false,
      agentRunningCount: 0,
      subscriptionModelVisible: false,
      userInfo: '',
      // aliyunMaketVisible: false,
      isDemoEnv: document.domain === 'demo.cloud.tapdata.net',
    }
  },

  computed: {
    ...mapState(['upgradeFeeVisible']),
    ...mapGetters(['isDomesticStation']),
  },
  watch: {
    $route() {
      this.setActiveMenu()
    },
  },

  created() {
    if (!this.$store.state.config?.disabledOnlineChat) {
      this.loadChat()
    }
    if (this.$store.state.config?.disabledDataService) {
      //海外版隐藏数据服务
      this.sortMenus = this.sortMenus.filter(
        (item) => item.name !== 'dataServerList',
      )
    }
    if (this.$store.state.config?.disabledDataVerify) {
      //生产环境隐藏数据校验
      this.sortMenus = this.sortMenus.filter(
        (item) => item.name !== 'dataVerification',
      )
    }

    const findRoute = (name) => {
      // 递归查找路由，包括嵌套的children
      const searchInRoutes = (routes) => {
        for (const route of routes) {
          if (route.name === name) {
            return route
          }
          if (route.children?.length) {
            const found = searchInRoutes(route.children)
            if (found) return found
          }
        }
        return null
      }

      console.log('routes', this.$router.options.routes)
      return searchInRoutes(this.$router.options.routes)
    }
    const menus = this.sortMenus.map((el) => {
      if (el.children?.length) {
        el.children.forEach((cMenu, idx) => {
          const findOne = findRoute(cMenu.name)
          if (!findOne) {
            console.log('findOne', el.name, el)
          }
          el.children[idx].path = findOne?.path
        })
      } else {
        const findOne = findRoute(el.name)
        if (!findOne) {
          console.log('findOne', el.name, el)
        }
        el.path = findOne?.path
      }
      return el
    })
    const subMenu = [
      {
        name: 'connections',
        title: this.$t('connection_manage'),
        icon: 'connection',
      },
      {
        name: 'Instance',
        title: this.$t('tap_agent_management'),
        icon: 'agent',
      },
      {
        name: 'order',
        title: this.$t('dfs_the_header_header_dingyuezhongxin'),
        icon: 'icon_subscription',
      },
      {
        name: 'OperationLog',
        title: this.$t('operation_log_manage'),
        icon: 'operation-log',
      },
      {
        name: 'advancedFeatures',
        title: this.$t('public_page_title_advanced_features'),
        icon: 'vip-one',
        code: 'v2_advanced_features',
        children: [
          {
            name: 'sharedMiningList',
            title: this.$t('public_shared_mining'),
            icon: 'cdc-log',
            beta: true,
          },
          {
            name: 'externalStorage',
            title: this.$t('public_external_storage'),
            icon: 'wcgl',
            beta: true,
          },
        ],
      },
    ]

    console.log('route', menus, subMenu)

    this.menus = menus
    this.subMenu = subMenu.map((el) => {
      if (el.children?.length) {
        el.children.forEach((cMenu, idx) => {
          const findOne = findRoute(cMenu.name)
          if (!findOne) {
            console.log('findOne:children', cMenu.name, cMenu)
          }
          el.children[idx].path = findOne?.path
        })
      } else {
        const findOne = findRoute(el.name)
        if (!findOne) {
          console.log('findOne', el.name, el)
        }
        el.path = findOne?.path
      }
      return el
    })

    $on(this.$root, 'select-connection-type', this.selectConnectionType)
    $on(this.$root, 'show-guide', this.showGuide)
    $on(this.$root, 'get-user', this.getUser)

    this.setActiveMenu()
  },
  mounted() {
    //获取cookie 是否用户有操作过 稍后部署 且缓存是当前用户 不在弹窗
    const user = window.__USER_INFO__
    this.userInfo = user
    //检查是云市场用户授权码有效期
    // if (user?.enableLicense) {
    //   this.checkLicense(user)
    // }
    const isCurrentUser = Cookie.get('deployLaterUser') === user?.userId
    if (Cookie.get('deployLater') == 1 && isCurrentUser) return
  },
  beforeUnmount() {
    clearTimeout(this.loopLoadAgentCountTimer)
  },
  methods: {
    ...mapMutations(['setUpgradeFeeVisible']),
    //监听agent引导页面
    openAgentDownload() {
      this.agentGuideDialog = false
      this.agentDownload.visible = true
    },
    createConnection(item) {
      this.dialogVisible = false
      this.buried('connectionCreate')
      const { pdkHash, pdkId } = item
      this.$router.push({
        name: 'connectionCreate',
        query: { pdkHash, pdkId },
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
    // 检查微信用户，是否绑定手机号
    checkWechatPhone() {
      const user = window.__USER_INFO__
      if (this.$store.state.config?.disabledBindingPhone) {
        //海外版不强制绑定手机号
        return
      }
      this.bindPhoneVisible =
        ['basic:email', 'basic:email-code', 'social:wechatmp-qrcode'].includes(
          user?.registerSource,
        ) && !user?.telephone
      return this.bindPhoneVisible
    },
    hideCustomTip() {
      setTimeout(() => {
        const tDom = document.querySelector('#titlediv')
        if (tDom) {
          tDom.style.display = 'none'
        } else {
          this.hideCustomTip()
        }
      }, 5000)
    },

    loadChat() {
      const $zoho = window.$zoho || {}
      const { isDomesticStation } = this
      $zoho.salesiq = $zoho.salesiq || {
        widgetcode: isDomesticStation
          ? '39c2c81d902fdf4fbcc9b55f1268168c6d58fe89b1de70d9adcb5c4c13d6ff4d604d73c57c92b8946ff9b4782f00d83f'
          : 'siqc6975654b695513072e7c944c1b63ce0561c932c06ea37e561e3a2f7fe5ae1f7',
        values: {},
        ready() {},
      }
      window.$zoho = $zoho
      const d = document
      const s = d.createElement('script')
      s.type = 'text/javascript'
      s.id = 'zsiqscript'
      s.defer = true
      s.src = isDomesticStation
        ? 'https://salesiq.zoho.com.cn/widget'
        : 'https://salesiq.zohopublic.com/widget'
      const t = d.querySelectorAll('script')[0]
      t.parentNode.insertBefore(s, t)
      this.hideCustomTip()

      $zoho.salesiq.ready = function () {
        const user = window.__USER_INFO__
        $zoho.salesiq.visitor.contactnumber(user.telephone)
        $zoho.salesiq.visitor.info({
          tapdata_username: user.nickname || user.username,
          tapdata_phone: user.telephone,
          tapdata_email: user.email,
        })

        $zoho.salesiq.addEventListener('load', function () {
          const siqiframe = document.querySelector('#siqiframe')

          if (siqiframe) {
            const style = document.createElement('style')
            style.type = 'text/css'
            style.innerHTML = `.botactions em { white-space: nowrap; }`
            siqiframe.contentWindow.document
              .querySelectorAll('head')
              .item(0)
              .append(style)
          }
        })
      }
    },

    onAgentNoRunning(flag) {
      this.showAgentWarning = flag
    },

    //检查云市场用户授权码是否过期
    checkLicense(user) {
      //未激活
      const licenseCodes = user?.licenseCodes || []
      if (!user?.licenseValid && licenseCodes?.length === 0) {
        //未激活
        this.aliyunMaketVisible = true
        this.userInfo = {
          showNextProcessing: false,
          licenseType: 'license',
          nearExpiration: [],
        }
      }
      //已过期
      const expired = licenseCodes.filter(
        (it) => it.licenseStatus === 'EXPIRED',
      )
      if (!user?.licenseValid && expired?.length > 0) {
        //授权码不可用 存在有临近授权码
        this.aliyunMaketVisible = true
        this.userInfo = {
          showNextProcessing: false,
          licenseType: 'checkCode',
          data: expired,
        }
      }
    },

    goDemo() {
      this.buried('agentGuideDemo')
      window.open('https://demo.cloud.tapdata.net/console/v3/')
    },
    goGuide() {
      this.buried('agentGuideDemo')
      this.$router.push({
        name: 'productDemo',
      })
    },

    setActiveMenu() {
      this.activeMenu =
        this.$route.meta.activeMenu ||
        this.$route.matched.find((item) => !!item.path).path
    },
  },
})
</script>

<template>
  <el-container direction="vertical" class="layout">
    <div class="layout-bg">
      <div class="layout-bg-main" />
      <div
        class="layout-bg-submain"
        style="
          background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E&quot;);
        "
      />
      <div class="layout-bg-layer layout-bg-tr" />
      <div class="layout-bg-layer layout-bg-bl" />
    </div>
    <Header height="60px" />
    <ElContainer class="layout-content position-relative">
      <el-scrollbar class="layout-side-scrollbar">
        <ElAside class="layout-side" width="220px">
          <ElMenu
            class="flex flex-column flex-1 gap-2 border-end-0"
            :default-active="activeMenu"
            @select="menuTrigger"
          >
            <template v-for="menu in menus">
              <ElSubMenu v-if="menu.children" :index="menu.name">
                <template #title>
                  <VIcon v-if="menu.icon" class="mr-4" size="17">{{
                    menu.icon
                  }}</VIcon>
                  <span>{{ menu.title }}</span>
                </template>
                <template v-for="cMenu in menu.children" :key="cMenu.title">
                  <ElMenuItem :index="cMenu.path">
                    <div class="submenu-item">{{ cMenu.title }}</div>
                  </ElMenuItem>
                </template>
              </ElSubMenu>
              <ElMenuItem
                v-else
                :id="`menu-${menu.name}`"
                :index="menu.path"
                class="flex align-center"
              >
                <VIcon v-if="menu.icon" class="mr-4" size="17">{{
                  menu.icon
                }}</VIcon>
                <span class="flex-fill flex align-center gap-1">
                  {{ menu.title }}
                  <VIcon v-if="menu.beta" size="30">beta</VIcon>
                </span>
                <template v-if="menu.name === 'Instance' && showAgentWarning">
                  <ElTooltip
                    placement="top"
                    popper-class="agent-tooltip__popper"
                    :visible-arrow="false"
                    effect="light"
                  >
                    <VIcon size="16" class="agent-warning-icon color-warning"
                      >warning</VIcon
                    >
                    <template #content>
                      <div class="font-color-dark">
                        <VIcon
                          size="16"
                          class="mr-1 color-warning align-text-top"
                        >
                          warning </VIcon
                        >xxx{{ $t('agent_tip_no_running') }}
                      </div>
                    </template>
                  </ElTooltip>
                </template>
              </ElMenuItem>
            </template>
            <div class="flex-1" />

            <template v-for="menu in subMenu">
              <ElSubMenu v-if="menu.children" :index="menu.name">
                <template #title>
                  <VIcon v-if="menu.icon" class="mr-4" size="17">{{
                    menu.icon
                  }}</VIcon>
                  <span>{{ menu.title }}</span>
                </template>
                <template v-for="cMenu in menu.children" :key="cMenu.title">
                  <ElMenuItem :index="cMenu.path">
                    <div class="submenu-item">{{ cMenu.title }}</div>
                  </ElMenuItem>
                </template>
              </ElSubMenu>
              <ElMenuItem
                v-else
                :id="`menu-${menu.name}`"
                :index="menu.path"
                class="flex align-center"
              >
                <VIcon v-if="menu.icon" class="mr-4" size="17">{{
                  menu.icon
                }}</VIcon>
                <span class="flex-fill">
                  {{ menu.title }}
                  <VIcon v-if="menu.beta" size="30" style="margin-bottom: 5px"
                    >beta</VIcon
                  >
                </span>
                <template v-if="menu.name === 'Instance' && showAgentWarning">
                  <ElTooltip
                    placement="top"
                    popper-class="agent-tooltip__popper"
                    :visible-arrow="false"
                    effect="light"
                  >
                    <VIcon size="16" class="agent-warning-icon color-warning"
                      >warning</VIcon
                    >
                    <template #content>
                      <div class="font-color-dark">
                        <VIcon
                          size="16"
                          class="mr-1 color-warning align-text-top"
                        >
                          warning</VIcon
                        >
                        {{ $t('agent_tip_no_running') }}
                      </div>
                    </template>
                  </ElTooltip>
                </template>
              </ElMenuItem>
            </template>
          </ElMenu>
        </ElAside>
      </el-scrollbar>

      <ElMain class="layout-main">
        <RouterView @agent_no_running="onAgentNoRunning" />
      </ElMain>
    </ElContainer>

    <AgentDownloadModal
      v-model:visible="agentDownload.visible"
      :source="agentDownload.data"
    />

    <!--付费-->
    <UpgradeFee
      :visible="upgradeFeeVisible"
      @update:visible="setUpgradeFeeVisible"
    />

    <MarketplaceGuide
      :visible="marketplaceGuideVisible"
      :loading="agentCountLoading"
      @update:visible="updateMarketplaceGuide"
      @refresh="loopLoadAgentCount(true)"
    />
  </el-container>
</template>

<style lang="scss" scoped>
.layout {
  height: 100%;

  .layout-bg {
    position: fixed;
    inset: 0;
    z-index: -10;

    &-main {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(
        to right bottom,
        rgb(248, 250, 252),
        rgb(241, 245, 249),
        rgb(239, 246, 255)
      );
    }

    &-submain {
      position: absolute;
      inset: 0;
      opacity: 0.03;
    }

    &-layer {
      position: absolute;
      width: 24rem;
      height: 24rem;
      border-radius: 9999px;
      filter: blur(64px);
    }

    &-tr {
      top: -6rem;
      right: -6rem;
      background-image: linear-gradient(
        to right bottom,
        rgba(219, 234, 254, 0.3),
        rgba(199, 210, 254, 0.3)
      );
    }

    &-bl {
      left: -8rem;
      bottom: -8rem;
      background-image: linear-gradient(
        to right top,
        rgba(219, 234, 254, 0.2),
        rgba(243, 232, 255, 0.2)
      );
    }
  }

  .layout-content {
    flex-grow: 1;
    min-height: 0;
  }

  .layout-side-scrollbar {
    flex-shrink: 0;
    :deep(.el-scrollbar__view) {
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  .layout-main {
    --el-main-padding: 0;
    margin-right: 1rem;
    margin-bottom: 1rem;
    overflow: unset; // 避免box-shadow被截断
  }

  .layout-side {
    --el-menu-bg-color: transparent;
    --el-menu-item-height: 40px;
    --el-menu-sub-item-height: 40px;
    --el-menu-hover-bg-color: var(--fill-hover);

    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 0 16px 82px;

    :deep(.el-menu) {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    :deep(.el-menu-item.is-active) {
      background-color: var(--primary-hover-light);
    }

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      border-radius: 8px;
    }

    :deep(.el-sub-menu__title + .el-menu) {
      margin-top: 8px;
      padding-inline-start: 10px;
    }
  }
}

.layout-menu {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 90%;
}

.layout-wrap {
  height: 100%;
  padding-top: 52px;
  word-wrap: break-word;
  word-break: break-word;
  background: map.get($color, submenu);

  .left-aside {
    // border-right: 1px map.get($borderColor, aside) solid;
    background: map.get($color, submenu);

    .el-menu {
      background-color: map.get($color, submenu);
    }

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      height: 50px;
      line-height: 50px;

      .v-icon {
        color: map.get($iconFillColor, normal);
      }

      &.is-active,
      &:hover {
        background-color: map.get($color, white);
        color: map.get($color, primary);
        border-radius: 8px;
      }

      &.is-active,
      &:hover {
        .v-icon {
          color: map.get($color, primary);
        }
      }

      .submenu-item {
        padding-left: 12px;
      }
    }

    .product-name {
      padding-left: 20px;
      font-size: 14px;
      font-weight: 700;
      line-height: 60px;
      color: map.get($fontColor, normal);
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

      :deep(.el-breadcrumb__inner) {
        color: #000;
      }
    }

    :deep(.el-breadcrumb__separator) {
      color: map.get($fontColor, sub);
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

<style lang="scss">
.zsiqfanim,
.zsiqfanim *,
.siqanim,
.siqanim * {
  pointer-events: all;
}

.driver-popover {
  max-width: 520px;
}

.replication-driver-popover {
  .driver-popover-footer {
    margin-top: 8px;
  }
}

.menu-tour-popover {
  color: rgba(0, 0, 0, 0.88);

  a {
    outline: none;
    color: map.get($color, primary);
    text-decoration: underline;
  }

  .driver-popover-title,
  .driver-popover-description {
    font-family: inherit;
  }
  .driver-popover-navigation-btns {
    button {
      display: flex;
      align-items: center;
      height: 24px;
      padding: 0 7px;
      font-family: inherit;
      font-size: 14px;
      border-radius: 6px;
      text-shadow: none;
      border: 1px solid transparent;
      transition: 0.1s;
    }

    button + button {
      margin-left: 8px;
    }

    .driver-popover-prev-btn {
      border-color: #d9d9d9;
      &.driver-popover-btn-disabled {
        display: none !important;
      }

      &:hover,
      &:focus {
        color: map.get($color, primary);
        border-color: map.get($color, primary);
        background-color: #fff;
      }
    }

    .driver-popover-next-btn {
      background-color: map.get($color, primary);
      color: #fff;

      &:hover,
      &:focus {
        color: #fff;
        border-color: #626cea;
        background-color: #626cea;
      }
    }
  }
}
</style>
