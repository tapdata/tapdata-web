<template>
  <section class="apiserver-wrap classify-wrap">
    <TablePage
      ref="table"
      row-key="id"
      class="apiserver-list"
      :remoteMethod="getData"
      :classify="{
        authority: 'API_category_management',
        types: ['api']
      }"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortTable"
    >
      <div slot="search" class="search-bar">
        <div class="search-status pr-4">
          {{ $t('modules_api_server_status') }}:
          <span class="status-text" :class="status">{{ $t('modules_status_' + status) }}</span>
        </div>
        <SelectList
          v-if="apiServersList.length"
          v-model="searchParams.api_server_process_id"
          :items="serverData"
          :inner-label="$t('dataExplorer_apiservr')"
          none-border
          last-page-text=""
          clearable
          menu-min-width="240px"
          :placeholder="$t('dataExplorer_apiservr')"
          @change="table.fetch(1)"
        ></SelectList>
        <SelectList
          v-if="pathList.length"
          v-model="searchParams.collection"
          :items="pathList"
          :inner-label="$t('dataExplorer_base_path')"
          none-border
          last-page-text=""
          clearable
          menu-min-width="240px"
          :placeholder="$t('dataExplorer_base_path')"
          @change="table.fetch(1)"
        ></SelectList>
        <ElButton plain class="btn-refresh" @click="table.fetch(1)">
          <VIcon>refresh</VIcon>
        </ElButton>
      </div>
      <div slot="operation">
        <ElSelect
          v-model="without_timezone"
          size="mini"
          width="100%"
          :label="
            $t('dataExplorer_datetype_without_timezone') + '. ' + $t('dataExplorer_mysql_datetype_without_timezone')
          "
          class="timezone"
          @change="saveTimeZone"
        >
          <ElOption v-for="item in timezones" :label="item.label" :value="item.value" :key="item.value"></ElOption>
        </ElSelect>
        <ElButton v-readonlybtn="'API_data_explorer_export'" class="btn" size="mini" @click="exportDialog = true">
          <span>{{ $t('button_export') }}</span>
        </ElButton>
        <ElButton class="btn" size="mini" @click="showFilterDialog = true">
          <span>{{ $t('dataExplorer_query') }}</span>
        </ElButton>
        <ElButton v-readonlybtn="'API_doc_&_test'" class="btn" size="mini" @click="openDocument">
          <span>{{ $t('dataExplorer_document') }}</span>
        </ElButton>
        <ElButton
          v-if="enableEdit"
          v-readonlybtn="'API_creation'"
          class="btn btn-create"
          size="mini"
          type="primary"
          @click="openCreate"
        >
          <span>{{ $t('button_create') }}</span>
        </ElButton>
      </div>

      <!-- 列表项 -->
      <el-table-column v-for="item in tableHeaders" :key="item.text" v-show="item.show" min-width="120">
        <template slot="header">
          <span :title="item.text">{{ handleAliasName(item.text) }}</span>
        </template>
        <template slot-scope="scope">
          <!-- <div>{{scope.row[item.text]}}</div> -->
          <div
            class="edit-text"
            v-if="scope.row.isspancen[item.text]"
            :title="scope.row[item.text]"
            @dblclick="editItem(scope.row, item.text)"
          >
            {{ scope.row[item.text] }}
          </div>
          <div v-else class="edit-text" @dblclick="editItem(scope.row, item.text)"></div>
          <template v-if="scope.row.istrue">
            <div v-if="scope.row.isshow[item.text]">
              <el-input
                @keyup.enter.native="editOk(scope.row, item.text, item.type)"
                ref="editInput"
                v-model="editValue"
                class="edit-input"
                type="text"
                size="mini"
              />
              <div>
                <ElButton @click="editOk(scope.row, item.text, item.type)" class="btn-text" type="text" size="small">
                  {{ $t('dataQuality.save') }}
                </ElButton>
                <ElButton @click="editCancel(scope.row, item.text)" class="btn-text" type="text" size="small">
                  {{ $t('dataQuality.cancel') }}
                </ElButton>
              </div>
            </div>
          </template>
        </template>
      </el-table-column>

      <el-table-column :label="$t('column_operation')" width="220" fixed="right">
        <template slot-scope="scope">
          <ElButton v-if="downloadFileUrl" size="mini" type="text" @click="downloadFile(scope.row)">
            {{ $t('button_download') }}
          </ElButton>
          <ElButton
            v-if="enableTag"
            v-readonlybtn="'API_data_explorer_tagging'"
            size="mini"
            type="text"
            @click="settingTag(scope.row)"
          >
            {{ $t('dataExplorer_tag_title') }}
          </ElButton>
          <ElButton
            v-if="enableEdit"
            v-readonlybtn="'API_data_explorer_deleting'"
            size="mini"
            type="text"
            @click="remove(scope.row)"
            >{{ $t('button_delete') }}</ElButton
          >
          <el-tooltip class="item" effect="dark" :content="$t('api_server_download_API_Server_config')" placement="top">
            <ElButton
              v-if="scope.row['dk_new_filename'] && scope.row['dk_orginal_filename'] && scope.row['dk_filepath']"
              size="mini"
              type="text"
              @click="
                downloadFileByField({
                  'metadata.file_name': scope.row['dk_orginal_filename'],
                  'metadata.file_path': scope.row['dk_filepath'],
                  'metadata.dk_new_filename': scope.row['dk_new_filename']
                })
              "
              >{{ $t('api_server_download') }}</ElButton
            >
          </el-tooltip>
        </template>
      </el-table-column>
      <div slot="tableFooter" class="table-footer">
        <span>{{ $t('dataExplorer_query_time') }}: {{ queryTime }}s</span>
        <span>{{ $t('dataExplorer_render_time') }}: {{ renderTime }}s</span>
      </div>
    </TablePage>
    <!-- 导出 -->
    <el-dialog
      width="600px"
      custom-class="export-dialog"
      :title="$t('dataExplorer_export')"
      :close-on-click-modal="false"
      :visible.sync="exportDialog"
    >
      <span class="pr-5">{{ $t('dataExplorer_type') }}:</span>
      <ElButton size="mini" @click="exportData('csv')">CSV</ElButton>
      <ElButton size="mini" @click="exportData('excel')">Excel</ElButton>
      <ElButton size="mini" @click="exportData('json')">JSON</ElButton>
    </el-dialog>
    <!-- 查询 -->
    <BrowseQuery
      ref="queryBuild"
      v-if="showFilterDialog"
      :key="queryBuildKey"
      :fieldData="queryFields"
      :header="tableHeader"
      :conditionData="condition"
      :dialogVisible="showFilterDialog"
      @backShowColumn="backShowColumn"
      @backDialogVisible="backDialogVisible"
    ></BrowseQuery>
    <!-- 创建 -->
    <el-dialog
      width="600px"
      custom-class="create-dialog"
      :title="$t('dataExplorer_new_document')"
      :close-on-click-modal="false"
      :visible.sync="openCreateDialog"
    >
      <div class="create-dialog-box">
        <JsEditor v-model="jsonDoc" height="200"></JsEditor>
      </div>

      <ul v-if="jsonDocHint.length">
        <li v-for="(item, index) in jsonDocHint" :key="index">{{ item }}</li>
      </ul>
      <span slot="footer" class="dialog-footer">
        <ElButton @click="openCreateDialog = false" size="mini">{{ $t('dialog_button_cancel') }}</ElButton>
        <ElButton @click="formatJson()" size="mini">{{ $t('dataExplorer_format') }}</ElButton>
        <ElButton type="primary" @click="createSave()" size="mini">{{ $t('button_confirm') }}</ElButton>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import dayjs from 'dayjs'

