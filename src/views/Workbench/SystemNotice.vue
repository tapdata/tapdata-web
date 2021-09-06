<template>
  <section class="system-notice main-containe" v-if="$route.name === 'SystemNotice'">
    <header class="system-header">系统通知</header>
    <div class="main">
      <div class="system-operation">
        <div class="system-operation-left">
          <span>通知列表</span>
          <span class="system-operation-setting" @click="handleSetting">
            <VIcon class="ml-2" size="12">setting</VIcon>
            <span>设置</span>
          </span>
        </div>
        <div class="system-operation-right">
          <ul>
            <li class="ml-3">
              <ElButton plain class="btn-refresh" @click="handleDelete('all')" :disabled="list.length < 1">
                全部删除
              </ElButton>
            </li>
            <li class="ml-3">
              <ElButton plain class="btn-refresh" @click="handleDelete('one')" :disabled="multipleSelection.length < 1">
                删除
              </ElButton>
            </li>
            <li class="ml-3">
              <ElButton plain size="mini" class="btn-refresh" @click="handleReadNotice('all')"> 全部已读 </ElButton>
            </li>
            <li class="ml-3">
              <ElButton
                plain
                size="mini"
                class="btn-refresh"
                @click="handleReadNotice('one')"
                :disabled="multipleSelection.length < 1"
              >
                标记为已读
              </ElButton>
            </li>
          </ul>
        </div>
      </div>
      <El-table
        class="system-table table-border"
        style="margin-top: 10px"
        height="100%"
        :data="list"
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="55"></ElTableColumn>
        <ElTableColumn label="通知内容" prop="name" min-width="150">
          <template slot-scope="scope">
            <div class="list-item-content">
              <div class="unread-1zPaAXtSu" v-show="!scope.row.read"></div>
              <div class="list-item-desc" @click="handleRead(scope.row.id)">
                <!--                                <span :style="`color: ${colorMap[scope.row.level]};`">【{{ scope.row.level }}】</span>-->
                <span>您的{{ systemMap[scope.row.system] }}:</span>
                <span style="color: #409eff; cursor: pointer" @click="handleGo(scope.row)">
                  {{ scope.row.serverName }}
                </span>
                <span>{{ typeMap[scope.row.msg] }}</span>
                <span v-if="scope.row.CDCTime">{{ getLag(scope.row.CDCTime) }}</span>
                <span v-if="scope.row.restDay">{{ scope.row.restDay }} 天</span>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn show-overflow-tooltip label="通知时间" prop="createTime" width="150"></ElTableColumn>
        <div class="connection-table__empty" slot="empty">
          <VIcon size="100">no-notice-color</VIcon>
          <span v-if="!isSearching" style="display: inline-block; margin-left: 6px">暂无通知</span>
        </div>
      </El-table>
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
    <ElDialog
      custom-class="notice-setting-dialog"
      title="通知设置"
      width="480px"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <ElForm ref="form" class="e-form" label-width="140px" :model="form">
        <div class="notice-setting-title">agent通知</div>
        <ElFormItem label="agent状态为离线时">
          <span class="notice-setting-label">短信通知</span>
          <ElSwitch v-model="form.connected.sms" size="mini"></ElSwitch>
          <span class="notice-setting-label">邮件通知</span>
          <ElSwitch v-model="form.connected.email" size="mini"></ElSwitch>
        </ElFormItem>
        <ElFormItem label="agent状态为运行中时">
          <span class="notice-setting-label">短信通知</span>
          <ElSwitch v-model="form.connectionInterrupted.sms" size="mini"></ElSwitch>
          <span class="notice-setting-label">邮件通知</span>
          <ElSwitch v-model="form.connectionInterrupted.email"></ElSwitch>
        </ElFormItem>
        <div class="notice-setting-title">任务运行通知</div>
        <ElFormItem label="任务运行出错时">
          <span class="notice-setting-label">短信通知</span>
          <ElSwitch v-model="form.stoppedByError.sms"></ElSwitch>
          <span class="notice-setting-label">邮件通知</span>
          <ElSwitch v-model="form.stoppedByError.email"></ElSwitch>
        </ElFormItem>
      </ElForm>
    </ElDialog>
  </section>
</template>

<script>
import { TYPEMAP } from './tyepMap'
import VIcon from '@/components/VIcon'

