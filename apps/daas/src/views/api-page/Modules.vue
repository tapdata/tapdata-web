<template>
  <section class="modules-list-wrap classify-wrap">
    <TablePage
      ref="table"
      row-key="id"
      class="modules-list"
      :classify="{
        authority: 'API_category_management',
        types: ['api']
      }"
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
          v-show="multipleSelection.length > 0"
          v-readonlybtn="'data_catalog_category_application'"
          size="mini"
          class="btn"
          @click="$refs.table.showClassify(handleSelectTag())"
        >
          <i class="iconfont icon-biaoqian back-btn-icon"></i>
          <span> {{ $t('dataFlow.taskBulkTag') }}</span>
        </ElButton>
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
      <el-table-column :label="$t('modules_header_status')">
        <template slot-scope="scope">
          <span>{{ $t('modules_' + scope.row.status) }}</span>
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
          {{ $moment(scope.row.last_updated).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('modules_header_operator')" width="380" fixed="right">
        <template slot-scope="scope">
          <ElButton v-readonlybtn="'API_creation'" size="mini" type="text" @click="copy(scope.row)">
            {{ $t('button_copy') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton v-readonlybtn="'API_data_explorer'" size="mini" type="text" @click="toDetails(scope.row)">
            {{ $t('button_preview') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton
            v-readonlybtn="'API_doc_&_test'"
            v-if="scope.row.status === 'active'"
            size="mini"
            type="text"
            @click="toDocumentTest(scope.row)"
          >
            {{ $t('modules_api_test') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider>
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
          <ElDivider direction="vertical"></ElDivider>
          <ElButton v-readonlybtn="'API_edition'" size="mini" type="text" @click="edit(scope.row)">
            {{ $t('modules_edit') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton v-readonlybtn="'API_export'" size="mini" type="text" @click="handleDownload(scope.row)">
            {{ $t('modules_export') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton
            v-readonlybtn="'API_delete'"
            size="mini"
            type="text"
            :disabled="$disabledByPermission('API_delete_all_data', scope.row.userId)"
            @click="remove(scope.row)"
            >{{ $t('button_delete') }}</ElButton
          >
        </template>
      </el-table-column>
    </TablePage>
    <!-- 导入 -->
    <Upload :type="'api'" ref="upload"></Upload>
    <!-- <ElDialog
      width="600px"
      custom-class="import-upload-dialog"
      :title="$t('modules_dialog_import_title')"
      :close-on-click-modal="false"
      :visible.sync="importDialogVisible"
    >
      <ElForm ref="form" :model="importForm" class="applications-form" label-width="100px">
        <ElFormItem :label="$t('modules_dialog_condition') + ':'">
          <el-radio v-model="importForm.upsert" :label="1">{{ $t('modules_dialog_overwrite_data') }}</el-radio>
          <el-radio v-model="importForm.upsert" :label="0">{{ $t('modules_dialog_skip_data') }}</el-radio>
        </ElFormItem>
        <ElFormItem :label="$t('modules_dialog_group') + ':'">
          <ElSelect v-model="importForm.tag" multiple size="mini" class="w-75">
            <ElOption v-for="item in classifyList" :label="item.value" :value="item.id" :key="item.id"></ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem :label="$t('modules_dialog_file') + ':'">
          <ElUpload
            class="upload-demo"
            ref="upload"
            :action="importForm.action"
            :accept="importForm.accept"
            :file-list="importForm.fileList"
            :auto-upload="false"
            :on-success="handleSuccess"
            :on-change="handleChange"
          >
            <ElButton type="text" plain slot="trigger" size="small">
              <VIcon class="mr-1 link-primary" size="18">upload</VIcon>
              {{ $t('modules_dialog_upload_files') }}</ElButton
            >
          </ElUpload>
        </ElFormItem>
      </ElForm>
      <span slot="footer" class="dialog-footer">
        <ElButton @click="importDialogVisible = false" size="small">{{ $t('button_cancel') }}</ElButton>
        <ElButton type="primary" @click="submitUpload()" size="small">{{ $t('button_confirm') }}</ElButton>
      </span>
    </ElDialog> -->
  </section>
</template>

<script>
import FilterBar from '@/components/filter-bar'
import TablePage from '@/components/TablePage'
import Upload from '@/components/UploadDialog'
import { toRegExp } from '@/utils/util'
// import * as Cookie from 'tiny-cookie'

export default {
  name: 'Modules',
  components: {
    TablePage,
    FilterBar,
    Upload
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        status: 'all'
      },
      filterItems: [],
      order: 'tablename DESC',
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
      intervalId: 0
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
  created() {
    // this.getDbOptions()
    this.getWorkers()
    this.getFilterItems()
  },
  mounted() {
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
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
      return this.$api('modules')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          this.table.setCache({
            keyword,
            status
          })

          return {
            total: res.data.total,
            data: res.data?.items || []
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
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          if (res?.data?.items?.length) {
            let record = res?.data?.items[0] || {}
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
    handleOperationClassify(listtags) {
      let attributes = {
        id: this.multipleSelection.map(r => r.id),
        listtags
      }
      this.$api('modules')
        .batchUpdateListtags(attributes)
        .then(() => {
          this.table.fetch()
          this.$message.success(this.$t('message_save_ok'))
        })
        .catch(() => {
          this.$message.error(this.$t('message_save_fail'))
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
      let message = h('p', [this.$t('message.deleteOrNot') + ' ' + item.name])
      this.$confirm(message, {
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
    }

    // // 上传文件成功失败钩子
    // handleChange(file) {
    //   this.importForm.fileList = [file]
    //   this.importForm.action =
    //     window.location.origin +
    //     window.location.pathname +
    //     'api/MetadataInstances/upload?upsert=' +
    //     this.importForm.upsert +
    //     '&listtags=' +
    //     encodeURIComponent(JSON.stringify(this.importForm.tag)) +
    //     '&type=APIServer' +
    //     `&access_token=${Cookie.get('token')}`
    // },

    // handleSuccess(response) {
    //   if (response.code === '110500' || response.code === '110401') {
    //     this.status = false
    //     this.$message.error(this.$t('dataFlow.uploadError'))
    //   } else {
    //     this.status = true
    //   }
    // },
    // // 上传保存
    // submitUpload() {
    //   this.importDialogVisible = false
    //   this.$refs.upload.submit()
    // }
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
      // background: #f5f5f5;
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
