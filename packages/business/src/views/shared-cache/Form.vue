<template>
  <section v-loading="loading">
    <ElForm
      ref="form"
      class="flex-fill overflow-auto pb-4"
      :label-width="isEn ? '180px' : '140px'"
      label-position="left"
      :model="form"
      :rules="rules"
    >
      <ElFormItem prop="name" :label="$t('packages_business_shared_cache_name') + ':'">
        <ElInput
          v-model.trim="form.name"
          class="form-input"
          :placeholder="$t('packages_business_shared_cache_placeholder_name')"
        ></ElInput>
      </ElFormItem>
      <ElFormItem prop="connectionId" :label="$t('packages_business_shared_cache_column_connection') + ':'">
        <ConnectionListSelect
          v-model:value="form.connectionId"
          v-model:label="form.connectionName"
          :placeholder="$t('packages_business_shared_cache_placeholder_connection')"
          filterable
          :params="{
            where: {
              connection_type: { in: ['source', 'source_and_target'] }
            }
          }"
          class="form-input"
          @change="connectionInputHandler"
        ></ConnectionListSelect>
      </ElFormItem>
      <ElFormItem prop="tableName" :label="$t('packages_business_shared_cache_column_table') + ':'">
        <VirtualSelect
          v-model:value="form.tableName"
          filterable
          class="form-input"
          :item-size="34"
          :items="tableOptions"
          :loading="tableOptionsLoading"
          :placeholder="$t('packages_business_shared_cache_placeholder_table')"
          @input="tableInputHandler"
        >
          <template #option="{ item }">
            <span>{{ item.label }}</span>
            <span v-if="item.comment" class="font-color-sslight">{{ `(${item.comment})` }}</span>
          </template>
        </VirtualSelect>
      </ElFormItem>
      <ElFormItem prop="cacheKeys" :label="$t('packages_business_shared_cache_keys') + ':'">
        <template v-slot:label>
          <span>{{ $t('packages_business_shared_cache_keys') }}</span>
          <el-tooltip placement="top" :content="$t('packages_business_shared_cache_keys_tooltip')">
            <el-icon class="color-primary ml-1"><el-icon-info /></el-icon>
          </el-tooltip>
          <span>:</span>
        </template>
        <FieldSelector
          v-model:value="form.cacheKeys"
          class="form-field-selector"
          :options="fieldOptions"
          :placeholder="$t('packages_business_shared_cache_placeholder_keys')"
        ></FieldSelector>
      </ElFormItem>
      <ElFormItem prop="fields" :label="$t('packages_business_shared_cache_fields') + ':'">
        <template v-slot:label>
          <span>{{ $t('packages_business_shared_cache_fields') }}</span>
          <el-tooltip placement="top" :content="$t('packages_business_shared_cache_fields_tooltip')">
            <el-icon class="color-primary ml-1"><el-icon-info /></el-icon>
          </el-tooltip>
          <span>:</span>
        </template>
        <FieldSelector
          v-model:value="form.fields"
          class="form-field-selector"
          :options="fieldOptions"
          :placeholder="$t('packages_business_shared_cache_placeholder_fields')"
        ></FieldSelector>
      </ElFormItem>
      <ElFormItem prop="maxMemory">
        <template v-slot:label>
          <span>{{ $t('packages_business_shared_cache_max_memory') }}</span>
          <el-tooltip placement="top" :content="$t('packages_business_shared_cache_max_memory_tooltip')">
            <el-icon class="color-primary ml-1"><el-icon-info /></el-icon>
          </el-tooltip>
          <span>:</span>
        </template>
        <ElInputNumber
          v-model:value="form.maxMemory"
          style="width: 200px"
          controls-position="right"
          :min="1"
          :max="999999999"
        ></ElInputNumber>
        <span class="ml-1">M</span>
      </ElFormItem>
      <ElFormItem prop="externalStorageId" :label="$t('public_external_memory_configuration')">
        <ElSelect v-model:value="form.externalStorageId" filterable :loading="!externalStorageOptions">
          <ElOption
            v-for="opt in externalStorageOptions"
            :key="opt.value"
            :value="opt.value"
            :label="opt.label"
          ></ElOption>
        </ElSelect>
      </ElFormItem>
      <ElFormItem>
        <template v-slot:label>
          <span>{{ $t('packages_business_shared_cache_code') }}</span>
          <el-tooltip placement="top" :content="$t('packages_business_shared_cache_code_tooltip')">
            <el-icon class="color-primary ml-1"><el-icon-info /></el-icon>
          </el-tooltip>
          <span>:</span>
        </template>
      </ElFormItem>
      <CodeView :data="form" class="w-100"></CodeView>
    </ElForm>
  </section>
</template>

<script>
import { InfoFilled as ElIconInfo } from '@element-plus/icons'
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import { VirtualSelect } from '@tap/component'
import FieldSelector from './FieldSelector'
import CodeView from './CodeView.vue'
import { sharedCacheApi, metadataInstancesApi, externalStorageApi } from '@tap/api'
import i18n from '@tap/i18n'
import ConnectionListSelect from '../connections/ListSelect'

