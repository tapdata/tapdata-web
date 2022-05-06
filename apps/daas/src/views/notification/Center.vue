<template>
  <section class="notification-wrap section-wrap">
    <div class="notification-wrap-box">
      <div class="left-panel pt-5">
        <ul class="menu">
          <li :class="{ active: activePanel === 'system' }" @click="selectPanel('system')">
            <VIcon>bells</VIcon>
            <span class="content">{{ $t('notify_system_notice') }}</span>
            <span class="unread" v-show="unRead > 0">{{ unRead }}</span>
          </li>
          <li :class="{ active: activePanel === 'user' }" @click="selectPanel('user')">
            <i class="iconfont icon-lishijilu"></i>
            <span class="content">{{ $t('notify_user_notice') }}</span>
          </li>
        </ul>
      </div>
      <div class="main-panel">
        <SystemNotification v-if="activePanel === 'system'"></SystemNotification>
        <UserNotification v-if="activePanel === 'user'"></UserNotification>
      </div>
    </div>
  </section>
</template>
<script>
import SystemNotification from './SystemNotification'
import UserNotification from './UserNotification'
import VIcon from '@/components/VIcon'
import { mapState } from 'vuex'

export default {
  components: {
    SystemNotification,
    UserNotification,
    VIcon
  },
  data() {
    return {
      activePanel: 'system'
    }
  },
  computed: mapState({
    unRead: state => state.notification.unRead
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
      if (name === 'system') {
        this.$router.push({
          name: 'systemNotification',
          query: {
            type: name
          }
        })
      } else {
        this.$router.push({
          name: 'userNotification',
          query: {
            type: name
          }
        })
      }
      // this.$router.replace({
      //   name: 'notification',
      //   query: {
      //     type: name
      //   }
      // })
    }
  }
}
</script>
<style lang="scss" scoped>
$unreadColor: #ee5353;
.notification-wrap {
  display: flex;
  justify-content: space-between;
  height: 100%;
  overflow: hidden;
  .notification-wrap-box {
    display: flex;
    flex-direction: row;
    height: 100%;
    background-color: #fff;
    border-radius: 4px;
    .left-panel {
      border-right: 1px solid #f2f2f2;
      width: 200px;
      ul.menu li {
        display: flex;
        height: 44px;
        padding-left: 20px;
        align-items: center;
        font-size: 12px;
        font-weight: 400;
        color: #4e5969;
        cursor: pointer;
        &.active,
        &:hover {
          background: rgba(44, 101, 255, 0.05);
          .iconfont {
            color: map-get($color, primary);
          }
        }
        .iconfont {
          margin-right: 5px;
          color: #4e5969;
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
          color: map-get($fontColor, white);
          font-weight: 500;
          font-size: 12px;
          white-space: nowrap;
          text-align: center;
          background: $unreadColor;
          box-sizing: border-box;
          outline: 0;
          transition: 0.1s;
          cursor: pointer;
        }
      }
    }
    .main-panel {
      position: relative;
      flex: 1;
    }
  }
}
</style>
