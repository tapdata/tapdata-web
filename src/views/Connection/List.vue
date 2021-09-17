<template>
  <section class="connection-wrapper main-container" v-loading="loading" v-if="$route.name === 'Connection'">
    <div class="main">
      <div class="connection-operation">
        <div class="connection-operation-left">
          <el-form inline @submit.native.prevent>
            <el-form-item label="全部状态 :" width="300px">
              <el-select v-model="searchParams.status" @input="search()">
                <el-option :label="$t('gl_placeholder_select')" value="" class="select-all"></el-option>
                <el-option v-for="(opt, value) in statusMap" :key="value" :label="opt.text" :value="value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="按连接名搜索 : " class="ml-2">
              <el-input
                width="200"
                v-model="searchParams.keyword"
                @input="search(800)"
                :placeholder="$t('gl_placeholder_input')"
              >
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button plain class="btn-refresh" @click="fetch()">
                <VIcon>refresh</VIcon>
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="connection-operation-right">
          <ElButton type="primary" @click="create">
            <span>创建连接</span>
          </ElButton>
        </div>
      </div>
      <ElTable
        class="connection-table table-border"
        style="margin-top: 10px"
        height="100%"
        :data="list"
        @sort-change="sortChange"
      >
        <ElTableColumn label="连接名" prop="name" min-width="200px">
          <template slot-scope="scope">
            <div class="flex flex-row align-items-center p-2">
              <img
                class="mr-2"
                style="width: 24px; height: 24px"
                :src="
                  require('web-core/assets/images/connection-type/' + scope.row.database_type.toLowerCase() + '.png')
                "
              />
              <ElLink
                type="primary"
                style="display: block; line-height: 20px"
                @click="preview(scope.row.id, scope.row.database_type)"
              >
                {{ scope.row.name }}
              </ElLink>
              <div class="flex align-items-center">
                <span v-if="scope.row.agentType === 'Cloud'" class="agent-cloud ml-3 px-2">仅供测试使用</span>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="120">
          <template slot-scope="scope">
            <StatusTag type="text" target="connection" :status="scope.row.status"></StatusTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="连接类型" width="120">
          <template slot-scope="scope">{{
            {
              source: '源头',
              target: '目标',
              source_and_target: '源头和目标'
            }[scope.row.connection_type]
          }}</template>
        </ElTableColumn>
        <ElTableColumn width="180">
          <div slot="header">
            {{ $t('connection_list_column_schema_status') }}
            <ElTooltip placement="top" :content="$t('connection_list_column_schema_status_tips')">
              <VIcon>question-circle</VIcon>
            </ElTooltip>
          </div>
          <template slot-scope="scope">
            <SchemaProgress :data="scope.row"></SchemaProgress>
          </template>
        </ElTableColumn>
        <ElTableColumn label="修改时间" prop="last_updated" width="150" sortable="custom">
          <template slot-scope="scope">{{ $moment(scope.row.last_updated).format('YYYY-MM-DD HH:mm:ss') }}</template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="280">
          <template slot-scope="scope">
            <div class="operate-columns">
              <el-button size="mini" type="text" @click="testConnection(scope.row)">连接测试</el-button>
              <el-divider direction="vertical"></el-divider>
              <el-button type="text" :disabled="scope.row.agentType === 'Cloud'" @click="edit(scope.row)"
                >编辑</el-button
              >
              <el-divider direction="vertical"></el-divider>
              <el-button type="text" :disabled="scope.row.agentType === 'Cloud'" @click="copy(scope.row)"
                >复制</el-button
              >
              <el-divider direction="vertical"></el-divider>
              <el-button type="text" @click="del(scope.row)">删除</el-button>
            </div>
          </template>
        </ElTableColumn>
        <div class="connection-table__empty" slot="empty">
          <VIcon>folder-opened</VIcon>
          <span class="ml-1" v-if="!isSearching">暂无数据</span>
          <span v-else> 没有查到符合条件的结果，<ElLink type="primary" @click="reset">返回列表</ElLink> </span>
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
      <!-- 连接测试 -->
      <ConnectionTest ref="test"></ConnectionTest>
      <Preview ref="preview" @close="fetch()"></Preview>
    </div>
  </section>
  <RouterView v-else></RouterView>
