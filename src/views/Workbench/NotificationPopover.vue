<template>
  <ElPopover placement="bottom" popper-class="notive-popove" trigger="hover" @show="activeTab = 'system'">
    <div class="btn" slot="reference" @click="toCenter()">
      <ElBadge class="item-badge" :value="unRead" :max="99" :hidden="!unRead">
        <VIcon class="mr-2" size="17">lingdang</VIcon>
        <span>通知</span>
      </ElBadge>
    </div>
    <div class="notification-popover-wrap">
      <div class="tab-item-container">
        <div class="notice-header">
          <span> 通知内容 </span>
          <span class="notice-header-text">
            <ElLink type="primary" @click="toCenter()">查看所有通知</ElLink>
            <!--            <router-link to="/systemNotice">-->
            <!--              <span></span>-->
            <!--            </router-link>-->
          </span>
        </div>
        <ul class="tab-list cuk-list">
          <li class="list-item" v-for="(item, index) in listData" :key="index" @click="handleRead(item.id)">
            <div class="list-item-content">
              <div class="unread-1zPaAXtSu"></div>
              <div class="list-item-desc">
                <!--                <span :style="`color: ${colorMap[item.level]};`">{{ item.level }}</span>-->
                <span>您的{{ systemMap[item.system] }}:</span>
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
          <span>暂无通知</span>
        </div>
      </div>
    </div>
  </ElPopover>
</template>

<script>
// import ws from '../../api/ws'
import { TYPEMAP } from './tyepMap'
import VIcon from '@/components/VIcon'
// import { mapState } from 'vuex'

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
        sync: '同步任务',
        migration: '迁移任务',
        dataFlow: '任务',
        agent: 'Agent',
        inspect: '校验任务',
        JobDDL: 'DDL处理'
      },
      userOperations: []
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
      // msg.userId = this.$cookie.get('user_id')

      // this.getUnReadNum()
      if (this.$ws) {
        this.$ws.on('notification', data => {
          if (data.data && data.data.length > 0) {
            this.listData.unshift(...data.data)
            this.getUnReadNum()
          } else {
            this.unRead = 0
          }
          //格式化日期
          if (this.listData && this.listData.length > 0) {
            this.listData.map(item => {
              item['createTime'] = item.createTime ? this.$moment(item.createTime).format('YYYY-MM-DD HH:mm:ss') : ''
            })
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
        read: false,
        isDeleted: {
          neq: true
        }
      }
      this.$axios.get('tm/api/Messages/count?where=' + encodeURIComponent(JSON.stringify(where))).then(res => {
        if (res) {
          this.unRead = res.count
          // this.$store.commit('notification', {
          //   unRead: res.data.count
          // })
        }
      })
    },
    // 已读消息
    handleRead(id) {
      this.$axios.patch('tm/api/Messages', { read: true, id: id }).then(res => {
        if (res) {
          this.listData = []
          this.$root.$emit('notificationUpdate')
        }
      })
    },
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
                this.$message.error('您的任务已不存在')
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
                this.$message.error('您的任务已不存在')
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
    getTaskData(id) {
      this.$axios.get('tm/api/DataFlows?id=' + id).then(res => {
        if (res) {
          debugger
        }
      })
    },
    toCenter() {
      if (this.$route.name === 'SystemNotice') {
        return
      }
      this.$router.push({ name: 'SystemNotice' })
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
        right: 30px;
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
      padding: 0 25px;
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
      padding: 0 12px;
      overflow: hidden;
      margin-bottom: -1px;
      //.tab-list {
      //  flex: 1;
      //  overflow-y: auto;
      //}
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
