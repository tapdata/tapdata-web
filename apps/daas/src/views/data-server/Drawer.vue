<template>
  <Drawer v-loading="loading" class="overflow-hidden" style="width: 838px" :visible.sync="visible">
    <div class="flex flex-column overflow-hidden pt-2 h-100">
      <!-- 顶部 标题 Tab -->
      <div class="flex position-relative">
        <div class="position-absolute top-0 start-0 fs-7 fw-sub px-6 font-color-dark" style="line-height: 36px">
          {{ data.id ? '服务详情' : '创建服务' }}
        </div>
        <ElTabs v-model="tab" class="data-server__tabs flex-1" @tab-click="tabChanged">
          <ElTabPane label="配置" name="form"></ElTabPane>
          <ElTabPane v-if="data.status === 'active'" label="调试" name="debug"></ElTabPane>
        </ElTabs>
      </div>
      <ElForm
        hide-required-asterisk
        inline-message
        class="data-server__form p-6 overflow-auto flex-1 pb-16"
        ref="form"
        label-position="left"
        size="mini"
        :model="form"
        :rules="rules"
      >
        <!-- 服务名称 -->
        <div class="flex justify-content-between align-items-start">
          <ElFormItem prop="name" class="flex-1" size="small">
            <ElInput v-if="isEdit" v-model="form.name"></ElInput>
            <div v-else class="fw-sub fs-7 font-color-normal">{{ data.name }}</div>
          </ElFormItem>
          <template v-if="tab === 'form' && data.status !== 'active'">
            <div v-if="isEdit" class="ml-10">
              <ElButton v-if="data.id" class="mr-4" size="mini" @click="isEdit = false">{{
                $t('button_cancel')
              }}</ElButton>
              <ElButton type="primary" size="mini" @click="save">{{ $t('button_save') }}</ElButton>
            </div>
            <ElButton v-else class="ml-10" type="primary" size="mini" @click="edit">{{ $t('button_edit') }}</ElButton>
          </template>
        </div>
        <div class="mt-1 line-height font-color-light">按联系方式筛选结果统计不同年龄段的人员数量</div>

        <!-- 基础信息 -->
        <ul v-if="tab === 'form'" class="flex flex-wrap bg-main p-2 mt-4 rounded-1">
          <li class="data-server-form-base__item">
            <ElFormItem label="操作类型" label-width="66px">
              <div class="text">查询</div>
            </ElFormItem>
          </li>
          <li class="data-server-form-base__item">
            <ElFormItem label="发布节点" label-width="66px">
              <div class="text">全部</div>
            </ElFormItem>
          </li>
          <li class="data-server-form-base__item">
            <ElFormItem label="接口类型" label-width="66px">
              <ElSelect v-if="isEdit" v-model="form.apiType" @change="apiTypeChanged">
                <ElOption v-for="(label, value) in apiTypeMap" :key="value" :value="value" :label="label"></ElOption>
              </ElSelect>
              <div v-else class="text">{{ apiTypeMap[data.apiType] }}</div>
            </ElFormItem>
          </li>
          <li class="data-server-form-base__item">
            <ElFormItem label="连接类型" label-width="66px" prop="connectionType">
              <ElSelect
                v-if="isEdit"
                v-model="form.connectionType"
                filterable
                :loading="!databaseTypes"
                @change="connectionTypeChanged"
              >
                <ElOption v-for="item in databaseTypes" :key="item" :value="item" :label="item"></ElOption>
              </ElSelect>
              <div v-else class="text">{{ data.connectionType }}</div>
            </ElFormItem>
          </li>
          <li class="data-server-form-base__item">
            <ElFormItem label="连接名称" label-width="66px" prop="connectionId">
              <ElSelect
                v-if="isEdit"
                v-model="form.connectionName"
                filterable
                :loading="!connectionOptions"
                @change="connectionNameChanged"
              >
                <ElOption
                  v-for="item in connectionOptions"
                  :key="item.name"
                  :value="item.name"
                  :label="item.name"
                ></ElOption>
              </ElSelect>
              <div v-else class="text">{{ data.connectionName }}</div>
            </ElFormItem>
          </li>
          <li class="data-server-form-base__item">
            <ElFormItem label="对象名称" label-width="66px" prop="tableName">
              <ElSelect
                v-if="isEdit"
                v-model="form.tableName"
                filterable
                :loading="!tableOptions"
                @change="tableChanged"
              >
                <ElOption v-for="item in tableOptions" :key="item" :value="item" :label="item"></ElOption>
              </ElSelect>
              <div v-else class="text">{{ data.tableName }}</div>
            </ElFormItem>
          </li>
        </ul>

        <!-- 输入参数 -->
        <div class="data-server-panel__title">
          <div>
            <span>输入参数</span>
            <i
              v-if="isEdit && form.apiType === 'customerQuery'"
              class="el-icon-circle-plus icon-button color-primary ml-4"
              @click="addItem('params')"
            ></i>
          </div>
        </div>
        <ElTable class="flex-1" :data="isEdit ? form.params : data.params">
          <ElTableColumn label="参数名称" prop="name" min-width="120">
            <template #default="{ row, $index }">
              <div v-if="isEdit && $index > 1 && form.apiType === 'customerQuery'">
                <ElFormItem :error="!form.params[$index].name ? 'true' : ''" :show-message="false">
                  <ElInput v-model="form.params[$index].name" size="mini"></ElInput>
                </ElFormItem>
              </div>
              <div v-else>{{ row.name }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="类型" prop="type">
            <template #default="{ row, $index }">
              <div v-if="isEdit && $index > 1 && form.apiType === 'customerQuery'" min-width="60">
                <ElSelect v-model="form.params[$index].type" size="mini">
                  <ElOption v-for="type in typeOptions" :key="type" :value="type" :label="type"></ElOption>
                </ElSelect>
              </div>
              <div v-else>{{ row.type }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn v-if="tab === 'form'" label="默认值" prop="defaultvalue" key="defaultvalue" min-width="60">
            <template #default="{ row, $index }">
              <div v-if="isEdit && row.defaultvalue !== undefined">
                <ElInput v-model="form.params[$index].defaultvalue" size="mini"></ElInput>
              </div>
              <div v-else>{{ row.defaultvalue }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="描述" prop="description" min-width="100">
            <template #default="{ row, $index }">
              <div v-if="isEdit && $index > 1 && form.apiType === 'customerQuery'">
                <ElInput v-model="form.params[$index].description" size="mini"></ElInput>
              </div>
              <div v-else>{{ row.description }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn v-if="debugParams" label="参数值" key="value" min-width="100">
            <template #default="{ row }">
              <ElInput v-model="debugParams[row.name]" size="mini"></ElInput>
            </template>
          </ElTableColumn>
          <ElTableColumn v-if="isEdit && form.apiType === 'customerQuery'" align="center" width="60">
            <template #default="{ $index }">
              <i v-if="$index > 1" class="el-icon-remove icon-button" @click="removeItem('params', $index)"></i>
            </template>
          </ElTableColumn>
        </ElTable>

        <template v-if="data.apiType === 'customerQuery' || form.apiType === 'customerQuery'">
          <!-- 筛选条件 -->
          <div class="data-server-panel__title">
            <div>
              <span>筛选条件</span>
              <i v-if="isEdit" class="el-icon-circle-plus icon-button color-primary ml-4" @click="addItem('where')"></i>
            </div>
          </div>
          <ul v-if="isEdit">
            <li v-for="(item, index) in form.where" class="flex align-items-center" :key="index">
              <ElSelect v-model="form.where[index].fieldName" class="mr-4">
                <ElOption
                  v-for="opt in allFields"
                  :key="opt.id"
                  :value="opt.field_name"
                  :label="opt.field_name"
                ></ElOption>
              </ElSelect>
              <ElSelect v-model="form.where[index].operator" size="mini" class="mr-4">
                <ElOption v-for="item in operatorOptions" :key="item" :value="item" :label="item"></ElOption>
              </ElSelect>
              <ElSelect v-model="form.where[index].parameter" class="mr-4">
                <ElOption
                  v-for="opt in parameterOptions"
                  :key="opt.name"
                  :value="opt.name"
                  :label="opt.name"
                ></ElOption>
              </ElSelect>
              <ElSelect v-model="form.where[index].condition" size="mini" class="mr-4">
                <ElOption v-for="item in conditionOptions" :key="item" :value="item" :label="item"></ElOption>
              </ElSelect>
              <i class="el-icon-remove icon-button" @click="removeItem('where', index)"></i>
            </li>
          </ul>
          <ul v-else>
            <li v-for="(item, index) in data.where" class="flex align-items-center" :key="index">
              <span class="mr-4">{{ item.fieldName }}</span>
              <span class="mr-4">{{ item.operator }}</span>
              <span class="mr-4">{{ item.parameter }}</span>
              <span>{{ item.condition }}</span>
            </li>
          </ul>

          <!-- 排列条件 -->
          <div class="data-server-panel__title">
            <div>
              <span>排列条件</span>
              <i v-if="isEdit" class="el-icon-circle-plus icon-button color-primary ml-4" @click="addItem('sort')"></i>
            </div>
          </div>
          <ul v-if="isEdit">
            <li v-for="(item, index) in form.sort" class="flex align-items-center" :key="index">
              <ElSelect v-model="form.sort[index].fieldName" class="mr-4">
                <ElOption
                  v-for="opt in allFields"
                  :key="opt.id"
                  :value="opt.field_name"
                  :label="opt.field_name"
                ></ElOption>
              </ElSelect>
              <ElSelect v-model="form.sort[index].operator" size="mini" class="mr-4">
                <ElOption value="asc" label="asc"></ElOption>
                <ElOption value="desc" label="desc"></ElOption>
              </ElSelect>
              <i class="el-icon-remove icon-button" @click="removeItem('sort', index)"></i>
            </li>
          </ul>
          <ul v-else>
            <li v-for="(item, index) in data.sort" class="flex align-items-center" :key="index">
              <span class="mr-4">{{ item.fieldName }}</span>
              <span>{{ item.type }}</span>
            </li>
          </ul>
        </template>

        <!-- 输出结果 -->
        <template v-if="tab === 'form'">
          <div class="data-server-panel__title">输出结果</div>
          <ElTable
            ref="fieldTable"
            :data="isEdit ? allFields : data.fields"
            :loading="fieldLoading"
            @selection-change="fieldsChanged"
          >
            <ElTableColumn v-if="isEdit" type="selection" width="55"></ElTableColumn>
            <ElTableColumn label="名称" prop="field_name" min-width="200"></ElTableColumn>
            <ElTableColumn label="类型" prop="originalDataType" min-width="120"></ElTableColumn>
            <ElTableColumn label="描述" prop="comment" min-width="50"></ElTableColumn>
          </ElTable>
        </template>
        <template v-if="tab === 'form' && !isEdit">
          <div class="data-server-panel__title">
            <span>服务访问</span>
            <ElButton v-if="data.status === 'generating'" type="primary" size="mini" @click="generate">生成</ElButton>
          </div>
          <ul v-if="data.path" class="data-server-path">
            <li v-for="(url, method) in urls" :key="method" class="data-server-path__item">
              <div class="data-server-path__method" :class="'method--' + method">
                {{ method }}
              </div>
              <div class="data-server-path__value line-height">{{ url }}</div>
            </li>
          </ul>
        </template>

        <!-- 调用方式 -->
        <template v-if="tab === 'debug'">
          <div class="data-server-panel__title">调用方式</div>
          <div class="flex">
            <div class="data-server-debug__url flex-1 flex align-center mr-4">
              <ElSelect v-model="debugMethod" class="data-server-debug__method mr-4" style="width: 100px" size="mini">
                <ElOption v-for="(url, method) in urls" :key="method" :value="method"></ElOption>
              </ElSelect>
              <div>{{ urls[debugMethod] }}</div>
            </div>
            <ElButton type="primary" size="mini" @click="debugData">{{ $t('button_submit') }}</ElButton>
          </div>
        </template>
        <template v-if="tab === 'debug'">
          <div class="data-server-panel__title">返回结果</div>
          <VCodeEditor
            height="280"
            lang="json"
            :options="{ printMargin: false, readOnly: true }"
            :value="debugResult"
          ></VCodeEditor>
        </template>

        <!--  示例代码 -->
        <template v-if="tab === 'debug'">
          <div class="flex position-relative mt-8 mb-4">
            <div class="position-absolute top-0 start-0 fs-7 fw-sub font-color-dark" style="line-height: 36px">
              示例代码
            </div>
            <ElTabs v-model="templateType" class="data-server__tabs flex-1">
              <ElTabPane label="JAVA" name="java"></ElTabPane>
              <ElTabPane label="JS" name="javascript"></ElTabPane>
              <ElTabPane label="PYTHON" name="python"></ElTabPane>
            </ElTabs>
          </div>
          <VCodeEditor
            height="280"
            :lang="templateType"
            :options="{ printMargin: false, readOnly: true }"
            :value="templates[templateType]"
          ></VCodeEditor>
        </template>
      </ElForm>
    </div>
  </Drawer>
</template>

<script>
import axios from 'axios'

import { databaseTypesApi, connectionsApi, metadataInstancesApi, modulesApi } from '@tap/api'
import { Drawer, VCodeEditor } from '@tap/component'
import { uid } from '@tap/shared'
import { cloneDeep } from 'lodash'

import templates from './template'

export default {
  components: { Drawer, VCodeEditor },
  props: {
    host: String
  },
  data() {
    return {
      loading: false,
      visible: false,
      data: {},
      form: {},
      tab: 'form',
      isEdit: false,
      rules: {
        name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
        connectionType: [{ required: true, message: '请选择连接类型', trigger: 'blur' }],
        connectionId: [{ required: true, message: '请选择连接', trigger: 'blur' }],
        tableName: [{ required: true, message: '请选择对象名称', trigger: 'blur' }]
      },
      apiTypeMap: {
        defaultApi: '默认查询',
        customerQuery: '自定义查询'
      },
      databaseTypes: null,
      connectionOptions: null,
      tableOptions: [],
      typeOptions: ['number', 'string', 'boolean', 'data', 'datetime', 'time'],
      operatorOptions: ['>', '==', '<', '>=', '<=', '!=', 'like'],
      conditionOptions: ['null', 'and', 'or'],
      allFields: [],
      fieldLoading: false,

      debugParams: null,
      debugMethod: 'GET',
      debugResult: '',

      urls: [],

      templates: templates,
      templateType: 'java'
    }
  },
  computed: {
    parameterOptions() {
      return this.form?.params?.filter(item => !['page', 'limit'].includes(item.name)) || []
    }
  },
  methods: {
    // 打开并初始化抽屉
    open(formData) {
      this.tab = 'form'
      this.visible = true
      this.isEdit = false
      this.$refs?.form?.clearValidate()
      this.formatData(formData || {})
      if (!this.data.id) {
        this.edit()
      }
    },
    tabChanged() {
      this.isEdit = false
      let debugParams = null
      if (this.tab === 'debug') {
        debugParams = {}
        this.data.params.forEach(p => {
          debugParams[p.name] = p.defaultvalue || ''
        })
      }
      this.debugParams = debugParams
    },
    formatData(formData = {}) {
      // 兼容老数据类型
      if (formData.apiType === 'customerApi') {
        formData.apiType = 'customerQuery'
      }
      const path = formData?.paths?.[0] || {}
      const { id, name, status, connectionType, connectionName, connectionId, tableName, basePath } = formData
      // 若为新建时，则默认值为 ‘默认查询(defaultApi)’ 的值
      let apiType = formData?.apiType || 'defaultApi'
      this.data = {
        status: status || 'generating', // generating,pending,active
        id,
        name,
        apiType: apiType,
        connectionType,
        connectionName,
        connectionId,
        tableName,
        basePath,

        method: path.method || 'GET',
        fields: path.fields || [],
        params: path.params || this.getDefaultParams(apiType),
        where: path.where || [],
        sort: path.sort || [],
        path: path.path || ''
      }
      let host = this.host
      let _path = this.data.path
      this.urls = {
        POST: `${host}${_path}/find`,
        GET: `${host}${_path}`,
        TOKEN: `${host}${_path}`
      }
    },
    getDefaultParams(apiType) {
      let params = [
        { name: 'page', type: 'number', defaultvalue: '1', description: '分页编号', required: true },
        { name: 'limit', type: 'number', defaultvalue: '20', description: '每个分页返回的记录数', required: true }
      ]
      if (apiType === 'defaultApi') {
        params.push(
          ...[
            { name: 'sort', type: 'object', description: '排序' },
            { name: 'filter', type: 'object', description: '过滤条件' }
          ]
        )
      }
      return params
    },
    // 切换到编辑状态
    edit() {
      this.isEdit = true
      this.form = cloneDeep(this.data)
      this.form.status = 'generating'
      this.form.path = ''
      this.form.basePath = ''
      this.getDatabaseTypes()
      this.getConnectionOptions()
      let { connectionId, tableName } = this.form
      if (connectionId) {
        this.getTableOptions(connectionId)
      }
      if (connectionId && tableName) {
        this.getFields()
      }
    },
    // 保存，新建和修改
    save() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let {
            id,
            name,
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
            connectionType,
            connectionName
          } = this.form
          if (params.some(it => !it.name.trim())) {
            return this.$message.error('请输入参数名称')
          }
          this.loading = true
          const data = await modulesApi[id ? 'patch' : 'post']({
            id,
            status,
            name,
            apiType,
            connectionId,
            connectionName,
            connectionType,
            operationType: method,
            datasource: connectionId, // 冗余老字段
            tableName,
            tablename: tableName, // 冗余老字段
            basePath,
            apiVersion: '', // 冗余老字段
            prefix: '', // 冗余老字段
            readConcern: '', // 冗余老字段
            readPreference: '', // 冗余老字段
            readPreferenceTag: '', // 冗余老字段
            listtags: [],

            paths: [
              {
                name: apiType === 'customerQuery' ? 'customerQuery' : 'findPage', // 冗余老字段
                result: 'Page<Document>', // 冗余老字段
                type: 'preset', // 冗余老字段
                acl: ['admin'], // 冗余老字段

                method,
                params,
                where,
                sort,
                fields,
                path
              }
            ],

            fields: this.allFields
          }).finally(() => {
            this.loading = false
          })
          data.connection = connectionId
          data.source = {
            database_type: connectionType,
            name: connectionName
          }
          this.formatData(data || [])
          this.$emit('save')
          this.isEdit = false
        }
      })
    },
    generate() {
      this.form = cloneDeep(this.data)
      let basePath = uid()
      this.form.basePath = basePath
      this.form.path = `/api/${basePath}`
      this.form.status = 'pending'
      this.$nextTick(() => {
        // save会校验表单项，不加nextTick会导致验证不通过
        this.save()
      })
    },
    // 获取可选数据源类型
    async getDatabaseTypes() {
      this.databaseTypes = null
      const data = await databaseTypesApi.get().catch(() => {
        this.databaseTypes = []
      })
      this.databaseTypes = data?.map(it => it.name) || []
    },
    // 获取可选连接
    async getConnectionOptions() {
      let filter = {
        fields: { id: true, name: true, connection_type: true, status: true, user_id: true, database_type: true },
        where: {
          database_type: this.form.connectionType,
          or: [{ connection_type: 'source_and_target' }, { connection_type: 'target' }]
        }
      }
      let type = this.form.connectionType
      if (type) {
        filter.where.database_type = type
      }
      this.connectionOptions = null
      const data = await connectionsApi.listAll(filter).catch(() => {
        this.connectionOptions = []
      })
      this.connectionOptions = data?.map(it => ({ name: it.name, type: it.database_type, id: it.id })) || []
    },
    // 获取可选表，依赖连接id
    async getTableOptions(id) {
      this.tableOptions = null
      const data = await metadataInstancesApi.getTables(id).catch(() => {
        this.tableOptions = []
      })
      this.tableOptions = data || []
    },
    // 获取输出结果中可配置的所有字段
    async getFields() {
      this.fieldLoading = true
      let filter = {
        where: { 'source.id': this.form.connectionId, original_name: this.form.tableName, is_deleted: false }
      }
      const data = await metadataInstancesApi
        .get({
          filter: JSON.stringify(filter)
        })
        .finally(() => {
          this.fieldLoading = false
        })
      this.allFields =
        data?.items?.[0]?.fields?.map(it => {
          return Object.assign({}, it, {
            id: it.id,
            field_name: it.field_name,
            originalDataType: it.data_type,
            comment: ''
          })
        }) || []
      if (!this.form.id) {
        this.form.fields = cloneDeep(this.allFields)
      }
      // 回显输出结果中被选中的字段
      const fields = this.form.fields || []
      this.$nextTick(() => {
        fields.forEach(row => {
          this.$refs?.fieldTable.toggleRowSelection(this.allFields.find(it => it.id === row.id))
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
      const connection = this.connectionOptions.find(it => it.name === this.form.connectionName)
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
    fieldsChanged(val) {
      this.form.fields = val
    },
    addItem(key) {
      let map = {
        params: { name: '', type: 'string', description: '', defaultvalue: '' },
        where: { fieldName: '', parameter: '', operator: '>', condition: 'null' },
        sort: { fieldName: '', type: 'asc' }
      }
      this.form[key].push(cloneDeep(map[key]))
    },
    removeItem(key, index) {
      this.form[key].splice(index, 1)
    },
    async debugData() {
      let http = axios.create({
        headers: {}
      })
      let params = this.debugParams
      let method = this.debugMethod
      let url = this.urls[this.debugMethod]
      if (method === 'GET') {
        params = {
          params: params
        }
      }
      let result = await http[method.toLowerCase()](url, params).catch(error => {
        let result = error?.response?.data
        result = result ? JSON.stringify(result, null, 2) : ''
        this.debugResult = result
      })
      if (result) {
        this.debugResult = result
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.icon-button {
  font-size: 15px;
  cursor: pointer;
}
.el-icon-remove {
  color: map-get($iconFillColor, normal);
}
.line-height {
  line-height: 22px;
}
.data-server__tabs {
  ::v-deep {
    .el-tabs__nav-wrap.is-top {
      padding-left: 112px;
    }
    .el-tabs__header.is-top {
      margin: 0;
    }
  }
}
.data-server__form {
  ::v-deep {
    .el-form-item {
      margin-bottom: 0;
    }
    .el-form-item__label {
      line-height: 30px;
    }
  }
}
.data-server-form-base__item {
  padding: 4px 8px;
  width: 30%;
  .text {
    font-size: 12px;
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
  color: map-get($fontColor, dark);
  user-select: none;
}
.data-server-path__item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  font-family: PingFangSC-Regular, PingFang SC;
}
.data-server-path__method {
  margin-right: 40px;
  width: 62px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  border-radius: 2px;

  color: map-get($fontColor, white);
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
  border: 1px solid map-get($borderColor, form);
  background: map-get($bgColor, form);
  border-radius: 4px;
  font-family: PingFangSC-Regular, PingFang SC;
}
.data-server-debug__method {
  ::v-deep {
    .el-input__inner {
      border: none;
      background: transparent;
    }
  }
}
</style>