export default {
  components: { VIcon },
  data() {
    return {
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
        sync: '同步任务',
        migration: '迁移任务',
        dataFlow: '任务',
        agent: 'Agent',
        inspect: '校验任务',
        JobDDL: 'DDL处理'
      },
      page: {
        current: 1,
        size: 20,
        total: 0
      },
      taskFalg: false,
      dialogVisible: false,
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
    this.fetch()
    // this.getUnreadNum() //未读消息数量
    this.$root.$on('notificationUpdate', () => {
      // this.getUnreadNum() //未读消息数量
      this.fetch()
    })
  },
  watch: {
    form: {
      handler(value) {
        let data = {
          notification: value
        }
        this.$axios.patch(`tm/api/user/${this.user.id}`, data)
      },
      deep: true
    }
  },
  methods: {
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
          order: 'createTime DESC',
          limit: this.page.size,
          skip: (current - 1) * this.page.size
        }

        this.loading = true
        Promise.all([
          this.$axios.get('tm/api/Messages/count?where=' + encodeURIComponent(JSON.stringify(where))),
          this.$axios.get('tm/api/Messages?filter=' + encodeURIComponent(JSON.stringify(filter)))
        ])
          .then(([countData, data]) => {
            this.page.total = countData.count
            let list = data || []
            this.list = list.map(this.formatData)
            // if (!list.length && data.total > 0) {
            //   setTimeout(() => {
            //     this.fetch(this.page.current - 1)
            //   }, 0)
            // }
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
      item['createTime'] = item.createTime ? this.$moment(item.createTime).format('YYYY-MM-DD HH:mm:ss') : ''
      return item
    },
    handleGo(item) {
      let routeUrl = {}
      this.handleRead(item.id)
      switch (item.system) {
        case 'dataFlow':
          this.$axios
            .get('tm/api/DataFlows/' + item.sourceId)
            .then(() => {
              routeUrl = this.$router.resolve({
                path: '/monitor',
                query: { id: item.sourceId, isMoniting: true, mapping: 'cluster-clone' }
              })
              window.open(routeUrl.href, '_blank')
            })
            .catch(err => {
              if (err?.data?.msg === 'no permission') {
                this.$message.error('您的任务已不存在')
              }
            })
          // this.$router.push({
          //   name: 'job',
          //   query: {
          //     id: item.sourceId,
          //     isMoniting: true,
          //     mapping: item.mappingTemplate
          //   }
          // })
          break
        case 'migration':
          this.$axios
            .get('tm/api/DataFlows/' + item.sourceId)
            .then(() => {
              routeUrl = this.$router.resolve({
                path: '/monitor',
                query: { id: item.sourceId, isMoniting: true, mapping: 'cluster-clone' }
              })
              window.open(routeUrl.href, '_blank')
            })
            .catch(err => {
              if (err?.data?.msg === 'no permission') {
                this.$message.error('您的任务已不存在')
              }
            })
          break
        case 'agent':
          this.$router.push({
            name: 'InstanceDetails',
            query: {
              id: item.agentId
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
        let m = this.$moment.duration(lag, 'seconds')
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
    handleDelete(type) {
      let where = {}
      if (type === 'one') {
        let ids = this.multipleSelection.map(item => item.id)
        where.id = { inq: ids }
      } else {
        where = {}
      }
      let data = {
        isDeleted: true
      }
      this.$confirm('是否确认删除通知？', '删除通知', {
        type: 'warning'
      }).then(res => {
        if (res) {
          this.$axios.post('tm/api/Messages/update?where=' + encodeURIComponent(JSON.stringify(where)), data)
          this.fetch()
        }
      })
    },
    // 已读消息
    handleRead(id) {
      // let read = this.read
      this.$axios
        .patch('tm/api/Messages', {
          read: true,
          id: id
        })
        .then(res => {
          if (res) {
            // this.getUnreadNum() //未读消息数量
            this.fetch()
            // this.read = read
            this.$root.$emit('notificationUpdate')
          }
        })
    },
    // 全部已读
    handleReadNotice(type) {
      let where = {}
      if (type === 'one') {
        let ids = this.multipleSelection.map(item => item.id)
        where.id = { inq: ids }
      } else {
        where = {}
      }
      this.$axios
        .post('tm/api/Messages/update?where=' + encodeURIComponent(JSON.stringify(where)), {
          read: true
        })
        .then(res => {
          if (res) {
            // this.getUnreadNum() //未读消息数量
            this.fetch()
            // this.read = read
            this.$root.$emit('notificationUpdate')
          }
        })
    },
    // 通知设置
    handleSetting() {
      this.dialogVisible = true
    }
    // 未读消息
    // getUnreadNum() {
    //   let where = {
    //     read: false,
    //     isDeleted: {
    //       neq: true
    //     }
    //   }
    //   this.$axios.get('tm/api/Messages/count?where=' + encodeURIComponent(JSON.stringify(where))).then(res => {
    //     if (res) {
    //       this.unReadCount = res.count
    //     }
    //   })
    // }
  }
}
</script>

<style lang="scss" scoped>
$unreadColor: #ee5353;
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
    padding: 20px;
    background: #fff;
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
    .system-operation-right {
      li {
        float: right;
        .btn-refresh {
          // border-color: #409eff;
          // color: #409eff;
        }
        .border-red:focus,
        .border-red:hover {
          border-color: $unreadColor !important;
          color: $unreadColor !important;
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
        top: 13px;
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
