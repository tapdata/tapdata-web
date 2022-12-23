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
                <span class="notive-item-name text-primary" @click="handleGo(item)" :title="item.serverName">
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
        <div class="tab-item__footer flex justify-content-end py-3 font-color-sub">
          <!--<span class="system-operation-setting cursor-pointer" @click="handleSetting">
            <VIcon class="mr-1" size="12">setting</VIcon>
            <span class="fs-8">{{ $t('header_setting') }}</span>
          </span>-->
          <ElLink class="font-color-sub" @click="toCenter()">{{ $t('header_view_notifications') }}</ElLink>
        </div>
      </div>
    </div>
    <Setting v-if="visible" :visible="visible" @handleDialogVisible="handleSettingDialog"></Setting>
  </ElPopover>
</template>

<script>
import { debounce } from 'lodash'

import { TYPEMAP } from './tyepMap'
import { VIcon } from '@tap/component'
import { uniqueArr } from '@/util'
import Setting from './components/Setting'
import timeFunction from '@/mixins/timeFunction'

export default {
  components: { VIcon, Setting },
  mixins: [timeFunction],
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
      visible: false,
      form: {}
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
        this.$ws.on(
          'notification',
          debounce(res => {
            let data = res?.data
            if (data?.msg !== 'alarm') {
              this.getUnReadNum()
            }
            if (data) {
              data.createTime = this.formatTime(data.createTime)
              this.listData = uniqueArr([data, ...this.listData])
            }
          }, 800)
        )
        this.$ws.ready(() => {
          this.$ws.send(msg)
        }, true)
        // this.$root.$on('notificationUpdate', () => {
        //   this.$ws.send(msg)
        // })
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
            t.createTime = this.formatTime(t.createTime)
            return t
          })
        })
    },
    // 已读消息
    handleRead(id) {
      let where = {
        id: { inq: [id] }
      }
      this.$axios.post('tm/api/Messages?where=' + encodeURIComponent(JSON.stringify(where))).then(() => {
        this.getUnreadData()
        this.$root.$emit('notificationUpdate')
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
      this.visible = true
    },
    // 关闭设置
    handleSettingDialog() {
      this.visible = false
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
</style>
<style lang="scss" scoped>
.notive-popove {
  .notification-popover-wrap {
    margin: -12px;
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
      padding: 0 16px 0;
      overflow: hidden;
      //margin-bottom: -1px;
      position: relative;
      //.tab-list {
      //  flex: 1;
      //  overflow-y: auto;
      //}
      .tab-item__footer {
        //position: absolute;
        //bottom: 0;
        //left: 0;
        //right: 0;
        //padding: 0 16px;
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
