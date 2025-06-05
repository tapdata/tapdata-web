<script>
import { InfoFilled } from '@element-plus/icons-vue'
import {
  applicationApi,
  connectionsApi,
  databaseTypesApi,
  metadataInstancesApi,
  modulesApi,
  roleApi,
  workerApi,
} from '@tap/api'
import { Drawer, VCodeEditor } from '@tap/component'
import i18n from '@tap/i18n'

import { uid } from '@tap/shared'
import axios from 'axios'
import { cloneDeep } from 'lodash-es'
import { $emit, $off, $on, $once } from '../../../utils/gogocodeTransfer'

import ListSelect from '../api-application/ListSelect'
import getTemplate from './template'

export default {
  components: {
    Drawer,
    VCodeEditor,
    ListSelect,
    InfoFilled,
  },
  props: {
    host: String,
    tag: {
      type: String,
      default: 'Drawer',
    },
    inDialog: Boolean,
    disableApp: Boolean,
    params: Object,
  },
  data() {
    const validateParams = (rule, value, callback) => {
      if (
        /^([^\u0000-\u00FF]|[a-zA-Z_$])([^\u0000-\u00FF]|[\w$])*$/.test(value)
      ) {
        callback()
      } else {
        callback(i18n.t('packages_business_data_server_drawer_geshicuowu'))
      }
    }
    const validateBasePath = (rule, value, callback) => {
      if (!value || /^[a-z$_\u4E00-\u9FA5][\w\u4E00-\u9FA5$]*$/i.test(value)) {
        callback()
      } else {
        callback(i18n.t('packages_business_data_server_drawer_validate'))
      }
    }
    const validatePrefix = (rule, value, callback) => {
      if (
        /^[a-z$_\u4E00-\u9FA5][\w\u4E00-\u9FA5$]*$/i.test(value) ||
        value === ''
      ) {
        callback()
      } else {
        callback(i18n.t('packages_business_data_server_drawer_validate'))
      }
    }

    return {
      loading: false,
      visible: false,
      data: {},
      form: {
        pathAccessMethod: 'customize',
        apiVersion: 'v1',
        prefix: '',
        basePath: '',
        acl: ['admin'],
        appValue: '',
        appLabel: '',
        limit: 0,
      },
      tab: 'form',
      isEdit: false,
      rules: {
        name: [
          {
            required: true,
            message: i18n.t(
              'packages_business_data_server_drawer_qingshurufuwu',
            ),
            trigger: 'blur',
          },
        ],
        acl: [
          {
            required: true,
            message: i18n.t(
              'packages_business_data_server_drawer_selectPermissions',
            ),
            trigger: 'blur',
          },
        ],
        connectionType: [
          {
            required: true,
            message: i18n.t(
              'packages_business_data_server_drawer_qingxuanzelianjie',
            ),
            trigger: 'blur',
          },
        ],
        connectionId: [
          {
            required: true,
            message:
              i18n.t('public_input_placeholder') + i18n.t('public_connection'),
            trigger: 'blur',
          },
        ],
        tableName: [
          {
            required: true,
            message: i18n.t(
              'packages_business_data_server_drawer_qingxuanzeduixiang',
            ),
            trigger: 'blur',
          },
        ],
        param: [
          {
            required: true,
            validator: validateParams,
            trigger: ['blur', 'change'],
          },
        ],
        basePath: [
          {
            required: true,
            message:
              i18n.t('public_input_placeholder') +
              i18n.t('packages_business_data_server_drawer_base_path'),
            trigger: ['blur', 'change'],
          },
          { validator: validateBasePath, trigger: ['blur', 'change'] },
        ],
        prefix: [
          {
            required: false,
            validator: validatePrefix,
            trigger: ['blur', 'change'],
          },
        ],
        apiVersion: [
          {
            required: true,
            validator: validateBasePath,
            trigger: ['blur', 'change'],
          },
        ],
        prefix: [
          {
            required: false,
            validator: validatePrefix,
            trigger: ['blur', 'change'],
          },
        ],
        apiVersion: [
          {
            required: false,
            validator: validateBasePath,
            trigger: ['blur', 'change'],
          },
        ],
        appValue: [
          {
            required: true,
            message: i18n.t(
              'packages_business_data_server_drawer_qingxuanzesuoshu',
            ),
            trigger: ['blur', 'change'],
          },
        ],
      },
      apiTypeMap: {
        defaultApi: i18n.t('packages_business_data_server_drawer_morenchaxun'),
        customerQuery: i18n.t(
          'packages_business_data_server_drawer_zidingyichaxun',
        ),
      },
      databaseTypes: null,
      connectionOptions: null,
      tableOptions: [],
      typeOptions: ['number', 'string', 'boolean', 'date', 'datetime', 'time'],
      operatorOptions: ['>', '==', '<', '>=', '<=', '!=', 'like'],
      conditionOptions: ['null', 'and', 'or'],
      allFields: [],
      fieldLoading: false,

      debugParams: null,
      debugMethod: 'GET',
      debugResult: '',
      templates: {},
      templateType: 'java',

      token: '',
      roles: [],
      workerStatus: '',
      intervalId: 0,
      appData: {
        label: '',
        value: '',
      },
    }
  },
  computed: {
    parameterOptions() {
      return (
        this.form?.params?.filter(
          (item) => !['page', 'limit'].includes(item.name),
        ) || []
      )
    },
    //计算基础路径
    customizePath() {
      const arr = []
      if (this.form?.apiVersion && this.form?.apiVersion !== '') {
        arr.push(this.form?.apiVersion)
      }
      if (this.form?.prefix && this.form?.prefix !== '') {
        arr.push(this.form?.prefix)
      }
      if (this.form?.basePath && this.form?.basePath !== '') {
        arr.push(this.form?.basePath)
      }
      // this.form.path = '/api/' + arr.join('/')
      return `/api/${arr.join('/')}`
    },

    debugDisabled() {
      return this.workerStatus !== 'running'
    },

    urlList() {
      const baseUrl = this.host + this.customizePath

      return [
        {
          method: 'POST',
          url: `${baseUrl}/find`,
        },
        {
          method: 'GET',
          url: String(baseUrl),
        },
        {
          method: 'TOKEN',
          url: `${location.origin + location.pathname}oauth/token`,
        },
      ]
    },

    urlsMap() {
      return this.urlList.reduce((acc, item) => {
        acc[item.method] = item.url
        return acc
      }, {})
    },
  },
  watch: {
    visible(v) {
      if (!v) {
        this.intervalId && clearTimeout(this.intervalId)
      }

      if (v) {
        this.setTabTitle(
          this.data.id
            ? this.$t('packages_business_data_server_drawer_fuwuxiangqing')
            : this.$t('packages_business_data_server_drawer_chuangjianfuwu'),
        )

        // setTimeout(() => {
        //   this.$refs.tabs.calcPaneInstances(true)
        // }, 0)
      }
    },
  },
  mounted() {
    this.getRoles()
  },
  methods: {
    // 打开并初始化抽屉
    open(formData) {
      this.orginData = formData
      this.tab = 'form'
      this.visible = true
      this.isEdit = false
      this.debugParams = null
      this.debugMethod = 'GET'
      this.debugResult = ''
      this.allFields = []
      this.workerStatus = ''
      this.form = {
        pathAccessMethod: 'customize',
        apiVersion: 'v1',
        prefix: '',
        basePath: '',
        acl: ['admin'],
        appValue: '',
        appLabel: '',
        limit: 0,
      }

      this.formatData(formData || {})

      // 若为新建时，则默认值为 '默认查询(defaultApi)' 的值
      this.form.pathAccessMethod = this.data?.pathAccessMethod || 'customize'
      this.getDatabaseTypes()
      const { connectionId, tableName } = this.form
      if (connectionId) {
        this.getTableOptions(connectionId)
      }
      if (connectionId && tableName) {
        this.getFields()
      }
      if (!this.data.id) {
        this.form.basePath = uid(11, 'a')
        this.edit()
      }

      const formVM = this.$refs.form

      if (formVM) {
        this.$nextTick(() => {
          formVM.clearValidate()
          formVM.$el.scrollTop = 0
        })
      }
    },
    tabChanged(tab) {
      let debugParams = null
      if (tab === 'debug') {
        this.isEdit = false
        debugParams = {}
        this.data.params.forEach((p) => {
          debugParams[p.name] = p.defaultvalue || ''
        })
        this.getWorkers()
      }
      this.debugParams = debugParams
    },
    formatData(formData = {}) {
      // 兼容老数据类型
      if (formData.apiType === 'customerApi') {
        formData.apiType = 'customerQuery'
      }
      const path = formData?.paths?.[0] || {}
      const {
        id,
        name,
        description,
        status,
        connectionType,
        connectionName,
        connectionId,
        tableName,
        basePath,
        apiVersion,
        prefix,
        pathAccessMethod,
        listtags,
        limit = 0,
      } = formData
      // 若为新建时，则默认值为 '默认查询(defaultApi)' 的值

      const appData = listtags?.[0] || {}
      const appValue = appData.id || '' // 不改变appValue 的原始值，防止首次创建触发所属应用的必填校验
      const appLabel = appData.value

      const apiType = formData?.apiType || 'defaultApi'
      const fields = formData.paths?.[0]?.fields || []
      this.data = {
        status: status || 'generating', // generating,pending,active
        id,
        name,
        description,
        apiType,
        connectionType,
        connectionName,
        connectionId,
        tableName,
        basePath,
        apiVersion,
        prefix,
        pathAccessMethod,
        method: path.method || 'GET',
        fields,
        params:
          path.params?.filter((t) => t.name !== 'sort') ||
          this.getDefaultParams(apiType),
        where: path.where || [],
        sort: path.sort || [],
        path: path.path || '',
        acl: path.acl || ['admin'],
        appValue,
        appLabel,
        limit,
      }
      this.form = cloneDeep(this.data)
      const host = this.host
      const _path = this.data.path
      const baseUrl = host + _path
      if (this.data.status === 'active') {
        this.getAPIServerToken((token) => {
          this.templates = getTemplate(baseUrl, token)
        })
      }
    },
    // 获取角色
    getRoles() {
      const filter = {
        limit: 500,
        skip: 0,
      }
      roleApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          this.roles = data?.items || []
        })
    },
    getDefaultParams(apiType) {
      const params = [
        {
          name: 'page',
          type: 'number',
          defaultvalue: '1',
          description: i18n.t(
            'packages_business_data_server_drawer_fenyebianhao',
          ),
          required: true,
        },
        {
          name: 'limit',
          type: 'number',
          defaultvalue: '20',
          description: i18n.t(
            'packages_business_data_server_drawer_meigefenyefan',
          ),
          required: true,
        },
      ]
      if (apiType === 'defaultApi') {
        params.push(
          ...[
            // { name: 'sort', type: 'object', description: i18n.t('public_button_sort') },
            {
              name: 'filter',
              type: 'object',
              description: i18n.t('public_data_filter_condition'),
            },
          ],
        )
      }
      return params
    },
    // 切换到编辑状态
    edit() {
      this.form.status = 'pending'
      this.isEdit = true
      this.$nextTick(() => {
        this.data.fields.forEach((f) => {
          this.$refs?.fieldTable.toggleRowSelection(
            this.allFields.find((it) => it.id === f.id),
          )
        })
      })
    },
    // 保存，新建和修改
    save(type) {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          let {
            id,
            name,
            description,
            apiType,
            basePath,
            connectionId,
            tableName,
            params,
            where,
            sort,
            fields,
            method,
            path,
            status,
            acl,
            connectionType,
            connectionName,
            apiVersion,
            prefix,
            pathAccessMethod,
            appLabel,
            appValue,
            limit,
          } = this.form

          // basePath
          if (basePath && basePath !== '') {
            status = 'pending'
          }

          if (params.some((it) => !it.name.trim())) {
            return this.$message.error(
              i18n.t('packages_business_data_server_drawer_qingshurucanshu'),
            )
          }

          // 排除 fields: [null]
          fields = fields.filter((f) => !!f)

          this.loading = true
          this.$emit('update:loading', true)

          const formData = {
            id,
            status,
            name,
            description,
            apiType,
            connectionId,
            connectionName,
            connectionType,
            operationType: method,
            tableName,
            basePath,
            readConcern: '',
            readPreference: '',
            readPreferenceTag: '',
            limit,
            datasource: connectionId, // 冗余老字段
            tablename: tableName, // 冗余老字段
            apiVersion, // 冗余老字段
            prefix,
            pathAccessMethod, // 冗余老字段
            listtags: [
              {
                id: appValue,
                value: appLabel,
              },
            ], // 冗余老字段

            paths: [
              {
                name:
                  apiType === 'customerQuery' ? 'customerQuery' : 'findPage', // 冗余老字段
                result: 'Page<Document>', // 冗余老字段
                type: apiType === 'customerQuery' ? 'customerQuery' : 'preset', // 冗余老字段
                acl, // 冗余老字段

                method,
                params,
                where,
                sort,
                fields,
                path,
              },
            ],
          }
          if (!type) {
            //生成按钮 不传fields覆盖数据库已有数据 (open 抽屉this.allFields 就清空了数据)
            if (connectionId && tableName) {
              await this.loadAllFields()
            }
            formData.fields = this.allFields
          }

          const data = await modulesApi[id ? 'patch' : 'post'](
            formData,
          ).finally(() => {
            this.loading = false
            this.$emit('update:loading', false)
          })
          data.connection = connectionId
          data.source = {
            database_type: connectionType,
            name: connectionName,
          }
          this.formatData(data || [])
          this.orginData && Object.assign(this.orginData, data)
          this.$emit('save', data)
          this.isEdit = false
        }
      })
    },
    // 获取可选数据源类型
    async getDatabaseTypes() {
      this.databaseTypes = null
      const data = await databaseTypesApi.get().catch(() => {
        this.databaseTypes = []
      })
      this.databaseTypes =
        data
          ?.filter((it) =>
            [
              'mysql',
              'sqlserver',
              'oracle',
              'mongodb',
              'postgres',
              'tidb',
              'doris',
            ].includes(it.pdkId),
          )
          ?.map((it) => it.name) || []
      // this.databaseTypes = data?.map(it => it.name) || []
      this.getConnectionOptions()
    },
    // 获取可选连接
    async getConnectionOptions() {
      const filter = {
        fields: {
          id: true,
          name: true,
          connection_type: true,
          status: true,
          user_id: true,
          database_type: true,
        },
        where: {
          database_type: this.form.connectionType
            ? this.form.connectionType
            : {
                in: this.databaseTypes,
              },
          connection_type:
            import.meta.env.VUE_APP_MODE !== 'msa'
              ? {
                  in: ['source_and_target', 'target'],
                }
              : undefined,
        },
      }
      const type = this.form.connectionType
      if (type) {
        filter.where.database_type = type
      }
      this.connectionOptions = null
      const data = await connectionsApi.listAll(filter).catch(() => {
        this.connectionOptions = []
      })
      this.connectionOptions =
        data?.map((it) => ({
          name: it.name,
          type: it.database_type,
          id: it.id,
        })) || []
    },
    // 获取可选表，依赖连接id
    async getTableOptions(id) {
      this.tableOptions = null
      const data = await metadataInstancesApi
        .getTablesValue({ connectionId: id })
        .catch(() => {
          this.tableOptions = []
        })
      this.tableOptions = data || []
    },
    // 获取输出结果中可配置的所有字段
    async getFields() {
      this.fieldLoading = true
      const filter = {
        where: {
          'source.id': this.form.connectionId,
          original_name: this.form.tableName,
          is_deleted: false,
          sourceType: 'SOURCE',
        },
      }
      const data = await metadataInstancesApi
        .get({
          filter: JSON.stringify(filter),
        })
        .finally(() => {
          this.fieldLoading = false
        })
      this.allFields =
        data?.items?.[0]?.fields?.map((it) => {
          return Object.assign({}, it, {
            id: it.id,
            field_name: it.field_name,
            originalDataType: it.data_type,
            comment: it.comment,
          })
        }) || []
      if (!this.form.id) {
        this.form.fields = cloneDeep(this.allFields)
      }
      // 回显输出结果中被选中的字段
      const fields = this.form.fields || []
      this.$nextTick(() => {
        fields.forEach((row) => {
          this.$refs?.fieldTable.toggleRowSelection(
            this.allFields.find((it) => it.id === row.id),
          )
        })
      })
    },
    apiTypeChanged() {
      this.form.params = this.getDefaultParams(this.form.apiType)
    },
    connectionTypeChanged() {
      this.getConnectionOptions()
      this.form.connectionName = ''
      this.form.tableName = ''
      this.form.fields = []
      this.allFields = []
      this.$refs?.form?.clearValidate('connectionType')
    },
    connectionNameChanged() {
      // 选择连接名时自动填充连接类型
      const connection = this.connectionOptions.find(
        (it) => it.name === this.form.connectionName,
      )
      this.form.connectionType = connection.type
      this.form.connectionId = connection.id
      this.form.tableName = ''
      this.form.fields = []
      this.allFields = []
      this.getTableOptions(connection.id)
      this.$refs?.form?.clearValidate('connectionId')
    },
    tableChanged() {
      this.form.fields = []
      this.allFields = []
      this.getFields()
      this.$refs?.form?.clearValidate('tableName')
    },
    aclChanged() {
      this.$refs?.form?.clearValidate('acl')
      this.handleChangePermissionsAndSave()
    },
    fieldsChanged(val) {
      this.form.fields = val
    },
    addItem(key) {
      const map = {
        params: { name: '', type: 'string', description: '', defaultvalue: '' },
        where: {
          fieldName: '',
          parameter: '',
          operator: '>',
          condition: 'and',
        },
        sort: { fieldName: '', type: 'asc' },
      }
      if (key === 'where') {
        const list = this.form.where
        const lastItem = list.at(-1)
        if (list.length && lastItem.condition === 'null') {
          lastItem.condition = 'and'
        }
      }
      this.form[key].push(cloneDeep(map[key]))
    },
    removeItem(key, index) {
      this.form[key].splice(index, 1)
    },
    async getAPIServerToken(callback) {
      const clientInfo = await applicationApi.get({
        filter: JSON.stringify({
          where: {
            clientName: 'Data Explorer',
          },
        }),
      })
      const clientInfoItem = clientInfo?.items?.[0] || {}

      const paramsStr = `grant_type=client_credentials&client_id=${clientInfoItem.id}&client_secret=${clientInfoItem.clientSecret}`
      const result = await axios.create().post('/oauth/token', paramsStr)
      const token = result?.data?.access_token || ''
      this.token = token
      callback && callback(token)
    },
    async debugData() {
      const http = axios.create()
      let params = this.debugParams
      const method = this.debugMethod
      if (method === 'TOKEN') {
        this.debugResult = JSON.stringify(
          {
            access_token: this.token,
            expires_in: 1209599,
            scope: 'admin',
            token_type: 'Bearer',
          },
          null,
          2,
        )
      } else {
        const url = `${this.urlsMap[this.debugMethod]}?access_token=${this.token}`
        for (const key in params) {
          const value = params[key]
          if (!value) {
            delete params[key]
          }
        }
        if (method === 'GET') {
          params = {
            params,
          }
        }
        const result = await http[method.toLowerCase()](url, params).catch(
          (error) => {
            let result = error?.response?.data
            result = result ? JSON.stringify(result, null, 2) : ''
            this.debugResult = result
          },
        )
        if (result) {
          this.debugResult = JSON.stringify(result?.data, null, 2)
        }
      }
    },

    getWorkers() {
      const where = {
        worker_type: 'api-server',
        ping_time: {
          gte: '$serverDate',
          gte_offset: 30000,
        },
      }
      const filter = {
        order: 'ping_time DESC',
        limit: 1,
        fields: {
          worker_status: true,
        },
        where,
      }
      workerApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          if (data?.items?.length) {
            const record = data.items[0] || {}
            const workerStatus =
              record.workerStatus || record.worker_status || {}
            if (this.status !== workerStatus.status) {
              this.workerStatus = workerStatus.status
            }
          } else {
            this.workerStatus = 'stop'
          }
        })
        .finally(() => {
          this.intervalId = setTimeout(this.getWorkers, 2000)
        })
    },

    async loadAllFields() {
      const filter = {
        where: {
          'source.id': this.form.connectionId,
          original_name: this.form.tableName,
          is_deleted: false,
          sourceType: 'SOURCE',
        },
      }
      const data = await metadataInstancesApi.get({
        filter: JSON.stringify(filter),
      })
      this.allFields =
        data?.items?.[0]?.fields?.map((it) => {
          return Object.assign({}, it, {
            id: it.id,
            field_name: it.field_name,
            originalDataType: it.data_type,
            comment: '',
          })
        }) || []
    },

    handleChangePermissionsAndSave() {
      if (this.isEdit) return
      this.$refs.form.validate(async (valid) => {
        if (!valid) return
        const {
          id,
          apiType,
          params,
          where,
          sort,
          fields,
          method,
          path,
          acl,
          appLabel,
          appValue,
        } = this.form

        const formData = {
          id,
          listtags: [
            {
              id: appValue,
              value: appLabel,
            },
          ],
          paths: [
            {
              name: apiType === 'customerQuery' ? 'customerQuery' : 'findPage',
              result: 'Page<Document>',
              type: apiType === 'customerQuery' ? 'customerQuery' : 'preset',
              acl,
              method,
              params,
              where,
              sort,
              fields,
              path,
            },
          ],
        }
        modulesApi.patch(formData).then(() => {
          this.$message.success(this.$t('public_message_operation_success'))
        })
      })
    },

    async handleUpdateRole() {
      if (!this.data.id) return

      await modulesApi.updatePermissions({
        moduleId: this.data.id,
        acl: this.form.acl,
      })
      this.$message.success(this.$t('public_message_operation_success'))
    },

    async handleUpdateApp() {
      if (!this.data.id) return

      const { appLabel, appValue } = this.form
      await modulesApi.updateTags({
        moduleId: this.data.id,
        listtags: [
          {
            id: appValue,
            value: appLabel,
          },
        ],
      })
      this.$message.success(this.$t('public_message_operation_success'))
    },

    setTabTitle(title) {
      let $title = this.$refs.tabs.$el.querySelector('.el-tabs__nav-title')
      if (!$title) {
        // 创建一个新的span元素
        $title = document.createElement('span')
        $title.setAttribute(
          'class',
          'el-tabs__nav-title mr-4 float-start fs-6 fw-sub font-color-dark',
        )

        // 获取el-tabs__header元素
        const tabsHeader =
          this.$refs.tabs.$el.querySelector('.el-tabs__nav-wrap')

        // 在el-tabs__header元素之前插入新的span元素
        tabsHeader.insertBefore($title, tabsHeader.firstChild)
      }

      $title.textContent = title
    },
  },
}
</script>

