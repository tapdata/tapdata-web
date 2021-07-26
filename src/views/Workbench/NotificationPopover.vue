<template>
  <ElPopover placement="bottom" trigger="hover" @show="activeTab = 'system'">
    <div class="btn" slot="reference" @click="toCenter()">
      <ElBadge class="item-badge" :value="unRead" :max="99" :hidden="!unRead">
        <VIcon class="mr-2" size="17">lingdang</VIcon>
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
              <!--              <div class="unread-1zPaAXtSu"></div>-->
              <div class="list-item-desc">
                <!--                <span :style="`color: ${colorMap[item.level]};`">{{ item.level }}</span>-->
                <span>{{ systemMap[item.system] }}</span>
                <span style="color: #409eff" @click="handleGo(item)">
                  {{ item.serverName }}
                </span>
                <span>{{ typeMap[item.msg] }}</span>
                <!--              <span v-if="item.CDCTime">{{ getLag(item.CDCTime) }}</span>-->
              </div>
              <!--            <div class="list-item-time">-->
              <!--              <span>{{ item.createTime }}</span>-->
              <!--            </div>-->
            </div>
          </li>
        </ul>
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
      unRead: 0,
      loading: false,
      activeTab: 'system',
      listData: [
        {
          id: '60f9178e94e7326360d582e8',
          groupId: '45192760f91779be0f180057739639',
          read: false,
          createTime: '2021-07-22T07:27:53.916Z',
          email: 'admin@admin.com',
          level: 'ERROR',
          msg: 'encounterERRORSkipped',
          serverName: '新任务@下午2:59:28',
          sourceId: '60f91779be0f180057739639',
          system: 'migration',
          time: '2021-07-22T07:28:17.458Z',
          title: 'encounterERRORSkipped',
          userId: '5fcf01b8f89acdf892e8bf78',
          username: 'admin'
        },
        {
          id: '60f91df9be0f18005773a7f2',
          level: 'ERROR',
          system: 'migration',
          msg: 'stoppedByError',
          title: 'stoppedByError',
          serverName: '新任务@下午2:59:28',
          sourceId: '60f91779be0f180057739639',
          userId: '5fcf01b8f89acdf892e8bf78',
          email: 'admin@admin.com',
          username: 'admin',
          mappingTemplate: 'cluster-clone',
          read: false,
          time: '2021-07-22T07:27:53.916Z',
          last_updated: '2021-07-22T07:27:53.917Z',
          createTime: '2021-07-22T07:27:53.917Z'
        },
        {
          id: '60f91decbe0f18005773a7c4',
          level: 'INFO',
          system: 'migration',
          msg: 'started',
          title: 'started',
          serverName: '新任务@下午2:59:28',
          sourceId: '60f91779be0f180057739639',
          userId: '5fcf01b8f89acdf892e8bf78',
          email: 'admin@admin.com',
          username: 'admin',
          mappingTemplate: 'cluster-clone',
          read: false,
          time: '2021-07-22T07:27:40.935Z',
          last_updated: '2021-07-22T07:27:40.937Z',
          createTime: '2021-07-22T07:27:40.937Z'
        }
      ],
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
        agent: '管理端',
        inspect: '校验任务',
        JobDDL: 'DDL处理'
      },
      userOperations: []
    }
  },
  // computed: mapState({
  //   unRead: state => state.notification.unRead
  // }),
  created() {
    this.init()
  },
  methods: {
    init() {
      let msg = {
        type: 'notification'
      }
      // if (!parseInt(this.$cookie.get('isAdmin'))) {
      //   msg.userId = this.$cookie.get('user_id')
      // }
      this.getUnReadNum()
      if (this.$ws) {
        this.$ws.on('notification', data => {
          if (data.data && data.data.length > 0) {
            this.listData.unshift(...data.data)
            this.getUnReadNum()
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
        read: false
      }
      this.$axios.get('tm/api/Messages/count?where=' + encodeURIComponent(JSON.stringify(where))).then(res => {
        if (res.data) {
          this.unRead = res.data.count
          // this.$store.commit('notification', {
          //   unRead: res.data.count
          // })
        }
      })
    },
    // 已读消息
    handleRead(id) {
      this.$axios.patch('tm/api/Messages', { read: true, id: id }).then(res => {
        if (res.data) {
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
      let routeUrl = {}
      switch (item.system) {
        case 'dataFlow':
          routeUrl = this.$router.resolve({
            path: '/monitor',
            query: { id: item.sourceId, isMoniting: true, mapping: item.mappingTemplate }
          })
          window.open(routeUrl.href, '_blank')
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
          routeUrl = this.$router.resolve({
            path: '/monitor',
            query: { id: item.sourceId, isMoniting: true, mapping: 'cluster-clone' }
          })
          window.open(routeUrl.href, '_blank')
          break

        case 'agent':
          this.$router.push({
            name: 'InstanceDetails',
            query: {
              id: item.id
            }
          })
          break
      }
    },
    toCenter() {
      if (this.$route.name === 'systemNotice') {
        return
      }
      this.$router.push({ name: 'SystemNotice' })
    }
  }
}
</script>
<style lang="scss">
.btn {
  cursor: pointer;
  .item-badge {
    .el-badge__content {
      right: 18px;
      height: 15px;
      line-height: 13px;
      padding: 0 5px;
      border: none;
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
</style>
<style lang="scss" scoped>
.notification-popover-wrap {
  margin: -15px;
  width: 440px;
  overflow: hidden;
  position: relative;
  border-radius: 3px;
  .notice-header {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    height: 40px;
    line-height: 40px;
    padding: 0 25px;
    background: rgba(241, 241, 241, 1);
    border-top: 1px solid rgba(222, 222, 228, 1);
    .notice-header-text {
      display: inline-block;
      cursor: pointer;
      //color: #666;
    }
  }
  .tab-item-container {
    display: flex;
    flex-direction: column;
    height: 362px;
    overflow: hidden;
    margin-bottom: -1px;
    //.tab-list {
    //  flex: 1;
    //  overflow-y: auto;
    //}
  }
  .cuk-list {
    font-size: 12px;
    .list-item {
      position: relative;
      background: #fff;
      border-bottom: 1px solid #dedee4;
      padding-right: 5px;
      cursor: pointer;
      &:hover {
        background-color: #ecf5ff;
      }
      .list-item-content {
        position: relative;
        height: 40px;
        line-height: 40px;
        padding-left: 14px;
        box-sizing: border-box;
        overflow: hidden;
        display: block;
      }
      .unread-1zPaAXtSu {
        position: absolute;
        top: 22px;
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
        span {
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
}
</style>
