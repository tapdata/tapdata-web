<template>
  <section class="notification-center">
    <div class="left-panel">
      <div class="header">{{ $t('notification.noticeCenter') }}</div>
      <ul class="menu">
        <li
          :class="{ active: activePanel === 'system' }"
          @click="selectPanel('system')"
        >
          <i class="iconfont icon-lingdang"></i>
          <span class="content">{{ $t('notification.systemNotice') }}</span>
          <span class="unread" v-show="unRead > 0">{{ unRead }}</span>
        </li>
        <li
          :class="{ active: activePanel === 'user' }"
          @click="selectPanel('user')"
        >
          <i class="iconfont icon-lishijilu"></i>
          <span class="content">{{ $t('notification.userNotice') }}</span>
        </li>
      </ul>
    </div>
    <div class="main-panel">
      <SystemNotification v-if="activePanel === 'system'"></SystemNotification>
      <UserNotification v-if="activePanel === 'user'"></UserNotification>
    </div>
  </section>
</template>
<script>
import SystemNotification from './SystemNotification'
import UserNotification from './UserNotification'
import { mapState } from 'vuex'

export default {
  components: {
    SystemNotification,
    UserNotification
  },
  data() {
    return {
      activePanel: 'system'
    }
  },
  computed: mapState({
    unRead: (state) => state.notification.unRead
  }),
  watch: {
    $route(route) {
      this.activePanel = route.query.type || 'system'
    }
  },
  created() {
    this.activePanel = this.$route.query.type || 'system'
  },
  methods: {
    selectPanel(name) {
      this.$router.replace({
        name: 'notification',
        query: {
          type: name
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
@unreadColor: #ee5353;
.notification-center {
  display: flex;
  justify-content: space-between;
  height: 100%;
  overflow: hidden;
  .left-panel {
    background: rgba(250, 250, 250, 1);
    border: 1px solid rgba(230, 230, 232, 1);
    width: 250px;
    .header {
      padding: 30px 20px 20px 20px;
      line-height: 34px;
      font-size: 14px;
      font-weight: bold;
      color: rgba(51, 51, 51, 1);
    }
    ul.menu li {
      display: flex;
      align-items: center;
      height: 44px;
      font-size: 12px;
      font-weight: 400;
      color: rgba(102, 102, 102, 1);
      line-height: 44px;
      padding-left: 20px;
      cursor: pointer;
      &.active,
      &:hover {
        background: rgba(238, 238, 238, 1);
      }
      .iconfont {
        margin-right: 5px;
      }
      .content {
        flex: 1;
      }
      .unread {
        margin-right: 20px;
        padding: 0px 5px;
        min-width: 25px;
        height: 17px;
        border-radius: 4px;
        line-height: 17px;
        color: #fff;
        font-weight: 500;
        font-size: 12px;
        white-space: nowrap;
        text-align: center;
        background: @unreadColor;
        box-sizing: border-box;
        outline: 0;
        transition: 0.1s;
        cursor: pointer;
      }
    }
  }
  .main-panel {
    flex: 1;
  }
}
</style>
