<template>
  <section class="module-warp section-wrap" v-loading="loadingFrom">
    <div class="module-warp-box section-wrap-box">
      <div class="module-form">
        <FormBuilder ref="form" v-model="createForm" :config="createFormConfig"></FormBuilder>
        <div class="module-path">
          <div class="module-path-header">
            <span>{{ $t('module_form_path') }}</span>
            <div class="module-path-button">
              <el-button
                v-if="createForm.apiType == 'customerApi' && createForm.paths.length < 1"
                size="mini"
                @click="customeApiPath"
                >{{ $t('module_form_customer_Api') }}</el-button
              >
              <el-button size="mini" v-if="apiAuthority === 'edit'" @click="updateAuthority">{{
                $t('module_form_security')
              }}</el-button>
              <el-button size="mini" v-else @click="updateAuthority">{{ $t('module_form_edit') }}</el-button>
              <el-button size="mini" v-if="createForm.status === 'active'" @click="openDocument">{{
                $t('module_form_document')
              }}</el-button>
              <el-button size="mini" v-if="createForm.status === 'active'">{{ $t('module_form_preview') }}</el-button>
            </div>
          </div>
          <div class="module-path-content">
            <div class="module-path-item" v-for="(item, index) in createForm.paths" :key="index">
              <div class="module-path-item-group" v-if="apiAuthority === 'edit'">
                <div class="module-path-item-button">
                  <span class="module-path-item-method" :class="'label-' + getstyle(item)">{{ item.method }}</span>
                  <span class="module-path-item-text">{{ item.path }}</span>
                </div>
                <div class="module-path-button-box">
                  <div class="module-path-item-description">{{ item.description }}</div>
                  <div style="margin-left: 10px">
                    <el-tooltip class="item" effect="dark" :content="$t('button_delete')" placement="bottom">
                      <span title="remove" @click="removeApiPath(index)" style="margin-right: 10px; cursor: pointer"
                        ><i class="fa fa-times el-icon-delete"></i
                      ></span>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" :content="$t('button_edit')" placement="left">
                      <span title="edit" @click="editApiPath(item)" v-if="item.type !== 'preset'"
                        ><i class="fa fa-edit el-icon-edit-outline"></i
                      ></span>
                    </el-tooltip>
                  </div>
                </div>
              </div>
              <template v-else>
                <div>
                  <span class="module-path-item-method" :class="'label-' + getstyle(item)">{{ item.method }}</span>
                  <span class="module-path-item-text">{{ item.path }}</span>
                </div>
                <div class="module-path-item-role">
                  <el-select v-model="item.acl" multiple size="mini" placeholder="请选择">
                    <el-option v-for="item in roles" :key="item.name" :label="item.name" :value="item.name">
                    </el-option>
                  </el-select>
                </div>
              </template>
            </div>
            <div class="module-path-item" v-if="createForm.paths.length === 0">No record found</div>
          </div>
          <div class="module-tags">
            <span>{{ $t('module_form_tags') }}</span>
            <span v-for="item in createForm.listtags" :key="item.id">{{ item.value }}</span>
            <el-button type="primary" @click="handleOpenTag()" size="small">
              {{ $t('module_form_edit') }}
            </el-button>
          </div>
          <div class="module-form-footer">
            <el-button class="cancel" @click="handleBack()" size="small">
              {{ $t('button_back') }}
            </el-button>
            <el-button type="primary" @click="submit()" size="small"> {{ $t('button_save') }}</el-button>
          </div>
        </div>
        <CustomerApiForm
          v-if="dialogVisible"
          :apiData="apiData"
          :dialogVisible="dialogVisible"
          @dialogVisible="handleDialogVisible"
          @backApiPath="handleBackApiPath"
        ></CustomerApiForm>
        <SelectClassify ref="classify" :types="['api']" @operationsClassify="saveClassify"></SelectClassify>
      </div>
    </div>
  </section>
</template>

