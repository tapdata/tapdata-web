<template>
  <div class="system-notification" v-loading="loading">
    <div class="notification-head pt-8 pb-4 px-6">
      <div class="title font-color-dark fs-7">系统告警</div>
    </div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="全部告警" name="first"></el-tab-pane>
      <el-tab-pane label="系统告警" name="second"></el-tab-pane>
    </el-tabs>
    <TablePage ref="table" row-key="id+indexName" class="share-list" :remoteMethod="getData">
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <div slot="operation">
        <el-button class="btn btn-create" type="primary" size="mini" :loading="loadingConfig" @click="handleSetting">
          <span>关闭</span>
        </el-button>
      </div>
      <el-table-column type="selection"></el-table-column>
      <el-table-column label="告警级别" prop="delayTime"></el-table-column>
      <el-table-column label="告警状态" prop="createTime" min-width="150" sortable> </el-table-column>
      <el-table-column label="告警对象" prop="status"></el-table-column>
      <el-table-column label="告警描述" prop="status"></el-table-column>
      <el-table-column label="告警首次发生时间" prop="createTime"></el-table-column>
      <el-table-column label="告警最近发生时间" prop="createTime"></el-table-column>
      <el-table-column fixed="right" :label="$t('column_operation')">
        <template #default="{ row }">
          <el-button type="text">关闭</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button type="text">日志</el-button>
        </template>
      </el-table-column>
    </TablePage>
  </div>
</template>

<script>
import { FilterBar } from '@tap/component'
import { makeStatusAndDisabled, TablePage } from '@tap/business'
import { notificationApi } from '@tap/api'
import { TYPEMAP } from './tyepMap'
import dayjs from 'dayjs'

export default {
  components: { TablePage, FilterBar },
  data() {
    return {
      filterItems: [],
      activeName: 'first',
      listData: [],
      read: true,
      loading: false,
      searchParams: {
        search: '',
        msg: ''
      },
      colorMap: {
        ERROR: '#D44D4D',
        WARN: '#FF7D00',
        INFO: '#2c65ff'
      },
      typeMap: TYPEMAP,
      count: ''
    }
  },
  created() {
    this.getData()
    this.getFilterItems()
    this.$root.$on('notificationUpdate', () => {
      this.getData()
    })
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  watch: {
    '$route.query'() {
      this.table.fetch(1)
    }
  },
  methods: {
    handleSetting() {
      this.$router.push({ name: 'notificationSetting' })
    },
    getData() {
      let { search, msg } = this.searchParams
      let where = {}
      if (!this.read) {
        where.read = false
      }
      if (search || search !== '') {
        where.level = search
      }
      if (msg || msg !== '') {
        where.msg = msg
      }
      let filter = {
        where,
        order: 'createTime DESC',
        limit: this.pagesize,
        skip: (this.currentPage - 1) * this.pagesize
      }
      return notificationApi.get({ filter: JSON.stringify(filter) }).then(data => {
        let list = data?.items || []
        return {
          total: data?.total || 0,
          data: list.map(item => {
            item.logTime = dayjs(item.logTime).format('YYYY-MM-DD HH:mm:ss')
            return item
          })
        }
      })
    },
    handleRead(item) {
      let read = this.read
      if (!item.read) {
        notificationApi.patch({ read: true, id: item.id }).then(() => {
          this.read = read
          this.$root.$emit('notificationUpdate')
          let msg = {
            type: 'notification'
          }
          this.$ws.ready(() => {
            this.$ws.send(msg)
          }, true)
        })
      }
    },
    // 标记本页已读
    handlePageRead() {
      let ids = []
      this.listData.map(item => {
        ids.push(item.id)
      })
      let id = {
        inq: ids
      }

      let data = {
        read: true,
        id
      }
      let read = this.read
      notificationApi.pageRead(data).then(() => {
        // this.getUnreadNum() //未读消息数量
        this.getData()
        this.read = read
        this.$root.$emit('notificationUpdate')
        let msg = {
          type: 'notification'
        }
        this.$ws.ready(() => {
          this.$ws.send(msg)
        }, true)
      })
    },

    // 标记全部已读
    handleAllRead() {
      let where = {}
      // let data = {
      //   read: true
      // }
      where = JSON.stringify(where)
      let read = this.read
      notificationApi.readAll(where).then(() => {
        // this.getUnreadNum() //未读消息数量
        this.getData()
        this.read = read
        this.$root.$emit('notificationUpdate')
        let msg = {
          type: 'notification'
        }
        this.$ws.ready(() => {
          this.$ws.send(msg)
        }, true)
      })
    },
    handleClick(tab) {
      this.currentPage = 1
      if (tab.name === 'first') {
        this.read = true // 全部信息
      } else {
        this.read = false //未读
      }
      this.getData()
    },
    getFilterItems() {
      this.filterItems = [
        {
          label: '告警状态',
          key: 'search',
          type: 'select-inner',
          items: this.options,
          selectedWidth: '200px'
        },
        {
          label: '告警时间',
          key: 'msg',
          type: 'select-inner',
          items: this.msgOptions
        },
        {
          key: 'keyword',
          type: 'input'
        }
      ]
    }
  }
}
</script>

<style scoped lang="scss">
.system-notification {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  font-size: 12px;
  .notification-head {
    .title {
      font-weight: bold;
    }
    .search {
      margin-top: 10px;
      margin-right: 10px;
      width: 200px;
    }
  }
}
</style>
<style lang="scss">
.system-notification {
  .el-tabs {
    position: relative;
    .el-tabs__header {
      padding: 0 24px;
    }
    .el-tabs__content {
      overflow: initial;
      .operation {
        position: absolute;
        top: -55px;
        right: 24px;
      }
    }
  }
  .el-tabs__item {
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-weight: 400;
    &.is-active {
      font-weight: 500;
    }
  }
  .table-page-container .table-page-body {
    padding-top: 0;
  }
}
</style>
