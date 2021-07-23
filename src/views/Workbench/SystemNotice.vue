<template>
  <section class="system-notice main-containe" v-if="$route.name === 'SystemNotice'">
    <header class="system-header">系统通知</header>
    <div class="main">
      <div class="system-operation">
        <div class="system-operation-left">通知列表</div>
        <div class="system-operation-right">
          <ul>
            <li class="ml-3">
              <ElButton plain class="btn-refresh" @click="handleDelete('one')" :disabled="multipleSelection.length < 1">
                删除
              </ElButton>
            </li>
            <li class="ml-3">
              <ElButton plain class="btn-refresh" @click="handleDelete('all')"> 全部删除 </ElButton>
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
            <div class="list-item-desc">
              <div class="list-item-desc">
                <span :style="`color: ${colorMap[scope.row.level]};`">【{{ scope.row.level }}】</span>
                <span>{{ systemMap[scope.row.system] }}</span>
                <span style="color: #409eff; cursor: pointer" @click="handleGo(scope.row)">
                  {{ scope.row.serverName }}
                </span>
                <span>{{ typeMap[scope.row.msg] }}</span>
                <span v-if="scope.row.CDCTime">{{ getLag(scope.row.CDCTime) }}</span>
                <span v-if="scope.row.restDay">{{ scope.row.restDay }} 天</span>
              </div>
              <!--              <div class="list-item-time">-->
              <!--                <span>{{ scope.row.createTime }}</span>-->
              <!--              </div>-->
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn show-overflow-tooltip label="通知时间" prop="createTime" width="150"></ElTableColumn>
        <div class="connection-table__empty" slot="empty">
          <i class="el-icon-folder-opened"></i>
          <span class="ml-1" v-if="!isSearching">暂无数据</span>
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
  </section>
</template>

<script>
import { delayTrigger } from '../../util'
import { TYPEMAP } from './tyepMap'

export default {
  data() {
    return {
      list: [],
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
        agent: '管理端',
        inspect: '校验任务',
        JobDDL: 'DDL处理'
      },
      page: {
        current: 1,
        size: 20,
        total: 0
      }
    }
  },
  created() {
    this.fetch()
  },
  methods: {
    fetch(pageNum, debounce) {
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
      debugger
      switch (item.system) {
        case 'dataFlow':
          routeUrl = this.$router.resolve({
            path: '/monitor',
            query: { id: item.sourceId, isMoniting: true, mapping: 'cluster-clone' }
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
    // 选择分类
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 删除消息
    handleDelete(type) {
      let where = []
      if (type === 'one') {
        let ids = this.multipleSelection.map(item => item.id)
        where.id = { in: ids }
      } else {
        where = {}
      }
      this.$axios.post('tm/api/Messages/upsertWithWhere?where=' + encodeURIComponent(JSON.stringify(where)), {
        isDeleted: true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
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
    }
    .system-operation-right {
      li {
        float: right;
      }
    }
  }
}
</style>
