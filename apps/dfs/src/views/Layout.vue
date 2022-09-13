<template>
  <ElContainer :class="['layout-wrap', $i18n && $i18n.locale]">
    <TheHeader ref="theHeader" class="layout-header"></TheHeader>
    <ElAside class="left-aside" width="200px">
      <ElMenu :default-active="activeMenu" @select="menuTrigger">
        <!-- <ElMenuItem v-for="m in menus" :key="m.name" :index="m.path">
          <span class="mr-4" slot v-if="m.icon"
            ><VIcon class="v-icon" size="12">{{ m.icon }}</VIcon></span
          >
          <span slot="title">{{ m.title }}</span>
        </ElMenuItem> -->
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
      <div v-if="!hideBreadcrumb" class="header">
        <ElBreadcrumb
          :class="['breadcrumb', { 'one-breadcrumb': breadcrumbData.length === 1 }]"
          separator-class="el-icon-arrow-right"
        >
          <ElBreadcrumbItem v-for="item in breadcrumbData" :key="item.name" :to="item.to">
            {{ item.name }}
          </ElBreadcrumbItem>
        </ElBreadcrumb>
      </div>
      <ElMain class="main">
        <RouterView></RouterView>
      </ElMain>
    </ElContainer>
    <ConnectionTypeDialog v-model="dialogVisible" @select="createConnection"></ConnectionTypeDialog>
    <AgentDownloadModal :visible.sync="agentDownload.visible" :source="agentDownload.data"></AgentDownloadModal>
    <BindPhone :visible.sync="bindPhoneVisible" @success="bindPhoneSuccess"></BindPhone>
  </ElContainer>
</template>

<script>
import TheHeader from '@/components/the-header'
import { VIcon } from '@tap/component'
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
    BindPhone
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
      breadcrumbData: [],
      hideBreadcrumb: false,
      dialogVisible: false,
      agentDownload: {
        visible: false,
        data: {}
      },
      bindPhoneVisible: false
    }
  },
  created() {
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
    this.getBreadcrumb(this.$route)
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
      this.getBreadcrumb(route)
    },
    breadcrumbData: {
      deep: true,
      handler(v) {
        let flag = false
        v?.forEach(el => {
          flag = !!el.hideTitle
        })
        this.hideBreadcrumb = flag
      }
    }
  },
  methods: {
    createConnection(type) {
      this.dialogVisible = false
      buried('connectionCreate')
      this.$router.push({
        name: 'ConnectionCreate',
        query: { databaseType: type }
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
    getBreadcrumb(route) {
      let matched = route.matched.slice(1)
      let data = []
      if (matched.length) {
        data = matched.map(route => {
          return {
            name: route.meta?.title,
            to: {
              name: route.name === this.$route.name ? null : route.name
            },
            hideTitle: !!route.meta?.hideTitle
          }
        })
      }
      this.breadcrumbData = data
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
