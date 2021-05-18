<template>
  <el-container class="layout-container">
    <div
      class="agentNot"
      v-if="agentTipFalg && $window.getSettingByKey('ALLOW_DOWNLOAD_AGENT')"
    >
      <i class="el-icon-warning"></i>
      {{ $t('dialog.downAgent.noAgent')
      }}<span @click="downLoadInstall">{{
        $t('dialog.downAgent.clickDownLoad')
      }}</span>
      <i class="el-icon-close close" @click="agentTipFalg = false"></i>
    </div>
    <CustomerService v-model="isShowCustomerService"></CustomerService>
    <newDataFlow :dialogVisible.sync="dialogVisible"></newDataFlow>
    <el-header
      class="layout-header"
      height="48px"
      v-if="!$window.getSettingByKey('DFS_TCM_PLATFORM')"
    >
      <a class="logo" href="/">
        <img :src="logoUrl" />
      </a>
      <div class="button-bar">
        <span class="expire-msg" v-if="licenseExpireVisible">
          <span v-if="licenseExpire <= 1">{{
            $t('app.menu.licenseBefore') +
            licenseExpire +
            $t('app.menu.licenseAfterOneDay')
          }}</span>
          <span v-if="licenseExpire > 1">{{
            $t('app.menu.licenseBefore') +
            licenseExpire +
            $t('app.menu.licenseAfter')
          }}</span>
        </span>
        <el-button
          class="btn-create"
          type="primary"
          size="mini"
          v-if="creatAuthority"
          @click="command('newDataFlow')"
        >
          <i class="el-icon-plus"></i>
          <span>{{ $t('dataFlow.createNew') }}</span>
        </el-button>
        <NotificationPopover
          v-if="$window.getSettingByKey('SHOW_NOTIFICATION')"
        ></NotificationPopover>
        <a
          v-if="$window.getSettingByKey('ALLOW_DOWNLOAD_AGENT')"
          class="btn"
          @click="command('download')"
          ><i class="iconfont icon-shangchuan-copy"></i
        ></a>
        <el-dropdown
          v-if="$window.getSettingByKey('SHOW_QA_AND_HELP')"
          class="btn"
          placement="bottom"
          @command="command"
        >
          <i class="iconfont icon-bangzhu1-copy"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="help">{{
              $t('app.document')
            }}</el-dropdown-item>
            <el-dropdown-item command="question">{{
              $t('app.qa')
            }}</el-dropdown-item>
            <!-- <el-dropdown-item>操作引导</el-dropdown-item> -->
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown
          v-if="
            $window.getSettingByKey('SHOW_SETTING_BUTTON') && settingVisibility
          "
          class="btn"
          placement="bottom"
          @command="command"
        >
          <i class="iconfont icon-shezhi1"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="settings" v-if="settingCode">{{
              $t('app.menu.settings')
            }}</el-dropdown-item>
            <el-dropdown-item
              command="setting"
              v-readonlybtn="'home_notice_settings'"
              >{{ $t('notification.setting') }}</el-dropdown-item
            >
            <!--						<el-dropdown-item command="verifySetting">{{-->
            <!--							$t('dataVerify.setting.verifySetting')-->
            <!--						}}</el-dropdown-item>-->
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown
          v-if="$window.getSettingByKey('SHOW_LANGUAGE')"
          class="btn"
          placement="bottom"
          @command="changeLanguage"
        >
          <i
            class="iconfont"
            :class="{
              'icon-zhongwen1': lang === 'sc',
              'icon-yingwen1': lang === 'en',
              'icon-fanti': lang === 'tc'
            }"
            style="font-size: 18px"
          ></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(value, key) in languages"
              :key="key"
              :command="key"
            >
              {{ value }}
            </el-dropdown-item>
            <!-- <el-dropdown-item>操作引导</el-dropdown-item> -->
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown class="menu-user" placement="bottom" @command="command">
          <el-button class="menu-button" size="mini">
            {{ userName }}<i class="el-icon-caret-bottom el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="account">{{
              $t('app.account')
            }}</el-dropdown-item>
            <el-dropdown-item command="version">{{
              $t('app.version')
            }}</el-dropdown-item>
            <el-dropdown-item command="license">{{
              $t('app.menu.license')
            }}</el-dropdown-item>
            <el-dropdown-item
              v-if="$window.getSettingByKey('SHOW_HOME_BUTTON')"
              command="home"
            >
              {{ $t('app.home') }}
            </el-dropdown-item>
            <el-dropdown-item command="signOut">{{
              $t('app.signOut')
            }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    <el-container style="width: 100%; flex: 1; overflow: hidden">
      <el-aside
        class="layout-aside"
        width="auto"
        v-if="!$window.getSettingByKey('DFS_TCM_PLATFORM')"
      >
        <el-menu
          class="menu"
          :default-active="activeMenu"
          :collapse="isCollapse"
          @select="menuHandler($event)"
        >
          <template v-for="menu in menus">
            <el-submenu
              v-if="menu.children && !menu.hidden"
              :key="menu.alias || menu.name"
              :index="menu.name"
            >
              <template slot="title">
                <i :class="`iconfont icon-${menu.icon}`"></i>
                <span slot="title">{{ menu.label }}</span>
              </template>
              <template v-for="cMenu in menu.children">
                <el-menu-item
                  :key="cMenu.alias || cMenu.name"
                  :index="cMenu.path + (cMenu.query || '')"
                  :route="cMenu"
                  v-if="!cMenu.hidden"
                >
                  <div class="submenu-item">{{ cMenu.label }}</div>
                </el-menu-item>
              </template>
            </el-submenu>
            <el-menu-item
              v-else-if="!menu.hidden"
              :key="menu.alias || menu.name"
              :index="menu.path + (menu.query || '')"
              :route="menu"
            >
              <i :class="`iconfont icon-${menu.icon}`"></i>
              <span slot="title">{{ menu.label }}</span>
            </el-menu-item>
          </template>
          <el-submenu v-if="favMenus.length" index="favorite">
            <template slot="title">
              <i class="iconfont icon-shoucang"></i>
              <span slot="title">{{ $t('app.menu.favorite') }}</span>
            </template>
            <el-menu-item
              v-for="(menu, index) in favMenus"
              :key="menu.name + '_' + menu.meta.title"
              :index="'#favorite_' + index"
            >
              <div class="submenu-item">
                <span>{{ menu.meta.title }}</span>
                <span class="btn-del-fav-menu" @click.stop="delFavMenu(index)">
                  <i class="el-icon-remove"></i>
                </span>
              </div>
            </el-menu-item>
          </el-submenu>
        </el-menu>
        <div class="menu-footer" @click="isCollapse = !isCollapse">
          <i
            class="el-icon-d-arrow-left btn-collapse"
            :class="{ 'is-collapse': isCollapse }"
          ></i>
        </div>
      </el-aside>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>

    <DownAgent
      type="dashboard"
      ref="agentDialog"
      @status-change="val => (agentTipFalg = !val)"
    ></DownAgent>
  </el-container>
</template>

<script>
import CustomerService from '@/components/CustomerService'
import newDataFlow from '@/components/newDataFlow'
import NotificationPopover from './notification/NotificationPopover'
import DownAgent from './downAgent/agentDown'
import { signOut } from '../utils/util'

const Languages = {
  sc: '中文 (简)',
  en: 'English',
  tc: '中文 (繁)'
}
let menuSetting = [
  { name: 'dashboard', icon: 'shouye' },
  { name: 'connections', icon: 'shujukus1', code: 'datasource_menu' },
  {
    name: 'dataTransmission',
    icon: 'chengbenguanlixitong',
    code: 'data_transmission',
    children: [
      {
        name: 'dataFlows',
        icon: 'shujukuqianyi1',
        code: 'Data_SYNC_menu',
        alias: 'dataFlowsClusterClone',
        query: '?mapping=cluster-clone'
      },
      {
        name: 'dataFlows',
        icon: 'shujutongbu',
        code: 'Data_SYNC_menu',
        alias: 'dataFlowsCustom',
        query: '?mapping=custom'
      },
      {
        name: 'dataVerification',
        icon: 'hechabidui-copy',
        code: 'Data_verify_menu'
      }
    ]
  },
  {
    name: 'dataGovernance',
    icon: 'yuanshuju1',
    code: 'data_government',
    children: [
      { name: 'metadataDefinition', code: 'data_catalog_menu' },
      { name: 'metadata', code: 'data_catalog_menu' },
      { name: 'metadataSearch' },
      { name: 'dataQuality', code: 'data_quality_menu' },
      { name: 'timeToLive', code: 'time_to_live_menu' },
      { name: 'dataMap', code: 'data_lineage_menu' },
      { name: 'dataRules', code: 'data_rules_menu' },
      { name: 'topology', code: 'Topology_menu' },
      { name: 'dictionary', code: 'dictionary_menu' }
    ]
  },
  {
    name: 'dataPublish',
    icon: 'API11',
    code: 'data_publish',
    children: [
      { name: 'modules', code: 'API_management_menu' },
      { name: 'dataExplorer', code: 'API_data_explorer_menu' },
      { name: 'apiDocAndTest', code: 'API_doc_&_test_menu' },
      { name: 'apiAnalysis', code: 'API_stats_menu' },
      { name: 'applications', code: 'API_clients_menu' },
      { name: 'apiServers', code: 'API_server_menu' }
    ]
  },
  { name: 'dataCollect', icon: 'shujucaiji', code: 'data_collect(old)_menu' },
  {
    name: 'system',
    icon: 'jiekoufuwu',
    code: 'system_management',
    children: [
      { name: 'tasks', code: 'schedule_jobs_menu' },
      // { name: 'agentdownload' },
      {
        name: 'clusterManagement',
        code: 'Cluster_management_menu',
        alias: window.getSettingByKey('SHOW_CLUSTER_OR_AGENT') + 'Management'
      },
      { name: 'agents', code: 'agents_menu' },
      { name: 'serversOversee', code: 'servers_oversee_menu' },
      { name: 'users', code: 'user_management_menu' },
      // { name: 'journal', code: 'user_management' },
      { name: 'roles', code: 'role_management_menu' },
      { name: 'settings', code: 'system_settings_menu' }
    ]
  }
]
export default {
  components: { CustomerService, newDataFlow, NotificationPopover, DownAgent },
  data() {
    return {
      logoUrl: window._TAPDATA_OPTIONS_.logoUrl,
      languages: Languages,
      lang: localStorage.getItem('tapdata_localize_lang') || 'en',
      isCollapse: false,
      settingVisibility:
        this.$has('home_notice_settings') ||
        (this.$has('system_settings') && this.$has('system_settings_menu')),
      settingCode:
        this.$has('system_settings') && this.$has('system_settings_menu'),
      creatAuthority:
        (this.$has('SYNC_job_creation') && this.$has('Data_SYNC_menu')) ||
        (this.$has('datasource_creation') && this.$has('datasource_menu')),
      menus: [],
      activeMenu: '',
      favMenus: [],
      userName: '',
      dialogVisible: false,
      isShowCustomerService: false,
      agentTipFalg: false,
      licenseExpire: '',
      licenseExpireVisible: false,
      licenseExpireDate: ''
    }
  },
  created() {
    this.activeMenu = this.$route.fullPath
    this.getMenus()
    this.getFavMenus()
    this.$root.$on('updateMenu', () => {
      this.getFavMenus()
    })
    if (this.$cookie.get('email')) {
      this.userName =
        this.$cookie.get('username') ||
        this.$cookie.get('email').split('@')[0] ||
        ''
    }

    window.iframeRouterChange = route => {
      this.$router.push(route)
    }
    let self = this
    window.stateChange = (key, data) => {
      self.$store.commit(key, data)
    }

    window.getFormLocal = data => {
      return self.$store.state[data]
    }
    // this.handleGetPermissions();

    // // 是否允许下载agent
    // if (this.$window.getSettingByKey('ALLOW_DOWNLOAD_AGENT')) {
    if (window.getSettingByKey('SHOW_LICENSE')) {
      this.getLicense()
    }
  },
  destroyed() {
    this.$root.$off('updateMenu')
  },
  watch: {
    '$route.name'() {
      this.activeMenu = this.$route.path
    }
    // $route() {
    // 	if (this.$route.meta) {
    // 		this.isCollapse = this.$route.meta.isCollapse;
    // 	}
    // }
  },
  methods: {
    async getFavMenus() {
      let result = await this.$api('users').get([this.$cookie.get('user_id')])
      if (result && result.data) {
        let user = result.data || {}
        this.favMenus = user.favorites || []
        // this.userName = user.email.split('@')[0] || '';
      }
    },
    delFavMenu(idx) {
      this.$confirm(
        this.$t('message.comfirm') + this.$t('app.menu.delFavMenu'),
        this.$t('app.menu.delFavMenu')
      ).then(async resFlag => {
        if (!resFlag) {
          return
        }
        this.favMenus.splice(idx, 1)
        // this.$cookie.get('user_id'),
        let result = await this.$api('users').updateById({
          favorites: this.favMenus
        })
        if (result.status === 200) {
          this.$message.success(this.$t('message.saveOK'))
        }
      })
    },
    getMenus() {
      let permissions = sessionStorage.getItem('tapdata_permissions')
      permissions = permissions ? JSON.parse(permissions) : []
      let routerMap = {}
      let routes = this.$router.options.routes.find(r => r.name === 'layout')
        .children
      routes.forEach(r => {
        routerMap[r.name] = r
      })

      let formatMenu = items => {
        return items.map(item => {
          let router = routerMap[item.name]
          let menu = Object.assign({}, item, router)
          menu.label = this.$t('app.menu.' + (item.alias || menu.name))
          let matched =
            !menu.code || permissions.some(p => p.code === menu.code)
          if (menu.children) {
            menu.children = formatMenu(menu.children)
            if (menu.children.every(m => m.hidden)) {
              menu.hidden = true
            }
          } else if (!matched) {
            menu.hidden = true
          }
          return menu
        })
      }
      let menus = menuSetting.concat()
      if (window.getSettingByKey('USE_CLOUD_MENU')) {
        let part1 = menus.splice(0, 2)
        let menu = menus.splice(0, 1)[0]
        let part2 = menus
        menus = part1.concat(menu.children, part2)
      }
      this.menus = formatMenu(menus)
    },
    command(command) {
      switch (command) {
        case 'account':
          this.$router.push({
            name: 'settingCenter'
          })
          break
        case 'setting':
          this.$router.push({
            name: 'notificationSetting'
          })
          break
        case 'verifySetting':
          this.$router.push({
            path: '/dataVerification/setting'
          })
          break
        case 'newDataFlow':
          this.dialogVisible = true
          break
        case 'help':
          window.open('https://docs.tapdata.io/', '_blank')
          break
        case 'question':
          this.isShowCustomerService = !this.isShowCustomerService
          break
        case 'version':
          if (window.getSettingByKey('SHOW_DK_VERSION')) {
            this.$message.info({
              dangerouslyUseHTMLString: true,
              message: 'DK_VERSION_1</br>DK_VERSION_2'
            })
          } else {
            this.$message.info(window._TAPDATA_OPTIONS_.version)
          }
          break
        case 'license':
          this.$message.info(
            this.$t('app.menu.licenseDate') + ': ' + this.licenseExpireDate
          )
          break
        case 'home':
          window.open('https://tapdata.net/', '_blank')
          break
        case 'signOut':
          this.$confirm(this.$t('app.signOutMsg'), this.$t('app.signOut')).then(
            resFlag => {
              if (!resFlag) {
                return
              }
              this.signOut()
            }
          )
          break
        case 'settings':
          this.$router.push({
            name: 'settings'
          })
          break
        default:
          this.$refs.agentDialog.dialogVisible = true
          // window.open('https://cloud.tapdata.net/agent/download.html', '_blank');
          break
      }
    },
    signOut() {
      this.$api('users')
        .logout()
        .then(() => {
          signOut()
        })
    },
    menuHandler(index) {
      // this.isCollapse = true;
      if (index.includes('#favorite_')) {
        let i = index.split('#favorite_')[1]
        let router = this.favMenus[i]
        if (this.$route.name === router.name) {
          this.$router.replace(router)
        }
        this.$router.push(router)
      } else {
        if (this.$route.fullPath === index) {
          return
        }
        this.$router.push(index)
      }
    },
    changeLanguage(lang) {
      localStorage.setItem('tapdata_localize_lang', lang)
      location.reload()
    },

    // 下载安装Agent
    downLoadInstall() {
      this.$refs.agentDialog.dialogVisible = true
    },

    async getLicense() {
      let timeStamp = this.$api('TimeStamp')
      let stime = ''
      await timeStamp.get().then(res => {
        if (res) {
          stime = res.data || new Date().getTime()
        }
      })
      this.$api('Licenses')
        .expires({})
        .then(res => {
          if (res) {
            let expires_on = res.data.expires_on || ''
            if (this.$cookie.get('isAdmin') == 1) {
              let endTime = expires_on - stime
              endTime = parseInt(endTime / 1000 / 60 / 60 / 24) //相差天数
              let showDay = window.getSettingByKey('licenseNoticeDays') || 0
              this.licenseExpireVisible = Number(showDay) > endTime
              this.licenseExpire = endTime
            }
            this.licenseExpireDate = this.$moment(expires_on).format(
              'YYYY-MM-DD HH:mm:ss'
            )
          }
        })
    }
  }
}
</script>
<style scoped lang="scss">
.layout-container {
  overflow: hidden;
  .agentNot {
    width: calc(100% - 10px);
    height: 30px;
    margin: 5px;
    line-height: 30px;
    box-sizing: border-box;
    font-size: 12px;
    text-align: center;
    color: #ec8205;
    user-select: none;
    border: 1px solid #ec8205;
    background-color: rgb(255, 233, 207);
    span {
      color: #48b6e2;
      cursor: pointer;
    }
    .close {
      float: right;
      padding: 8px 20px 0;
      cursor: pointer;
    }
  }
}
</style>

<style lang="scss">
.btn-del-fav-menu {
  display: none;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translate(0, -50%);
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  cursor: pointer;
  [class^='el-icon-'] {
    margin: 0;
    color: #f56c6c !important;
  }
}
.el-menu--inline .el-menu-item:hover .btn-del-fav-menu {
  display: block;
}
.layout-container {
  height: 100%;
  background: rgba(250, 250, 250, 1);
  .layout-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 7px;
    background: rgba(54, 54, 54, 1);
    .logo {
      margin-left: 8px;
      display: block;
      width: 99px;
      img {
        display: block;
        height: 100%;
        width: 100%;
        object-fit: contain;
      }
    }
    .button-bar {
      display: flex;
      align-items: center;
      .btn-create {
        margin-right: 5px;
      }
      .btn {
        margin-left: 8px;
        color: #999;
        cursor: pointer;
        i {
          display: inline-block;
          line-height: 28px;
          text-align: center;
          height: 28px;
          width: 28px;
        }
        &:hover {
          color: #fff;
        }
      }
      .menu-user {
        margin-left: 15px;
        .menu-button {
          color: rgba(204, 204, 204, 1);
          background: rgba(85, 85, 85, 1);
          border: none;
        }
      }
    }
  }
  .layout-aside {
    position: relative;
    display: flex;
    height: 100%;
    overflow: hidden;
    .el-menu--popup .submenu-item .btn-del {
      display: none;
    }
    .menu {
      width: 260px;
      //flex: 1;
      padding-bottom: 48px;
      background: rgba(250, 250, 250, 1);
      .iconfont {
        display: inline-block;
        margin-right: 5px;
        width: 24px;
        text-align: center;
        color: rgba(51, 51, 51, 1);
        font-size: 18px;
      }
      overflow-y: auto;
      user-select: none;
      .el-menu-item .el-tooltip {
        outline: none;
      }
      &.el-menu--collapse {
        width: 64px;
      }
      .el-menu-item,
      .el-submenu__title {
        height: 50px;
        line-height: 50px;
        color: rgba(51, 51, 51, 1);
        .submenu-item {
          padding-left: 12px;
        }
        &:hover {
          background: rgba(241, 241, 241, 1);
        }
        &.is-active {
          color: #48b6e2;
          background: rgba(241, 241, 241, 1);
        }
      }
      .is-active .el-submenu__title {
        background: rgba(241, 241, 241, 1);
      }
    }
    .menu-footer {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 48px;
      line-height: 48px;
      border: 1px solid #eee;
      box-sizing: border-box;
      text-align: right;
      overflow: hidden;
      background: rgba(250, 250, 250, 1);
      cursor: pointer;
      &:hover {
        background: rgba(241, 241, 241, 1);
      }
      .btn-collapse {
        padding: 10px;
        color: #666;
        transition: all 0.4s;
        &.is-collapse {
          padding: 10px 24px;
          transform: rotate(-180deg);
        }
      }
    }
  }
  .item-badge {
    .el-badge__content {
      height: 15px;
      line-height: 13px;
      padding: 0 5px;
      border: none;
    }
    .el-badge__content.is-fixed {
      right: 18px;
      top: 3px;
    }
  }
  .layout-main {
    padding: 0;
    background: #fff;
  }
  .expire-msg {
    display: inline-block;
    color: #fff;
    margin-right: 10px;
  }
}
</style>