export default {
  components: {
    VirtualSelect,
    FieldSelector,
    CodeView,
    ConnectionListSelect,
    ElIconInfo
  },
  props: {
    taskId: {
      type: String
    }
  },
  data() {
    return {
      loading: false,
      form: {},
      externalStorageOptions: null,

      tableOptions: [],
      tableOptionsLoading: false,

      fieldOptions: [],
      fieldOptionsLoading: false,

      rules: {
        name: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('packages_business_shared_cache_placeholder_name')
          }
        ],
        connectionId: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('packages_business_shared_cache_placeholder_connection')
          }
        ],
        tableName: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('packages_business_shared_cache_placeholder_table')
          }
        ],
        cacheKeys: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('packages_business_shared_cache_placeholder_keys')
          }
        ],
        fields: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('packages_business_shared_cache_placeholder_fields')
          }
        ],
        maxMemory: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('packages_business_shared_cache_placeholder_max_memory')
          }
        ],
        externalStorageId: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('packages_business_shared_cache_placeholder_external_storage')
          }
        ]
      },
      isEn: i18n.locale === 'en'
    }
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      this.form = {
        name: '',
        connectionId: '',
        connectionName: '',
        databaseType: '',
        tableName: '',
        cacheKeys: '',
        fields: '',
        maxMemory: 500,
        externalStorageId: ''
      }
      if (this.taskId) {
        await this.getData(this.taskId)
      }
      await this.getExternalStorageOptions()
    },
    async getData(id) {
      this.loading = true
      await sharedCacheApi
        .findOne(id)
        .then(async data => {
          data = data || {}
          let externalStorageId = data.externalStorageId
          const externalStorage = await externalStorageApi.get(externalStorageId)
          if (!externalStorage?.id) {
            externalStorageId = ''
          }
          this.form = {
            name: data.name,
            connectionId: data.connectionId,
            connectionName: data.connectionName,
            databaseType: data.databaseType,
            tableName: data.tableName,
            cacheKeys: data.cacheKeys,
            fields: data.fields?.join(',') || '',
            maxMemory: data.maxMemory,
            externalStorageId
          }
          this.getTableOptions(data.connectionId)
          this.getTableSchema(data.tableName)
        })
        .finally(() => {
          this.loading = false
        })
    },
    async getExternalStorageOptions() {
      let filter = {
        where: {}
      }

      const { externalStorageId } = this.form
      if (externalStorageId) {
        const ext = await externalStorageApi.get(externalStorageId)
        filter.where.type = ext?.type
      }
      const data = await externalStorageApi
        .get({
          filter: JSON.stringify(filter)
        })
        .catch(() => {
          this.externalStorageOptions = []
        })
      let defaultStorageId = ''
      this.externalStorageOptions =
        data?.items?.map(it => {
          if (it.defaultStorage) {
            defaultStorageId = it.id
          }
          return { label: it.name, value: it.id }
        }) || []
      if (!this.taskId) {
        this.form.externalStorageId = defaultStorageId
      }
    },
    getTableOptions(connectionId) {
      this.tableOptionsLoading = true
      metadataInstancesApi
        .getTablesValue({ connectionId })
        .then(data => {
          let options = []
          let list = data || []
          list.forEach(opt => {
            if (opt) {
              options.push({
                label: opt.tableName,
                value: opt.tableName,
                comment: opt.tableComment
              })
            }
          })
          this.tableOptions = options
        })
        .finally(() => {
          this.tableOptionsLoading = false
        })
    },
    getTableSchema(tableName) {
      let params = {
        filter: JSON.stringify({
          where: {
            'source.id': this.form.connectionId,
            original_name: tableName,
            is_deleted: false,
            'fields.is_deleted': false
          },
          fields: {
            'fields.field_name': true,
            'fields.original_field_name': true
          }
        })
      }
      this.fieldOptionsLoading = true
      metadataInstancesApi
        .get(params)
        .then(data => {
          let table = data?.items?.[0]
          if (table) {
            let fields = table.fields || []
            this.fieldOptions = fields.map(opt => opt.field_name)
          } else {
            this.$message.error(this.$t('packages_business_shared_cache_messge_no_table'))
          }
        })
        .finally(() => {
          this.fieldOptionsLoading = false
        })
    },
    connectionInputHandler(connectionId, opt) {
      this.form.tableName = ''
      this.form.cacheKeys = ''
      this.form.fields = ''
      this.form.databaseType = opt.data?.definitionPdkId
      this.fieldOptions = []
      this.getTableOptions(connectionId)
    },
    tableInputHandler(tableName) {
      this.form.cacheKeys = ''
      this.form.fields = ''
      this.fieldOptions = []
      this.getTableSchema(tableName)
    },
    submit() {
      this.$refs.form.validate(flag => {
        if (flag) {
          let {
            name,
            connectionId,
            connectionName,
            databaseType,
            tableName,
            cacheKeys,
            fields,
            maxMemory,
            externalStorageId
          } = this.form
          let id = this.taskId
          let params = {
            id,
            name,
            dag: {
              nodes: [
                {
                  type: 'table',
                  attrs: {
                    fields: fields.split(',')
                  },
                  tableName,
                  databaseType,
                  connectionId,
                  connectionName
                },
                {
                  cacheKeys: cacheKeys,
                  maxMemory: maxMemory,
                  externalStorageId
                }
              ],
              edges: []
            }
          }
          let method = id ? 'patch' : 'post'
          $emit(this, 'update:loading', true)
          sharedCacheApi[method](params)
            .then(() => {
              this.$message.success(this.$t('public_message_save_ok'))
              $emit(this, 'success')
            })
            .finally(() => {
              $emit(this, 'update:loading', false)
            })
        }
      })
    }
  },
  emits: ['update:loading', 'success']
}
</script>

<style lang="scss" scoped>
.el-input,
.el-select,
.form-input,
.fields-selector {
  width: 100%;
  max-width: 600px;
}
</style>
