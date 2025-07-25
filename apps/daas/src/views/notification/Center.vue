<script>
import { AlarmNotification } from '@tap/business'
import { VIcon } from '@tap/component'
import { mapState } from 'vuex'
import SystemAlarm from './SystemAlarm'
import SystemNotification from './SystemNotification'
import UserNotification from './UserNotification'

export default {
  components: {
    SystemNotification,
    UserNotification,
    SystemAlarm,
    AlarmNotification,
    VIcon,
  },
  inject: ['lockedFeature', 'openLocked'],
  data() {
    return {
      activePanel: 'system',
    }
  },
  computed: mapState({
    unRead: (state) => state.notification.unRead,
  }),
  watch: {
    $route(route) {
      this.activePanel = route.query.type || route.params.type || 'system'
    },
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
              type: name,
            },
          })
          break
        case 'user':
          this.$router.push({
            name: 'userNotification',
            query: {
              type: name,
            },
          })
          break
        case 'alarmNotice':
          this.$router.push({
            name: 'alarmNotification',
            query: {
              type: name,
            },
          })
          break
        case 'alarm':
          this.$router.push({
            name: 'systemAlarm',
            params: {
              type: name,
            },
            query: {
              type: name,
            },
          })
          break
      }
    },
  },
}
</script>

<template>
  <section class="notification-wrap">
    <div class="notification-wrap-box">
      <div class="left-panel pt-5">
        <ul class="menu">
          <li
            :class="{ active: activePanel === 'system' }"
            @click="selectPanel('system')"
          >
            <VIcon size="14">notice-system-notice</VIcon>
            <span class="content ml-2">{{ $t('notify_system_notice') }}</span>
            <span v-show="unRead > 0" class="unread">{{ unRead }}</span>
          </li>
          <li
            :class="{ active: activePanel === 'user' }"
            @click="selectPanel('user')"
          >
            <VIcon size="14">notice-user</VIcon>
            <span class="content ml-2">{{
              $t('daas_notification_center_yonghucaozuo')
            }}</span>
          </li>
          <li
            :class="{ active: activePanel === 'alarmNotice' }"
            @click="selectPanel('alarmNotice')"
          >
            <VIcon size="14">warning</VIcon>
            <span class="content ml-2">{{
              $t('daas_notification_alarmnotification_gaojingtongzhi')
            }}</span>
          </li>
          <li
            :class="{ active: activePanel === 'alarm' }"
            class="flex align-center pr-4"
            @click="
              lockedFeature.alarmSetting ? openLocked() : selectPanel('alarm')
            "
          >
            <VIcon size="14">notice-system</VIcon>
            <span class="content ml-2">{{
              $t('daas_notification_center_xitonggaojing')
            }}</span>
            <VIcon v-if="lockedFeature.alarmSetting" size="24"
              >lock-circle</VIcon
            >
          </li>
        </ul>
      </div>
      <div class="main-panel">
        <SystemNotification v-if="activePanel === 'system'" />
        <UserNotification v-if="activePanel === 'user'" />
        <SystemAlarm v-if="activePanel === 'alarm'" />
        <AlarmNotification v-if="activePanel === 'alarmNotice'" />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
$unreadColor: #ee5353;
.notification-wrap {
  height: 100%;
  overflow: hidden;
  .notification-wrap-box {
    display: flex;
    flex-direction: row;
    height: 100%;
    background-color: var(--color-white);
    border-radius: 4px;
    .left-panel {
      border-right: 1px solid var(--border-light);
      width: 200px;
      ul.menu li {
        display: flex;
        height: 44px;
        padding-left: 20px;
        align-items: center;
        font-size: var(--font-base-title);
        font-weight: 400;
        color: var(--text-normal);
        cursor: pointer;
        &.active,
        &:hover {
          background: rgba(44, 101, 255, 0.05);
          .iconfont {
            color: var(--color-primary);
          }
        }
        .iconfont {
          margin-right: 5px;
          color: var(--text-normal);
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
          color: var(--text-white);
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
