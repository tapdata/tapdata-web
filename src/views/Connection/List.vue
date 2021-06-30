<template>
  <section class="connection-wrapper main-container" v-loading="loading" v-if="$route.name === 'Connection'">
    <div class="main">
      <div class="connection-operation">
        <div class="connection-operation-left">
          <ul>
            <li>
              <ElSelect v-model="searchParams.status" @input="search()">
                <ElOption label="全部状态" value=""></ElOption>
                <ElOption v-for="(opt, value) in statusMap" :key="value" :label="opt.text" :value="value"></ElOption>
              </ElSelect>
            </li>
            <li class="ml-3">
              <ElInput v-model="searchParams.keyword" placeholder="按连接名搜索" @input="search()">
                <i slot="prefix" class="iconfont td-icon-sousuo el-input__icon"></i>
              </ElInput>
            </li>
            <li class="ml-3">
              <ElButton plain class="btn-refresh" @click="fetch()">
                <i class="iconfont td-icon-shuaxin"></i>
              </ElButton>
            </li>
          </ul>
        </div>
        <div class="connection-operation-right">
          <ElButton type="primary" @click="create">
            <i class="iconfont td-icon-dinggou" style="margin-right: 5px;"></i>
            <span>创建连接</span>
          </ElButton>
        </div>
      </div>
      <El-table
        class="connection-table  table-border"
        style="margin-top: 10px;"
        height="100%"
        :data="list"
        @sort-change="sortChange"
      >
        <ElTableColumn label="连接名" prop="name" min-width="150">
          <template slot-scope="scope">
            <div class="flex flex-row align-center p-2">
              <img
                class="mr-2"
                style="width: 24px;height: 24px;"
                :src="
                  require('tapdata-web-core/assets/images/connection-type/' +
                    scope.row.database_type.toLowerCase() +
                    '.png')
                "
              />
              <ElLink
                type="primary"
                style="display: block; line-height: 20px"
                @click="preview(scope.row.id, scope.row.database_type)"
              >
                {{ scope.row.name }}
              </ElLink>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn show-overflow-tooltip label="连接信息" prop="database_uri" min-width="150"></ElTableColumn>
        <ElTableColumn label="状态">
          <template slot-scope="scope">
            <StatusTag type="text" target="connection" :status="scope.row.status"></StatusTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="连接类型">
          <template slot-scope="scope">{{
            {
              source: '源头',
              target: '目标',
              source_and_target: '源头和目标'
            }[scope.row.connection_type]
          }}</template>
        </ElTableColumn>
        <ElTableColumn label="修改时间" prop="lastUpdateTime" width="180" sortable="custom">
          <template slot-scope="scope">{{ $moment(scope.row.lastUpdateTime).format('YYYY-MM-DD HH:mm:ss') }}</template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="180">
          <template slot-scope="scope">
            <ElLink type="primary" class="mr-2" @click="test(scope.row)">连接测试</ElLink>
            <ElLink type="primary" class="mr-2" @click="edit(scope.row)">编辑</ElLink>
            <ElLink type="primary" class="mr-2" @click="copy(scope.row)">复制</ElLink>
            <ElLink type="danger" @click="del(scope.row)">删除</ElLink>
          </template>
        </ElTableColumn>
        <div class="connection-table__empty" slot="empty">
          <i class="el-icon-folder-opened"></i>
          <span class="ml-1" v-if="!isSearching">暂无数据</span>
          <span v-else> 没有查到符合条件的结果，<ElLink type="primary" @click="reset">返回列表</ElLink> </span>
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
      <ConnectionTest ref="test" @recieve="recieveTestData"></ConnectionTest>
      <Preview ref="preview"></Preview>
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
  }
  .connection-table__empty {
    color: map-get($fontColor, light);
  }
}
</style>
<script>
import { delayTrigger, toRegExp } from '../../util'
import { CONNECTION_STATUS_MAP, SUPPORT_DB } from '../../const'
import StatusTag from '../../components/StatusTag'
import Preview from './Preview.vue'