import { ApiClient, settingsApi, workerApi, usersApi, apiServerApi, modulesApi } from '@tap/api'
import { JsEditor, SelectList } from '@tap/component'
import { TablePage } from '@tap/business'

import BrowseQuery from './BrowseQuery'

let time = 0
export default {
  name: 'ApiExplorer',
  components: {
    TablePage,
    BrowseQuery,
    SelectList,
    JsEditor
  },
  data() {
    return {
      searchParams: {
        api_server_process_id: '',
        collection: ''
      },
      filterItems: [],
      status: 'stop',
      apiServersList: [],
      pathList: [],
      serverData: [],
      collectionsList: [],
      tableHeader: [],
      tableData: [],
      apiId: '',
      jsonDoc: '', // json
      jsonDocHint: [], // json错误信息
      apiClient: null,
      downloadFileUrl: '',
      enableTag: false,
      editTag: false, // 设置标签按钮
      enableEdit: false, // 删除按钮显示
      apiType: '',
      intervalId: 0,
      queryTime: 0, // 查询使用
      renderTime: 0, // 渲染使用
      aliasNameObj: {}, // 存储表头别名，切换api时改变
      pkName: '', // 存储主键名称
      queryBuildKey: 1, // 自定义查询字段组件key
      condition: {}, //查询条件
      save_timezone: 0,
      without_timezone: 0,
      timezones: [],
      editValue: '', // 要编辑的字段的值
      editCol: '', // 当前编辑的字段名
      // timeZoneDialog: false,
      exportDialog: false,
      showFilterDialog: false,
      openCreateDialog: false,
      tag: '',
      order: '_id DESC',
      createDialogVisible: false,
      classifyTag: [], //选中分类tag
      editDocId: ''
    }
  },
  created() {
    let defaultCollection = this.$route.query.collection || this.$route.query['id']
    this.apiClient = new ApiClient(defaultCollection)
    this.initTimezones() // 获取时区下拉值
    this.getApiServer() // 获取API Server下拉值
    this.getCollections() // 获取api下拉值
    this.getWorkers() // 获取状态
    this.getHandleTimeZone() //获取时区
    if (!this.without_timezone) {
      this.without_timezone = this.timezones[12]
    }
    // this.getFilterItems()
  },
  watch: {
    'searchParams.api_server_process_id': {
      handler(val) {
        if (val) {
          this.collectionsList = []
          if (this.apiServersList.length) {
            let temp = this.apiServersList.filter(v => v.processId === val)
            this.apiClient.setApiServer(temp[0])
          }
          this.getCollections(this.classifyTag)
        }
      },
      deep: true
    },
    'searchParams.collection': {
      handler(val) {
        if (val) {
          this.collectionsList.forEach(item => {
            if (item.value === val) {
              this.apiType = item.type
            }
          })
          this.getTableHeader()
        }
      },
      deep: true
    },
    tableHeader: {
      handler(val) {
        if (val) {
          this.tableHeader = val
        }
      },
      deep: true
    }
  },
  computed: {
    tableHeaders() {
      return this.tableHeader.filter(v => v.show && v.value !== '__operation' && v.value !== '__tapd8')
    },
    table() {
      return this.$refs.table
    },
    queryFields() {
      return this.tableHeader.filter(v => {
        v.text = this.aliasNameObj[v.value] || v.value
        return v.show && ['__operation', '_id', '__tapd8'].indexOf(v.value) === -1
      })
    },
    timezoneLabel() {
      let _this = this
      let label = ''
      this.timezones.forEach(item => {
        if (item.value == _this.without_timezone) {
          label = item.label
        }
      })
      return label
    }
  },
  methods: {
    // 双击编辑字段
    editItem(item, key) {
      this.editCol = key
      this.editValue = item[key]
      // 初始化所有双击前的默认数据
      for (let i in this.tableData) {
        for (let k in this.tableData[i].isspancen) {
          this.tableData[i].isspancen[k] = true
        }
        this.tableData[i].istrue = false
      }
      for (let i in item.isshow) {
        item.isshow[i] = false
      }
      if (item.isPrimaryKey.pkName !== key) {
        item.istrue = true
        item.isshow[key] = true
        item.isspancen[key] = false
        this.$nextTick(() => {
          if (this.$refs.editInput && this.$refs.editInput.length) {
            this.$refs.editInput.forEach(v => {
              v.focus()
            })
          } else {
            this.$refs.editInput && this.$refs.editInput.focus()
          }
        })
      }
    },
    // 获取API Server下拉值
    getApiServer() {
      apiServerApi.get({}).then(data => {
        this.apiServersList = data?.items || []
        if (this.apiServersList.length) {
          this.searchParams.api_server_process_id = this.apiServersList[0].processId
          this.apiClient.setApiServer(this.apiServersList[0])
          this.serverData = this.apiServersList.map(item => {
            return {
              label: item.clientName,
              value: item.processId
            }
          })
        }
      })
    },
    // 获取api下拉数据
    async loadOpenAPI(tag) {
      let _this = this
      await this.apiClient.loadOpenAPI().then(res => {
        if (res) {
          this.collectionsList = []
          Object.keys(res.data).forEach(item => {
            let operations = res.data[item].api,
              apiId = res.data[item].apiId,
              _apiName = res.data[item].apiName || '',
              downloadFileUrl = ''
            if (operations['downloadById']) {
              downloadFileUrl = operations['downloadById'].url
            }
            if (operations['findPage_post']) {
              _this.collectionsList.push({
                collection: item,
                apiName: _apiName,
                text: item,
                value: operations['findPage_post'].url,
                method: operations['findPage_post'].method,
                downloadFileUrl: downloadFileUrl,
                apiId: apiId,
                type: 'preset'
              })
            }
            Object.keys(operations).forEach(operationName => {
              if (operationName !== 'findPage_post' && operationName.startsWith('findPage_')) {
                let url = operations[operationName].url
                _this.collectionsList.push({
                  collection: item,
                  text: item + '/' + url.substring(url.lastIndexOf('/') + 1),
                  value: url,
                  method: operations[operationName].method,
                  downloadFileUrl: downloadFileUrl,
                  operationName: operationName,
                  apiId: apiId,
                  type: 'custom'
                })
              }
            })
          })

          if (_this.collectionsList?.length) {
            let collectionsArr = []
            // 去重
            let obj = {}
            _this.collectionsList = _this.collectionsList.reduce((cur, next) => {
              obj[next.text] ? '' : (obj[next.text] = true && cur.push(next))
              return cur
            }, [])

            _this.collectionsList.forEach(item => {
              // 数据类目
              if (tag && tag.length) {
                tag.forEach(tagId => {
                  if (tagId.id === item.apiId) {
                    item.text = tagId.name || item.text
                    collectionsArr.push(item)
                  }
                })
              }
            })

            _this.collectionsList = collectionsArr?.length ? collectionsArr : _this.collectionsList
            // 基础路径下拉获取值
            _this.pathList = _this.collectionsList.map(item => {
              return {
                label: item.text,
                value: item.value
              }
            })
          }

          // 页面缓存改变api
          if (_this.collectionsList.length) {
            // 如果缓存的api不在当前api列表中,则重置排序，默认第一个api
            // let formData = window.getFormLocal('apiDataExplorer')
            if (
              this.searchParams.collection &&
              _this.collectionsList.find(v => v.value === this.searchParams.collection)
            ) {
              // _this.searchParams.collection = formData.collection
            } else {
              _this.searchParams.collection = _this.collectionsList[0].value
            }
          } else {
            _this.searchParams.collection = ''
          }

          // 页面传参改变默认api
          let defaultCollection = _this.$route.query.collection || _this.$route.query['id']
          if (defaultCollection) {
            let obj = this.collectionsList.find(v => v.collection === defaultCollection && v.method === 'post')
            if (obj) {
              this.searchParams.collection = obj.value
            }
          }

          let api = _this.collectionsList.filter(v => v.value === _this.searchParams.collection)
          if (api[0]) {
            _this.apiClient.setCollection(api[0])
            _this.apiId = api[0].apiId
          }

          if (_this.searchParams.collection) {
            _this.applyQueryParams()
            // _this.table.fetch()
          } else {
            _this.tableHeader = []
            _this.tableData = []
            _this.searchParams.collection = ''
          }
        }
      })
      // .catch(e => {
      //   const msg = {
      //     default: this.$t('dataExplorer_timeout'),
      //     504: this.$t('dataExplorer_timeout'),
      //     401: this.$t('dataExplorer_unauthenticated')
      //   }
      //   if (e?.response) {
      //     this.$message.error(msg['' + (e?.response?.status || '')])
      //   } else {
      //     this.$message.error(this.$t('dataExplorer_timeout'))
      //   }
      // })
    },
    // 获取表头
    async getTableHeader() {
      let _this = this
      time = new Date().getTime()

      this.tableHeader = []
      // 获取当前选中表
      let selectCollections = _this.collectionsList.filter(v => v.value === _this.searchParams.collection)
      let selectCollection = selectCollections.length ? selectCollections[0] : {}

      let apiId = selectCollection.apiId || ''
      _this.downloadFileUrl = selectCollection.downloadFileUrl || ''
      _this.apiClient.setCollection(selectCollection)
      // 根据当前表获取表api浏览表格头

      let headers = await _this.apiClient.getHeaders(selectCollection.collection, selectCollection.operationName)
      if (headers?.length)
        headers.forEach(col => {
          if (col) _this.tableHeader.push(col)
        })
      // 获取当前用户信息
      usersApi.get().then(data => {
        if (data) {
          let arrquery = data.arrquery
          if (arrquery?.length) {
            _this.tableHeader = arrquery.map(item => {
              if (
                item.apiServer === _this.getApiId('') &&
                item.processId === _this.searchParams.api_server_process_id
              ) {
                _this.tableHeader = JSON.parse(item.condition)
              }
            })
          }
        }
      })
      _this.enableEdit = selectCollection.type === 'preset'
      _this.apiId = apiId

      let filter = {
        field: {
          _id: true,
          fields: true
        },
        where: {
          _id: apiId
        }
      }
      modulesApi.get({ filter: JSON.stringify(filter) }).then(data => {
        let items = data?.items || []
        if (items.length) {
          let field_alias = {}
          items[0].fields.forEach(v => {
            field_alias[v.field_name] = v.field_alias || ''
          })
          _this.enableTag = _this.enableEdit && field_alias.hasOwnProperty('__tapd8')
        }
        _this.table.fetch()
      })
    },
    // 获取当前apiId
    getApiId(apiid) {
      this.collectionsList.forEach(item => {
        if (item.value == this.searchParams.collection) {
          apiid = item.apiId
        }
      })
      return apiid
    },
    // 查询保存返回值
    backShowColumn(data, condition) {
      this.showFilterDialog = false
      let apiId = '',
        _this = this
      let parmas = {
        apiServer: _this.getApiId(apiId), //API服务器ID
        processId: _this.searchParams.api_server_process_id, //API ID
        condition: JSON.stringify(_this.tableHeader)
      }
      _this.tableHeader.forEach(item => {
        if (!data.includes(item.value) && item.value !== '__operation') {
          item.show = false
        } else {
          item.show = true
        }
      })
      this.condition = condition
      this.table.fetch()
      usersApi.get().then(data => {
        if (data) {
          let arrquery = data.arrquery
          let isproid = 0
          if (arrquery === undefined || arrquery === 'undefined') {
            usersApi.patch({ arrquery: [parmas] })
          } else {
            let userData = { arrquery: arrquery }
            arrquery.forEach(item => {
              if (item.processId === _this.searchParams.api_server_process_id) {
                if (item.apiServer === _this.getApiId(apiId)) {
                  // parmas.parmas[index].condition = JSON.stringify(_this)
                } else {
                  userData.arrquery.push(parmas)
                }
              } else {
                isproid = 1
              }
            })
            if (isproid === 1) {
              userData.arrquery.push(parmas)
            }
            usersApi.patch(userData)
          }
        }
      })
    },
    // 查询弹窗关闭
    backDialogVisible() {
      this.showFilterDialog = false
    },
    // 查询字段
    backSearch() {
      this.table.fetch()
    },

    // 选中
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    // 获取api下拉数据
    getCollections(tags) {
      let where = {}
      if (tags && tags.length) {
        where['listtags.id'] = {
          in: tags
        }
      }
      let params = {
        filter: {
          fields: {
            paths: true,
            tablename: true,
            id: true,
            prefix: true,
            name: true,
            apiType: true
          },
          where
        }
      }
      modulesApi.get(params).then(data => {
        if (data) {
          this.loadOpenAPI(data)
        }
      })
    },
    // 下载文件
    downloadFile(item) {
      if (this.downloadFileUrl && item) {
        this.apiClient.downloadById(item)
      }
    },
    // 确认编辑字段保存
    async editOk(item, value, type) {
      let _this = this
      let text = String(value)
      let newValue = ''
      let { pkValue } = item.isPrimaryKey
      let id = pkValue || this.editDocId
      _this.editDocId = item['_id']
      if (['float', 'double', 'short', 'bigDecimal', 'integer', 'long', 'number'].includes(type)) {
        if (!/^\d+$/.test(_this.editValue)) {
          _this.$message.error(_this.$t('message_save_ok') + '-' + _this.$t('message_save_fail'))
        } else {
          newValue = Number(_this.editValue)
        }
      } else if (type === 'object') {
        try {
          newValue = JSON.parse(_this.editValue)
        } catch (e) {
          _this.$message.error(_this.$t('message_save_ok') + '-' + _this.$t('message_save_fail'))
          return false
        }
      } else if (/^\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d$/.test(item[text])) {
        newValue = new Date(_this.editValue).toISOString()
      } else if (type === 'date') {
        newValue = new Date(_this.editValue).toISOString()
      } else if (type === 'boolean') {
        newValue = _this.editValue === 'true'
      } else if (type === 'string') {
        newValue = _this.editValue
      } else {
        newValue = _this.editValue
      }
      _this.jsonDocHint = []
      let result = await this.apiClient.updateById(id, {
        [value]: newValue
      })
      if (result.success) {
        // console.log("保存成功进来了....")
        this.showEditDialog = false
        this.editDocId = ''
        this.jsonDoc = ''
        _this.table.fetch()
        _this.$message.success(_this.$t('message_save_ok'))
      } else {
        _this.$message.error(_this.$t('message_save_fail'))
      }
    },
    // 取消保存
    editCancel(item, key) {
      item.isspancen[key] = true
      item.istrue = false
      this.table.fetch()
    },
    // 创建
    openCreate() {
      function clearContent(obj) {
        if (obj && typeof obj === 'object') {
          Object.keys(obj).forEach(key => {
            let type = typeof obj[key]
            if (key === '_id') {
              delete obj[key]
            } else if (Array.isArray(obj)) {
              obj.splice(1, obj.length - 1)
              clearContent(obj[0])
            } else if (type === 'string') {
              obj[key] = ''
            } else if (type === 'number') {
              obj[key] = 0
            } else if (type === 'object') {
              clearContent(obj[key])
            }
          })
        }
      }

      let example = {}
      if (this.tableData?.length) {
        example = JSON.parse(JSON.stringify(this.tableData[0]))
        clearContent(example)
      } else {
        this.tableHeader.forEach(v => {
          if (v.value !== '__operation')
            example[v.value] =
              v.type === 'string'
                ? ''
                : v.type === 'number'
                ? 0
                : v.type === 'object'
                ? {}
                : v.type === 'array'
                ? []
                : ''
        })
      }
      delete example.istrue
      delete example.isshow
      delete example.isspancen

      this.jsonDoc = JSON.stringify(example, '', '\t')
      this.openCreateDialog = true
      this.jsonDocHint = []
    },
    // 格式化json
    formatJson() {
      if (!this.jsonDoc) {
        return false
      }
      if (this.jsonDoc) {
        let doc = ''
        try {
          doc = JSON.parse(this.jsonDoc)
          this.jsonDoc = JSON.stringify(doc, '', '\t')
          return this.jsonDoc
        } catch (e) {
          this.jsonDocHint.push(e.message)
        }
      }
      return false
    },
    // 创建保存json
    async createSave() {
      if (!this.jsonDoc) {
        return false
      }
      let doc = this.formatJson()
      if (doc) {
        doc = JSON.parse(doc)

        await this.apiClient.create(doc).then(res => {
          if (res.success) {
            this.showEditDialog = false
            this.jsonDoc = null
            this.jsonDocHint = []
            this.$message.success(this.$('message_save_ok'))
          } else {
            if (res.response.status === 422) {
              let details = res.response.data.error.details
              if (details?.length) {
                this.$message.error(this.$t('message_save_fail'))
                details.forEach(err => {
                  this.jsonDocHint.push('Field ' + err.path + ' ' + err.message)
                })
              }
            } else {
              this.jsonDocHint.push(res.response.statusText)
            }
          }
        })
      }
    },
    // 设置标签
    settingTag(item) {
      let _this = this
      _this.editTag = true
      _this.saveTagMessage = ''
      if (item.__tapd8 && item.__tapd8.tag) {
        _this.tag = item.__tapd8.tag
      } else {
        _this.tag = ''
      }

      this.saveTag = async function () {
        let tapd8 = item.__tapd8 || {}
        tapd8.tag = _this.tag
        await _this.apiClient
          .updateById(item._id || item.id, {
            __tapd8: tapd8
          })
          .then(res => {
            if (res) {
              item.__tapd8 = tapd8
              _this.saveTag = function () {}
              _this.editTag = false
            }
          })
          .catch(() => {
            _this.saveTagMessage = this.$t('message_save_fail')
          })
      }
    },
    // 移除
    async remove(item) {
      const h = this.$createElement
      let message = h('p', [this.$t('message.deleteOrNot') + ' ' + item.clientName])
      this.$confirm(message, this.$t('message.prompt'), {
        type: 'warning'
      }).then(
        await (resFlag => {
          if (!resFlag) {
            return
          }
          this.apiClient.deleteById(item._id).then(() => {
            this.$message.success(this.$t('message_delete_ok'))
            this.table.fetch()
          })
          // .catch(() => {
          //   this.$message.info(this.$t('message_delete_fail'))
          // })
        })
      )
    },

    // 查询
    showFilterDialogfn() {},

    // api文档
    async openDocument() {
      if (this.apiServersList?.length) {
        let tmp = this.apiServersList.filter(v => v.processId === this.searchParams.api_server_process_id)
        if (tmp && tmp.length > 0) {
          let openApi = tmp[0].clientURI + '/openapi.json'
          let token = await this.apiClient.getAPIServerToken()
          let cols = this.collectionsList.filter(v => v.value === this.searchParams.collection)
          let api = cols && cols.length === 1 ? cols[0].text : ''

          this.$router.push({
            name: 'apiDocAndTest',
            query: {
              id: api,
              openApi: openApi,
              token: token
            }
          })
        }
      }
    },

    // 下载文件字段
    downloadFileByField(item) {
      let parms = {
        'filter[where][id][eq]': '53',
        'filter[limit]': 1
      }
      settingsApi.get(parms).then(data => {
        if (data) {
          let baseUrl = data[0].value
          let url = encodeURI(
            `${baseUrl}?dk_orginal_filename=${item['metadata.file_name']}&dk_filepath=${item['metadata.file_path']}&dk_new_filename=${item['metadata.dk_new_filename']}`
          )

          window.open(url)
        }
      })
      //
    },

    // 获取状态
    getWorkers() {
      let _this = this
      let where = {
        worker_type: 'api-server',
        ping_time: {
          gte: '$serverDate',
          gte_offset: 30000
        }
      }
      if (_this.searchParams.api_server_process_id) {
        where.process_id = _this.searchParams.api_server_process_id
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
          let items = data?.items || []
          if (items.length) {
            let record = items[0] || {}
            let workerStatus = record.workerStatus || record.worker_status || {}
            if (_this.status !== workerStatus.status) {
              _this.status = workerStatus.status
            }
          } else {
            _this.status = 'stop'
          }
        })
      _this.intervalId = setTimeout(_this.getWorkers, 5000)
    },

    // 获取数据
    async getData({ page, tags }) {
      let _this = this
      let tableData = []
      let fields = []
      let { current, size } = page
      let where = {}
      let formatTime = time => {
        return Math.floor(time / 10) / 100
      }
      this.classifyTag = tags
      if (tags) {
        this.getCollections(tags)
      }

      if (_this.condition && Object.keys(_this.condition)?.length) {
        where = this.condition
      }

      let filter = {
        limit: size,
        skip: (current - 1) * size,
        fields: {}, // 查询所有字段
        where
      }
      time = new Date().getTime()
      _this.queryTime = 0
      _this.renderTime = 0
      // 获取字段
      if (_this.apiId) {
        await modulesApi.getdata({ mondeid: _this.apiId }).then(data => {
          if (data.fields?.length) {
            let obj = {}
            data.fields.forEach(v => {
              if (v.alias_name) {
                obj[v.field_name] = v.alias_name
              }
              if (v.primary_key_position) {
                this.$set(this, 'pkName', v.field_name)
              }
            })

            this.$set(this, 'aliasNameObj', obj)
          }
        })
      }
      return (
        _this.apiClient
          .find(filter)
          .then(({ data }) => {
            let typeMap = {
              '[object String]': 'string',
              '[object Boolean]': 'boolean',
              '[object Number]': 'number',
              '[object Object]': 'object'
            }
            let oldHeaders = JSON.parse(JSON.stringify(_this.tableHeader))
            let headerMap = {}
            // 保存之前的headers
            oldHeaders.forEach(v => {
              headerMap[v.value] = v
            })
            let findData = data?.data || []
            if (findData?.length) {
              findData.forEach(record => {
                Object.keys(record).forEach(v => {
                  let isValidDate =
                    typeof record[v] === 'string' &&
                    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3}Z)?(\+\d{2}:\d{2})?$/.test(record[v])
                  if (!headerMap[v]) {
                    let value = record[v]
                    let h = {
                      show: true,
                      text: _this.aliasNameObj[v] || v,
                      type: typeMap[Object.prototype.toString.call(value)],
                      value: v,
                      pkName: record[_this.pkName]
                    }
                    let header = oldHeaders.find(it => it.value === v)
                    if (header) {
                      h.show = header.show
                    } else if (isValidDate) {
                      h.type = 'date'
                    }
                    headerMap[v] = h
                  }
                  if (isValidDate) {
                    let time = dayjs(new Date(record[v])).format('YYYY-MM-DD HH:mm:ss')
                    record[v] = _this.timeZoneConversion(time)
                  }
                })
                let isPrimaryKey = {
                  pkName: _this.pkName,
                  pkValue: record[_this.pkName]
                }
                this.$set(record, 'isshow', {})
                this.$set(record, 'isspancen', {})
                this.$set(record, 'isPrimaryKey', isPrimaryKey)
                for (let i in record) {
                  record.isshow[i] = false
                  record.isspancen[i] = true
                }
                if (fields.length) {
                  Object.keys(fields).forEach((v, index) => {
                    if (fields[index].dictionary) {
                      fields[index].dictionary.forEach(j => {
                        if (j.key == record['' + fields[index].field_name + '']) {
                          record['' + fields[index].field_name + ''] = j.value
                        }
                      })
                    }
                  })
                }
                tableData.push(record)
                record.istrue = false
              })
            }

            this.tableData = tableData
            _this.queryTime = formatTime(new Date().getTime() - time)
            return {
              total: data.total.count,
              data: this.tableData
            }
          })
          // .catch(e => {
          //   const msg = {
          //     504: _this.$t('dataExplorer_message_timeout'),
          //     500: _this.$t('dataExplorer_publish').replace('{id}', _this.collection),
          //     401: _this.$t('dataExplorer_unauthenticated'), // user not have permissions
          //     403: _this.$t('dataExplorer_no_permissions') // token expired
          //   }
          //   if (e?.response) {
          //     _this.$message.error(msg['' + (e.response ? e.response.status : '')] || e.msg)
          //   }
          // })
          .finally(() => {
            let renderStart = new Date().getTime()
            _this.$nextTick(() => {
              _this.renderTime = formatTime(new Date().getTime() - renderStart)
            })
          })
      )
    },
    // 表格显示别名
    handleAliasName(aliasName) {
      // console.log('this.aliasNameObj', aliasName, this.aliasNameObj[aliasName])
      return this.aliasNameObj[aliasName] || aliasName
    },
    // 查询
    applyQueryParams() {
      if (this.$route.query) {
        if (this.$route.query.condition) {
          let obj = JSON.parse(this.$route.query.condition)
          if (typeof obj === 'object') {
            this.$refs.queryBuild.setCondition(obj)
          }
          this.condition = obj
        }
        if (this.$route.query.sortBy) {
          this.pagination.sortBy = this.$route.query.sortBy
        }
        this.$route.query.descending = this.$route.query.descending === true || this.$route.query.descending === 'true'
        if (this.$route.query.fields) {
          let fields = JSON.parse(this.$route.query.fields)
          if (typeof fields === 'object') {
            this.tableHeaders.forEach(h => {
              if (fields.hasOwnProperty(h.value)) {
                h.show = fields[h.value]
              }
            })
          }
        }
      }
    },
    // 字段过滤
    getFieldFilter() {
      let showFields = {}
      let hideFields = {}
      this.tableHeaders.forEach(h => {
        if (h.value !== '__operation') {
          if (h.show) {
            showFields[h.value] = true
          } else {
            hideFields[h.value] = false
          }
        }
      })
      if (Object.keys(hideFields).length === 0) return null
      if (Object.keys(showFields).length > Object.keys(hideFields).length) {
        return hideFields
      } else {
        return showFields
      }
    },
    // 导出
    async exportData(type) {
      let params = {
        type: type || 'json'
      }
      // console.log(this.condition, Object.keys(this.condition))
      if (this.condition && Object.keys(this.condition).length) {
        // 有查询条件
        let queryString = this.$refs.queryBuild.serializationToRestFilter('filter', { where: this.condition })
        if (queryString) {
          queryString.split('&').forEach(v => {
            let keyValue = v.split('=')
            if (keyValue.length === 2) {
              params[keyValue[0]] = keyValue[1]
            }
          })
        }
      }
      let fieldFilter = this.getFieldFilter()
      if (fieldFilter) {
        Object.keys(fieldFilter).forEach(field => {
          params[`filter[fields][${field}]`] = fieldFilter[field]
        })
      }
      await this.apiClient.exportData(params)

      this.exportDialog = false
    },
    // 保存时区
    saveTimeZone() {
      this.save_timezone = this.without_timezone ? parseInt(this.without_timezone) : 0

      let where = {
        id: '84'
      }
      let parmas = {
        value: String(this.save_timezone)
      }

      settingsApi.update(where, parmas).then(() => {
        this.table.fetch()
        // this.$message.success(this.$t('message_save_ok'))
      })
      // .catch(() => {
      //   this.$message.error(this.$t('message_save_fail'))
      // })
      // .finally(() => {
      //   this.timeZoneDialog = false
      // })
    },
    // 初始化时区下拉
    initTimezones() {
      let timezones = [{ label: '数据库时区', value: '' }]

      for (let i = -11; i < 15; i++) {
        let timezone = ''
        if (i >= -9 && i <= 9) {
          timezone = '0' + Math.abs(i)
        } else {
          timezone = Math.abs(i)
        }
        timezone += ':00'
        let UTCName
        if (i < 0) {
          timezone = '-' + timezone
          UTCName = 'UTC ' + i
        } else {
          timezone = '+' + timezone
          UTCName = 'UTC +' + i
        }

        timezones.push({ label: UTCName, value: timezone })
      }
      this.timezones = timezones
    },

    // 获取时区
    getHandleTimeZone() {
      let filter = {
        where: {
          id: '84'
        }
      }
      settingsApi.get({ filter: JSON.stringify(filter) }).then(data => {
        if (data) {
          this.save_timezone = data[0].value

          let zone = this.save_timezone * 1
          if (zone >= -9 && zone <= 9) {
            this.without_timezone = '0' + Math.abs(zone)
          } else {
            this.without_timezone = Math.abs(zone)
          }

          if (zone < 0) {
            this.without_timezone = '-' + this.without_timezone
          } else {
            this.without_timezone = '+' + this.without_timezone
          }
          this.without_timezone += ':00'
        }
      })
    },

    // 时区转换
    timeZoneConversion(time) {
      let getTime = this.timeZoneFormat(this.save_timezone, time)
      return dayjs(new Date(getTime)).format('YYYY-MM-DD HH:mm:ss')
    },

    // 时区时间转换
    timeZoneFormat(time, timeVal) {
      time = time * 1
      if (typeof time !== 'number' && timeVal === '') return
      let day = new Date(timeVal)
      let currentTime = day.getTime()
      let offset = day.getTimezoneOffset() * 60000
      let utcTime = currentTime + offset
      return new Date(utcTime + 3600000 * time)
    },

    // 表格排序
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'clientName'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
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
.apiserver-wrap {
  .apiserver-list {
    .search-bar {
      display: flex;
      flex-direction: row;
      line-height: 34px;
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
        color: #178061;
        background-color: #c4f3cb;
      }
      .deploy_fail,
      .stop {
        color: map-get($color, danger);
        background-color: #ffecec;
      }
      .btn-refresh {
        padding: 0;
        height: 32px;
        line-height: 32px;
        width: 32px;
        min-width: 32px;
        font-size: 16px;
        &:hover,
        &.is-plain:focus:hover {
          border-color: map-get($color, primary);
          background-color: #f5f6f7;
        }
      }
    }
    .btn + .btn {
      margin-left: 10px;
    }
    .edit-text {
      height: 22px;
    }
    .table-footer {
      border: 1px solid #ebeef5;
      border-top: 0;
      span {
        padding: 0 50px 0 10px;
        font-size: 12px;
        color: map-get($fontColor, normal);
      }
    }
    .timezone {
      width: 100px;
      margin-right: 10px;
    }
  }
}
.create-dialog {
  .create-dialog-box {
    // padding: 15px;
    // background-color: #3a3d4c;
    ::v-deep {
      .el-textarea .el-textarea__inner {
        min-height: 200px !important;
        color: #82b290;
        // background-color: #262838;
        border: 0;
      }
    }
  }
}
</style>
<style lang="scss">
.apiserver-wrap {
  .table-span {
    margin: 0 2px;
    padding: 2px;
    border: 1px solid #ccc;
  }
}
</style>
