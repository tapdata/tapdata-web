<template>
  <ElPopover placement="bottom" popper-class="notive-popove" trigger="hover" @show="activeTab = 'system'">
    <div class="btn" slot="reference" @click="toCenter()">
      <ElBadge class="item-badge" :value="unRead" :max="99" :hidden="!unRead">
        <VIcon class="mr-2" size="17">lingdang</VIcon>
        <span>{{ $t('header_notify') }}</span>
      </ElBadge>
    </div>
    <div class="notification-popover-wrap">
      <div class="tab-item-container">
        <div class="notice-header">
          <span> {{ $t('header_notification_content') }} </span>
        </div>
        <ul class="tab-list cuk-list">
          <li class="list-item" v-for="(item, index) in listData" :key="index" @click="handleRead(item.id)">
            <div class="list-item-content">
              <div class="unread-1zPaAXtSu"></div>
              <div class="list-item-desc">
                <!--                <span :style="`color: ${colorMap[item.level]};`">{{ item.level }}</span>-->
                <span>{{ $t('header_your') }}{{ systemMap[item.system] }}:</span>
                <span class="notive-item-name" @click="handleGo(item)" :title="item.serverName">
                  {{ item.serverName }}
                </span>
                <span>{{ typeMap[item.msg] }}</span>
              </div>
            </div>
          </li>
        </ul>
        <div class="connection-table__empty" v-if="listData.length < 1">
          <VIcon size="76">notice-color</VIcon>
          <span>{{ $t('header_no_notice') }}</span>
        </div>
        <div class="tab-item__footer flex justify-content-between py-3 font-color-sub">
          <span class="system-operation-setting cursor-pointer" @click="handleSetting">
            <VIcon class="mr-1" size="12">setting</VIcon>
            <span>{{ $t('header_setting') }}</span>
          </span>
          <ElLink class="font-color-sub" @click="toCenter()">{{ $t('header_view_notifications') }}</ElLink>
        </div>
      </div>
    </div>
    <ElDialog
      custom-class="notice-setting-dialog"
      :title="$t('notify_setting')"
      width="600px"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <ElForm ref="form" class="e-form" label-width="150px" :model="form">
        <div class="notice-setting-title">{{ $t('notify_agent_notification') }}</div>
        <ElFormItem :label="$t('notify_agent_status_offline')">
          <span class="notice-setting-label">{{ $t('notify_sms_notification') }}</span>
          <ElSwitch v-model="form.connectionInterrupted.sms" size="mini" @change="handleSettingValue"></ElSwitch>
          <span class="notice-setting-label">{{ $t('notify_email_notification') }}</span>
          <ElSwitch v-model="form.connectionInterrupted.email" size="mini" @change="handleSettingValue"></ElSwitch>
        </ElFormItem>
        <ElFormItem :label="$t('notify_agent_status_running')">
          <span class="notice-setting-label">{{ $t('notify_sms_notification') }}</span>
          <ElSwitch v-model="form.connected.sms" size="mini" @change="handleSettingValue"></ElSwitch>
          <span class="notice-setting-label">{{ $t('notify_email_notification') }}</span>
          <ElSwitch v-model="form.connected.email" @change="handleSettingValue"></ElSwitch>
        </ElFormItem>
        <div class="notice-setting-title">{{ $t('notify_task_running_notification') }}</div>
        <ElFormItem :label="$t('notify_agent_status_error')">
          <span class="notice-setting-label">{{ $t('notify_sms_notification') }}</span>
          <ElSwitch v-model="form.stoppedByError.sms" @change="handleSettingValue"></ElSwitch>
          <span class="notice-setting-label">{{ $t('notify_email_notification') }}</span>
          <ElSwitch v-model="form.stoppedByError.email" @change="handleSettingValue"></ElSwitch>
        </ElFormItem>
      </ElForm>
    </ElDialog>
  </ElPopover>
</template>