<script>
import APIClient from '@/api/ApiClient'
import CustomerApiForm from './CustomerApiForm'
import SelectClassify from '@/components/SelectClassify'
export default {
  name: 'ModuleForm',
  components: { CustomerApiForm, SelectClassify },
  data() {
    return {
      createFormConfig: null,
      apiData: {},
      dialogVisible: false,
      apiClient: null,
      createForm: {
        datasource: '',
        tablename: '',
        readPreference: '',
        readConcern: '',
        apiVersion: 'v1',
        name: '',
        describtion: '',
        prefix: '',
        basePath: '',
        path: '',
        apiType: 'defaultApi',
        status: 'pending',
        createType: '',
        paths: [],
        listtags: []
      },
      roles: [],
      fields: [],
      tagFlag: false,
      apiAuthority: 'edit',
      loadingFrom: false
    }
  },
  created() {
    this.getForm()
    this.getConnection()
    if (this.$route.query.id) {
      this.getDetail()
    }

    this.getRoles()
    let prefix = this.createForm.prefix ? this.createForm.prefix + '/' : ''
    this.createForm.path = '/api/' + this.createForm.apiVersion.toLowerCase() + '/' + prefix + this.createForm.basePath
  },
  watch: {
    // 数据库切换获取表
    'createForm.datasource'() {
      this.getTableData()
    },
    'createForm.tablename'(val) {
      let fields = []
      let selectedCollections = this.createFormConfig.items[1].options.filter(v => v.value === val)
      selectedCollections.forEach(v => {
        fields = fields.concat(v.fields)
      })
      this.fields = fields
    },
    'createForm.apiType'(newType, oldType) {
      if (this.$route.query.id && (newType === oldType || oldType === '')) return
      this.createForm.paths = []
      if (newType === 'defaultApi') {
        this.initPresetPaths()
      }
    },
    'createForm.apiVersion'() {
      this.updatePath()
    },
    'createForm.basePath'() {
      this.updatePath()
      if (this.createForm.apiType === 'defaultApi') {
        this.initPresetPaths()
      }
    },
    'createForm.prefix'() {
      this.updatePath()
    }
  },
  methods: {
    // 关闭自定义api弹窗
    handleDialogVisible() {
      this.dialogVisible = false
    },
    // 自定义api数据返回
    handleNewApiPath() {},

    // 移除api路径
    removeApiPath(index) {
      this.createForm.paths.splice(index, 1)
    },
    // 更新路径
    updatePath() {
      let prefix = this.createForm.prefix ? this.createForm.prefix + '/' : ''
      this.createForm.path =
        '/api/' + this.createForm.apiVersion.toLowerCase() + '/' + prefix + this.createForm.basePath
      this.createForm.paths.forEach(v => {
        let prefix = this.createForm.prefix ? this.createForm.prefix + '/' : ''
        if (['findById', 'updateById', 'deleteById'].indexOf(v.name) !== -1) {
          v.path = '/api/' + this.createForm.apiVersion + '/' + prefix + this.createForm.basePath + '/{id}'
        } else if (v.type !== 'custom') {
          v.path = '/api/' + this.createForm.apiVersion + '/' + prefix + this.createForm.basePath
        } else {
          v.path = '/api/' + this.createForm.apiVersion + '/' + prefix + this.createForm.basePath //+'/'+ v.namespace;//+'/'+ v.name//"/cust/"+
        }
      })
    },
    // 获取api数据
    getDetail() {
      let _this = this
      this.$api('modules')
        .get([this.$route.query.id])
        .then(res => {
          if (res) {
            Object.assign(_this.createForm, res.data)
            // _this.createForm.apiType = res.data.apiType
            // _this.createForm.datasource = res.data.datasource
            _this.fields = res.data.fields
            _this.getTableData()
          }
        })
    },
    // 获取数据库
    getConnection() {
      let fields = {
        id: true,
        name: true,
        connection_type: true,
        status: true,
        user_id: true
      }
      let where = {
        or: [{ connection_type: 'source_and_target' }, { connection_type: 'target' }],
        database_type: {
          in: ['mongodb', 'gridfs', 'oracle', 'mysql', 'sqlserver', 'postgres']
        }
      }
      let params = {
        fields: fields,
        where
      }
      this.$api('connections')
        .get({
          filter: JSON.stringify(params)
        })
        .then(res => {
          let options = []
          options = res.data.items.map(db => {
            return {
              label: db.name,
              value: db.id
            }
          })
          this.createFormConfig.items[0].options = options
        })
    },
    // 获取表数据
    getTableData() {
      let params = {
        where: {
          id: this.createForm.datasource
        }
      }
      this.$api('connections')
        .get({
          filter: JSON.stringify(params)
        })
        .then(res => {
          let options = []
          if (res.data?.items?.length && res.data.schema?.tables?.length)
            options = res.data.items[0].schema.tables.map(table => {
              return {
                label: table.table_name,
                value: table.table_name,
                fields: table.fields
              }
            })
          this.createFormConfig.items[1].options = options
        })
    },

    // 初始化pai路径
    initPresetPaths() {
      let prefix = this.createForm.prefix ? this.createForm.prefix + '/' : ''
      this.createForm.paths = []
      let preset = {
        path: '/api/' + this.createForm.apiVersion + '/' + prefix + this.createForm.basePath,
        method: 'POST',
        description: this.$t('module_form_create_a_new_record'),
        name: 'create',
        result: 'Document',
        type: 'preset',
        acl: ['admin']
      }
      this.createForm.paths.push(preset)
      preset = {
        path: '/api/' + this.createForm.apiVersion + '/' + prefix + this.createForm.basePath + '/{id}',
        method: 'GET',
        description: this.$t('module_form_get_record_by_id'),
        name: 'findById',
        params: [{ name: 'id', type: 'string', defaultvalue: 1, description: 'document id' }],
        result: 'Document',
        type: 'preset',
        acl: ['admin']
      }
      this.createForm.paths.push(preset)
      preset = {
        path: '/api/' + this.createForm.apiVersion + '/' + prefix + this.createForm.basePath + '/{id}',
        method: 'PATCH',
        name: 'updateById',
        params: [{ name: 'id', type: 'string', defaultvalue: 1, description: 'document id' }],
        description: this.$t('module_form_update_record_by_id'),
        result: 'Document',
        type: 'preset',
        acl: ['admin']
      }
      this.createForm.paths.push(preset)
      preset = {
        path: '/api/' + this.createForm.apiVersion + '/' + prefix + this.createForm.basePath + '/{id}',
        method: 'DELETE',
        name: 'deleteById',
        params: [{ name: 'id', type: 'string', description: 'document id' }],
        description: this.$t('module_form_delete_record_by_id'),
        type: 'preset',
        acl: ['admin']
      }
      this.createForm.paths.push(preset)
      preset = {
        path: '/api/' + this.createForm.apiVersion + '/' + prefix + this.createForm.basePath,
        method: 'GET',
        name: 'findPage',
        params: [
          { name: 'page', type: 'int', defaultvalue: 1, description: 'page number' },
          { name: 'limit', type: 'int', defaultvalue: 20, description: 'max records per page' },
          { name: 'sort', type: 'object', description: "sort setting,Array ,format like [{'propertyName':'ASC'}]" },
          { name: 'filter', type: 'object', description: 'search filter object,Array' }
        ],
        description: this.$t('module_form_get_record_list_by_page_and_limit'),
        result: 'Page<Document>',
        type: 'preset',
        acl: ['admin']
      }
      this.createForm.paths.push(preset)
    },
    // 创建自定义api
    customeApiPath() {
      this.apiData = {
        method: 'GET',
        condition: {},
        createType: 'add',
        fields: this.fields || [],
        availableQueryField: [],
        requiredQueryField: [],
        type: 'custom',
        acl: ['admin']
      }
      // if (this.apiData?.field?.length) {
      //   this.apiData.fields.forEach(v => (v.visible = true))
      // }
      this.dialogVisible = true
    },
    // 编辑自定义api路径
    editApiPath(item) {
      this.apiData = item
      this.apiData.createType = 'edit'
      this.dialogVisible = true
    },
    // 打开api文档
    openDocument() {
      this.apiClient = new APIClient()
      this.$api('ApiServer')
        .get({ 'filter[limit]': 1 })
        .then(res => {
          if (res?.data?.length) {
            let apiServer = res.data[0]
            let apiServerUri = apiServer.clientURI
            let openApiUri = apiServerUri + '/openapi.json'
            let api = this.createForm.basePath + '_' + this.createForm.apiVersion
            let token = this.apiClient.getAPIServerToken()

            this.$router.push({
              name: 'apiDocAndTest',
              query: {
                id: api,
                openApi: openApiUri,
                token: token
              }
            })
          } else {
            this.$message.error(this.$t('module_form_no_server_preview_api'))
          }
        })
        .catch(() => {
          this.$message.error(this.$t('module_form_get_api_uri_fail'))
        })
    },
    // 获取角色权限
    getRoles() {
      this.$api('role')
        .get({})
        .then(res => {
          if (res) {
            this.roles = res.data
            this.roles.push({
              name: this.$t('module_form_public_api'),
              id: '$everyone'
            })
          }
        })
        .catch(e => {
          this.$message.error(e.response.msg)
        })
    },
    // 更新权限编辑按钮展示
    updateAuthority() {
      this.apiAuthority = this.apiAuthority === 'edit' ? 'security' : 'edit'
    },

    // 打开数据目录
    handleOpenTag() {
      let id = this.$route.query.id
      if (id) {
        this.$refs.classify.show(this.apiData.listtags ? this.apiData.listtags : {})
      } else {
        this.$refs.classify.show({})
      }
    },
    // 保存数据目录
    saveClassify(tag) {
      this.createForm.listtags = tag
    },

    // 路径颜色
    getstyle(item) {
      switch (item.method) {
        case 'STREAM':
          return 'purple'
        case 'GET':
          return 'blue'
        case 'POST':
          return 'green'
        case 'PATCH':
          return 'yellow'
        case 'DELETE':
          return 'red'
      }
    },
    // 返回新建api路径
    handleBackApiPath(apiData) {
      Object.assign(this.apiData, apiData)

      let prefix = this.createForm.prefix ? this.createForm.prefix + '/' : ''
      this.createForm.apiVersion
      this.apiData.path = '/api/' + this.createForm.apiVersion + '/' + prefix + this.createForm.basePath //+'/'+ this.api.namespace;//+'/'+ this.api.name;//"/cust/"+

      if (this.apiData.createType == 'add') {
        this.createForm.paths.push(this.apiData)
      }
      delete this.createForm.createType
      this.dialogVisible = false
      this.createForm.createType = ''
    },
    // 保存
    submit() {
      this.loadingFrom = true
      if (this.createForm.paths?.length < 1) {
        this.$message.error(this.$t('module_form_noPath'))
        return
      }
      const id = this.$route.query.id
      const method = id ? 'patch' : 'post'

      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.createForm.paths?.length) {
            let publicPermission = this.$t('module_form_public_api')
            this.createForm.paths.forEach(item => {
              if (item.cal) {
                if (item.cal.indexOf(publicPermission) !== -1 && item.cal.index('$everyone') === -1)
                  item.acl.push('$everyone')
              }
            })
          }
          this.$api('modules')
            [method](this.createForm)
            .then(res => {
              if (res) {
                this.$router.push({
                  name: 'modules'
                })
                this.$message.success(this.$t('message_save_ok'))
              }
            })
            .catch(e => {
              if (e?.response?.msg == 'duplication for name') {
                this.$message.error(this.$t('module_form_duplication_name') + ',' + this.$t('message_save_fail'))
              }
              this.$message.error(this.$t('message_save_fail'))
            })
            .finally(() => {
              this.loadingFrom = false
            })
        }
      })
    },
    // 返回列表
    handleBack() {
      this.$router.push({ name: 'modules' })
    },
    // 表单
    getForm() {
      this.createFormConfig = {
        form: {
          labelPosition: 'right',
          labelWidth: '100px'
        },
        items: [
          {
            type: 'select',
            label: this.$t('module_form_connection'),
            field: 'datasource',
            options: [],
            required: true
          },
          {
            type: 'select',
            label: this.$t('module_form_tablename'),
            field: 'tablename',
            options: [],
            required: true
          },
          {
            type: 'select',
            label: 'readPreference',
            field: 'readPreference',
            options: [
              { label: '', value: '' },
              { label: 'primary', value: 'primary' },
              { label: 'primaryPreferred', value: 'primaryPreferred' },
              { label: 'secondary', value: 'secondary' },
              { label: 'secondaryPreferred', value: 'secondaryPreferred' },
              { label: 'nearest', value: 'nearest' }
            ]
          },
          {
            type: 'input',
            label: 'readPreference Tag',
            field: 'readPreferenceTag',
            show: true,
            dependOn: [
              {
                triggerOptions: [
                  {
                    field: 'readPreference',
                    value: 'primary'
                  }
                ],
                triggerConfig: {
                  show: false
                }
              },
              {
                triggerOptions: [
                  {
                    field: 'readPreference',
                    value: ''
                  }
                ],
                triggerConfig: {
                  show: false
                }
              }
            ]
          },
          {
            type: 'select',
            label: 'readConcern',
            field: 'readConcern',
            options: [
              { label: '', value: '' },
              { label: 'local', value: 'local' },
              { label: 'available', value: 'available' },
              { label: 'majority', value: 'majority' },
              { label: 'linearizable', value: 'linearizable' },
              { label: 'snapshot', value: 'snapshot' }
            ]
          },
          {
            type: 'input',
            label: this.$t('module_form_version'),
            field: 'apiVersion',
            required: true
          },
          {
            type: 'input',
            label: this.$t('module_form_name'),
            field: 'name',
            required: true,
            rules: [
              {
                required: true,
                validator: (rule, v, callback) => {
                  const flag = /^[a-zA-Z\$_\u4e00-\u9fa5][a-zA-Z\u4e00-\u9fa5\d\$_]*$/.test(v) // eslint-disable-line
                  if (!flag) {
                    return callback(new Error(this.$t('module_form_validator_name')))
                  }
                  return callback()
                }
              }
            ]
          },
          {
            type: 'input',
            label: this.$t('module_form_describtion'),
            field: 'describtion',
            domType: 'textarea',
            maxlength: 100,
            showWordLimit: true
          },
          {
            type: 'input',
            label: this.$t('module_form_prefix'),
            field: 'prefix',
            maxlength: 100,
            showWordLimit: true
          },
          {
            type: 'input',
            label: this.$t('module_form_basePath'),
            field: 'basePath',
            required: true,
            maxlength: 100,
            showWordLimit: true,
            rules: [
              {
                required: true,
                validator: (rule, v, callback) => {
                  const flag = /^[a-zA-Z\$_\u4e00-\u9fa5][a-zA-Z\u4e00-\u9fa5\d\$_]*$/.test(v) // eslint-disable-line
                  if (!flag) {
                    return callback(new Error(this.$t('module_form_validator_name')))
                  }
                  return callback()
                }
              }
            ]
          },
          {
            type: 'input',
            label: this.$t('module_form_path'),
            field: 'path',
            disabled: true,
            maxlength: 100,
            showWordLimit: true
          },
          {
            type: 'radio',
            field: 'apiType',
            label: this.$t('module_form_method'),
            options: [
              { label: this.$t('module_form_default_Api'), value: 'defaultApi' },
              { label: this.$t('module_form_customer_Api'), value: 'customerApi' }
            ]
          }
        ]
      }
    }
  }
}
</script>

