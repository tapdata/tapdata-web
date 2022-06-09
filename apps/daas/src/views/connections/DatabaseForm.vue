<template>
  <div class="connection-from" v-loading="loadingFrom">
    <div class="connection-from-body">
      <main class="connection-from-main">
        <div class="connection-from-title">
          {{
            $route.params.id ? this.$t('connection_form_edit_connection') : this.$t('connection_form_creat_connection')
          }}
        </div>
        <div class="connection-from-label" v-if="$route.params.id">
          <label class="label">{{ $t('connection_form_connection_name') }}: </label>
          <div class="content-box">
            <div class="img-box ml-2">
              <img :src="getConnectionIcon()" alt="" />
            </div>
            <div class="content ml-2">{{ model.name }}</div>
            <div class="addBtn cursor-pointer color-primary ml-2" @click="dialogEditNameVisible = true">
              {{ $t('connection_form_rename') }}
            </div>
          </div>
        </div>
        <div class="connection-from-label" v-else>
          <label class="label">{{ $t('connection_form_data_source_type') }}:</label>
          <div class="content-box">
            <div class="img-box ml-2">
              <img :src="getConnectionIcon()" alt="" />
            </div>
            <span class="ml-2">{{ databaseType }}</span>
            <el-button class="ml-2" type="text" @click="dialogDatabaseTypeVisible = true">
              {{ $t('connection_form_change') }}
            </el-button>
          </div>
        </div>
        <div class="form-wrap">
          <div class="form">
            <SchemaToForm ref="schemaToForm" :schema="schemaData" :colon="true" label-width="160"></SchemaToForm>
            <span class="status">
              <span class="error" v-if="['invalid'].includes(status)">
                <VIcon>error</VIcon>
                <span>
                  {{ $t('connection.status.invalid') }}
                </span>
              </span>
              <span class="success" v-if="['ready'].includes(status)">
                <i class="el-icon-success"></i>
                <span>
                  {{ $t('connection.status.ready') }}
                </span>
              </span>
              <span class="warning" v-if="['testing'].includes(status)">
                <i class="el-icon-warning"></i>
                <span>
                  {{ $t('connection.status.testing') }}
                </span>
              </span>
            </span>
          </div>
        </div>
        <footer slot="footer" class="footer">
          <div class="footer-btn">
            <el-button size="mini" @click="goBack()">{{ $t('button_back') }}</el-button>
            <el-button size="mini" class="test" @click="startTest()">{{ $t('connection_list_test_button') }}</el-button>
            <el-button size="mini" type="primary" :loading="submitBtnLoading" @click="submit">
              {{ $t('button_save') }}
            </el-button>
          </div>
        </footer>
      </main>
      <!-- </div>
      </main> -->
    </div>
    <Test
      ref="test"
      :dialogTestVisible.sync="dialogTestVisible"
      :formData="model"
      @returnTestData="returnTestData"
    ></Test>
    <DatabaseTypeDialog
      :dialogVisible.sync="dialogDatabaseTypeVisible"
      @databaseType="handleDatabaseType"
    ></DatabaseTypeDialog>
    <el-dialog
      :title="$t('connection.rename')"
      :close-on-click-modal="false"
      :visible.sync="dialogEditNameVisible"
      width="30%"
    >
      <el-form :model="renameData" :rules="renameRules" ref="renameForm" @submit.native.prevent>
        <el-form-item prop="rename">
          <el-input v-model="renameData.rename" maxlength="100" show-word-limit></el-input>
        </el-form-item>
        <span style="color: #ccc; margin-top: 5px; font-size: 12px; display: inline-block"
          >中英开头，1～100个字符，可包含中英文、数字、中划线、下划线、空格</span
        >
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancelRename" size="mini">{{ $t('button_cancel') }}</el-button>
        <el-button @click="submitEdit()" size="mini" type="primary" :loading="editBtnLoading">{{
          $t('button_confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import factory from '@/api/factory'
import formConfig from './config'
import Test from './Test'
import { TYPEMAPCONFIG, defaultModel, getConnectionIcon } from './util'
import DatabaseTypeDialog from './DatabaseTypeDialog'
import VIcon from '@/components/VIcon'
import SchemaToForm from '@tap/dag/src/components/SchemaToForm'
import { checkConnectionName } from '@/utils/util'
import Cookie from '@tap/shared/src/cookie'

const connectionsModel = factory('connections')
let defaultConfig = []
export default {
  name: 'DatabaseForm',
  components: { Test, DatabaseTypeDialog, VIcon, SchemaToForm },
  data() {
    let validateExcelHeader = (rule, value, callback) => {
      let start = this.model.excel_header_start
      let end = this.model.excel_header_end
      let config = this.model.gridfs_header_config
      if (start === '') {
        callback(new Error(this.$t('editor.fileFormBuilder.excel_header_start') + this.$t('formBuilder.noneText')))
      } else if (end === '') {
        callback(new Error(this.$t('editor.fileFormBuilder.excel_header_end') + this.$t('formBuilder.noneText')))
      } else if (config === '' && this.model.gridfs_header_type === 'custom') {
        callback(new Error(this.$t('editor.fileFormBuilder.header_type_required')))
      } else if ((!/^[A-Z]+[1-9]+$/.test(start) && start !== '') || (!/^[A-Z]+[1-9]+$/.test(end) && end !== '')) {
        callback(new Error(this.$t('editor.fileFormBuilder.excel_cell_tip')))
      } else {
        callback()
      }
    }
    let validateSheet = (rule, value, callback) => {
      let start = this.model.sheet_start
      let end = this.model.sheet_end
      if (start === '') {
        callback(new Error(this.$t('editor.fileFormBuilder.sheet_start') + this.$t('formBuilder.noneText')))
      } else if (end === '') {
        callback(new Error(this.$t('editor.fileFormBuilder.sheet_end') + this.$t('formBuilder.noneText')))
      } else if (start > end) {
        callback(new Error(this.$t('editor.fileFormBuilder.excel_value_end_gt_start')))
      } else {
        callback()
      }
    }
    let validateRename = (rule, value, callback) => {
      if (!this.renameData.rename || !this.renameData.rename.trim()) {
        callback(new Error(this.$t('dataForm.form.connectionName') + this.$t('formBuilder.noneText')))
      } else if (!checkConnectionName(this.renameData.rename)) {
        callback(new Error('名称规则：中英开头，1～100个字符，可包含中英文、数字、中划线、下划线、空格'))
      } else {
        callback()
      }
    }
    return {
      accessNodeList: [],
      // modelForm: {},
      rules: [],
      id: '',
      visible: false,
      createStrategyDisabled: false,
      timezones: [],
      dataTypes: [],
      logSaveList: [1, 2, 3, 4, 5, 6, 7],
      mongodbList: [],
      showSystemConfig: false,
      tableList: [], //共享挖掘
      model: '',
      config: {
        items: []
      },
      checkItems: null,
      databaseType: '',
      typeMap: this.$const.TYPEMAP,
      timer: null,
      status: '',
      loadingFrom: true,
      dialogTestVisible: false,
      dialogDatabaseTypeVisible: false,
      dialogEditNameVisible: false,
      submitBtnLoading: false,
      editBtnLoading: false,
      connectionTypeOption: '',
      isUrlOption: '',
      renameData: {
        rename: ''
      },
      kafka: {
        id: '',
        name: '',
        database_type: '',
        connection_type: '',
        kafkaBootstrapServers: '',
        kafkaPatternTopics: '',
        kafkaIgnoreInvalidRecord: false,
        kafkaAcks: '',
        kafkaCompressionType: '',
        kafkaIgnorePushError: false
      },
      width: 440,
      height: 300,
      instanceModelZone: '',
      instanceMock: [],
      dataSourceZone: '',
      dataSourceMock: [],
      ecsPageSize: 10,
      ecsPage: 1,
      vpcList: [],
      ecsList: [],
      gridFSrules: {
        gridfs_header_config: [
          {
            required: true,
            message: this.$t('editor.fileFormBuilder.gridfs_header_config'),
            trigger: 'blur'
          }
        ],
        excel_header_start: [
          {
            validator: validateExcelHeader,
            trigger: 'blur'
          }
        ],
        sheet_start: [
          {
            validator: validateSheet,
            trigger: 'blur'
          }
        ]
      },
      renameRules: {
        rename: [{ validator: validateRename, trigger: 'blur' }]
      },
      pdkOptions: {},
      schemaData: null,
      pdkFormModel: {}
    }
  },
  computed: {
    schemaFormInstance() {
      return this.$refs.schemaToForm.getForm?.()
    }
  },
  created() {
    let self = this
    defaultConfig = [
      {
        type: 'input',
        field: 'name',
        label: self.$t('dataForm.form.connectionName'),
        required: true,
        maxlength: 100,
        width: '504px',
        showWordLimit: true,
        show: true,
        customClass: 'large-item',
        rules: [
          {
            required: true,
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (!value || !value.trim()) {
                callback(new Error('连接名称不能为空'))
              } else if (!checkConnectionName(value)) {
                callback('连接名称中英开头，1～100个字符，可包含中英文、数字、中划线、下划线、空格')
              } else if (value && value.trim() && checkConnectionName(value)) {
                let filter = {
                  where: {
                    name: this.model.name
                  },
                  fields: {
                    name: 1
                  },
                  limit: 1
                }
                if (this.id) {
                  filter.where['id'] = { neq: this.id }
                }
                this.$api('connections')
                  .get({
                    filter: JSON.stringify(filter)
                  })
                  .then(res => {
                    if (res.data?.total !== 0) {
                      callback(new Error('名称已存在'))
                    } else callback()
                  })
              } else {
                callback()
              }
            }
          }
        ]
      }
    ]
    this.id = this.$route.params.id || ''
    this.databaseType = this.$route.query.databaseType || this.$store.state.createConnection.databaseType
    //确认类型 按照type 初始化变量

    this.model = Object.assign({}, defaultModel['default'])
    switch (this.databaseType) {
      case 'kafka':
        this.model = Object.assign({}, defaultModel['kafka'])
        break
      case 'file':
        this.model = Object.assign({}, defaultModel['file'])
        break
      case 'jira':
        this.model = Object.assign({}, defaultModel['jira'])
        break
      case 'rest api':
        this.model = Object.assign({}, defaultModel['restApi'])
        break
      case 'custom_connection':
        this.model = Object.assign({}, defaultModel['custom_connection'])
        break
      case 'mq':
        this.model = Object.assign({}, defaultModel['mq'])
        break
      case 'gridfs':
        this.model = Object.assign({}, defaultModel['default'], defaultModel['gridfs'])
        break
      case 'tcp_udp':
        this.model = Object.assign({}, defaultModel['tcp'])
        break
      case 'hana':
        this.model = Object.assign({}, defaultModel['default'], defaultModel['hana'])
        break
      case 'vika':
        this.model = Object.assign({}, defaultModel['vika'])
        break
    }
    this.initTimezones()
    this.checkDataTypeOptions(this.databaseType)
    this.getCluster()
    this.getPdkForm()
  },
  watch: {
    'model.multiTenant'(val) {
      if (!val) {
        this.model.pdb = ''
      }
    },
    'model.region'() {
      this.changeInstanceRegion()
    },
    'model.s_region'() {
      this.changeDataSourceRegion()
    },
    'model.zone'() {
      this.getDataSourceRegion() //选择完zone 联动实例vip 接口
    },
    'model.s_zone'() {
      this.changeDatabaseHost()
    },
    'model.sourceType'() {
      this.getEcsList()
    },
    'model.ecs'() {
      this.ecsList = this.ecsList || []
      if (!this.ecsList || this.ecsList.length === 0) return
      this.handleStrategy()
    }
  },
  methods: {
    formChange(data) {
      let filed = data.field || ''
      let value = data.value
      if (filed === 'connection_type') {
        this.model.redoLogParserEnable = false
        this.model.shareCdcEnable = false
      }
      //rest api
      if (filed === 'data_sync_mode') {
        if (value === 'INITIAL_INCREMENTAL_SYNC') {
          this.model.url_info = []
          if (this.model.auth_type === 'oauth2') {
            this.addUrlInfo('GET_TOKEN')
          }
          this.addUrlInfo('INITIAL_SYNC')
          this.addUrlInfo('INCREMENTAL_SYNC')
        } else if (value === 'INITIAL_SYNC') {
          this.addUrlInfo('INITIAL_SYNC')
          this.removeUrlInfo('INCREMENTAL_SYNC')
        } else {
          this.addUrlInfo('INCREMENTAL_SYNC')
          this.removeUrlInfo('INITIAL_SYNC')
        }
      }
      if (filed === 'auth_type') {
        if (value === 'oauth2') {
          this.addUrlInfo('GET_TOKEN')
        } else {
          this.removeUrlInfo('GET_TOKEN')
        }
      }
      // custom_connection
      if (filed === 'connection_type' || filed === 'custom_type') {
        this.model.custom_ondata_script = ''
        this.model.custom_cdc_script = ''
        this.model.custom_initial_script = ''
      }
      if (filed === 'custom_before_opr') {
        this.model.custom_before_script = ''
      }
      if (filed === 'custom_after_opr') {
        this.model.custom_after_script = ''
      }
      //维格表
      if (filed === 'plain_password' && this.model.database_type === 'vika') {
        this.getSpaceVika()
      }
      //共享挖掘
      if (filed === 'shareCdcEnable') {
        //请求是否有全局共享挖掘配置
        this.check()
        //日志时长
        this.changeConfig([], 'logSaveList')
      }
      if (filed === 'persistenceMongodb_uri_db') {
        //请求是否有全局共享挖掘配置
        this.model.persistenceMongodb_collection = '' //清空之前的数据
        this.handleTables()
      }
    },
    async initData(data) {
      let editData = null
      if (this.$route.params.id) {
        if (this.model.database_type === 'mongodb') {
          editData = await this.$api('connections').customQuery([this.$route.params.id])
        } else {
          editData = await this.$api('connections').getNoSchema(this.$route.params.id)
        }

        if (
          editData.data.database_type === 'mq' &&
          (typeof editData.data.mqQueueSet === 'object' || typeof editData.data.mqTopicSet === 'object')
        ) {
          let mqQueueSet = editData.data.mqQueueSet.length ? editData.data.mqQueueSet.join(',') : ''
          let mqTopicSet = editData.data.mqTopicSet.length ? editData.data.mqTopicSet.join(',') : ''
          editData.data.mqQueueSet = mqQueueSet
          editData.data.mqTopicSet = mqTopicSet
        }
        this.model = Object.assign(this.model, editData.data)
        if (this.model.sourceType === 'ecs') {
          this.getEcsList()
        }
        this.renameData.rename = this.model.name
        this.model.isUrl = false
        if (this.model.database_type === 'vika') {
          //初始化维格表
          this.getSpaceVika(this.$route.params.id)
        }
        if (!this.model.accessNodeProcessId) {
          this.model.accessNodeProcessId = this.accessNodeList?.[0]?.processId
        }
      } else {
        this.model = Object.assign(this.model, data, { name: this.model.name })
        this.model.isUrl = true
      }
      if (this.model.database_type === 'file' && this.model.file_sources) {
        this.model.file_sources.forEach(item => {
          if (item.exclude_filename) {
            this.$set(item, 'selectFileType', 'exclude')
          } else {
            this.$set(item, 'selectFileType', 'include')
          }
        })
      }
    },
    checkDataTypeOptions(type) {
      this.model.database_type = type
      this.getFormConfig()
    },
    initTimezones() {
      let timezones = [{ label: '(Database Timezone)', value: '' }]

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
    //获取维格表的空间
    getSpaceVika(id) {
      if ((!this.model.plain_password || this.model.plain_password === '') && !id) {
        return
      }
      let params = {
        load_type: 'space',
        database_host: this.model.database_host,
        api_token: this.model.plain_password,
        connection_id: id || ''
      }
      this.$api('connections')
        .getSpace(params)
        .then(data => {
          if (data.data.status === 'SUCCESS') {
            this.changeConfig(data.data.result || [], 'set_space')
          } else {
            this.$message.error(data.data?.error)
          }
        })
    },
    // 共享挖掘设置
    check() {
      Promise.all([this.$api('logcollector').check(), this.$api('logcollector').getSystemConfig()]).then(
        ([check, res]) => {
          let verify = check?.data
          let digSettingForm = res?.data
          if (verify && !digSettingForm?.persistenceMongodb_uri_db) {
            this.showSystemConfig = true
            this.getMongodb() //打开全局设置
          }
        }
      )
    },
    //获取所有mongo连接
    getMongodb() {
      let filter = {
        where: {
          database_type: 'mongodb'
        }
      }
      this.$api('connections')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          if (res) {
            this.mongodbList = res?.data?.items
            this.changeConfig([], 'mongodbList')
            this.model.showShareConfig = true
          }
        })
    },
    //根据已选connectionId->tables
    handleTables() {
      this.$api('connections')
        .customQuery(this.model.persistenceMongodb_uri_db, { schema: true })
        .then(res => {
          if (res) {
            this.tableList = res?.data?.schema?.tables || []
            this.changeConfig([], 'tableList')
          }
        })
    },
    //保存全局挖掘设置
    saveSetting() {
      let digSettingForm = {
        persistenceMongodb_uri_db: this.model.persistenceMongodb_uri_db,
        persistenceMongodb_collection: this.model.persistenceMongodb_collection,
        share_cdc_ttl_day: this.model.share_cdc_ttl_day
      }
      this.$api('logcollector')
        .patchSystemConfig(digSettingForm)
        .then(res => {
          if (res) {
            this.settingDialogVisible = false
            this.$message.success('保存全局设置成功')
          }
        })
    },

    //rest api addUrl
    addUrlInfo(type) {
      let urlInfo = {
        url: '',
        method: 'GET',
        url_type: 'INITIAL_SYNC',
        headers: {},
        request_parameters: {},
        offset_field: '',
        initial_offset: '',
        content_type: '',
        headerArray: [{ name: '', value: '' }],
        parameterArray: [{ name: '', value: '' }]
      }
      urlInfo['url_type'] = type
      if (type === 'GET_TOKEN') {
        urlInfo['parameterArray'] = [
          { name: 'client_id', value: '' },
          { name: 'client_secret', value: '' },
          { name: 'scope', value: '' },
          { name: 'grant_type', value: '' },
          { name: 'client_credentials', value: '' }
        ]
      }
      let isExist = this.model.url_info.filter(item => item.url_type === type)
      if (isExist.length === 0 && type !== 'GET_TOKEN') {
        this.model.url_info.push(urlInfo)
      } else if (isExist.length === 0 && type === 'GET_TOKEN') {
        this.model.url_info.unshift(urlInfo)
      }
    },
    //删除url
    removeUrlInfo(type) {
      let index = this.model.url_info.findIndex(item => item.url_type === type)
      if (index > -1) {
        this.model.url_info.splice(index, 1)
      }
    },
    // 按照数据库类型获取表单配置规则
    getFormConfig() {
      let type = this.model.database_type
      type = TYPEMAPCONFIG[type] || type //特殊数据源名称转换
      let func = formConfig[type]
      if (func) {
        let config = func(this)
        let items = defaultConfig.concat(config.items)
        let item = items.find(it => it.field === 'database_datetype_without_timezone')
        if (item) {
          item.options = this.timezones
        }
        let databaseName = items.find(it => it.field === 'database_name')
        if (databaseName) {
          databaseName.allowSpace = false
        }
        let itemIsUrl = items.find(it => it.field === 'isUrl')
        let sslKey = items.find(it => it.field === 'sslKeyFile')
        let sslCA = items.find(it => it.field === 'sslCAFile')
        if (this.model.database_type === 'mongodb' && this.$route.params.id && itemIsUrl) {
          itemIsUrl.options[0].disabled = true //编辑模式下mongodb不支持URL模式
        }
        if (this.model.database_type === 'mongodb' && this.$route.params.id && sslKey) {
          sslKey.rules = []
        }
        if (this.model.database_type === 'mongodb' && this.$route.params.id && sslCA) {
          sslCA.rules = []
        }
        //编辑模式下vika不校验plain_password
        let plain_password = items.find(it => it.field === 'plain_password')
        if (this.model.database_type === 'vika' && this.$route.params.id && plain_password) {
          plain_password.required = false
        }
        if (this.$route.params.id) {
          //编辑模式下 不展示
          defaultConfig[0].show = false
          defaultConfig[0].required = false
        }
        this.config.form = config.form
        this.config.items = items
        this.initData(
          Object.assign(this.model, config.defaultModel, {
            database_type: this.model.database_type
          })
        ) //切换类型会后初始化数据
        this.checkItems = config.checkItems //根据model变化更新表单项显示或隐藏
        this.checkItems && this.checkItems()
      }
      this.loadingFrom = false
    },
    //第一步 选择实例
    // getInstanceRegion() {
    //   this.$api('tcm')
    //     .getRegionZone()
    //     .then(data => {
    //       this.instanceMock = data.data || []
    //       if (this.model.region === '' && this.instanceMock.length > 0) {
    //         this.model.region = this.instanceMock[0].code
    //       }
    //       this.changeConfig(this.instanceMock || [], 'region')
    //       this.changeInstanceRegion()
    //     })
    //     .catch(() => {
    //       this.$message.error('请求失败')
    //     })
    // },
    changeInstanceRegion() {
      let zone = this.instanceMock.filter(item => item.code === this.model.region)
      if (zone.length > 0) {
        this.model.zone = this.model.zone || zone[0].zones[0].code
        this.instanceModelZone = zone[0].zones
      } else {
        this.instanceModelZone = []
      }
      let data = zone.length ? zone[0].zones : []
      this.changeConfig(data, 'zone')
      this.getDataSourceRegion() //选择完zone 联动实例vip 接口
    },
    //第二步 source_type DRS实例
    getDataSourceRegion() {
      let param = {
        productType: this.model.database_type,
        agentPoolId: this.model.region,
        agentZoneId: this.model.zone
      }
      this.$api('tcm')
        .productVip(param)
        .then(data => {
          this.dataSourceMock = data.data.poolList || []
          if (this.model.s_region === '' && this.dataSourceMock.length > 0) {
            this.model.s_region = this.dataSourceMock[0].poolId
          }
          this.changeConfig(this.dataSourceMock || [], 's_defaultRegion')
          this.changeDataSourceRegion()
        }) //华东上海
    },
    changeDataSourceRegion() {
      let zone = this.dataSourceMock.filter(item => item.poolId === this.model.s_region)
      if (zone.length > 0) {
        this.model.s_zone = this.model.s_zone || zone[0].zoneInfo[0].zoneCode
        this.dataSourceZone = zone[0].zoneInfo
      } else {
        this.dataSourceZone = []
      }
      let data = zone.length ? zone[0].zones : []
      this.changeConfig(data, 's_defaultZone')
    },
    //可用区联动database host
    changeDatabaseHost() {
      if (!this.dataSourceZone || this.dataSourceZone.length === 0) {
        return
      }
      let currentZone = this.dataSourceZone.filter(item => item.zoneCode === this.model.s_zone)
      if (currentZone.length > 0 && this.model.sourceType === 'rds' && this.model.s_zone !== '') {
        this.model.database_host = currentZone[0].ipv4 || currentZone[0].ipv6 || ''
      }
    },
    //change config
    changeConfig(data, type) {
      let items = this.config.items
      switch (type) {
        case 'region': {
          // 第一步 选择实例 选择区域
          let region = items.find(it => it.field === 'region')
          if (region) {
            region.options = data.map(item => {
              return {
                id: item.code,
                name: item.name,
                label: item.name,
                value: item.code
              }
            })
          }
          break
        }
        case 'zone': {
          //映射可用区
          let zone = items.find(it => it.field === 'zone')
          if (zone) {
            zone.options = this.instanceModelZone.map(item => {
              return {
                id: item.code,
                name: item.name,
                label: item.name,
                value: item.code
              }
            })
          }
          break
        }
        case 's_defaultRegion': {
          //源端默认等于选择实例可用区
          let s_region = items.find(it => it.field === 's_region')
          if (s_region) {
            s_region.options = this.dataSourceMock.map(item => {
              return {
                id: item.poolId,
                name: item.poolName,
                label: item.poolName,
                value: item.poolId
              }
            })
          }
          break
        }
        case 's_defaultZone': {
          //映射可用区
          let s_zone = items.find(it => it.field === 's_zone')
          if (s_zone) {
            s_zone.options = this.dataSourceZone.map(item => {
              return {
                id: item.zoneCode,
                name: item.zoneName,
                label: item.zoneName,
                value: item.zoneCode
              }
            })
          }
          break
        }
        case 'set_space': {
          //映射可用区
          let vika_space_id = items.find(it => it.field === 'vika_space_id')
          if (vika_space_id) {
            vika_space_id.options = data.map(item => {
              return {
                id: item.id,
                name: item.name,
                label: item.name,
                value: item.id
              }
            })
          }
          break
        }
        //共享挖掘
        case 'mongodbList': {
          //映射可用区
          let persistenceMongodb_uri_db = items.find(it => it.field === 'persistenceMongodb_uri_db')
          if (persistenceMongodb_uri_db) {
            persistenceMongodb_uri_db.options = this.mongodbList.map(item => {
              return {
                id: item.id,
                name: item.name,
                label: item.name,
                value: item.id
              }
            })
          }
          break
        }
        case 'tableList': {
          //映射可用区
          let persistenceMongodb_collection = items.find(it => it.field === 'persistenceMongodb_collection')
          if (persistenceMongodb_collection) {
            persistenceMongodb_collection.show = true
            persistenceMongodb_collection.options = this.tableList.map(item => {
              return {
                id: item.tableId,
                name: item.table_name,
                label: item.table_name,
                value: item.table_name
              }
            })
          }
          break
        }
        case 'logSaveList': {
          let share_cdc_ttl_day = items.find(it => it.field === 'share_cdc_ttl_day')
          if (share_cdc_ttl_day) {
            share_cdc_ttl_day.options = this.logSaveList.map(item => {
              return {
                id: item,
                name: item + this.$t('share_form_edit_day'),
                label: item + this.$t('share_form_edit_day'),
                value: item
              }
            })
          }
          break
        }
      }
    },
    handleTestVisible() {
      this.dialogTestVisible = false
    },
    handleEcsList() {
      let ecs = this.ecsList.filter(item => item.id === this.model.ecs)
      this.model.vpc = '' //清空当前子级值
      if (ecs.length > 0) {
        this.vpcList = ecs[0].portDetail
      } else {
        this.vpcList = []
      }
    },
    loadMore() {
      this.ecsPage = this.ecsPage + 1
      this.getEcsList()
    },
    //切换sourceType ecs需要请求ecs列表 开通网络策略
    getEcsList() {
      if (this.model.sourceType !== 'ecs') return
      let userId = Cookie.get('userId')
      let params = {
        page: this.ecsPage || 1,
        pageSize: this.ecsPageSize || 10,
        region: this.model.region || ''
      }
      this.$api('tcm')
        .getEcsList(userId, params)
        .then(result => {
          if (result.data) {
            const newList = result.data.ecsList
            if (newList.length > 0) {
              this.ecsList.push(...newList)
            }
          }
        })
    },
    //控制是否开通网络策略
    handleStrategy() {
      let currentData = this.ecsList.filter(item => item.id === this.model.ecs)
      if (currentData.length === 0) return
      this.model.platformInfo.strategyExistence = currentData[0].strategyExistence
      if (this.model.platformInfo.strategyExistence) {
        this.createStrategy()
      }
    },
    //创建网络策略
    createStrategy() {
      this.createStrategyDisabled = true
      let currentData = this.vpcList.filter(item => item.portId === this.model.vpc)
      if (currentData.length === 0) return
      let params = {
        userId: Cookie.get('user_id'),
        ecsId: this.model.ecs,
        region: this.model.region,
        zone: this.model.zone,
        routerId: currentData[0].routerId
      }
      this.$api('tcm')
        .strategy(params)
        .then(result => {
          this.model.platformInfo.strategyExistence = true
          if (result.data) {
            this.getEcsList() //更新Ecs列表
            this.model.database_host = result.data.dummyFipAddress
            if (this.model.database_type === 'mongodb') {
              this.model.database_uri = `mongodb://${result.data.dummyFipAddress}/test`
            }
          }
        })
        .catch(() => {
          this.$message.error('开通失败')
        })
        .finally(() => {
          this.createStrategyDisabled = false
        })
    },
    goBack() {
      let msg = this.$route.params.id ? '此操作会丢失当前修改编辑内容' : '此操作会丢失当前正在创建的连接'
      // let title = this.$route.params.id ? '是否放弃修改内容？' : '是否放弃创建该连接？'

      this.$confirm(msg, '', {
        confirmButtonText: this.$t('connection_form_give_up'),
        cancelButtonText: this.$t('button_cancel'),
        type: 'warning',
        showClose: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.$router.push({
          name: 'connections'
        })
      })
    },
    handleName(ops) {
      if (!ops.sourceData || ops.sourceData.length === 0) {
        return
      }
      let data = ops.sourceData.filter(item => item[ops.target] === ops.field)
      if (data.length === 0) return
      return data[0][ops.name]
    },
    //处理不同rds 场景 platformInfo
    handlePlatformInfo(params) {
      let platformInfo = {
        region: params.region || '',
        zone: params.zone || '',
        sourceType: params.sourceType || '',
        DRS_region: params.s_region || '',
        DRS_zone: params.s_zone || '',
        DRS_regionName: '',
        DRS_zoneName: '',
        DRS_instances: params.DRS_instances || '',
        IP_type: params.IP_type || '',
        checkedVpc: params.checkedVpc || '',
        vpc: params.vpc || '',
        ecs: params.ecs || '',
        strategyExistence: params.strategyExistence || ''
      }
      //存实例名称
      platformInfo['regionName'] = this.handleName({
        sourceData: this.instanceMock,
        field: platformInfo.region,
        target: 'code',
        name: 'name'
      })
      platformInfo['zoneName'] = this.handleName({
        sourceData: this.instanceModelZone,
        field: platformInfo.zone,
        target: 'code',
        name: 'name'
      })
      //数据源名称
      if (platformInfo.DRS_region !== '') {
        platformInfo['DRS_regionName'] = this.handleName({
          sourceData: this.dataSourceMock,
          field: platformInfo.DRS_region,
          target: 'poolId',
          name: 'poolName'
        })
      }
      if (platformInfo.DRS_zone !== '') {
        platformInfo['DRS_zoneName'] = this.handleName({
          sourceData: this.dataSourceZone,
          field: platformInfo.DRS_zone,
          target: 'zoneCode',
          name: 'zoneName'
        })
      }
      return platformInfo
    },
    submit() {
      this.pdkFormModel = this.$refs.schemaToForm?.getForm?.()
      this.schemaFormInstance?.validate().then(() => {
        this.submitBtnLoading = true
        // 保存数据源
        let id = this.$route.params?.id
        let { pdkOptions } = this
        let formValues = this.$refs.schemaToForm?.getFormValues?.()
        let { __TAPDATA_START, __TAPDATA_END } = formValues
        delete formValues['__TAPDATA_START']
        delete formValues['__TAPDATA_END']
        let params = Object.assign(
          {
            ...__TAPDATA_START,
            ...__TAPDATA_END,
            database_type: pdkOptions.type,
            pdkHash: pdkOptions.pdkHash
          },
          {
            status: 'testing',
            schema: {},
            retry: 0,
            nextRetry: null,
            response_body: {},
            project: '',
            submit: true,
            pdkType: 'pdk'
          },
          {
            config: formValues
          }
        )
        if (id) {
          params.id = id
        }
        if (!params.id) {
          params['status'] = this.status ? this.status : 'testing' //默认值 0 代表没有点击过测试
        }
        connectionsModel[params.id ? 'patchId' : 'post'](params)
          .then(() => {
            this.$message.success(this.$t('message.saveOK'))
            if (this.$route.query.step) {
              this.$router.push({
                name: 'connections',
                query: {
                  step: this.$route.query.step
                }
              })
            } else {
              this.$router.push({
                name: 'connections'
              })
            }
          })
          .catch(err => {
            this.$message.error(err?.data?.message || this.$t('message.saveFail'))
          })
          .finally(() => {
            this.submitBtnLoading = false
          })
      })
    },
    //开始测试
    async startTest() {
      this.$root.checkAgent(() => {
        this.schemaFormInstance.validate().then(() => {
          this.startTestPdk()
        })
      })
    },
    startTestPdk() {
      let formValues = this.$refs.schemaToForm?.getFormValues?.()
      let { __TAPDATA_START, __TAPDATA_END } = formValues
      Object.assign(this.model, __TAPDATA_START, __TAPDATA_END)
      delete formValues['__TAPDATA_START']
      delete formValues['__TAPDATA_END']
      this.model.config = formValues
      this.model.pdkType = 'pdk'
      this.model.pdkHash = this.$route.query?.pdkHash
      this.dialogTestVisible = true
      if (this.$route.params.id) {
        //编辑需要特殊标识 updateSchema = false editTest = true
        this.$refs.test.start(false, true)
      } else {
        delete this.model.id
        this.$refs.test.start(false)
      }
    },
    returnTestData(data) {
      if (!data.status || data.status === null) return
      this.status = data.status
    },
    //取消
    handleCancelRename() {
      this.renameData.rename = this.model.name
      this.$refs['renameForm'].clearValidate()
      this.dialogEditNameVisible = false
    },
    //保存名字
    submitEdit() {
      this.$refs['renameForm'].validate(valid => {
        if (valid) {
          this.editBtnLoading = true
          if (this.renameData.rename === '') {
            this.editBtnLoading = false
            this.renameData.rename = this.model.name
            this.$refs['renameForm'].clearValidate()
            return
          }
          let params = {
            name: this.renameData.rename,
            id: this.model.id,
            submit: true
          }
          this.$api('connections')
            .patchId(params)
            .then(() => {
              this.editBtnLoading = false
              this.model.name = this.renameData.rename
              this.$refs['renameForm'].clearValidate()
              this.$message.success(this.$t('message_save_ok'))
              this.dialogEditNameVisible = false
            })
            .catch(err => {
              this.renameData.rename = this.model.name
              this.$refs['renameForm'].clearValidate()
              this.editBtnLoading = false
              if (err && err.response) {
                if (err.response.msg.indexOf('duplication for names') > -1) {
                  this.$message.error(this.$t('dataForm.error.connectionNameExist'))
                } else {
                  this.$message.error(err.response.msg)
                }
              } else {
                this.$message.error(this.$t('dataForm.saveFail'))
              }
            })
        }
      })
    },
    // 跳转到重复数据源
    clickLinkSource() {
      window.open('/#/connection/' + this.connectionObj.id, '_blank')
    },
    handleDatabaseType(type, item) {
      this.dialogDatabaseTypeVisible = false
      let query = {
        databaseType: type
      }
      if (item) {
        query.pdkType = item.pdkType
        query.pdkHash = item.pdkHash
      }
      this.$router.push({
        name: 'connectionsCreate',
        query
      })
      location.reload()
    },
    // 文件类型添加文件路径
    addPathRow() {
      let list = {
        path: '',
        recursive: false,
        selectFileType: 'include',
        include_filename: '',
        exclude_filename: ''
      }
      this.model.file_sources.push(list)
    },

    // 文件类型删除文件路径
    removeRow(item, index) {
      // this.index = this.model.file_sources.indexOf(item);
      if (this.model.file_sources.length > 1) {
        if (index !== -1) {
          this.model.file_sources.splice(index, 1)
        }
      }
    },

    // 文件保留丢弃字段
    changeFileInclude(item, val) {
      val === 'include' ? (item.exclude_filename = '') : (item.include_filename = '')
    },
    //rest api
    addHeader(index) {
      this.model.url_info[index].headerArray.push({
        name: '',
        value: ''
      })
    },
    removeHeader(parentIndex, index) {
      this.model.url_info[parentIndex].headerArray.splice(index, 1)
    },
    addParameter(index) {
      this.model.url_info[index].parameterArray.push({
        name: '',
        value: ''
      })
    },
    removeParameter(parentIndex, index) {
      this.model.url_info[parentIndex].parameterArray.splice(index, 1)
    },
    // 获取数据
    getCluster() {
      let self = this
      this.$api('cluster')
        .findAccessNodeInfo()
        .then(res => {
          let items = res.data || []
          self.accessNodeList = items
          if (!self.model.accessNodeProcessId) {
            self.model.accessNodeProcessId = items?.[0]?.processId
          }
        })
    },
    getPdkForm() {
      const pdkHash = this.$route.query?.pdkHash
      this.$api('DatabaseTypes')
        .pdkHash(pdkHash)
        .then(({ data }) => {
          let id = this.id || this.$route.params.id
          this.pdkOptions = data
          let result = {
            type: 'object',
            'x-component-props': {
              width: 500
            },
            properties: {}
          }
          result.properties = {
            __TAPDATA_START: {
              type: 'object',
              'x-index': 0,
              properties: {
                name: {
                  type: 'string',
                  title: this.$t('connection_form_connection_name'),
                  required: true,
                  'x-decorator': 'FormItem',
                  'x-component': 'Input'
                },
                connection_type: {
                  type: 'string',
                  title: this.$t('connection_form_connection_type'),
                  required: true,
                  default: 'source_and_target',
                  enum: [
                    {
                      label: this.$t('connection_form_source_and_target'),
                      value: 'source_and_target',
                      tip: this.$t('connection_form_source_and_target_tip')
                    },
                    {
                      label: this.$t('connection_form_source'),
                      value: 'source',
                      tip: this.$t('connection_form_source_tip')
                    },
                    {
                      label: this.$t('connection_form_target'),
                      value: 'target',
                      tip: this.$t('connection_form_target_tip')
                    }
                  ],
                  'x-decorator': 'FormItem',
                  'x-component': 'Radio.Group',
                  'x-component-props': {
                    optionType: 'button'
                  }
                }
              }
            },
            ...(data?.properties?.connection?.properties || {}),
            __TAPDATA_END: {
              type: 'object',
              'x-index': 1000000,
              properties: {
                table_filter: {
                  type: 'string',
                  title: this.$t('connection_form_table_filter'),
                  'x-decorator': 'FormItem',
                  'x-component': 'Input.TextArea',
                  'x-component-props': {
                    placeholder: this.$t('connection_form_database_owner_tip')
                  }
                }
              }
            }
          }
          if (id) {
            this.getPdkData(id)
            delete result.properties['__TAPDATA_START.name']
          }
          this.schemaData = result
        })
    },
    getPdkData(id) {
      this.$api('connections')
        .getNoSchema(id)
        .then(res => {
          this.model = res.data
          let { name, connection_type, table_filter } = this.model
          this.schemaFormInstance.setValues({
            __TAPDATA_START: {
              name,
              connection_type
            },
            __TAPDATA_END: {
              table_filter
            },
            ...this.model?.config
          })
          this.renameData.rename = this.model.name
        })
    },
    getConnectionIcon() {
      const { databaseType } = this
      let result = {
        database_type: databaseType
      }
      const { pdkHash, pdkType } = this.$route.query || {}
      result.pdkHash = pdkHash
      result.pdkType = pdkType
      return getConnectionIcon(result)
    }
  }
}
</script>

<style scoped lang="scss">
.connection-from {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 20px 20px 20px;
  overflow: hidden;
  background-color: #eff1f4;
  .connection-from-body {
    display: flex;
    flex: 1;
    padding-left: 24px;
    border-radius: 4px;
    overflow: hidden;
    background-color: map-get($bgColor, white);
    .connection-from-main {
      display: flex;
      flex: 1;
      flex-direction: column;
      .connection-from-title {
        padding-top: 20px;
        margin-bottom: 24px;
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: map-get($fontColor, dark);
        line-height: 28px;
      }
      .connection-from-label {
        display: flex;
        align-items: center;
        margin-bottom: 24px;
        .label:before {
          content: '*';
          color: #f56c6c;
          margin-right: 4px;
        }
        .label {
          width: 160px;
          font-size: 12px;
          color: map-get($fontColor, light);
        }
        .content-box {
          display: flex;
          max-width: 680px;
          line-height: 22px;
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: map-get($fontColor, dark);
          align-items: center;
          white-space: nowrap;
          word-break: break-word;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .img-box {
          display: flex;
          width: 25px;
          height: 25px;
          justify-content: center;
          align-items: center;
          background: map-get($bgColor, white);
          border-radius: 3px;
          img {
            width: 100%;
          }
        }
      }
      .form-wrap {
        display: flex;
        flex: 1;
        overflow: hidden;
        .form {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          .scheme-to-form {
            width: 480px;
          }
          .form-builder {
            width: 396px;
            ::v-deep {
              .e-form-builder-item {
                // width: 396px;
                &.large-item {
                  width: 610px;
                  .el-form-item__content {
                    padding-right: 20px;
                  }
                }
                &.small-item {
                  width: 320px;
                }
                &.mongodb-item {
                  width: 680px;
                }
                &.mongodb-tip-item .el-form-item__content {
                  width: 680px;
                }
                .url-tip {
                  font-size: 12px;
                  color: map-get($fontColor, light);
                  b {
                    font-size: 12px;
                    font-weight: 400;
                    color: map-get($fontColor, light);
                  }
                }
                .fb-radio-group {
                  .el-radio--mini.is-bordered {
                    padding-top: 0;
                  }
                }
                // .el-form-item__content {
                //   width: 300px;
                // }
                .el-input .el-input__inner,
                .el-textarea__inner {
                  // width: 300px;
                  background-color: rgba(239, 241, 244, 0.2);
                }
                .el-textarea__inner {
                  min-height: 70px !important;
                }
              }
              .el-input-group__append button.el-button {
                background-color: inherit;
                border-color: azure;
              }
            }
          }
        }

        ::v-deep {
          .formily-element-form-item {
            font-size: 12px;
            .el-input-number {
              width: 180px;
            }
            .el-input-number--small {
              width: 130px;
            }
          }
        }
      }
      // .form {
      //   padding: 0 20px;
      //   width: 640px;
      //   margin: 0 auto;
      //   padding-right: 200px;
      //   .url-tip {
      //     font-size: 12px;
      //     color: #999;
      //     line-height: 18px;
      //   }
      //   .rest-api-box {
      //     display: flex;
      //     flex: 1;
      //     div.rest-api-label {
      //       width: 210px;
      //       padding-right: 20px;
      //       line-height: 28px;
      //       font-size: 12px;
      //       color: #606266;
      //       text-align: right;
      //       box-sizing: border-box;
      //     }
      //     .rest-api-url {
      //       width: calc(100% - 200px);
      //       border: 1px solid #dedee4;
      //       padding: 10px;
      //       margin-top: 5px;
      //       .rest-api-row {
      //         margin-bottom: 10px;
      //       }
      //       .rest-api-margin {
      //         margin-left: 10px;
      //       }
      //       .rest-api-marginB {
      //         margin-bottom: 10px;
      //       }
      //       .rest-api-label {
      //         display: inline-block;
      //         width: 80px;
      //       }
      //       .rest-api-FloatL {
      //         float: left;
      //       }
      //       .small-input {
      //         width: 104px;
      //       }
      //       .min-input {
      //         width: 80px;
      //       }
      //       .medium-input {
      //         width: 130px;
      //       }
      //       .rest-api-Array {
      //         margin-bottom: 10px;
      //       }
      //       .add-btn-icon {
      //         cursor: pointer;
      //       }
      //     }
      //   }
      //   .gridfs-box {
      //     font-size: 12px;
      //     .separate {
      //       margin: 0 10px;
      //     }
      //   }
      //   .fileBox {
      //     display: flex;
      //     flex: 1;
      //     div.file-label {
      //       width: 210px;
      //       padding-right: 20px;
      //       line-height: 28px;
      //       font-size: 12px;
      //       color: #606266;
      //       text-align: right;
      //       box-sizing: border-box;
      //     }
      //     .file-form-content {
      //       width: calc(100% - 200px);
      //       padding: 0 10px;
      //     }
      //     .fromLoopBox {
      //       padding: 10px 20px 20px !important;
      //       margin-bottom: 12px;
      //       box-sizing: border-box;
      //       background-color: map-get($bgColor, white);
      //       border: 1px solid #dedee4;
      //       border-radius: 3px;
      //       .el-input--mini .el-input__inner {
      //         width: 100%;
      //       }
      //     }
      //   }
      // }
      // .edit-header-box {
      //   border-bottom: 1px solid #eee;
      //   margin-bottom: 20px;
      // }
      // .edit-header {
      //   display: flex;
      //   justify-content: flex-start;
      //   width: 578px;
      //   margin: 30px auto;
      // }
      // .title {
      //   display: flex;
      //   justify-content: flex-start;
      //   width: 568px;
      //   margin: 40px auto 20px auto;
      // }
      // .img-box {
      //   display: flex;
      //   width: 52px;
      //   height: 52px;
      //   justify-content: center;
      //   align-items: center;
      //   background-color: map-get($bgColor, white);
      //   border-radius: 3px;
      //   margin-right: 10px;
      //   img {
      //     width: 100%;
      //   }
      // }
      // .content {
      //   display: flex;
      //   align-items: center;
      //   margin-left: 15px;
      //   font-size: 22px;
      //   max-width: 445px;
      //   white-space: nowrap;
      //   word-break: break-word;
      //   text-overflow: ellipsis;
      //   overflow: hidden;
      // }
      // .addBtn {
      //   cursor: pointer;
      //   font-size: 12px;
      //   margin-top: 22px;
      //   margin-left: 10px;
      // }
      // .content-box {
      //   .addBtn {
      //     cursor: pointer;
      //     font-size: 12px;
      //     margin-top: 0;
      //     margin-left: 10px;
      //   }

      //   .tip {
      //     margin-left: 15px;
      //     font-size: 12px;
      //     color: #999;
      //     margin-top: 5px;
      //     line-height: 18px;
      //     width: 430px;
      //   }
      // }
      // .test {
      //   margin-left: 200px;
      //   margin-bottom: 20px;
      //   margin-top: 16px;
      // }
    }
    .status {
      font-size: 12px;
      margin-top: 2px;
      .error {
        color: #f56c6c;
      }
      .success {
        color: #67c23a;
      }
      .warning {
        color: #e6a23c;
      }
    }
  }
  // .header {
  //   height: 50px;
  //   line-height: 50px;
  //   padding-left: 20px;
  //   background-color: rgba(250, 250, 250, 100);
  //   color: rgba(51, 51, 51, 100);
  //   font-size: 18px;
  //   text-align: left;
  //   box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
  //   border: 1px solid rgba(222, 222, 228, 100);
  //   border-left: none;
  //   position: relative;
  // }
  .footer {
    // margin: 10px auto;
    width: 100%;
    height: 62px;
    background-color: map-get($bgColor, white);
    border-left: none;
    line-height: 62px;
    border-top: 1px solid #dedee4;
    .footer-btn {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin: 0 auto;
      padding-top: 18px;
    }
    // button {
    //   margin-left: 10px;
    //   padding: 0 15px;
    //   height: 32px;
    //   line-height: 32px;
    //   border-radius: 2px;
    // }
  }
}
</style>
<style lang="scss">
// .databaseFrom .el-form--label-right .el-form-item {
//   .el-form-item__label .e-form-builder-item-label {
//     float: right;
//   }
//   margin-top: 16px;
// }
// .databaseFrom .el-form--label-right .el-form-item {
//   .el-form-item__label {
//     display: inline-block;
//     padding: 0 20px 0 0;
//   }
// }
// .databaseFrom .form {
//   .url-tip {
//     margin-top: -14px;
//     b {
//       color: map-get($fontColor, light);
//     }
//   }
//   .file-form-content {
//     .el-form-item {
//       margin-bottom: 6px;
//     }
//     .el-form-item__label {
//       padding-bottom: 0;
//       line-height: 28px;
//       font-size: 12px;
//     }
//     .el-form-item__content {
//       line-height: 30px;
//     }
//   }
//   .urlInfoForm {
//     .el-form-item {
//       margin-bottom: 0;
//     }
//   }
// }
// .databaseFrom .gridfs-box {
//   .el-form-item {
//     margin-bottom: 0;
//     margin-top: 0;
//   }

//   .el-form-item__content {
//     display: flex;
//     font-size: 12px;
//     margin-right: 20px;
//   }

//   .el-form-item__error {
//     padding-top: 0;
//   }

//   .el-form-item__label:before {
//     content: '*';
//     color: #f56c6c;
//     margin-right: 4px;
//   }

//   .excel_value_start {
//     .el-form-item__label:before {
//       content: '';
//     }
//   }

//   .el-form-item__label {
//     font-size: 12px;
//   }

//   .el-radio__label {
//     font-size: 12px;
//   }

//   .headerType .el-form-item__content {
//     flex-direction: column;

//     .excel_header_start {
//       display: flex;
//       font-size: 12px;
//     }
//   }

//   .excelHeaderType {
//     .el-form-item__content {
//       display: block;
//       font-size: 12px;
//     }
//   }
// }
</style>