<script>
import { TYPEMAP } from './tyepMap'
import VIcon from '@/components/VIcon'
import { formatTime, uniqueArr } from '@/util'
export default {
  components: { VIcon },
  data() {
    return {
      loading: false,
      activeTab: 'system',
      unRead: 0,
      listData: [],
      colorMap: {
        ERROR: 'red',
        WARN: 'orangered',
        INFO: '#409EFF'
      },
      typeMap: TYPEMAP,
      systemMap: {
        sync: this.$t('notify_sync_task'),
        migration: this.$t('notify_migration_task'),
        dataFlow: this.$t('notify_task'),
        agent: this.$t('notify_agent'),
        inspect: this.$t('notify_inspect'),
        JobDDL: this.$t('notify_jobDDL')
      },
      userOperations: [],
      dialogVisible: false,
      userId: '',
      form: {
        connected: {
          email: true,
          sms: true
        },
        connectionInterrupted: {
          email: true,
          sms: true
        },
        stoppedByError: {
          email: true,
          sms: true
        }
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      let msg = {
        type: 'notification'
      }
      this.getUnreadData()
      if (this.$ws) {
        this.$ws.on('notification', async res => {
          this.getUnReadNum()
          let data = res?.data
          if (data) {
            data.createTime = formatTime(data.createTime)
            this.listData = uniqueArr([data, ...this.listData])
          }
        })
        this.$ws.ready(() => {
          this.$ws.send(msg)
        }, true)
        this.$root.$on('notificationUpdate', () => {
          this.$ws.send(msg)
        })
      }
    },
    // 获取未读的消息数量
    getUnReadNum() {
      let where = {
        read: false
      }
      return this.$axios.get('tm/api/Messages/count?where=' + encodeURIComponent(JSON.stringify(where))).then(res => {
        this.unRead = res
      })
    },
    getUnreadData() {
      let filter = {
        where: {
          read: false
        },
        order: ['createTime DESC'],
        limit: 20,
        skip: 0
      }
      return this.$axios
        .get('tm/api/Messages?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(({ items, total }) => {
          this.unRead = total
          this.listData = items.map(t => {
            t.createTime = formatTime(t.createTime)
            return t
          })
        })
    },
    // 已读消息
    handleRead(id) {
      let where = {
        id: { inq: [id] }
      }
      this.$axios.post('tm/api/Messages?where=' + encodeURIComponent(JSON.stringify(where))).then(res => {
        if (res) {
          this.getUnreadData()
          this.$root.$emit('notificationUpdate')
        }
      })
    },
    // 跳转消息详情
    handleGo(item) {
      this.handleRead(item.id)
      switch (item.system) {
        case 'dataFlow':
          this.$axios
            .get('tm/api/DataFlows/' + item.sourceId)
            .then(() => {
              this.$router.push({
                name: 'Monitor',
                params: { id: item.sourceId }
              })
            })
            .catch(err => {
              if (err?.data?.msg === 'no permission') {
                this.$message.error(this.$t('notify_task_longer_exists'))
              }
            })
          break
        case 'migration':
          this.$axios
            .get('tm/api/DataFlows/' + item.sourceId)
            .then(() => {
              this.$router.push({
                name: 'Monitor',
                params: { id: item.sourceId }
              })
            })
            .catch(err => {
              if (err?.data?.msg === 'no permission') {
                this.$message.error(this.$t('notify_task_longer_exists'))
              }
            })
          break

        case 'agent':
          this.$router.replace({
            name: 'Instance',
            query: {
              keyword: item.serverName
            }
          })
          break
      }
    },
    toCenter() {
      if (this.$route.name === 'SystemNotice') {
        return
      }
      this.$router.push({ name: 'SystemNotice' })
    },
    // 通知设置
    handleSetting() {
      this.dialogVisible = true
      // 获取tm用户id
      this.$axios.get('tm/api/users/self').then(data => {
        if (data) {
          this.userId = data.id
          if (data.notification) {
            this.form = data.notification
          }
        }
      })
    },
    handleSettingValue() {
      let data = {
        notification: this.form
      }
      this.$axios.patch(`tm/api/users/${this.userId}`, data)
    }
  }
}
</script>
<style lang="scss">
.notive-popove {
  overflow: hidden;
}
.el-popover__reference-wrapper {
  .btn {
    cursor: pointer;
    .item-badge {
      &:hover {
        color: #337dff;
      }
      .el-badge__content {
        left: 0;
        right: inherit;
        height: 15px;
        line-height: 15px;
        padding: 0 5px;
        border: 0;
        transform: translateY(-50%) translateX(30%);
      }
    }
  }

  .notification-popover-wrap {
    > .el-tabs__content {
      padding: 0 !important;
    }
    .tab-item {
      margin-bottom: 1px;
    }
  }
}
.notice-setting-dialog {
  .el-dialog__header {
    padding: 40px 40px 0 40px;
    .el-dialog__title {
      font-weight: 500;
      color: #000;
    }
    .el-dialog__headerbtn {
      top: 40px;
      right: 40px;
    }
  }
  .el-dialog__body {
    padding: 30px 40px;
    .notice-setting-title {
      padding-bottom: 10px;
      font-size: 12px;
      color: #2c65ff;
    }
    .notice-setting-label {
      padding: 0 8px 0 30px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.65);
    }
    .el-form-item__label {
      text-align: left;
    }
  }
}
</style>
<style lang="scss" scoped>
.notive-popove {
  .notification-popover-wrap {
    margin: -15px;
    width: 380px;
    overflow: hidden;
    position: relative;
    border-radius: 3px;

    .notice-header {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      height: 50px;
      line-height: 50px;
      //padding: 0 25px;
      color: #000;
      border-top: 1px solid rgba(222, 222, 228, 1);
      border-bottom: 1px solid #f2f2f2;

      .notice-header-text {
        display: inline-block;
        cursor: pointer;
        //color: #666;
      }
    }

    .tab-item-container {
      display: flex;
      flex-direction: column;
      height: 262px;
      padding: 0 16px 30px;
      overflow: hidden;
      margin-bottom: -1px;
      position: relative;
      //.tab-list {
      //  flex: 1;
      //  overflow-y: auto;
      //}
      .tab-item__footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 0 16px;
      }
    }

    .cuk-list {
      font-size: 12px;
      overflow-y: auto;
      .list-item {
        position: relative;
        background: #fff;
        border-bottom: 1px solid #f2f2f2;
        padding-right: 5px;
        cursor: pointer;

        &:hover {
          background-color: #ecf5ff;
        }

        .list-item-content {
          position: relative;
          height: 40px;
          line-height: 40px;
          padding: 0 5px 0 18px;
          box-sizing: border-box;
          overflow: hidden;
          display: block;
        }

        .unread-1zPaAXtSu {
          position: absolute;
          top: 18px;
          left: 8px;
          width: 6px;
          height: 6px;
          background: #f81d22;
          border-radius: 50%;
        }

        .list-item-desc {
          color: #666;
          //position: absolute;
          //top: -5px;
          //left: 30px;
          //right: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          .notive-item-name {
            display: inline-block;
            max-width: 100px;
            padding: 0 5px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            color: #409eff;
          }

          span {
            float: left;
            font-size: 12px;
          }
        }

        .list-item-platform {
          color: #666;
        }

        .list-item-time {
          margin: 15px 0 0 17px;
          color: #aaa;
          font-size: 12px;
        }
      }
    }

    .notification-list {
      box-sizing: border-box;

      .notification-item {
        padding: 5px 20px 4px 20px;
        border-bottom: 1px solid #dedee4;
        font-size: 12px;
        color: #666;

        &:hover {
          background-color: #ecf5ff;
        }

        &:last-child {
          border: none;
        }

        .item-time {
          margin-top: 5px;
          color: #aaa;
          font-size: 12px;
        }
      }
    }

    .connection-table__empty {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
      span {
        display: inline-block;
        line-height: 20px;
        padding-top: 10px;
        font-size: 12px;
      }
    }
  }
}
</style>
