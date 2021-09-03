<template>
  <section class="modules-list-wrap">
    <TablePage
      ref="table"
      row-key="id"
      class="modules-list"
      :title="$t('app.menu.' + $route.name)"
      :classify="{
        authority: 'API_category_management',
        types: ['api']
      }"
      :remoteMethod="getData"
      @selection-change="handleSelectionChange"
      @classify-submit="handleOperationClassify"
      @sort-change="handleSortTable"
    >
      <div slot="search">
        <ul class="search-bar">
          <li>
            <el-input
              clearable
              class="input-with-select"
              size="mini"
              v-model="searchParams.keyword"
              :placeholder="$t('metadata.namePlaceholder')"
              @input="table.fetch(1, 800)"
            >
              <el-select v-model="searchParams.isFuzzy" style="width: 120px" slot="prepend" @input="table.fetch(1)">
                <el-option :label="$t('connection.fuzzyQuery')" :value="true"></el-option>
                <el-option :label="$t('connection.PreciseQuery')" :value="false"></el-option>
              </el-select>
            </el-input>
          </li>
          <li>
            <el-select
              v-model="searchParams.status"
              clearable
              size="mini"
              :placeholder="$t('metadata.typePlaceholder')"
              @input="statusChange"
            >
              <el-option v-for="opt in statusList" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
            </el-select>
          </li>
          <template v-if="searchParams.keyword || searchParams.status">
            <li>
              <el-button size="mini" type="text" @click="reset()">{{ $t('button.query') }}</el-button>
            </li>
            <li>
              <el-button size="mini" type="text" @click="reset('reset')">{{ $t('button.reset') }}</el-button>
            </li>
          </template>
          <li v-if="status">
            {{ $t('modules.apiServerStatus') }}:
            <span class="status-text" :class="status">{{ $t('modules_status_' + status) }}</span>
          </li>
        </ul>
      </div>
      <div slot="operation">
        <el-button size="mini" v-if="selectedStopped.length" @click="batch('active')">{{
          $t('modules_allarelease')
        }}</el-button>

        <el-button size="mini" v-if="selectedRunning.length" @click="batch('pending')">{{
          $t('modules_allacancel')
        }}</el-button>
        <el-button size="mini" @click.native="exportFile">{{ $t('modules_export') }}</el-button>
        <el-button size="mini" @click.native="importFile">{{ $t('modules_import') }}</el-button>
        <el-button
          v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
          v-show="multipleSelection.length > 0"
          v-readonlybtn="'data_catalog_category_application'"
          size="mini"
          class="btn"
          @click="$refs.table.showClassify(handleSelectTag())"
        >
          <i class="iconfont icon-biaoqian back-btn-icon"></i>
          <span> {{ $t('dataFlow.taskBulkTag') }}</span>
        </el-button>
        <el-button v-readonlybtn="'API_creation'" class="btn btn-create" size="mini" @click="openCreateDialog">
          <i class="iconfont icon-jia add-btn-icon"></i>
          <span>{{ $t('modules_create') }}</span>
        </el-button>
      </div>
      <el-table-column
        v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
        type="selection"
        width="45"
        :reserve-selection="true"
      >
      </el-table-column>
      <el-table-column :label="$t('modules_header_api_name')" prop="name" sortable="name"></el-table-column>
      <el-table-column :label="$t('modules_header_tablename')" prop="tablename" sortable="tablename"> </el-table-column>
      <el-table-column :label="$t('modules_header_dataSource')" prop="connection" sortable="connection">
        <template slot-scope="scope" v-if="scope.row.source">
          <span
            @click.stop="dataSourceFn(scope.row)"
            :title="scope.row.source.name"
            style="cursor: pointer; color: #1976d2"
            >{{ scope.row.source.name }}({{
              $t('modules_status_' + (scope.row.source && scope.row.source.status))
            }})</span
          >
        </template>
      </el-table-column>
      <el-table-column :label="$t('modules_header_status')" prop="status" sortable="status">
        <template slot-scope="scope">
          <span>{{ $t('modules_' + scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('modules_header_basePath')" prop="basePath" sortable="basePath"> </el-table-column>
      <el-table-column :label="$t('modules_header_version')" prop="version" sortable="custom"> </el-table-column>
      <el-table-column :label="$t('modules_header_classifications')" prop="classifications" sortable="classifications">
        <template slot-scope="scope" v-if="scope.row.listtags">
          <div v-for="item in scope.row.listtags" :key="item.value">{{ item.value }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('modules_header_username')" prop="user" sortable="user"> </el-table-column>
      <el-table-column :label="$t('modules_header_last_updated')" prop="last_updated" sortable="custom">
        <template slot-scope="scope">
          {{ $moment(scope.row.last_updated).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('modules_header_operator')" width="390">
        <template slot-scope="scope">
          <el-button v-readonlybtn="'API_creation'" size="mini" type="text" @click="copy(scope.row)">
            {{ $t('button_copy') }}
          </el-button>
          <el-button v-readonlybtn="'API_data_explorer'" size="mini" type="text" @click="toDetails(scope.row)">
            {{ $t('button_preview') }}
          </el-button>
          <el-button
            v-readonlybtn="'API_doc_&_test'"
            v-if="scope.row.status === 'active'"
            size="mini"
            type="text"
            @click="toDocumentTest(scope.row)"
          >
            {{ $t('modules_api_test') }}
          </el-button>
          <el-button
            v-readonlybtn="'API_publish'"
            v-if="scope.row.status === 'pending'"
            size="mini"
            type="text"
            :disabled="$disabledByPermission('API_publish_all_data', scope.row.user_id)"
            @click="publish(scope.row)"
          >
            {{ $t('modules_publish_api') }}
          </el-button>
          <el-button
            v-else
            v-readonlybtn="'API_publish'"
            size="mini"
            type="text"
            :disabled="$disabledByPermission('API_publish_all_data', scope.row.user_id)"
            @click="unpublish(scope.row)"
          >
            {{ $t('modules_unpublish_api') }}
          </el-button>
          <el-button v-readonlybtn="'API_edition'" size="mini" type="text" @click="edit(scope.row)">
            {{ $t('modules_edit') }}
          </el-button>
          <el-button v-readonlybtn="'API_export'" size="mini" type="text" @click="handleDownload(scope.row)">
            {{ $t('modules_export') }}
          </el-button>
          <el-button
            v-readonlybtn="'API_delete'"
            size="mini"
            type="text"
            :disabled="$disabledByPermission('API_delete_all_data', scope.row.user_id)"
            @click="remove(scope.row)"
            >{{ $t('button_delete') }}</el-button
          >
        </template>
      </el-table-column>
    </TablePage>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'
import { toRegExp } from '@/utils/util'

export default {
  name: 'Modules',
  components: {
    TablePage
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        isFuzzy: true,
        status: 'all'
      },
      order: 'tablename DESC',
      status: '',
      dbOptions: [],
      statusList: [
        {
          label: this.$t('modules.all'),
          value: 'all'
        },
        {
          label: this.$t('modules.active'),
          value: 'active'
        },
        {
          label: this.$t('modules.pending'),
          value: 'pending'
        }
      ],
      multipleSelection: [],
      intervalId: 0
    }
  },
  created() {
    // this.getDbOptions()
    this.getWorkers()
  },
  mounted() {
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
    let cache = this.table.getCache()
    cache.isFuzzy = cache.isFuzzy === true
    this.searchParams = cache
  },
  computed: {
    table() {
      return this.$refs.table
    },
    selectedRunning() {
      return this.multipleSelection.filter(v => v.status === 'active')
    },
    selectedStopped() {
      return this.multipleSelection.filter(v => v.status === 'pending' || v.status === 'error' || v.status === 'draft')
    }
  },
  methods: {
    // 重置查询条件
    reset(name) {
      if (name === 'reset') {
        this.searchParams = {
          keyword: '',
          isFuzzy: true,
          status: ''
        }
      }
      this.table.fetch(1)
    },
    // 获取数据
    getData({ page, tags }) {
      let { current, size } = page
      let { isFuzzy, keyword, status } = this.searchParams
      let where = {}
      let fields = {
        apiVersion: true,
        basePath: true,
        connection: true,
        datasource: true,
        description: true,
        id: true,
        status: true,
        tablename: true,
        user_id: true,
        last_updated: true,
        listtags: true,
        name: true,
        'source._id': true,
        'source.user_id': true
      }
      if (keyword && keyword.trim()) {
        let filterObj = isFuzzy ? { like: toRegExp(keyword), options: 'i' } : keyword
        where.or = [{ basePath: filterObj }, { description: filterObj }]
      }

      if (tags && tags.length) {
        where['listtags.id'] = {
          in: tags
        }
      }
      let filter = {
        order: this.order,
        limit: size,
        fields: fields,
        skip: (current - 1) * size,
        where
      }
      return Promise.all([
        this.$api('modules').count({ where: JSON.stringify(where) }),
        this.$api('modules').get({
          filter: JSON.stringify(filter)
        })
      ]).then(([countRes, res]) => {
        this.table.setCache({
          isFuzzy,
          keyword,
          status
        })
        return {
          total: countRes.data.count,
          data: res.data
        }
      })
    },
    // 获取状态
    getWorkers() {
      let where = {
        worker_type: 'api-server',
        ping_time: {
          gte: '$serverDate',
          gte_offset: 30000
        }
      }
      let filter = {
        order: 'ping_time DESC',
        limit: 1,
        fields: {
          worker_status: true
        },
        where
      }
      this.$api('Workers')
        .get(filter)
        .then(res => {
          if (res) {
            let record = res.data[0] || {}
            let workerStatus = record.worker_status || {}
            if (this.status !== workerStatus.status) {
              this.status = workerStatus.status
            }
          } else {
            this.status = 'stop'
          }
        })
      this.intervalId = setTimeout(this.loadData, 5000)
    },
    // 表格排序
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 选中分类
    handleSelectTag() {
      let tagList = {}
      this.multipleSelection.forEach(row => {
        if (row.classifications && row.classifications.length > 0) {
          tagList[row.classifications[0].id] = {
            value: row.classifications[0].value
          }
        }
      })
      return tagList
    },
    // 数据分类查询数据
    handleOperationClassify(classifications) {
      this.$api('MetadataInstances')
        .classification({
          metadatas: this.multipleSelection.map(it => {
            return {
              id: it.id,
              classifications: classifications
            }
          })
        })
        .then(() => {
          this.table.fetch()
        })
    },
    // 状态改变查询
    statusChange() {
      this.table.fetch(1)
    },
    // 创建api
    openCreateDialog() {
      this.$router.push({ name: 'module' })
    },
    // 预览
    toDetails(item) {
      this.$router.push({ name: 'dataExplorer', query: { id: item.basePath + '_' + item.apiVersion } })
    },
    // api文档及测试
    toDocumentTest(item) {
      this.$router.push({ name: 'apiDocAndTest', query: { id: item.basePath + '_' + item.apiVersion } })
    },
    // 发布api
    publish(item) {
      this.$confirm(this.$t('modules_sure') + this.$t('modules_publish_api'), this.$t('modules_publish_api'), {
        type: 'warning',
        closeOnClickModal: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        let parmas = {
          status: 'active',
          id: item.id,
          tablename: item.tablename
        }
        this.$api('modules')
          .patch(parmas)
          .then(res => {
            if (res) {
              this.$message.success(this.$t('modules_active'))
              this.table.fetch()
            }
          })
          .catch(() => {
            this.$message.error(this.$t('modules_status_deploy_fail'))
          })
      })
    },
    // 取消发布
    unpublish(item) {
      this.$confirm(this.$t('modules_sure') + this.$t('modules_unpublish_api'), this.$t('modules_unpublish_api'), {
        type: 'warning',
        closeOnClickModal: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        let parmas = {
          status: 'pending',
          id: item.id,
          tablename: item.tablename
        }
        this.$api('modules')
          .patch(parmas)
          .then(res => {
            if (res) {
              this.$message.success(this.$t('modules_pending'))
              this.table.fetch()
            }
          })
          .catch(() => {
            this.$message.error(this.$t('modules_cancel_failed'))
          })
      })
    },
    // 编辑
    edit(item) {
      this.$router.push({
        name: 'editModule',
        query: { id: item.id, name: item.table_name },
        params: {
          id: item.id
        }
      })
    },
    // 删除列表
    remove(item) {
      const h = this.$createElement
      let message = h('p', [
        this.$t('message.deleteOrNot') + ' ',
        h('span', { style: { color: '#409EFF' } }, item.name)
      ])
      this.$confirm(message, this.$t('message.prompt'), {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.$api('modules')
          .delete(item.id, item.name)
          .then(() => {
            this.$message.success(this.$t('message_delete_ok'))
            this.table.fetch()
          })
          .catch(() => {
            this.$message.info(this.$t('message_delete_fail'))
          })
      })
    },
    // 批量取消和批量发布
    batch(action) {
      if (!action) return
      const h = this.$createElement
      let text = action === 'active' ? this.$t('modules_releasefb') : this.$t('modules_releasecancel')
      let jobs = action === 'active' ? this.selectedStopped : this.selectedRunning
      let tableNameData = jobs.map(item => {
        return item.tablename
      })
      let message = h('p', [text + ' ', h('div', { style: { color: '#409EFF' } }, tableNameData.join(', '))])
      let title = action === 'active' ? this.$t('modules_allarelease') : this.$t('modules_allacancel')
      this.$confirm(message, title, {
        type: 'warning',
        closeOnClickModal: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        let modulesData = []
        jobs.forEach(item => {
          let data =
            action === 'active'
              ? {
                  id: item.id,
                  status: 'active',
                  connectorStopped: false,
                  transformerStopped: false
                }
              : {
                  id: item.id,
                  status: 'pending'
                }
          modulesData.push(this.$api('modules').patch(data))
        })

        Promise.all(modulesData).then(res => {
          let successResults = res.filter(rs => rs.data)
          if (successResults.length === jobs.length) {
            this.table.fetch()
            this.$message.success(this.$t('message_save_ok'))
          } else {
            this.$message.error(this.$t('message_save_fail'))
          }
        })
      })
    },
    // 跳转数据源
    dataSourceFn(data) {
      if (data.source) {
        let routeUrl = this.$router.resolve({
          name: 'connectionsEdit',
          params: { id: data.source.id },
          query: { databaseType: data.source.database_type }
        })
        window.open(routeUrl.href, '_blank')
      }
    },
    // 导入按钮
    importFile() {
      this.$router.push('/upload?type=api')
    },
    // 批量导出
    exportFile() {
      let id = []
      id = this.multipleSelection.map(v => {
        return v.id
      })
      let where = {
        _id: {
          in: id
        }
      }
      this.$api('MetadataInstances').download(where)
    },
    // 单个导出
    handleDownload(item) {
      let where = {
        _id: {
          in: [item.id]
        }
      }
      this.$api('MetadataInstances').download(where)
    },
    // 复制
    copy(item) {
      let parmas = {
        uri: `${item.id}/copy`,
        headers: { 'lconname-name': item.basePath }
      }
      this.$api('modules')
        .post(parmas, { 'lconname-name': item.basePath })
        .then(res => {
          if (res) {
            this.$message.success(this.$t('message_copy_success'))
            this.table.fetch()
          }
        })
        .catch(() => {
          this.$message.error(this.$t('message_copy_fail'))
        })
    }
  },
  beforeDestroy() {
    if (this.intervalId) {
      clearTimeout(this.intervalId)
    }
  }
}
</script>
<style lang="scss" scoped>
.modules-list-wrap {
  height: 100%;
  .modules-list {
    .search-bar {
      display: flex;
      li + li {
        margin-left: 10px;
      }
      .status-text {
        font-weight: bold;
        width: 150px;
        display: inline-block;
      }
      .deploying,
      .running,
      .restart,
      .starting {
        color: #44a501;
      }
      .deploy_fail,
      .stop {
        color: red;
      }
    }
    .btn + .btn {
      margin-left: 5px;
    }
    .btn {
      padding: 7px;
      background: #f5f5f5;
      i.iconfont {
        font-size: 12px;
      }
      &.btn-dropdowm {
        margin-left: 5px;
      }
      &.btn-create {
        margin-left: 5px;
      }
    }
    .modules-name {
      .name {
        color: #409eff;
        a {
          color: inherit;
          cursor: pointer;
        }
      }
      .name:hover {
        text-decoration: underline;
      }
      .tag {
        margin-left: 5px;
        color: #999999;
        background: #f5f5f5;
        border: 1px solid #dedee4;
      }
      .parent {
        color: #cccccc;
      }
    }
  }
}
</style>
<style lang="scss">
.changeName-prompt {
  .el-message-box__header {
    padding: 15px 15px 0;
    .el-message-box__title {
      padding-left: 0;
    }
  }
}
</style>
