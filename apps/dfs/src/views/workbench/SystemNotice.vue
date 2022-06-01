<template>
  <section class="system-notice g-panel-container" v-if="$route.name === 'SystemNotice'">
    <div class="main">
      <div class="system-operation">
        <div class="system-operation-left">
          <span>{{ $t('notify_list') }}</span>
          <span class="system-operation-setting" @click="handleSetting">
            <VIcon class="ml-2" size="12">setting</VIcon>
            <span class="fs-8">{{ $t('header_setting') }}</span>
          </span>
        </div>
        <div class="system-operation-right">
          <ElButton
            size="mini"
            class="btn-refresh"
            @click="handleReadNotice()"
            :disabled="multipleSelection.length < 1"
          >
            {{ $t('notify_mark_read') }}
          </ElButton>
          <ElButton size="mini" @click="handleDelete" :disabled="multipleSelection.length < 1">
            {{ $t('button_delete') }}
          </ElButton>
          <ElButton size="mini" type="primary" @click="handleReadNoticeAll">
            {{ $t('notify_all_read') }}
          </ElButton>
          <ElButton size="mini" @click="handleAllDelete" :disabled="list.length < 1">
            {{ $t('button_all_delete') }}
          </ElButton>
        </div>
      </div>
      <ElTable
        class="system-table table-border"
        style="margin-top: 10px"
        height="100%"
        :data="list"
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="55"></ElTableColumn>
        <ElTableColumn :label="$t('notify_notification_content')" prop="name" min-width="150">
          <template slot-scope="scope">
            <div class="list-item-content">
              <div class="unread-1zPaAXtSu" v-show="!scope.row.read"></div>
              <div class="list-item-desc" @click="!scope.row.read && handleReadNotice(scope.row.id, scope.row)">
                <!--                                <span :style="`color: ${colorMap[scope.row.level]};`">【{{ scope.row.level }}】</span>-->
                <span>{{ $t('notify_your') }}{{ systemMap[scope.row.system] }}:</span>
                <span style="color: #2c65ff; cursor: pointer" @click="handleGo(scope.row)">
                  {{ scope.row.serverName }}
                </span>
                <span>{{ typeMap[scope.row.msg] }}</span>
                <span v-if="scope.row.CDCTime">{{ getLag(scope.row.CDCTime) }}</span>
                <span v-if="scope.row.restDay">{{ scope.row.restDay }} {{ $t('notify_day') }}</span>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn
          show-overflow-tooltip
          :label="$t('notify_notification_time')"
          prop="createTime"
          width="180"
        ></ElTableColumn>
        <div class="connection-table__empty" slot="empty">
          <VIcon size="100">no-notice-color</VIcon>
          <span v-if="!isSearching" style="display: inline-block; margin-left: 6px">{{ $t('notify_no_notice') }}</span>
        </div>
      </ElTable>
      <ElPagination
        background
        class="mt-3"
        layout="total, sizes, ->, prev, pager, next, jumper"
        :current-page.sync="page.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size.sync="page.size"
        :total="page.total"
        @size-change="fetch(1)"
        @current-change="fetch"
      >
      </ElPagination>
    </div>
    <Setting v-if="visible" :visible="visible" @handleDialogVisible="handleSettingDialog"></Setting>
  </section>
</template>

<script>
import { TYPEMAP } from './tyepMap'
import Setting from './components/Setting'
import VIcon from '@/components/VIcon'
import timeFunction from '@/mixins/timeFunction'