</template>
<style lang="scss" scoped>
.connection-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    font-size: 16px;
  }
  .main {
    padding: 20px;
    background: #fff;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .connection-operation {
    display: flex;
    justify-content: space-between;
    .connection-operation-left {
      li {
        float: left;
      }
    }
  }
  .connection-table {
    flex: 1;
    overflow: auto;
    border-bottom: none;
    .agent-link {
      color: unset;
      cursor: unset;
    }
    .agent-cloud {
      color: #10c038;
      border-color: #10c038;
      background-color: #dbefd1;
    }
    .operate-columns {
      line-height: 14px;
      .el-button {
        padding: 0;
        & + .el-button {
          margin: 0;
        }
      }
      .el-divider {
        margin: 0 16px;
      }
    }
  }
  .connection-table__empty {
    color: map-get($fontColor, light);
  }
}
</style>
<script>
import { CONNECTION_STATUS_MAP, SUPPORT_DB } from '../../const'
import StatusTag from '../../components/StatusTag'
import SchemaProgress from 'web-core/components/SchemaProgress'
import Preview from './Preview.vue'
import VIcon from '@/components/VIcon'
let timer = null
export default {
  components: { StatusTag, Preview, VIcon, SchemaProgress },
  data() {
    return {
      loading: true,
      searchParams: {
        status: '',
        keyword: ''
      },
      list: [],
      page: {
        current: 1,
        size: 10,
        total: 0
      },
      order: 'createTime desc',
      statusMap: CONNECTION_STATUS_MAP,
      whiteList: SUPPORT_DB,
      showDetails: false
    }
  },
  computed: {
    isSearching() {
      return !!Object.values(this.searchParams).join('')
    }
  },
  watch: {
    $route(route) {
      if (route.name === 'Connection') {
        let query = route.query
        this.searchParams = Object.assign(this.searchParams, query)
        let pageNum = JSON.stringify(query) === '{}' ? undefined : 1
        this.fetch(pageNum)
      }
    }
  },
  created() {
    let query = this.$route.query
    this.searchParams = Object.assign(this.searchParams, query)
    this.fetch()
    timer = setInterval(() => {
      let list = this.list || []
      let ids = []
      list.forEach(item => {
        if (['testing'].includes(item.status) || ['loading'].includes(item.loadFieldsStatus)) {
          ids.push(item.id)
        }
      })
      if (ids.length && this.$route.name === 'Connection') {
        this.updateStatusByIds(ids)
      }
    }, 5000)
  },
  mounted() {
    if (this.$route.query?.action === 'create') {
      this.clearRouter()
      this.create()
    }
  },
  beforeDestroy() {
    clearInterval(timer)
    timer = null
  },
  methods: {
    async updateStatusByIds(ids) {
      let fields = {
        id: true,
        name: true,
        status: true,
        loadFieldsStatus: true,
        loadCount: true,
        tableCount: true,
        loadFieldErrMsg: true
      }
      let filter = {
        fields,
        where: {
          id: {
            $inq: ids
          }
        }
      }
      let data = await this.$axios.get('tm/api/Connections?filter=' + encodeURIComponent(JSON.stringify(filter)))
      let changeList = data || []
      let statusMap = {}
      changeList.forEach(item => {
        statusMap[item.id] = this.formatData(item)
      })
      let list = this.list || []
      list.forEach(item => {
        let changeParams = statusMap[item.id]
        if (changeParams) {
          Object.assign(item, changeParams)
        }
      })
    },
    // 清除路由
    clearRouter() {
      this.$router.replace({
        name: 'Connection'
      })
    },
    search(debounce) {
      const { delayTrigger } = this.$util
      delayTrigger(() => {
        this.$router.replace({
          name: 'Connection',
          query: this.searchParams
        })
      }, debounce)
    },
    fetch(pageNum) {
      const { toRegExp } = this.$util
      this.loading = true
      let current = pageNum || this.page.current
      let { keyword, status } = this.searchParams
      let where = {}
      if (keyword && keyword.trim()) {
        where.name = { like: toRegExp(keyword), options: 'i' }
      }
      status && (where.status = status)
      let filter = {
        // fields, noSchema:1 不加载schema
        noSchema: 1,
        where,
        limit: this.page.size,
        skip: (current - 1) * this.page.size,
        order: this.order
      }
      Promise.all([
        this.$axios.get('tm/api/Connections/count?where=' + encodeURIComponent(JSON.stringify(where))),
        this.$axios.get('tm/api/Connections?filter=' + encodeURIComponent(JSON.stringify(filter)))
      ])
        .then(([countData, data]) => {
          this.page.total = countData.count
          let list = data || []
          this.list = list.map(this.formatData)
          if (!list.length && data.total > 0) {
            setTimeout(() => {
              this.fetch(this.page.current - 1)
            }, 0)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    formatData(item) {
      let statusInfo = this.statusMap[item.status] || {}
      item.statusText = statusInfo.text || ''
      item.statusIcon = statusInfo.icon || ''
      return item
    },
    sortChange({ prop, order }) {
      this.order = `${order ? prop : 'createTime'} ${order === 'ascending' ? 'asc' : 'desc'}`
      this.fetch(1)
    },
    reset() {
      this.searchParams = {
        status: '',
        keyword: ''
      }
      this.fetch(1)
    },
    create() {
      this.$root.$emit('select-connection-type')
    },
    edit(item) {
      if (item.agentType === 'Cloud') {
        return
      }
      this.$router.push({
        path: `connection/${item.id}?databaseType=${item.search_databaseType || item.database_type}`
      })
    },
    async copy(item) {
      if (item.agentType === 'Cloud') {
        return
      }
      try {
        let data = await this.$axios.post(`tm/api/Connections/${item.id}/copy`, {
          uri: `${item.id}/copy`,
          headers: { 'lconname-name': item.name }
        })
        this.fetch()
        this.$message.success('复制成功')
        this.test(data?.result, false)
      } catch (error) {
        if (error?.response?.msg === 'duplicate source') {
          this.$message.success('复制失败，原因：系统设置中 "连接设置 - 允许创建重复数据源" 被设置为 "false"')
        }
      }
    },
    del(item) {
      let msg = `<p>删除连接 <span>${item.name}</span> 后，此连接将无法恢复</p>`
      this.$confirm(msg, '是否删除该连接？', {
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(async resFlag => {
        if (resFlag) {
          try {
            await this.$axios.delete(`tm/api/Connections/${item.id}?name=${item.name}`)
            if (item.agentType === 'Cloud') {
              // 释放资源
              this.$axios
                .post('api/tcm/connection/delete', {
                  type: item.connection_type,
                  databaseType: item.database_type
                })
                .then(() => {
                  this.$message.success('删除成功')
                  this.fetch()
                })
            } else {
              this.$message.success('删除成功')
              this.fetch()
            }
          } catch (error) {
            // 删除失败
            let errorTip = '删除失败'
            if (error?.data?.msg) {
              let { dataFlows, jobs, modules } = error?.data?.msg
              if ([...dataFlows, ...jobs, ...modules].length > 0) {
                errorTip = '此连接被任务所占用，无法删除'
              }
            }
            this.$message.error(errorTip)
          }
        }
      })
    },
    testConnection(item) {
      this.$checkAgentStatus(async () => {
        let loading = this.$loading()
        this.test(item)
        loading.close()
      })
    },
    async test(data, isShowDialog = true) {
      if (['gridfs', 'mongodb'].includes(data.database_type)) {
        delete data.database_uri
        data.justTest = true
      }
      if (data.database_type !== 'redis') {
        delete data['database_password']
      }
      try {
        await this.$axios.patch(`tm/api/Connections/${data.id}`, {
          status: 'testing'
        })
        this.$refs.test.start(data, isShowDialog)
        this.fetch()
      } catch (error) {
        this.$message.error(error?.response?.msg || '测试连接失败')
      }
    },
    loadDetailsData(data) {
      if (this.selectedRow?.id) {
        return
      }
      this.selectedRow = data
    },
    detailsClosedFnc() {
      this.showDetails = false
      this.$router.replace({
        name: 'Instance',
        query: this.searchParams
      })
    },
    preview(id, type) {
      this.$refs.preview.open(id, type)
    }
  }
}
</script>