<template>
  <component
    :is="tag"
    v-model:visible="visible"
    v-loading="loading"
    class="overflow-hidden"
    width="850px"
    @visible="$emit('visible', arguments[0])"
  >
    <div class="flex flex-column overflow-hidden pt-0 h-100">
      <!-- 顶部 标题 Tab -->
      <div
        v-if="!inDialog"
        class="flex position-relative px-4"
        style="line-height: 48px"
      >
        <ElTabs
          ref="tabs"
          v-model="tab"
          class="data-server__tabs flex-1"
          @tab-change="tabChanged"
        >
          <ElTabPane
            :label="$t('packages_business_data_server_drawer_peizhi')"
            name="form"
          />
          <ElTabPane
            v-if="data.status === 'active'"
            :label="$t('packages_business_data_server_drawer_tiaoshi')"
            name="debug"
          />
        </ElTabs>
      </div>

      <ElForm
        ref="form"
        hide-required-asterisk
        class="data-server__form overflow-auto flex-1"
        :class="{
          'p-6 pb-16': !inDialog,
        }"
        label-position="top"
        :model="form"
        :rules="rules"
      >
        <template v-if="!inDialog">
          <div class="flex justify-content-between align-items-start">
            <ElFormItem class="flex-1 form-item-name" prop="name">
              <ElInput
                v-if="isEdit"
                v-model="form.name"
                text
                type="primary"
                maxlength="50"
                :placeholder="
                  $t('public_input_placeholder') + $t('public_name')
                "
              />
              <div v-else class="fw-sub fs-7 font-color-normal">
                {{ data.name }}
              </div>
            </ElFormItem>
            <template v-if="tab === 'form' && data.status !== 'active'">
              <div v-if="isEdit" class="ml-4">
                <ElButton v-if="data.id" @click="isEdit = false">{{
                  $t('public_button_cancel')
                }}</ElButton>
                <ElButton type="primary" @click="save()">{{
                  $t('public_button_save')
                }}</ElButton>
              </div>
              <ElButton v-else class="ml-4" type="primary" @click="edit">{{
                $t('public_button_edit')
              }}</ElButton>
            </template>
          </div>
          <div class="flex-1 mt-3 mb-3">
            <ElInput
              v-model="form.description"
              type="textarea"
              :placeholder="
                $t('public_input_placeholder') + $t('public_description')
              "
              :disabled="!isEdit"
            />
          </div>
          <div class="flex gap-4">
            <ElFormItem
              class="flex-1"
              :label="$t('packages_business_data_server_drawer_quanxianfanwei')"
              prop="acl"
            >
              <ElSelect
                v-model="form.acl"
                multiple
                class="w-100"
                @change="handleUpdateRole"
              >
                <ElOption
                  v-for="item in roles"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name"
                />
              </ElSelect>
            </ElFormItem>

            <ElFormItem
              v-if="tag !== 'div'"
              class="flex-1"
              :label="$t('packages_business_data_server_drawer_suoshuyingyong')"
              prop="appValue"
            >
              <ListSelect
                v-model:value="form.appValue"
                v-model:label="form.appLabel"
                :disabled="disableApp"
                class="w-100"
                @change="handleUpdateApp"
              />
            </ElFormItem>
          </div>
        </template>
        <template v-else>
          <div class="flex gap-4">
            <ElFormItem
              :label="$t('public_name')"
              class="flex-1 form-item-name"
              prop="name"
            >
              <ElInput
                v-if="isEdit"
                v-model="form.name"
                :placeholder="$t('public_input_placeholder_name')"
              />
              <div v-else class="fw-sub fs-7 font-color-normal">
                {{ data.name }}
              </div>
            </ElFormItem>
            <ElFormItem
              class="flex-1"
              :label="$t('packages_business_quanxianfanwei')"
              prop="acl"
            >
              <ElSelect
                v-model="form.acl"
                multiple
                :disabled="!isEdit"
                class="w-100"
                @change="handleUpdateRole"
              >
                <ElOption
                  v-for="item in roles"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem
              v-if="!params.to"
              class="flex-1"
              :label="$t('packages_business_data_server_drawer_suoshuyingyong')"
              prop="appValue"
            >
              <ListSelect
                v-model:value="form.appValue"
                v-model:label="form.appLabel"
                @change="handleUpdateApp"
              />
            </ElFormItem>
          </div>
          <ElFormItem
            :label="$t('public_description')"
            class="flex-1 form-item-name"
            prop="description"
          >
            <ElInput
              v-model="form.description"
              type="textarea"
              :placeholder="$t('function_describe_placeholder')"
              :disabled="!isEdit"
            />
          </ElFormItem>
        </template>

        <!-- 基础信息 -->
        <ul
          v-if="tab === 'form'"
          class="flex flex-wrap bg-subtle p-2 rounded-lg"
        >
          <li class="data-server-form-base__item">
            <ElFormItem
              :label="$t('packages_business_data_server_drawer_caozuoleixing')"
              label-width="86px"
            >
              <div class="text">{{ $t('public_button_inquire') }}</div>
            </ElFormItem>
          </li>
          <li class="data-server-form-base__item">
            <ElFormItem
              :label="$t('packages_business_data_server_drawer_fabujiedian')"
              label-width="86px"
            >
              <div class="text">{{ $t('public_select_option_all') }}</div>
            </ElFormItem>
          </li>
          <li class="data-server-form-base__item">
            <ElFormItem
              :label="$t('packages_business_data_server_drawer_jiekouleixing')"
              label-width="86px"
            >
              <ElSelect
                v-if="isEdit"
                v-model="form.apiType"
                class="w-100"
                @change="apiTypeChanged"
              >
                <ElOption
                  v-for="(label, value) in apiTypeMap"
                  :key="value"
                  :value="value"
                  :label="label"
                />
              </ElSelect>
              <div v-else class="text">{{ apiTypeMap[data.apiType] }}</div>
            </ElFormItem>
          </li>
          <li class="data-server-form-base__item">
            <ElFormItem
              :label="$t('public_connection_type')"
              label-width="86px"
              prop="connectionType"
            >
              <ElSelect
                v-if="isEdit"
                v-model="form.connectionType"
                class="w-100"
                filterable
                :loading="!databaseTypes"
                @change="connectionTypeChanged"
              >
                <ElOption
                  v-for="item in databaseTypes"
                  :key="item"
                  :value="item"
                  :label="item"
                />
              </ElSelect>
              <div v-else class="text">{{ data.connectionType }}</div>
            </ElFormItem>
          </li>
          <li class="data-server-form-base__item">
            <ElFormItem
              :label="$t('public_connection_name')"
              label-width="86px"
              prop="connectionId"
            >
              <ElSelect
                v-if="isEdit"
                v-model="form.connectionName"
                class="w-100"
                filterable
                :loading="!connectionOptions"
                @change="connectionNameChanged"
              >
                <ElOption
                  v-for="item in connectionOptions"
                  :key="item.id"
                  :value="item.name"
                  :label="item.name"
                />
              </ElSelect>
              <div v-else class="text">{{ data.connectionName }}</div>
            </ElFormItem>
          </li>
          <li class="data-server-form-base__item">
            <ElFormItem
              :label="$t('object_list_name')"
              label-width="86px"
              prop="tableName"
            >
              <ElSelect
                v-if="isEdit"
                v-model="form.tableName"
                class="w-100"
                filterable
                :loading="!tableOptions"
                @change="tableChanged"
              >
                <ElOption
                  v-for="item in tableOptions"
                  :key="item.tableName"
                  :value="item.tableName"
                >
                  <span>{{ item.tableName }}</span>
                  <span v-if="item.tableComment" class="font-color-sslight">{{
                    `(${item.tableComment})`
                  }}</span>
                </ElOption>
              </ElSelect>
              <div v-else class="text">{{ data.tableName }}</div>
            </ElFormItem>
          </li>
        </ul>
        <template v-if="tab === 'form'">
          <!-- 访问路径设置-->
          <section v-if="isEdit">
            <div class="fs-7 data-server-panel__title mt-4 mb-3">
              {{ $t('packages_business_data_server_drawer_aPI_path_Settings') }}
            </div>

            <div class="flex gap-4">
              <ElFormItem
                class="flex-1"
                :label="$t('public_version')"
                prop="apiVersion"
                :rules="rules.apiVersion"
              >
                <ElInput v-model="form.apiVersion" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem
                class="flex-1"
                :label="$t('packages_business_data_server_drawer_prefix')"
                prop="prefix"
              >
                <ElInput v-model="form.prefix" :disabled="!isEdit" />
              </ElFormItem>
            </div>
            <div class="flex gap-4">
              <ElFormItem
                class="flex-1"
                :label="$t('packages_business_data_server_drawer_base_path')"
                prop="basePath"
              >
                <ElInput v-model="form.basePath" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem class="flex-1" prop="limit">
                <template #label>
                  <el-text>
                    <span>{{
                      $t('packages_business_request_speed_limit')
                    }}</span>
                    <el-tooltip
                      :content="$t('packages_business_request_speed_limit_tip')"
                      placement="top"
                      ><el-icon color="#909399" class="ml-1"
                        ><InfoFilled
                      /></el-icon>
                    </el-tooltip>
                  </el-text>
                </template>
                <el-input-number
                  v-model="form.limit"
                  :min="0"
                  :disabled="!isEdit"
                  :controls="false"
                />
              </ElFormItem>
            </div>
          </section>
          <!--服务访问 -->
          <div
            class="data-server-panel__title mt-4 mb-3 justify-content-start gap-2"
          >
            <span>{{ $t('packages_business_fuwufangwen') }}</span>

            <el-tag v-if="form.limit" type="warning">
              {{
                $t('packages_business_request_speed_limit_tag', {
                  val: form.limit,
                })
              }}
            </el-tag>
          </div>
          <ul class="data-server-path flex flex-column gap-2">
            <li
              v-for="item in urlList"
              :key="item.method"
              class="data-server-path__item bg-subtle rounded-4 pl-1 py-1"
            >
              <div
                class="data-server-path__method rounded-4 mr-4"
                :class="`method--${item.method}`"
              >
                {{ item.method }}
              </div>
              <div class="data-server-path__value line-height">
                {{ item.url }}
              </div>
            </li>
          </ul>
        </template>

        <!-- 輸入参数 -->
        <div class="data-server-panel__title mt-4 mb-3">
          <div class="flex align-items-center">
            <span>{{
              $t('packages_business_data_server_drawer_shurucanshu')
            }}</span>
            <el-button
              v-if="isEdit && form.apiType === 'customerQuery'"
              text
              size="small"
              type="primary"
              class="ml-2"
              @click="addItem('params')"
            >
              <template #icon>
                <el-icon-circle-plus />
              </template>
            </el-button>
          </div>
        </div>
        <ElTable class="flex-1" :data="isEdit ? form.params : data.params">
          <ElTableColumn
            :label="$t('packages_business_data_server_drawer_canshumingcheng')"
            prop="name"
            min-width="120"
          >
            <template #default="{ row, $index }">
              <div
                v-if="isEdit && $index > 1 && form.apiType === 'customerQuery'"
              >
                <ElFormItem
                  :prop="`params.${$index}.name`"
                  :error="!form.params[$index].name ? 'true' : ''"
                  :show-message="false"
                  :rules="rules.param"
                >
                  <ElInput v-model="form.params[$index].name" />
                </ElFormItem>
              </div>
              <div v-else>{{ row.name }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('public_type')" prop="type">
            <template #default="{ row, $index }">
              <div
                v-if="isEdit && $index > 1 && form.apiType === 'customerQuery'"
                min-width="60"
              >
                <ElSelect v-model="form.params[$index].type">
                  <ElOption
                    v-for="type in typeOptions"
                    :key="type"
                    :value="type"
                    :label="type"
                  />
                </ElSelect>
              </div>
              <div v-else>{{ row.type }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            v-if="tab === 'form'"
            :label="$t('public_data_default')"
            prop="defaultvalue"
            min-width="60"
          >
            <template #default="{ row, $index }">
              <div v-if="isEdit && row.defaultvalue !== undefined">
                <ElInput v-model="form.params[$index].defaultvalue" />
              </div>
              <div v-else>{{ row.defaultvalue }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            :label="$t('public_description')"
            prop="description"
            min-width="100"
          >
            <template #default="{ row, $index }">
              <div
                v-if="isEdit && $index > 1 && form.apiType === 'customerQuery'"
              >
                <ElInput v-model="form.params[$index].description" />
              </div>
              <div v-else>{{ row.description }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            v-if="debugParams"
            :label="$t('packages_business_data_server_drawer_canshuzhi')"
            min-width="100"
          >
            <template #default="{ row }">
              <ElInputNumber
                v-if="row.type === 'number'"
                v-model="debugParams[row.name]"
                :precision="0"
                :step="1"
                :min="0"
              />
              <ElInput v-else v-model="debugParams[row.name]" />
            </template>
          </ElTableColumn>
          <ElTableColumn
            v-if="isEdit && form.apiType === 'customerQuery'"
            align="center"
            width="60"
          >
            <template #default="{ $index }">
              <el-button text @click="removeItem('params', $index)">
                <template #icon>
                  <el-icon>
                    <el-icon-remove />
                  </el-icon>
                </template>
              </el-button>
            </template>
          </ElTableColumn>
        </ElTable>

        <template
          v-if="
            data.apiType === 'customerQuery' || form.apiType === 'customerQuery'
          "
        >
          <!-- 筛选条件 -->
          <div class="data-server-panel__title mt-4 mb-3">
            <div>
              <span>{{
                $t('packages_business_data_server_drawer_shaixuantiaojian')
              }}</span>
              <el-icon class="icon-button color-primary ml-4">
                <el-icon-circle-plus />
              </el-icon>
            </div>
          </div>
          <ul v-if="isEdit">
            <li
              v-for="(item, index) in form.where"
              :key="index"
              class="flex align-items-center"
            >
              <ElSelect v-model="form.where[index].fieldName" class="mr-4">
                <ElOption
                  v-for="opt in allFields"
                  :key="opt.id"
                  :value="opt.field_name"
                  :label="opt.field_name"
                />
              </ElSelect>
              <ElSelect v-model="form.where[index].operator" class="mr-4">
                <ElOption
                  v-for="item in operatorOptions"
                  :key="item"
                  :value="item"
                  :label="item"
                />
              </ElSelect>
              <ElSelect v-model="form.where[index].parameter" class="mr-4">
                <ElOption
                  v-for="opt in parameterOptions"
                  :key="opt.name"
                  :value="opt.name"
                  :label="opt.name"
                />
              </ElSelect>
              <ElSelect v-model="form.where[index].condition" class="mr-4">
                <template v-for="item in conditionOptions">
                  <ElOption
                    v-if="item !== 'null' || index === form.where.length - 1"
                    :value="item"
                    :label="item"
                  />
                </template>
              </ElSelect>
              <el-icon class="icon-button">
                <el-icon-remove />
              </el-icon>
            </li>
          </ul>
          <ul v-else>
            <li
              v-for="(item, index) in data.where"
              :key="index"
              class="flex align-items-center"
            >
              <span class="mr-4">{{ item.fieldName }}</span>
              <span class="mr-4">{{ item.operator }}</span>
              <span class="mr-4">{{ item.parameter }}</span>
              <span>{{ item.condition }}</span>
            </li>
          </ul>

          <!-- 排列条件 -->
          <div class="data-server-panel__title mt-4 mb-3">
            <div>
              <span>{{
                $t('packages_business_data_server_drawer_pailietiaojian')
              }}</span>
              <el-icon class="icon-button color-primary ml-4">
                <el-icon-circle-plus />
              </el-icon>
            </div>
          </div>
          <ul v-if="isEdit">
            <li
              v-for="(item, index) in form.sort"
              :key="index"
              class="flex align-items-center"
            >
              <ElSelect v-model="form.sort[index].fieldName" class="mr-4">
                <ElOption
                  v-for="opt in allFields"
                  :key="opt.id"
                  :value="opt.field_name"
                  :label="opt.field_name"
                />
              </ElSelect>
              <ElSelect v-model="form.sort[index].type" class="mr-4">
                <ElOption value="asc" label="ASC" />
                <ElOption value="desc" label="DESC" />
              </ElSelect>
              <el-icon class="icon-button">
                <el-icon-remove />
              </el-icon>
            </li>
          </ul>
          <ul v-else>
            <li
              v-for="(item, index) in data.sort"
              :key="index"
              class="flex align-items-center"
            >
              <span class="mr-4">{{ item.fieldName }}</span>
              <span>{{ item.type }}</span>
            </li>
          </ul>
        </template>

        <!-- 输出结果 -->
        <template v-if="tab === 'form'">
          <div class="data-server-panel__title mt-4 mb-3">
            {{ $t('packages_business_data_server_drawer_shuchujieguo') }}
          </div>
          <ElTable
            ref="fieldTable"
            :data="isEdit ? allFields : data.fields"
            :loading="fieldLoading"
            @selection-change="fieldsChanged"
          >
            <ElTableColumn v-if="isEdit" type="selection" width="55" />
            <ElTableColumn
              :label="$t('public_name')"
              prop="field_name"
              min-width="200"
            />
            <ElTableColumn
              :label="$t('public_type')"
              prop="originalDataType"
              min-width="120"
            />
            <ElTableColumn
              :label="$t('public_description')"
              prop="comment"
              min-width="50"
            />
          </ElTable>
        </template>

        <!-- {{$t('packages_business_data_server_drawer_diaoyongfangshi')}} -->
        <template v-if="tab === 'debug'">
          <div class="data-server-panel__title mt-4 mb-3">
            {{ $t('packages_business_data_server_drawer_diaoyongfangshi') }}
          </div>
          <div class="flex gap-4">
            <el-input :model-value="urlsMap[debugMethod]" readonly>
              <template #prepend>
                <ElSelect v-model="debugMethod" style="width: 100px">
                  <ElOption
                    v-for="(item, i) in urlList"
                    :key="i"
                    :value="item.method"
                  />
                </ElSelect>
              </template>
            </el-input>

            <ElButton
              type="primary"
              :disabled="debugDisabled"
              @click="debugData"
              >{{ $t('public_button_submit') }}
            </ElButton>
          </div>
        </template>
        <template v-if="tab === 'debug'">
          <div class="data-server-panel__title mt-4 mb-3">
            {{ $t('packages_business_data_server_drawer_fanhuijieguo') }}
          </div>
          <VCodeEditor
            class="rounded-lg"
            height="280"
            lang="json"
            :options="{ printMargin: false, readOnly: true, wrap: 'free' }"
            :value="debugResult"
          />
        </template>

        <!--  {{$t('packages_business_data_server_drawer_shilidaima2')}} -->
        <template v-if="tab === 'debug'">
          <div class="position-relative mt-4 mb-3">
            <div
              class="fs-7 fw-sub font-color-dark flex align-center"
              style="line-height: 36px; height: 36px"
            >
              <span class="data-server-panel__title my-0">
                {{ $t('packages_business_data_server_drawer_shilidaima') }}
              </span>
            </div>
            <ElTabs v-model="templateType" class="data-server__tabs flex-1">
              <ElTabPane label="JAVA" name="java" />
              <ElTabPane label="JS" name="javascript" />
              <ElTabPane label="PYTHON" name="python" />
            </ElTabs>
          </div>
          <VCodeEditor
            class="rounded-lg"
            height="280"
            :lang="templateType"
            :options="{ printMargin: false, readOnly: true, wrap: 'free' }"
            :value="templates[templateType]"
          />
        </template>
      </ElForm>
    </div>
  </component>
</template>

<style lang="scss" scoped>
.icon-button {
  font-size: 15px;
  cursor: pointer;
}

.el-icon-remove {
  color: map.get($iconFillColor, normal);
}

.line-height {
  line-height: 22px;
}

.data-server__tabs {
  --el-tabs-header-height: 48px;
  :deep(.el-tabs__header.is-top) {
    margin: 0;
  }
}

.data-server__form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
    .el-form-item__content {
      .el-select {
        width: 100%;
      }
    }
  }

  :deep(.el-form-item__label) {
    padding-bottom: 0;
  }
}

.data-server-form-base__item {
  padding: 4px 8px;
  width: 30%;

  .text {
    font-size: 12px;
    word-break: break-word;
  }

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.data-server-panel__title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  margin-bottom: 16px;
  height: 22px;
  line-height: 22px;
  font-weight: 500;
  font-size: 14px;
  color: map.get($fontColor, dark);
  user-select: none;

  position: relative;
  padding-left: 12px;
  $bar-width: 3px;

  &::before {
    content: '';
    width: $bar-width;
    height: 1.2em;
    border-radius: calc($bar-width / 2);
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    position: absolute;
    background-color: map.get($color, primary);
    //background-color: #bcbfc3;
  }
}

.data-server-path__item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  font-family:
    PingFangSC-Regular,
    PingFang SC;
}

.data-server-path__method {
  margin-right: 40px;
  width: 62px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  border-radius: 2px;
  color: map.get($fontColor, white);

  &.method--POST {
    background: #478c6c;
  }

  &.method--GET {
    background: #09819c;
  }

  &.method--TOKEN {
    background: #f2994b;
  }
}

.data-server-debug__url {
  border: 1px solid map.get($borderColor, form);
  background: map.get($bgColor, form);
  border-radius: 4px;
}

.data-server__form {
  :deep(.form-item-name) {
    .el-form-item__content {
      margin-left: 0 !important;
    }
  }
}

.data-server-debug__method {
  :deep(.el-input__inner) {
    border: none;
    background: transparent;
  }
}
</style>