<style scoped lang="scss">
.module-warp {
  box-sizing: border-box;
  overflow: hidden;
  .module-warp-box {
    // width: 100%;
    // height: 100%;
    overflow: auto;
    .module-form {
      width: 1000px;
      margin: 0 auto;
      box-sizing: border-box;
      // overflow: hidden;
      ::deep {
        .el-form-item {
          margin-bottom: 20px;
          .el-form-item__label {
            width: 140px !important;
            text-align: right;
          }
          .el-form-item__content {
            margin-left: 140px !important;
            .el-radio--mini.is-bordered {
              padding: 0 15px 0 10px;
            }
          }
        }
      }
      .module-path-header {
        display: flex;
        justify-content: space-between;
        span {
          display: inline-block;
          width: 140px;
          padding-right: 20px;
          text-align: right;
          box-sizing: border-box;
        }
      }
      .module-path-content {
        padding: 20px 0 20px 70px;
        .module-path-item {
          padding: 10px 15px 12px;
          border: 1px solid #eee;
          border-top: 0;
          color: #999;
          font-size: 10px;
          cursor: pointer;
          &:first-child {
            border-top: 1px solid #eee;
          }
          .module-path-item-group {
            display: flex;
            justify-content: space-between;
          }
          .module-path-button-box {
            display: flex;
          }
          .module-path-item-method {
            display: inline-block;
            width: 80px;
            padding: 3px;
            text-align: center;
            font-size: 11px;
            color: #fff;
          }
          .module-path-item-text {
            padding-left: 20px;
          }
          .module-path-item-button {
            span {
              padding: 0 5px;
            }
          }
          .module-path-item-role {
            margin-top: 10px;
            ::v-deep {
              .el-select {
                width: 100%;
                .el-select__tags {
                  max-width: 100%;
                }
              }
            }
          }
          .label-default {
            background-color: #999 !important;
          }
          .label-primary {
            background-color: #dc6767 !important;
          }
          .label-red {
            background-color: #bf4346 !important;
          }
          .label-orange {
            background-color: #e9662c !important;
          }
          .label-green {
            background-color: #488c6c !important;
          }
          .label-yellow {
            background-color: #f2994b !important;
          }
          .label-blue {
            background-color: #0a819c !important;
          }
        }
      }
      .module-tags {
        padding: 20px 0 20px 70px;
        font-size: 12px;
        span {
          padding: 0 20px;
        }
        .e-button {
          padding-left: 20px;
        }
      }
      .module-form-footer {
        text-align: center;
      }
    }
  }
}
</style>
