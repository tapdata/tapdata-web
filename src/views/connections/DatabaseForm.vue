<template>
  <div class="databaseFrom">
    <header class="header" v-if="!$window.getSettingByKey('DFS_TCM_PLATFORM')">
      {{
        $route.params.id
          ? $t('connection.editDataSource')
          : $t('connection.createNewDataSource')
      }}
    </header>
    <div class="databaseFrom-body">
      <main class="databaseFrom-main">
        <header v-if="$route.params.id" class="edit-header-box">
          <div class="edit-header">
            <div class="img-box">
              <img :src="getImgByType(databaseType)" />
            </div>
            <div class="content">{{ model.name }}</div>
            <div
              class="addBtn color-primary"
              @click="dialogEditNameVisible = true"
            >
              {{ $t('connection.rename') }}
            </div>
          </div>
        </header>
        <header class="edit-header-box" v-else>
          <div class="edit-header">
            <div class="img-box">
              <img :src="getImgByType(databaseType)" />
            </div>
            <div class="content-box">
              <div class="content">
                {{ typeMap[databaseType] }}
                <div
                  class="addBtn color-primary"
                  @click="dialogDatabaseTypeVisible = true"
                >
                  {{ $t('connection.change') }}
                </div>
              </div>
              <div
                class="tip"
                v-if="!$window.getSettingByKey('DFS_TCM_PLATFORM')"
              >
                {{ $t('dataForm.form.guide') }}
                <a
                  class="color-primary"
                  href="https://docs.tapdata.net/data-source"
                  >{{ $t('dataForm.form.guideDoc') }}</a
                >
              </div>
              <div
                class="tip"
                v-if="$window.getSettingByKey('DFS_TCM_PLATFORM')"
              >
                请按输入以下配置项以创建连接，点击下方连接测试按钮进行连接检测，支持版本、配置说明与限制说明等事项请查阅帮助文档
              </div>
            </div>
          </div>
        </header>
        <div class="form-wrap">
          <div class="form">
            <form-builder
              ref="form"
              v-model="model"
              :config="config"
              @value-change="formChange"
            >
              <div class="url-tip" slot="name" v-if="!$route.params.id">
                中英开头，1～100个字符，可包含中英文、数字、中划线、下划线、空格
              </div>
              <div
                class="url-tip"
                slot="ecsList"
                v-if="model.sourceType === 'ecs'"
              >
                <el-select
                  v-model="model.ecs"
                  clearable
                  placeholder="请选择"
                  v-loadmore="loadMore"
                  style="width: 100%; margin-top: 10px"
                  @change="handleEcsList"
                >
                  <el-option
                    v-for="item in ecsList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  >
                  </el-option>
                </el-select>
                <el-select
                  v-model="model.vpc"
                  clearable
                  placeholder="请选择"
                  style="width: 100%; margin-top: 10px"
                >
                  <el-option
                    v-for="item in vpcList"
                    :key="item.portId"
                    :label="item.vpcName"
                    :value="item.portId"
                  >
                  </el-option>
                </el-select>
              </div>
              <div class="url-tip" slot="vpc-setting" v-if="model.ecs">
                <el-checkbox v-model="model.checkedVpc"
                  >授权允许数据同步服务访问您的ECS实例</el-checkbox
                >
                <span v-if="model.checkedVpc">
                  <el-link
                    v-if="!model.platformInfo.strategyExistence"
                    :underline="false"
                    @click="createStrategy()"
                    style="color: #d54e21"
                    :disabled="createStrategyDisabled"
                    >点击开通</el-link
                  >
                  <span v-else>已开通</span>
                </span>
              </div>
              <div
                class="url-tip"
                slot="urlTip"
                v-if="model.isUrl"
                v-html="$t('dataForm.form.uriTips.content')"
              ></div>
              <div class="url-tip" slot="tableFilter">
                {{ $t('dataForm.form.tableFilterTips') }}
              </div>
              <div class="url-tip" slot="timezone">
                {{ $t('dataForm.form.timeZoneTips') }}
              </div>
              <div class="url-tip" slot="kafkaUri">
                {{ $t('dataForm.form.kafka.hostPlaceHolder') }}
              </div>
              <div class="url-tip" slot="lonoreFormatTip">
                {{ $t('dataForm.form.kafka.lonoreFormatTip') }}
              </div>
              <div class="url-tip" slot="pushErrorTip">
                {{ $t('dataForm.form.kafka.pushErrorTip') }}
              </div>
            </form-builder>
            <!-- 文件数据库 -->
            <template
              v-if="
                model.database_type === 'file' &&
                model.connection_type === 'source'
              "
            >
              <div class="fileBox">
                <div class="file-label">
                  {{ $t('dataForm.form.file.fileUrl') }}
                </div>
                <div class="file-form-content">
                  <el-form
                    :model="model"
                    ref="fileForm"
                    label-width="100px"
                    class="demo-ruleForm"
                    label-position="top"
                    :inline-message="true"
                  >
                    <el-row
                      type="flex"
                      :gutter="20"
                      class="loopFrom"
                      v-for="(item, index) in model.file_sources"
                      :key="index"
                    >
                      <el-col :span="24" class="fromLoopBox">
                        <el-form-item
                          required
                          :label="$t('dataForm.form.file.path')"
                          :prop="'file_sources.' + index + '.path'"
                          :rules="{
                            required: true,
                            message: $t('dataForm.form.file.fileNone'),
                            trigger: 'blur'
                          }"
                        >
                          <el-input
                            v-model="item.path"
                            size="mini"
                            :placeholder="
                              $t('dataForm.form.file.pathPlaceholder')
                            "
                          ></el-input>
                        </el-form-item>
                        <el-form-item
                          :label="$t('dataForm.form.file.recursive')"
                          prop="path"
                        >
                          <el-switch v-model="item.recursive"></el-switch>
                        </el-form-item>
                        <el-form-item
                          :label="$t('dataForm.form.file.csvFijlter')"
                        >
                          <el-select
                            v-model="item.selectFileType"
                            size="mini"
                            style="width: 100%"
                            @change="
                              changeFileInclude(item, item.selectFileType)
                            "
                          >
                            <el-option
                              :label="$t('dataForm.form.file.include_filename')"
                              value="include"
                            ></el-option>
                            <el-option
                              :label="$t('dataForm.form.file.exclude_filename')"
                              value="exclude"
                            ></el-option>
                          </el-select>
                        </el-form-item>
                        <el-form-item v-if="item.selectFileType === 'include'">
                          <el-input
                            v-model="item.include_filename"
                            size="mini"
                            :placeholder="
                              $t('dataForm.form.file.includePlaceholder')
                            "
                          ></el-input>
                        </el-form-item>
                        <el-form-item v-else>
                          <el-input
                            v-model="item.exclude_filename"
                            size="mini"
                            :placeholder="
                              $t('dataForm.form.file.excludePlaceholder')
                            "
                          ></el-input>
                        </el-form-item>
                        <p style="font-size: 12px; color: #666">
                          {{ $t('dataForm.form.file.viewExpression') }}
                        </p>
                      </el-col>
                      <el-col :span="2" style="margin-right: -40px">
                        <el-button
                          plain
                          style="padding: 0"
                          @click="removeRow(item, index)"
                        >
                          <i class="iconfont icon-quxiao remove"></i>
                        </el-button>
                      </el-col>
                    </el-row>
                    <el-button
                      type="text"
                      style="padding: 0"
                      @click="addPathRow()"
                    >
                      {{ $t('dataForm.form.file.addPath') }}
                    </el-button>
                  </el-form>
                </div>
              </div>
            </template>
            <el-button
              type="primary"
              size="mini"
              class="test"
              @click="startTest()"
              >{{ $t('connection.testConnection') }}</el-button
            >
            <span class="status">
              <span class="error" v-if="['invalid'].includes(status)">
                <i class="el-icon-error"></i>
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
            <el-button size="mini" @click="goBack()">{{
              $t('dataForm.cancel')
            }}</el-button>
            <el-button
              size="mini"
              type="primary"
              :loading="submitBtnLoading"
              @click="submit"
            >
              {{ $t('dataForm.submit') }}
            </el-button>
          </div>
        </footer>
      </main>
      <gitbook v-if="!$window.getSettingByKey('DFS_TCM_PLATFORM')"></gitbook>
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
      <span>
        <el-input
          v-model="rename"
          maxlength="100"
          show-word-limit
          clearable
        ></el-input>
        <span
          style="
            color: #ccc;
            margin-top: 5px;
            font-size: 12px;
            display: inline-block;
          "
          >中英开头，1～100个字符，可包含中英文、数字、中划线、下划线、空格</span
        >
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancelRename" size="mini">{{
          $t('dataForm.cancel')
        }}</el-button>
        <el-button
          @click="submitEdit()"
          size="mini"
          type="primary"
          :loading="editBtnLoading"
          >{{ $t('message.confirm') }}</el-button
        >
      </span>
    </el-dialog>
    <!-- <el-dialog
			:title="$t('dataForm.dialogTitle')"
			:close-on-click-modal="false"
			:visible.sync="repeatDialogVisible"
			width="30%"
		>
			<p>
				{{ $t('dataForm.error.sourceNameExist') }}
				<span @click="clickLinkSource" style="color:#48B6E2;cursor: pointer">
					{{ connectionObj.name }}</span
				>
				{{ $t('dataForm.error.noCreate') }}
			</p>
			<span slot="footer" class="dialog-footer">
				<el-button @click="repeatDialogVisible = false">{{ $t('dataForm.close') }}</el-button>
			</span>
		</el-dialog> -->
  </div>