export default {
  components: { Setting, VIcon },
  mixins: [timeFunction],
  data() {
    return {
      visible: false,
      user: window.__USER_INFO__ || {},
      list: [],
      unReadCount: 0,
      read: true,
      typeMap: TYPEMAP,
      isSearching: false,
      multipleSelection: [],
      colorMap: {
        ERROR: 'red',
        WARN: 'orangered',
        INFO: '#409EFF'
      },
      systemMap: {
        sync: this.$t('notify_sync_task'),
        migration: this.$t('notify_migration_task'),
        dataFlow: this.$t('notify_task'),
        agent: this.$t('notify_agent'),
        inspect: this.$t('notify_inspect'),
        JobDDL: this.$t('notify_jobDDL')
      },
      page: {
        current: 1,
        size: 20,
        total: 0
      },
      taskFalg: false
    }
  },
  created() {
    this.fetch()
    // this.getUnreadNum() //未读消息数量
    this.$root.$on('notificationUpdate', () => {
      // this.getUnreadNum() //未读消息数量
      this.fetch()
    })
  },
  methods: {
    handleSetting() {
      this.visible = true
    },
    // 关闭设置
    handleSettingDialog() {
      this.visible = false
    },
    fetch(pageNum, debounce) {
      const { delayTrigger } = this.$util
      delayTrigger(() => {
        this.loading = true
        let where = {
          isDeleted: {
            neq: true
          }
        }

        let current = pageNum || this.page.current
        let filter = {
          where,
          order: ['createTime DESC'],
          limit: this.page.size,
          skip: (current - 1) * this.page.size
        }

        this.loading = true
        // this.$axios.get('tm/api/Messages/count?where=' + encodeURIComponent(JSON.stringify(where))),
        this.$axios
          .get('tm/api/Messages?filter=' + encodeURIComponent(JSON.stringify(filter)))
          .then(data => {
            this.page.total = data.total
            let list = data.items || []
            this.list = list.map(this.formatData)
          })
          .finally(() => {
            this.loading = false
          })
      }, debounce)
      // notification
      //   .get({ filter: JSON.stringify(filter) })
      //   .then(res => {
      //     if (res.data) {
      //       this.listData = res.data
      //       //格式化日期
      //       if (this.listData && this.listData.length > 0) {
      //         this.listData.map(item => {
      //           item['createTime'] = item.createTime ? moment(item.createTime).format('YYYY-MM-DD HH:mm:ss') : ''
      //         })
      //       }
      //     }
      //   })
      //   .finally(() => {
      //     this.loading = false
      //   })
      // this.getCount(this.read)
    },
    formatData(item) {
      item['createTime'] = this.formatTime(item.createTime)
      return item
    },
    handleGo(item) {
      this.handleReadNotice(item.id)
      switch (item.system) {
        case 'dataFlow':
          this.$axios
            .get('tm/api/DataFlows/' + item.sourceId)
            .then(() => {
              this.$router.push({
                name: 'Monitor',
                params: {
                  id: item.sourceId
                }
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
                params: {
                  id: item.sourceId
                }
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
    // 获取任务数据
    // getTaskData(id) {
    //   this.$axios.get('tm/api/DataFlows/' + id).catch(err => {
    //     if (err?.data?.msg === 'no permission') {
    //       this.taskFalg = true
    //     }
    //   })
    // },
    getLag(lag) {
      let r = '0s'
      if (lag) {
        let m = this.duration(lag, 'seconds')
        if (m.days()) {
          r = m.days() + 'd'
        } else if (m.hours()) {
          r = m.hours() + 'h'
        } else if (m.minutes()) {
          r = m.minutes() + 'm'
        } else {
          r = lag + 's'
        }
      }
      return r
    },
    // 选择通知
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 删除消息
    handleDelete() {
      let where = {}
      let ids = this.multipleSelection.map(item => item.id)
      where.id = { inq: ids }

      this.$confirm(this.$t('notify_delete_notification_tip'), this.$t('notify_delete_notification_title'), {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel')
      }).then(res => {
        if (res) {
          this.$axios.delete('tm/api/Messages?where=' + encodeURIComponent(JSON.stringify(where)))
          this.fetch()
        }
      })
    },
    // 删除全部消息
    handleAllDelete() {
      this.$confirm(this.$t('notify_delete_all_notification_message'), this.$t('notify_delete_notification_title'), {
        type: 'warning'
      }).then(res => {
        if (res) {
          this.$axios.delete('tm/api/Messages/deleteAll').then(() => {
            this.fetch()
          })
        }
      })
    },
    // handleDelete(type) {
    //   let where = {}
    //   if (type === 'one') {
    //     let ids = this.multipleSelection.map(item => item.id)
    //     where.id = { inq: ids }
    //   } else {
    //     where = {}
    //   }
    //   let data = {
    //     isDeleted: true
    //   }
    //   this.$confirm('是否确认删除通知？', '删除通知', {
    //     type: 'warning'
    //   }).then(res => {
    //     if (res) {
    //       this.$axios.post('tm/api/Messages/update?where=' + encodeURIComponent(JSON.stringify(where)), data)
    //       this.fetch()
    //     }
    //   })
    // },
    // 已读消息
    // handleRead(id) {
    //   // let read = this.read
    //   this.$axios.post('tm/api/Messages', { id: id }).then(res => {
    //     if (res) {
    //       // this.getUnreadNum() //未读消息数量
    //       this.fetch()
    //       // this.read = read
    //       this.$root.$emit('notificationUpdate')
    //     }
    //   })
    // },
    // 标记为已读
    handleReadNotice(id) {
      let where = {}
      if (id) {
        where.id = { inq: [id] }
      } else {
        let ids = this.multipleSelection.map(item => item.id)
        where.id = { inq: ids }
      }

      this.$axios.post('tm/api/Messages?where=' + encodeURIComponent(JSON.stringify(where))).then(res => {
        if (res) {
          // this.getUnreadNum() //未读消息数量
          this.fetch()
          // this.read = read
          // this.$root.$emit('notificationUpdate')
        }
      })
    },
    // 全部已读
    handleReadNoticeAll() {
      this.$axios.post('tm/api/Messages/readAll').then(res => {
        if (res) {
          // this.getUnreadNum() //未读消息数量
          this.fetch()
          // this.read = read
          // this.$root.$emit('notificationUpdate')
        }
      })
    }
    // handleReadNotice(type) {
    //   let where = {}
    //   if (type === 'one') {
    //     let ids = this.multipleSelection.map(item => item.id)
    //     where.id = { inq: ids }
    //   } else {
    //     where = {}
    //   }
    //   this.$axios
    //     .post('tm/api/Messages/update?where=' + encodeURIComponent(JSON.stringify(where)), {
    //       read: true
    //     })
    //     .then(res => {
    //       if (res) {
    //         // this.getUnreadNum() //未读消息数量
    //         this.fetch()
    //         // this.read = read
    //         this.$root.$emit('notificationUpdate')
    //       }
    //     })
    // }
    // 未读消息
    // getUnreadNum() {
    //   let where = {
    //     read: false
    //   }
    //   this.$axios.get('tm/api/Messages/count?where=' + encodeURIComponent(JSON.stringify(where))).then(res => {
    //     if (res) {
    //       this.unReadCount = res
    //     }
    //   })
    // }
  }
}
</script>

<style lang="scss" scoped>
$unreadColor: #e43737;
.system-notice {
  display: flex;
  width: 100%;
  height: 100%;
  padding: 20px;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  .system-header {
    padding-bottom: 20px;
    font-size: 18px;
    font-weight: 500;
    color: #000;
  }
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-right: 3px;
    overflow: hidden;
  }
  .system-operation {
    display: flex;
    justify-content: space-between;
    .system-operation-left {
      font-size: 14px;
      color: #000;
      span {
        padding-right: 20px;
      }
      .system-operation-setting {
        cursor: pointer;
        color: #2c65ff;
        span {
          padding-left: 5px;
        }
      }
    }
  }
  .system-table {
    .list-item-content {
      position: relative;
      box-sizing: border-box;
      cursor: pointer;
      display: block;
      .unread-1zPaAXtSu {
        position: absolute;
        top: 8px;
        left: -10px;
        width: 6px;
        height: 6px;
        background: $unreadColor;
        border-radius: 50%;
      }
    }
    .connection-table__empty {
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      span {
        display: inline-block;
        margin-left: -20px;
        line-height: 20px;
      }
    }
  }
}
</style>
<style lang="scss">
.system-notice {
  .system-operation-right {
    .btn-refresh.is-disabled {
      background-color: #fff;
      border-color: #ebeef5;
      color: #c0c4cc;
    }
  }
}
</style>
