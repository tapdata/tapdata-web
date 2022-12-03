<template>
  <div class="section-wrap setting-warp">
    <div class="setting-warp-box h-100">
      <div class="setting-center">
        <div class="setting-left-sidebar">
          <ul>
            <li
              v-for="item in settingList"
              :key="item.icon"
              :class="activePanel === item.key ? 'active' : ''"
              @click="changeName(item.key)"
            >
              <!-- <i :class="['iconfont', item.icon]"></i> -->
              <VIcon class="mr-2">{{ item.icon }}</VIcon>
              <span slot="title">{{ item.name }}</span>
            </li>
          </ul>
        </div>
        <div class="setting-main">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import i18n from '@/i18n'

import { VIcon } from '@tap/component'
export default {
  components: { VIcon },
  data() {
    return {
      settingList: [
        {
          icon: 'setting',
          name: this.$t('account_systemSetting'),
          key: 'settings'
        },
        {
          icon: 'bells',
          name: this.$t('notify_setting'),
          key: 'notificationSetting'
        },
        {
          icon: 'bells',
          name: i18n.t('daas_setting_settingcenter_gaojingshezhi'),
          key: 'alarmSetting'
        },
        {
          icon: 'account',
          name: this.$t('account_accountSettings'),
          key: 'accountSetting'
        }
      ],
      activePanel: '',
      authoritySetting: this.$has('system_settings') && this.$has('system_settings_menu')
    }
  },
  computed: {
    breadcrumbName() {
      return this.$t(this.$route.meta?.title)
    }
  },
  watch: {
    $route(route) {
      this.activePanel = route.name
    }
  },
  created() {
    this.activePanel = this.$route.name
  },
  methods: {
    changeName(name) {
      this.activePanel = name
      this.$router.push({
        name
      })
    }
  }
}
</script>

<style scoped lang="scss">
.setting-warp {
  height: 100%;
  overflow: hidden;
  // .section-wrap-breadcrumb {
  //   padding: 25px 0;
  // }
  .setting-warp-box {
    flex: 1 1 auto;
    border-radius: 4px;
    background-color: map-get($bgColor, white);
    overflow: hidden;
    .setting-center {
      height: 100%;
      font-size: $fontBaseTitle;
      display: flex;
      justify-content: space-between;
      height: 100%;
      .setting-left-sidebar {
        padding-top: 16px;
        border-right: 1px solid map-get($borderColor, light);
        width: 200px;
        // .title {
        //   height: 14px;
        //   font-size: 14px;
        //   font-weight: bold;
        //   color: rgba(51, 51, 51, 1);
        //   line-height: 34px;
        //   padding: 30px 20px;
        // }
        ul {
          li {
            height: 44px;
            line-height: 44px;
            padding-left: 20px;
            cursor: pointer;
            color: map-get($fontColor, light);
            ::v-deep {
              .iconfont {
                color: map-get($fontColor, light);
              }
            }
          }
          .active {
            background: rgba(44, 101, 255, 0.05);
            ::v-deep {
              .iconfont {
                color: map-get($color, primary);
              }
            }
          }
          // &:hover {
          // 	background: #eeeeee;
          // }
        }
      }

      .setting-main {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
    }
  }
}
</style>
<style lang="scss">
.setting-left-sidebar .el-menu-vertical-demo {
  .el-menu-item is-active {
    background-color: #eee;
  }
}
</style>