</template>

<script>
import factory from '@/api/factory'
import formConfig from './config'
import gitbook from './GitBook'
import Test from './Test'
import { getImgByType, TYPEMAP, defaultModel, defaultCloudModel } from './util'
import DatabaseTypeDialog from './DatabaseTypeDialog'

const databaseTypesModel = factory('DatabaseTypes')
const connectionsModel = factory('connections')
let defaultConfig = []
export default {
  name: 'DatabaseForm',
  components: { gitbook, Test, DatabaseTypeDialog },
  data() {
    return {
      // modelForm: {},
      rules: [],
      visible: false,
      createStrategyDisabled: false,
      timezones: [],
      dataTypes: [],
      whiteList: [
        'mysql',
        'oracle',
        'mongodb',
        'sqlserver',
        'postgres',
        'elasticsearch',
        'redis',
        'file',
        'db2',
        'kafka',
        'mariadb',
        'mysql pxc',
        'dameng'
      ],
      model: '',
      config: {
        items: []
      },
      checkItems: null,
      databaseType: '',
      typeMap: TYPEMAP,
      timer: null,
      status: '',
      dialogTestVisible: false,
      dialogDatabaseTypeVisible: false,
      dialogEditNameVisible: false,
      submitBtnLoading: false,
      editBtnLoading: false,
      connectionTypeOption: '',
      isUrlOption: '',
      rename: '',
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
      instanceModelZone: '',
      instanceMock: [],
      dataSourceZone: '',
      dataSourceMock: [],
      ecsPageSize: 10,
      ecsPage: 1,
      vpcList: [],
      ecsList: []
    }
  },
  created() {
    this.databaseType =
      this.$route.query.databaseType ||
      this.$store.state.createConnection.databaseType
    //确认类型 按照type 初始化变量
    if (window.getSettingByKey('DFS_TCM_PLATFORM') === 'drs') {
      this.model = Object.assign(
        {},
        defaultCloudModel['default'],
        defaultCloudModel['drs']
      )
    } else {
      this.model = Object.assign({}, defaultModel['default'])
    }
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
    }
    this.getDT(this.databaseType)
    this.initTimezones()
    let self = this
    defaultConfig = [
      {
        type: 'input',
        field: 'name',
        label: self.$t('dataForm.form.connectionName'),
        required: true,
        maxlength: 100,
        showWordLimit: true,
        show: true,
        rules: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value || !value.trim()) {
                callback('连接名称不能为空')
              } else if (
                !/^([\u4e00-\u9fa5]|[A-Za-z])([a-zA-Z0-9_\s-]|[\u4e00-\u9fa5])*$/.test(
                  value
                )
              ) {
                callback('连接名称不符合规则')
              } else {
                callback()
              }
            }
          }
        ]
      }
    ]
  },
  watch: {
    // 文件选中类型默认端口号
    'model.file_source_protocol'(val) {
      if (val === 'smb') {
        this.model.database_port = '445'
      } else if (val === 'ftp') {
        this.model.database_port = '21'
      }
    },
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
    getImgByType,
    formChange(data) {
      let filed = data.field || ''
      if (filed === 'sourceType') {
        this.model.database_host = ''
      }
      if (filed === 'region') {
        this.model.zone = ''
      }
      if (filed === 'zone') {
        this.getDataSourceRegion() //选择完zone 联动实例vip 接口
      }
      if (filed === 's_region') {
        this.model.s_zone = ''
      }
    },
    async initData(data) {
      let editData = null
      this.checkTestConnectionAvailable() //先检测agent
      if (this.$route.params.id) {
        if (this.model.database_type === 'mongodb') {
          editData = await this.$api('connections').customQuery([
            this.$route.params.id
          ])
        } else {
          editData = await this.$api('connections').get([this.$route.params.id])
        }
        this.model = Object.assign(this.model, editData.data)
        if (this.model.sourceType === 'ecs') {
          this.getEcsList()
        }
        this.rename = this.model.name
        this.model.isUrl = false
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
      this.getInstanceRegion()
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
    // 获取数据库类型列表
    async getDT(type) {
      let result = await databaseTypesModel.get()
      if (result.data) {
        let options = result.data.map(dt => {
          return { label: dt.name, value: dt.type }
        })
        this.dataTypes = options
        this.checkDataTypeOptions(type)
      }
    },
    // 按照数据库类型获取表单配置规则
    getFormConfig() {
      let type = this.model.database_type

      if (type === 'mysql pxc') {
        type = 'mysqlpxc'
      }
      if (window.getSettingByKey('DFS_TCM_PLATFORM') === 'drs') {
        type = 'drs_' + type
      } else if (window.getSettingByKey('DFS_TCM_PLATFORM') === 'dfs') {
        type = 'dfs_' + type
      }
      let func = formConfig[type]

      if (func) {
        let config = func(this)
        let items = defaultConfig.concat(config.items)
        let item = items.find(
          it => it.field === 'database_datetype_without_timezone'
        )
        if (item) {
          item.options = this.timezones
        }
        let itemIsUrl = items.find(it => it.field === 'isUrl')
        let sslKey = items.find(it => it.field === 'sslKeyFile')
        let sslCA = items.find(it => it.field === 'sslCAFile')
        if (
          this.model.database_type === 'mongodb' &&
          this.$route.params.id &&
          itemIsUrl
        ) {
          itemIsUrl.options[0].disabled = true //编辑模式下mongodb不支持URL模式
        } else if (
          this.model.database_type === 'mongodb' &&
          !this.$route.params.id &&
          itemIsUrl
        ) {
          itemIsUrl.options[1].disabled = true
        }
        ////编辑模式下mongodb 不校验证书
        if (
          this.model.database_type === 'mongodb' &&
          this.$route.params.id &&
          sslKey
        ) {
          sslKey.rules = []
        }
        if (
          this.model.database_type === 'mongodb' &&
          this.$route.params.id &&
          sslCA
        ) {
          sslCA.rules = []
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
    },
    //第一步 选择实例
    getInstanceRegion() {
      this.$api('tcm')
        .getRegionZone()
        .then(data => {
          this.instanceMock = data.data || []
          if (this.model.region === '' && this.instanceMock.length > 0) {
            this.model.region = this.instanceMock[0].code
          }
          this.changeConfig(this.instanceMock || [], 'region')
          this.changeInstanceRegion()
        })
        .catch(() => {
          this.$message.error('请求失败')
        })
    },
    changeInstanceRegion() {
      let zone = this.instanceMock.filter(
        item => item.code === this.model.region
      )
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
      let zone = this.dataSourceMock.filter(
        item => item.poolId === this.model.s_region
      )
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
      let currentZone = this.dataSourceZone.filter(
        item => item.zoneCode === this.model.s_zone
      )
      if (
        currentZone.length > 0 &&
        this.model.sourceType === 'rds' &&
        this.model.s_zone !== ''
      ) {
        this.model.database_host =
          currentZone[0].ipv4 || currentZone[0].ipv6 || ''
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
      let userId = this.$cookie.get('userId')
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
      this.model.platformInfo.strategyExistence =
        currentData[0].strategyExistence
      if (this.model.platformInfo.strategyExistence) {
        this.createStrategy()
      }
    },
    //创建网络策略
    createStrategy() {
      this.createStrategyDisabled = true
      let currentData = this.vpcList.filter(
        item => item.portId === this.model.vpc
      )
      if (currentData.length === 0) return
      let params = {
        userId: this.$cookie.get('user_id'),
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
      let tip = this.$route.params.id
        ? '此操作会丢失当前修改编辑内容'
        : '此操作会丢失当前正在创建的连接'
      let title = this.$route.params.id
        ? '是否放弃修改内容？'
        : '是否放弃创建该连接？'
      this.$confirm(tip, title, {
        confirmButtonText: '放弃',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.$router.push('/connections')
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
      this.submitBtnLoading = true
      let flag = true
      this.model.search_databaseType = ''
      if (
        this.model.database_type === 'file' &&
        this.model.connection_type === 'source'
      ) {
        this.$refs.fileForm.validate(valid => {
          if (!valid) {
            flag = false
          }
        })
      }
      if (!this.model.checkedVpc && this.model.sourceType === 'ecs') {
        this.$message.error('请授权允许数据同步服务访问您的ECS实例')
        return
      }
      if (
        this.model.platformInfo &&
        !this.model.platformInfo.strategyExistence &&
        this.model.sourceType === 'ecs'
      ) {
        this.$message.error('请"点击开通"开通网络策略')
        return
      }

      // if (this.model.database_type === 'mysqlpxc') {
      // 	// this.model.search_databaseType = this.model.database_type;
      // 	this.model.database_type = 'mysql pxc';
      // }

      this.$refs.form.validate(valid => {
        if (valid && flag) {
          let params = Object.assign(
            {},
            {
              // user_id: this.$cookie.get('user_id'),
              status: 'testing',
              schema: {},
              retry: 0,
              nextRetry: null,
              response_body: {},
              project: '',
              submit: true
            },
            this.model
          )
          params['sslCert'] = this.model.sslKey
          delete params.sslKeyFile
          delete params.sslCAFile
          delete params.status //编辑的情况下不传status
          if (!params.id) {
            delete params.id
          }
          if (!params.id) {
            params['status'] = this.status ? this.status : 'testing' //默认值 0 代表没有点击过测试
          }
          if (params.database_type === 'mongodb') {
            //params['database_uri'] = encodeURIComponent(params['database_uri'])
            params.fill = params.isUrl ? 'uri' : ''
            delete params.isUrl
          }
          if (window.getSettingByKey('DFS_TCM_PLATFORM') === 'drs') {
            params['platformInfo'] = Object.assign(
              params['platformInfo'],
              this.handlePlatformInfo(params)
            )
            if (params.sourceType === 'selfDB') {
              delete params.DRS_region
              delete params.DRS_zone
              delete params.platformInfo.DRS_region
              delete params.platformInfo.DRS_zone
            }
          }
          connectionsModel[this.model.id ? 'patchId' : 'post'](params)
            .then(() => {
              this.$message.success(this.$t('message.saveOK'))
              if (this.$route.query.step) {
                this.$router.push('/connections?step=' + this.$route.query.step)
              } else {
                this.$router.push('/connections')
              }
            })
            .catch(err => {
              if (err && err.response) {
                if (err.response.msg.indexOf('duplication for names') > -1) {
                  this.$message.error(
                    this.$t('dataForm.error.connectionNameExist')
                  )
                } else if (err.response.msg.indexOf('duplicate source') > -1) {
                  // this.connectionObj.name = err.response.data.name;
                  // this.connectionObj.id = err.response.data.id;
                  // this.repeatDialogVisible = true;
                  this.$message.error(this.$t('dataForm.error.duplicateSource'))
                } else {
                  this.$message.error(err.response.msg)
                }
              } else {
                this.$message.error(this.$t('message.saveFail'))
              }
            })
            .finally(() => {
              this.submitBtnLoading = false
            })
        } else {
          this.submitBtnLoading = false
        }
      })
    },
    //开始测试
    async startTest() {
      let result = await this.$api('Workers').getAvailableAgent()
      if (!result.data.result || result.data.result.length === 0) {
        this.$message.error(this.$t('dataForm.form.agentMsg'))
      } else {
        this.$refs.form.validate(valid => {
          if (valid) {
            if (window.getSettingByKey('DFS_TCM_PLATFORM') === 'drs') {
              this.model['platformInfo'] = Object.assign(
                this.model['platformInfo'],
                this.handlePlatformInfo(this.model)
              )
            }
            this.dialogTestVisible = true
            if (this.$route.params.id) {
              //编辑需要特殊标识 updateSchema = false editTest = true
              this.$refs.test.start(false, true)
            } else {
              this.$refs.test.start(false)
            }
          }
        })
      }
    },
    returnTestData(data) {
      if (!data.status || data.status === null) return
      this.status = data.status
    },
    //取消
    handleCancelRename() {
      this.dialogEditNameVisible = false
      this.rename = this.model.name
    },
    //保存名字
    submitEdit() {
      this.editBtnLoading = true
      if (this.rename === '') {
        this.editBtnLoading = false
        this.rename = this.model.name
        this.$message.error(
          this.$t('dataForm.form.connectionName') +
            this.$t('formBuilder.noneText')
        )
        return
      }
      if (
        !/^([\u4e00-\u9fa5]|[A-Za-z])([a-zA-Z0-9_\s-]|[\u4e00-\u9fa5])*$/.test(
          this.rename
        )
      ) {
        this.editBtnLoading = false
        this.$message.error(
          '名称规则：中英开头，1～100个字符，可包含中英文、数字、中划线、下划线、空格'
        )
        return
      }
      this.model.name = this.rename
      let params = {
        name: this.model.name,
        id: this.model.id
      }
      this.$api('connections')
        .patchId(params)
        .then(() => {
          this.editBtnLoading = false
          this.$message.success(this.$t('message.saveOK'))
          this.dialogEditNameVisible = false
        })
        .catch(err => {
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
    },
    // 跳转到重复数据源
    clickLinkSource() {
      window.open('/#/connection/' + this.connectionObj.id, '_blank')
    },
    //检测agent 是否可用
    async checkTestConnectionAvailable() {
      let result = await this.$api('Workers').getAvailableAgent()
      if (!result.data.result || result.data.result.length === 0) {
        this.$message.error(this.$t('dataForm.form.agentMsg'))
      }
    },
    handleDatabaseType(type) {
      this.dialogDatabaseTypeVisible = false
      if (this.whiteList.includes(type)) {
        this.$router.push({
          path: '/connections/create',
          query: {
            databaseType: type
          }
        })
        location.reload()
      } else {
        top.location.href = '/#/connection'
        localStorage.setItem('connectionDatabaseType', type)
      }
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
      val === 'include'
        ? (item.exclude_filename = '')
        : (item.include_filename = '')
    }
  }
}
</script>

<style scoped lang="scss">
.databaseFrom {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .databaseFrom-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    .databaseFrom-main {
      display: flex;
      flex: 1;
      flex-direction: column;
      .form-wrap {
        display: flex;
        overflow-y: auto;
        flex: 1;
      }
      .form {
        padding: 0 20px;
        width: 640px;
        margin: 0 auto;
        padding-right: 200px;
        .url-tip {
          font-size: 12px;
          color: #999;
          line-height: 18px;
        }
        .fileBox {
          display: flex;
          flex: 1;
          div.file-label {
            width: 210px;
            padding-right: 20px;
            line-height: 28px;
            font-size: 12px;
            color: #606266;
            text-align: right;
            box-sizing: border-box;
          }
          .file-form-content {
            width: calc(100% - 200px);
            padding: 0 10px;
          }
          .fromLoopBox {
            padding: 10px 20px 20px !important;
            margin-bottom: 12px;
            box-sizing: border-box;
            background-color: #fff;
            border: 1px solid #dedee4;
            border-radius: 3px;
            .el-input--mini .el-input__inner {
              width: 100%;
            }
          }
        }
      }
      .edit-header-box {
        border-bottom: 1px solid #eee;
        margin-bottom: 20px;
      }
      .edit-header {
        display: flex;
        justify-content: flex-start;
        width: 578px;
        margin: 30px auto;
      }
      .title {
        display: flex;
        justify-content: flex-start;
        width: 568px;
        margin: 40px auto 20px auto;
      }
      .img-box {
        display: flex;
        width: 52px;
        height: 52px;
        justify-content: center;
        align-items: center;
        background: #fff;
        border-radius: 3px;
        margin-right: 10px;
        img {
          width: 100%;
        }
      }
      .content {
        display: flex;
        align-items: center;
        margin-left: 15px;
        font-size: 22px;
        max-width: 445px;
        white-space: nowrap;
        word-break: break-word;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .addBtn {
        cursor: pointer;
        font-size: 12px;
        margin-top: 22px;
        margin-left: 10px;
      }
      .content-box {
        .addBtn {
          cursor: pointer;
          font-size: 12px;
          margin-top: 0;
          margin-left: 10px;
        }
        .tip {
          margin-left: 15px;
          font-size: 12px;
          color: #999;
          margin-top: 5px;
          line-height: 18px;
          width: 430px;
        }
      }
      .test {
        margin-left: 200px;
        margin-bottom: 20px;
        margin-top: 16px;
      }
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
  .header {
    height: 50px;
    line-height: 50px;
    padding-left: 20px;
    background-color: rgba(250, 250, 250, 100);
    color: rgba(51, 51, 51, 100);
    font-size: 18px;
    text-align: left;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(222, 222, 228, 100);
    border-left: none;
    position: relative;
  }
  .footer {
    margin: 10px auto;
    width: 100%;
    height: 62px;
    background-color: #fff;
    border-left: none;
    line-height: 62px;
    border-top: 1px solid #dedee4;
    .footer-btn {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin: 0 auto;
      padding-top: 18px;
      width: 450px;
    }
    button {
      margin-left: 10px;
      padding: 0 15px;
      height: 32px;
      line-height: 32px;
      border-radius: 2px;
    }
  }
}
</style>
<style lang="scss">
.databaseFrom .el-form--label-right .el-form-item {
  .el-form-item__label .e-form-builder-item-label {
    float: right;
  }
  margin-top: 16px;
}
.databaseFrom .el-form--label-right .el-form-item {
  .el-form-item__label {
    display: inline-block;
    padding: 0 20px 0 0;
  }
}
.databaseFrom .form {
  .url-tip {
    margin-top: -14px;
    b {
      color: #666;
    }
  }
  .file-form-content {
    .el-form-item {
      margin-bottom: 6px;
    }
    .el-form-item__label {
      padding-bottom: 0;
      line-height: 28px;
      font-size: 12px;
    }
    .el-form-item__content {
      line-height: 30px;
    }
  }
}
</style>
