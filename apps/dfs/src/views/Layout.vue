<template>
  <ElContainer :class="['layout-wrap', $i18n && $i18n.locale]">
    <TheHeader ref="theHeader" class="layout-header"></TheHeader>
    <ElAside class="left-aside" width="200px">
      <ElMenu :default-active="activeMenu" @select="menuTrigger">
        <template v-for="menu in menus">
          <ElSubmenu v-if="menu.children" :key="menu.title" :index="menu.name">
            <template slot="title">
              <span class="mr-4" slot v-if="menu.icon"
                ><VIcon class="v-icon" size="12">{{ menu.icon }}</VIcon></span
              >
              <span slot="title">{{ menu.title }}</span>
            </template>
            <template v-for="cMenu in menu.children">
              <ElMenuItem :key="cMenu.title" :index="cMenu.path">
                <div class="submenu-item">{{ cMenu.title }}</div>
              </ElMenuItem>
            </template>
          </ElSubmenu>
          <ElMenuItem v-else :key="menu.title" :index="menu.path">
            <span class="mr-4" slot v-if="menu.icon"
              ><VIcon class="v-icon" size="12">{{ menu.icon }}</VIcon></span
            >
            <span slot="title">{{ menu.title }}</span>
          </ElMenuItem>
        </template>
      </ElMenu>
    </ElAside>
    <ElContainer direction="vertical" class="layout-main position-relative">
      <PageHeader class="py-4 px-5"></PageHeader>
      <ElMain class="main">
        <RouterView></RouterView>
      </ElMain>
    </ElContainer>
    <ConnectionTypeDialog :dialogVisible.sync="dialogVisible" @databaseType="createConnection"></ConnectionTypeDialog>
    <AgentDownloadModal :visible.sync="agentDownload.visible" :source="agentDownload.data"></AgentDownloadModal>
    <BindPhone :visible.sync="bindPhoneVisible" @success="bindPhoneSuccess"></BindPhone>
  </ElContainer>
</template>

<script>
import TheHeader from '@/components/the-header'
import { VIcon } from '@tap/component'
import { PageHeader } from '@tap/business'

import ConnectionTypeDialog from '@/components/ConnectionTypeDialog'
import AgentDownloadModal from '@/views/agent-download/AgentDownloadModal'
import BindPhone from '@/views/user/components/BindPhone'
import { buried } from '@/plugins/buried'

export default {
  components: {
    TheHeader,
    VIcon,
    ConnectionTypeDialog,
    AgentDownloadModal,
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
          icon: 'task'
        },
        {
          name: 'dataflowList',
          title: $t('task_manage_etl') + ' Beta',
          icon: 'task'
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
      bindPhoneVisible: false
    }
  },
  created() {
    this.loadChat()
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
    this.checkDialogState()
  },
  watch: {
    $route(route) {
      this.activeMenu = route.path
    }
  },
  methods: {
    createConnection(item) {
      this.dialogVisible = false
      buried('connectionCreate')
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
      this.checkAgent()
    },
    // 检查微信用户，是否绑定手机号
    checkWechatPhone() {
      let user = window.__USER_INFO__
      this.bindPhoneVisible = user?.registerSource === 'social:wechatmp-qrcode' && !user?.telephone
      return this.bindPhoneVisible
    },
    // 检查是否有安装过agent
    checkAgent() {
      this.$axios.get('api/tcm/orders/checkAgent').then(data => {
        if (data.agentId) {
          this.agentDownload.visible = true
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
        widgetcode: 'a97952edfe212ffc52d6a67f37aa6e903e76203f0bbbd3e066c89cc43779f219',
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
    }
  }
}
</script>

<style lang="scss" scoped>
.layout-wrap {
  height: 100%;
  padding-top: 68px;
  word-wrap: break-word;
  word-break: break-word;
  .left-aside {
    border-right: 1px solid #f2f4f6;
    background: #fff;
    .el-menu-item {
      ::v-deep .v-icon {
        color: #888;
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
    padding: 0 24px 24px 24px;
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
}
</style>