export default {
  components: { StatusTag, Preview },
  data() {
    return {
      loading: true,
      searchParams: {
        status: '',
        keyword: ''
      },

      list: [],
      page: {
        current: 0,
        size: 10,
        total: 0
      },
      order: 'createAt desc',

      statusMap: CONNECTION_STATUS_MAP,
      whiteList: SUPPORT_DB
    }
  },
  computed: {
    isSearching() {
      return !!Object.values(this.searchParams).join('')
    }
  },
  watch: {
    '$route.query'(query) {
      this.searchParams = Object.assign(this.searchParams, query)
      this.fetch(1)
    }
  },
  created() {
    let query = this.$route.query
    this.searchParams = Object.assign(this.searchParams, query)
    this.fetch()
  },
  methods: {
    search() {
      this.$router.replace({
        name: 'Connection',
        query: this.searchParams
      })
    },
    fetch(pageNum, debounce) {
      delayTrigger(() => {
        this.loading = true
        let current = pageNum || this.page.current
        let { keyword, status } = this.searchParams
        let fields = {
          name: true,
          user_id: true,
          connection_type: true,
          database_type: true,
          search_databaseType: true,
          database_host: true,
          database_uri: true,
          database_username: true,
          database_port: true,
          database_name: true,
          sourceType: true,
          status: true,
          id: true,
          listtags: true,
          tableCount: true,
          loadCount: true,
          loadFieldsStatus: true,
          schemaAutoUpdate: true,
          platformInfo: true,
          last_updated: true,
          additionalString: true,
          database_password: true,
          fill: true,
          sslCert: true,
          ssl: true,
          sslCAFile: true,
          sslPass: true,
          sslKeyFile: true,
          sslKey: true,
          sslValidate: false,
          sslCA: true //MongoDB
        }
        let where = {}
        if (keyword && keyword.trim()) {
          where.name = { like: toRegExp(keyword), options: 'i' }
        }
        status && (where.status = status)
        let filter = {
          fields,
          where,
          limit: this.page.size,
          skip: (current - 1) * this.page.size,
          sort: [this.order]
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
      }, debounce)
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
      this.$emit('select-connection-type')
    },
    edit(item) {
      this.$router.push({
        path: `connection/${item.id}?databaseType=${item.search_databaseType || item.database_type}`
      })
    },
    async copy(item) {
      try {
        await this.$axios.post(`tm/api/Connections/${item.id}/copy`, {
          uri: `${item.id}/copy`,
          headers: { 'lconname-name': item.name }
        })
        this.fetch()
        this.$message.success('复制成功')
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
            this.$message.success('删除成功')
          } catch (error) {
            this.$message.error(error?.response.msg || '删除失败')
          }
        }
      })
    },
    test(item) {
      this.$checkAgentStatus(async () => {
        let loading = this.$loading()
        let data = Object.assign(
          {},
          {
            id: '',
            name: '',
            database_type: '',
            connection_type: '',
            database_host: '',
            database_port: '',
            database_name: '',
            database_username: '',
            database_password: '',
            plain_password: '',
            table_filter: '',
            additionalString: '',
            thin_type: '',
            database_owner: '',
            node_name: '',
            database_schema: '',
            plugin_name: '',
            pgsql_log_decorder_plugin_name: '',
            database_datetype_without_timezone: '',
            supportUpdatePk: false,
            isUrl: true,
            database_uri: '',
            ssl: false,
            sslKey: '',
            sslPass: '',
            schemaAutoUpdate: false,
            multiTenant: false,
            pdb: '',
            sslValidate: false,
            sslCA: '',
            sslCAFile: null,
            sslKeyFile: null,
            search_databaseType: '',
            increamentalTps: 100, //dummy
            initialReadSize: 100000, //dummy
            schema: ''
          },
          item
        )
        if (['gridfs', 'mongodb'].includes(item.database_type)) {
          data.database_uri = ''
          data.isUrl = true
          data.justTest = true
        }
        if (item.database_type !== 'redis') {
          delete data['database_password']
        }
        try {
          await this.$axios.patch(`tm/api/Connections/${item.id}`, {
            status: 'testing'
          })
          this.$refs.test.start(data)
          this.fetch()
        } catch (error) {
          this.$message.error(error?.response?.msg || '测试连接失败')
        }
        loading.close()
      })
    },
    recieveTestData(data) {
      if (!data.status || data.status === null) return
      let status = data.status
      if (status === 'ready') {
        this.$message.success('连接测试有效')
      } else {
        this.$message.error('连接测试无效')
      }
      this.fetch()
    },
    preview(id, type) {
      this.$refs.preview.open(id, type)
    }
  }
}
</script>
