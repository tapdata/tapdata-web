<template>
  <section class="notification-wrap">
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
          <li :class="{ active: activePanel === 'alarmNotice' }" @click="selectPanel('alarmNotice')">
            <i class="iconfont icon-lishijilu"></i>
            <span class="content">{{$t('daas_notification_alarmnotification_gaojingtongzhi')}}</span>
          </li>
          <li :class="{ active: activePanel === 'alarm' }" @click="selectPanel('alarm')">
            <i class="iconfont icon-lishijilu"></i>
            <span class="content">{{$t('daas_notification_center_xitonggaojing')}}</span>
          </li>
        </ul>
      </div>
      <div class="main-panel">
        <SystemNotification v-if="activePanel === 'system'"></SystemNotification>
        <UserNotification v-if="activePanel === 'user'"></UserNotification>
        <SystemAlarm v-if="activePanel === 'alarm'"></SystemAlarm>
        <AlarmNotification v-if="activePanel === 'alarmNotice'"></AlarmNotification>
      </div>
    </div>
  </section>
</template>
<script>
import SystemNotification from './SystemNotification'
import UserNotification from './UserNotification'
import SystemAlarm from './SystemAlarm'
import AlarmNotification from './AlarmNotification'
import { VIcon } from '@tap/component'
import { mapState } from 'vuex'

export default {
  components: {
    SystemNotification,
    UserNotification,
    SystemAlarm,
    AlarmNotification,
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
      switch (name) {
        case 'system':
          this.$router.push({
            name: 'systemNotification',
            query: {
              type: name
            }
          })
          break
        case 'user':
          this.$router.push({
            name: 'userNotification',
            query: {
              type: name
            }
          })
          break
        case 'alarmNotice':
          this.$router.push({
            name: 'alarmNotification',
            query: {
              type: name
            }
          })
          break
        case 'alarm':
          this.$router.push({
            name: 'systemAlarm',
            query: {
              type: name
            }
          })
          break
      }
    }
  }
}
</script>
<style lang="scss" scoped>
$unreadColor: #ee5353;
.notification-wrap {
  height: 100%;
  overflow: hidden;
  .notification-wrap-box {
    display: flex;
    flex-direction: row;
    height: 100%;
    background-color: map-get($bgColor, white);
    border-radius: 4px;
    .left-panel {
      border-right: 1px solid map-get($borderColor, light);
      width: 200px;
      ul.menu li {
        display: flex;
        height: 44px;
        padding-left: 20px;
        align-items: center;
        font-size: 12px;
        font-weight: 400;
        color: map-get($fontColor, normal);
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
          color: map-get($fontColor, normal);
        }
        .content {
          flex: 1;
        }
        .unread {
          margin-right: 20px;
          padding: 0px 5px;
          min-width: 25px;
          height: 17px;
          border-radius: 10px;
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
