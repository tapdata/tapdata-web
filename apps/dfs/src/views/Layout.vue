<template>
  <ElContainer :class="['layout-wrap', $i18n && $i18n.locale]">
    <TheHeader ref="theHeader"></TheHeader>
    <ElAside class="left-aside" width="200px">
      <ElMenu :default-active="activeMenu" @select="menuTrigger">
        <ElMenuItem v-for="m in menus" :key="m.name" :index="m.path">
          <span class="mr-4" slot v-if="m.icon"
            ><VIcon class="v-icon" size="12">{{ m.icon }}</VIcon></span
          >
          <span slot="title">{{ m.title }}</span>
        </ElMenuItem>
      </ElMenu>
    </ElAside>
    <ElContainer direction="vertical">
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
import VIcon from '@/components/VIcon'
import ConnectionTypeDialog from '@/components/ConnectionTypeDialog'
import AgentDownloadModal from '@/views/agent-download/AgentDownloadModal'
import BindPhone from '@/views/user/components/BindPhone'

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
          name: 'Connection',
          title: $t('connection_manage'),
          link: './tm/#/connections',
          icon: 'connection'
        },
        {
          name: 'Task',
          title: $t('task_manage'),
          icon: 'task'
        },
        {
          name: 'Verify',
          title: $t('verify_manage'),
          icon: 'shujuxiaoyan'
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
    this.menus = this.sortMenus.map(el => {
      let findOne = children.find(item => item.name === el.name)
      el.path = findOne.path
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
