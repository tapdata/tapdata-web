<template>
  <section class="modules-list-wrap">
    <TablePage
      ref="table"
      row-key="id"
      class="modules-list"
      :remoteMethod="getData"
      @selection-change="handleSelectionChange"
      @classify-submit="handleOperationClassify"
      @sort-change="handleSortTable"
    >
      <div slot="search" class="search-bar">
        <div class="search-status pr-4">
          {{ $t('modules_api_server_status') }}:
          <span class="status-text" :class="status">{{ $t('modules_status_' + status) }}</span>
        </div>
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </div>
      <div slot="operation">
        <ElButton size="mini" v-if="selectedStopped.length" @click="batch('active')">{{
          $t('modules_allarelease')
        }}</ElButton>

        <ElButton size="mini" v-if="selectedRunning.length" @click="batch('pending')">{{
          $t('modules_allacancel')
        }}</ElButton>
        <ElButton size="mini" @click.native="exportFile">{{ $t('modules_export') }}</ElButton>
        <ElButton size="mini" @click.native="importFile">{{ $t('modules_import') }}</ElButton>
        <ElButton
          v-readonlybtn="'API_creation'"
          class="btn btn-create"
          type="primary"
          size="mini"
          @click="openCreateDialog"
        >
          <!-- <i class="iconfont icon-jia add-btn-icon"></i> -->
          <span>{{ $t('modules_create') }}</span>
        </ElButton>
      </div>
      <el-table-column type="selection" width="45" :reserve-selection="true"></el-table-column>
      <el-table-column :label="$t('modules_header_api_name')" show-overflow-tooltip minWidth="120">
        <template slot-scope="scope">
          <div style="white-space: nowrap"></div>
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('modules_header_tablename')" show-overflow-tooltip minWidth="140">
        <template slot-scope="scope">
          {{ scope.row.tablename }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('modules_header_dataSource')" show-overflow-tooltip width="140">
        <template slot-scope="scope" v-if="scope.row.source">
          <span
            @click.stop="dataSourceFn(scope.row)"
            :title="scope.row.source.name"
            style="cursor: pointer; color: #2c65ff"
            >{{ scope.row.source.name }}({{
              $t('modules_status_' + (scope.row.source && scope.row.source.status))
            }})</span
          >
        </template>
      </el-table-column>
      <el-table-column :label="$t('modules_header_status')" width="110">
        <template #default="{ row }">
          <span :class="['status-' + row.status, 'status-block', 'mr-2']">
            {{ $t('modules_' + row.status) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('modules_header_basePath')" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.basePath }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('modules_header_version')">
        <template slot-scope="scope">
          {{ scope.row.apiVersion }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('modules_header_classifications')">
        <template slot-scope="scope" v-if="scope.row.listtags">
          <div v-for="item in scope.row.listtags" :key="item.value">{{ item.value }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('modules_header_username')">
        <template slot-scope="scope">
          {{ scope.row.user }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('modules_header_last_updated')" prop="last_updated" sortable="custom" width="140">
        <template slot-scope="scope">
          {{ scope.row.lastUpdatedFmt }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('modules_header_operator')" width="260" fixed="right">
        <template slot-scope="scope">
          <ElButton v-readonlybtn="'API_creation'" size="mini" type="text" @click="copy(scope.row)">
            {{ $t('button_copy') }}
          </ElButton>
          <ElDivider direction="vertical" v-readonlybtn="'API_creation'"></ElDivider>
          <!-- <ElButton v-readonlybtn="'API_data_explorer'" size="mini" type="text" @click="toDetails(scope.row)">
            {{ $t('button_preview') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton v-readonlybtn="'API_doc_&_test'" size="mini" type="text" @click="toDocumentTest(scope.row)">
            {{ $t('modules_api_test') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider> -->
          <ElButton
            v-readonlybtn="'API_publish'"
            v-if="scope.row.status === 'pending'"
            size="mini"
            type="text"
            :disabled="$disabledByPermission('API_publish_all_data', scope.row.userId)"
            @click="publish(scope.row)"
          >
            {{ $t('modules_publish_api') }}
          </ElButton>
          <ElButton
            v-else
            v-readonlybtn="'API_publish'"
            size="mini"
            type="text"
            :disabled="$disabledByPermission('API_publish_all_data', scope.row.userId)"
            @click="unpublish(scope.row)"
          >
            {{ $t('modules_unpublish_api') }}
          </ElButton>
          <ElDivider direction="vertical" v-readonlybtn="'API_publish'"></ElDivider>
          <ElButton v-readonlybtn="'API_edition'" size="mini" type="text" @click="edit(scope.row)">
            {{ $t('modules_edit') }}
          </ElButton>
          <ElDivider direction="vertical" v-readonlybtn="'API_edition'"></ElDivider>
          <!-- <ElButton v-readonlybtn="'API_export'" size="mini" type="text" @click="handleDownload(scope.row)">
            {{ $t('modules_export') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider> -->
          <ElButton
            v-readonlybtn="'API_delete'"
            size="mini"
            type="text"
            :disabled="$disabledByPermission('API_delete_all_data', scope.row.userId) || scope.row.status !== 'pending'"
            @click="remove(scope.row)"
            >{{ $t('button_delete') }}</ElButton
          >
          <ElDivider direction="vertical" v-readonlybtn="'API_delete'"></ElDivider>
          <ElDropdown v-show="moreAuthority" size="small" @command="handleCommand($event, scope.row)">
            <ElLink type="primary" class="rotate-90">
              <i class="el-icon-more"></i>
            </ElLink>
            <ElDropdownMenu class="dataflow-table-more-dropdown-menu" slot="dropdown">
              <ElDropdownItem command="preview" v-readonlybtn="'API_data_explorer'"
                >{{ $t('button_preview') }}
              </ElDropdownItem>
              <ElDropdownItem command="export" v-readonlybtn="'API_export'">{{ $t('modules_export') }}</ElDropdownItem>
              <ElDropdownItem command="toDocumentTest" v-readonlybtn="'API_doc_&_test'">{{
                $t('modules_api_test')
              }}</ElDropdownItem>
            </ElDropdownMenu>
          </ElDropdown>
        </template>
      </el-table-column>
    </TablePage>
    <!-- 导入 -->
    <Upload :type="'api'" ref="upload"></Upload>
  </section>
</template>

<script>
import dayjs from 'dayjs'

import { modulesApi, workerApi, metadataInstancesApi } from '@tap/api'
import { FilterBar } from '@tap/component'
import { TablePage, UploadDialog } from '@tap/business'

import { toRegExp } from '@/utils/util'

export default {
  name: 'ApiPublish',
  components: {
    TablePage,
    FilterBar,
    Upload: UploadDialog
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        status: 'all'
      },
      filterItems: [],
      order: 'last_updated DESC',
      status: 'stop',
      dbOptions: [],
      statusList: [
        {
          label: this.$t('modules_all'),
          value: 'all'
        },
        {
          label: this.$t('modules_active'),
          value: 'active'
        },
        {
          label: this.$t('modules_pending'),
          value: 'pending'
        }
      ],
      multipleSelection: [],
      intervalId: 0,
      moreAuthority: this.$has('API_data_explorer') || this.$has('API_doc_&_test') || this.$has('API_export')
      // importDialogVisible: false,
      // importForm: {
      //   tag: [],
      //   fileList: [],
      //   action: '',
      //   upsert: 1,
      //   accept: '.gz'
      // },
      // classifyList: []
    }
  },

  watch: {
    '$route.query'() {
      this.table.fetch(1)
    }
  },

  created() {
    this.getWorkers()
    this.getFilterItems()
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
          status: ''
        }
      }
      this.table.fetch(1)
    },
    // 获取数据
    getData({ page, tags }) {
      let { current, size } = page
      let { keyword, status } = this.searchParams
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
        let filterObj = { like: toRegExp(keyword), options: 'i' }
        where.or = [{ basePath: filterObj }, { description: filterObj }]
      }
      status && (where.status = status)

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
      return modulesApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          return {
            total: data?.total,
            data:
              data?.items?.map(item => {
                item.lastUpdatedFmt = dayjs(item.last_updated).format('YYYY-MM-DD HH:mm:ss')
                return item
              }) || []
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
      workerApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          if (data?.items?.length) {
            let record = data?.items[0] || {}
            let workerStatus = record.workerStatus || record.worker_status || {}
            if (this.status !== workerStatus.status) {
              this.status = workerStatus.status
            }
          } else {
            this.status = 'stop'
          }
        })
      this.intervalId = setTimeout(this.getWorkers, 5000)
    },
    // 表格排序
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 数据分类查询数据
    handleOperationClassify(listtags) {
      let attributes = {
        id: this.multipleSelection.map(r => r.id),
        listtags
      }
      modulesApi.batchUpdateListtags(attributes).then(() => {
        this.table.fetch()
        this.$message.success(this.$t('message_save_ok'))
      })
      // .catch(() => {
      //   this.$message.error(this.$t('message_save_fail'))
      // })
    },
    // 状态改变查询
    statusChange() {
      this.table.fetch(1)
    },
    // 创建api
    openCreateDialog() {
      this.$router.push({ name: 'apiPublishCreate' })
    },
    // 预览
    preview(ids, item) {
      this.$router.push({ name: 'apiExplorer', query: { id: item.basePath + '_' + item.apiVersion } })
    },
    // api文档及测试
    toDocumentTest(ids, item) {
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
        modulesApi.patch(parmas).then(() => {
          this.$message.success(this.$t('modules_active'))
          this.table.fetch()
        })
        // .catch(() => {
        //   this.$message.error(this.$t('modules_status_deploy_fail'))
        // })
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
        modulesApi.patch(parmas).then(() => {
          this.$message.success(this.$t('modules_pending'))
          this.table.fetch()
        })
        // .catch(() => {
        //   this.$message.error(this.$t('modules_cancel_failed'))
        // })
      })
    },
    // 编辑
    edit(item) {
      this.$router.push({
        name: 'apiPublishEdit',
        query: { id: item.id, name: item.table_name },
        params: {
          id: item.id
        }
      })
    },
    // 删除列表
    remove(item) {
      const h = this.$createElement
      let message = h('p', [this.$t('message_deleteOrNot') + ' ' + item.name])
      this.$confirm(message, {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        modulesApi.delete(item.id, item.name).then(() => {
          this.$message.success(this.$t('message_delete_ok'))
          this.table.fetch()
        })
        // .catch(() => {
        //   this.$message.info(this.$t('message_delete_fail'))
        // })
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
          modulesData.push(modulesApi.patch(data))
        })

        Promise.all(modulesData).then(data => {
          let successResults = data?.filter(rs => rs) || []
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
      this.$refs.upload.show()
      // this.importDialogVisible = true
      // this.getClassify()
      // this.$router.push('/upload?type=api')
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
      metadataInstancesApi.download(where, 'Modules')
    },
    // 单个导出
    export(ids, item) {
      let where = {
        _id: {
          in: [item.id]
        }
      }
      metadataInstancesApi.download(where, 'Modules')
    },
    // 复制
    copy(item) {
      let parmas = {
        uri: `${item.id}/copy`,
        headers: { 'lconname-name': item.basePath }
      }
      modulesApi.post(parmas, { 'lconname-name': item.basePath }).then(() => {
        this.$message.success(this.$t('message_copy_success'))
        this.table.fetch()
      })
      // .catch(() => {
      //   this.$message.error(this.$t('message_copy_fail'))
      // })
    },
    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('modules_type'),
          key: 'status',
          type: 'select-inner',
          items: this.statusList,
          selectedWidth: '200px'
        },
        {
          placeholder: this.$t('modules_name_placeholder'),
          key: 'keyword',
          type: 'input'
        }
      ]
    },
    handleCommand(command, node) {
      let ids = []
      if (node) {
        ids = [node.id]
      } else {
        ids = this.multipleSelection.map(item => item.id)
      }
      this[command](ids, node)
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
      flex-direction: row;
      .search-status {
        line-height: 34px;
        .status-text {
          display: inline-block;
          font-weight: bold;
          height: 25px;
          padding: 0 10px;
          line-height: 25px;
          border-radius: 2px;
        }
      }

      .deploying,
      .running,
      .restart,
      .starting {
        color: #44a501;
        background-color: #c4f3cb;
      }
      .deploy_fail,
      .stop {
        color: #d44d4d;
        background-color: #ffecec;
      }
    }
    .btn + .btn {
      margin-left: 5px;
    }
    .btn {
      // padding: 7px;
      // background: map-get($bgColor, main);
      i.iconfont {
        font-size: 12px;
      }
      &.btn-dropdowm {
        margin-left: 5px;
      }
      &.btn-create {
        margin-left: 10px;
      }
    }
    .modules-name {
      .name {
        color: map-get($color, primary);
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
        color: map-get($fontColor, light);
        background: map-get($bgColor, main);
        border: 1px solid #dedee4;
      }
      .parent {
        color: map-get($fontColor, slight);
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
