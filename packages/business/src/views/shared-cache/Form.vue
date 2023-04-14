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
          v-model="form.name"
          class="form-input"
          :placeholder="$t('packages_business_shared_cache_placeholder_name')"
        ></ElInput>
      </ElFormItem>
      <ElFormItem prop="connectionId" :label="$t('packages_business_shared_cache_column_connection') + ':'">
        <VirtualSelect
          v-model="form.connectionId"
          filterable
          class="form-input"
          :item-size="34"
          :items="connectionOptions"
          :loading="!connectionOptions.length"
          :placeholder="$t('packages_business_shared_cache_placeholder_connection')"
          @input="connectionInputHandler"
        />
      </ElFormItem>
      <ElFormItem prop="tableName" :label="$t('packages_business_shared_cache_column_table') + ':'">
        <VirtualSelect
          v-model="form.tableName"
          filterable
          class="form-input"
          :item-size="34"
          :items="tableOptions"
          :loading="tableOptionsLoading"
          :placeholder="$t('packages_business_shared_cache_placeholder_table')"
          @input="tableInputHandler"
        />
      </ElFormItem>
      <ElFormItem prop="cacheKeys" :label="$t('packages_business_shared_cache_keys') + ':'">
        <template slot="label">
          <span>{{ $t('packages_business_shared_cache_keys') }}</span>
          <el-tooltip placement="top" :content="$t('packages_business_shared_cache_keys_tooltip')">
            <i class="el-icon-info color-primary ml-1"></i>
          </el-tooltip>
          <span>:</span>
        </template>
        <FieldSelector
          v-model="form.cacheKeys"
          class="form-field-selector"
          :options="fieldOptions"
          :placeholder="$t('packages_business_shared_cache_placeholder_keys')"
        ></FieldSelector>
      </ElFormItem>
      <ElFormItem prop="fields" :label="$t('packages_business_shared_cache_fields') + ':'">
        <template slot="label">
          <span>{{ $t('packages_business_shared_cache_fields') }}</span>
          <el-tooltip placement="top" :content="$t('packages_business_shared_cache_fields_tooltip')">
            <i class="el-icon-info color-primary ml-1"></i>
          </el-tooltip>
          <span>:</span>
        </template>
        <FieldSelector
          v-model="form.fields"
          class="form-field-selector"
          :options="fieldOptions"
          :placeholder="$t('packages_business_shared_cache_placeholder_fields')"
        ></FieldSelector>
      </ElFormItem>
      <ElFormItem prop="maxMemory">
        <template slot="label">
          <span>{{ $t('packages_business_shared_cache_max_memory') }}</span>
          <el-tooltip placement="top" :content="$t('packages_business_shared_cache_max_memory_tooltip')">
            <i class="el-icon-info color-primary ml-1"></i>
          </el-tooltip>
          <span>:</span>
        </template>
        <ElInputNumber
          v-model="form.maxMemory"
          style="width: 200px"
          controls-position="right"
          :min="1"
          :max="999999999"
        ></ElInputNumber>
        <span class="ml-1">M</span>
      </ElFormItem>
      <ElFormItem prop="externalStorageId" :label="$t('public_external_memory_configuration')">
        <ElSelect v-model="form.externalStorageId" filterable :loading="!externalStorageOptions">
          <ElOption
            v-for="opt in externalStorageOptions"
            :key="opt.value"
            :value="opt.value"
            :label="opt.label"
          ></ElOption>
        </ElSelect>
      </ElFormItem>
      <ElFormItem>
        <template slot="label">
          <span>{{ $t('packages_business_shared_cache_code') }}</span>
          <el-tooltip placement="top" :content="$t('packages_business_shared_cache_code_tooltip')">
            <i class="el-icon-info color-primary ml-1"></i>
          </el-tooltip>
          <span>:</span>
        </template>
      </ElFormItem>
      <CodeView :data="form" class="w-100"></CodeView>
    </ElForm>
  </section>
</template>

<script>
import { VirtualSelect } from '@tap/component'
import FieldSelector from './FieldSelector'
import CodeView from './CodeView.vue'
import { sharedCacheApi, metadataInstancesApi, connectionsApi, externalStorageApi } from '@tap/api'
import i18n from '@tap/i18n'

export default {
  components: { VirtualSelect, FieldSelector, CodeView },
  props: {
    taskId: {
      type: String
    }
  },
  data() {
    return {
      loading: false,
      form: {},
      connectionOptions: [],
      externalStorageOptions: null,

      tableOptions: [],
      tableOptionsLoading: false,

      fieldOptions: [],
      fieldOptionsLoading: false,

      rules: {
        name: [
          { required: true, trigger: 'blur', message: this.$t('packages_business_shared_cache_placeholder_name') }
        ],
        connectionId: [
          { required: true, trigger: 'blur', message: this.$t('packages_business_shared_cache_placeholder_connection') }
        ],
        tableName: [
          { required: true, trigger: 'blur', message: this.$t('packages_business_shared_cache_placeholder_table') }
        ],
        cacheKeys: [
          { required: true, trigger: 'blur', message: this.$t('packages_business_shared_cache_placeholder_keys') }
        ],
        fields: [
          { required: true, trigger: 'blur', message: this.$t('packages_business_shared_cache_placeholder_fields') }
        ],
        maxMemory: [
          { required: true, trigger: 'blur', message: this.$t('packages_business_shared_cache_placeholder_max_memory') }
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
    this.getConnectionOptions()
    this.getExternalStorageOptions()
    this.init()
  },
  methods: {
    init() {
      this.form = {
        name: '',
        connectionId: '',
        tableName: '',
        cacheKeys: '',
        fields: '',
        maxMemory: 500,
        externalStorageId: ''
      }
      if (this.taskId) {
        this.getData(this.taskId)
      }
    },
    getData(id) {
      this.loading = true
      sharedCacheApi
        .findOne(id)
        .then(data => {
          data = data || {}
          this.form = {
            name: data.name,
            connectionId: data.connectionId,
            tableName: data.tableName,
            cacheKeys: data.cacheKeys,
            fields: data.fields?.join(',') || '',
            maxMemory: data.maxMemory,
            externalStorageId: data.externalStorageId
          }
          this.getTableOptions(data.connectionId)
          this.getTableSchema(data.tableName)
        })
        .finally(() => {
          this.loading = false
        })
    },
    async getExternalStorageOptions() {
      const data = await externalStorageApi.get().catch(() => {
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
    getConnectionOptions() {
      let filter = {
        order: 'createTime DESC',
        fields: {
          id: true,
          name: true
        },
        where: {
          connection_type: { in: ['source', 'source_and_target'] }
        }
      }
      connectionsApi.listAll(filter).then(data => {
        let options = data || []
        this.connectionOptions = options.map(opt => ({ label: opt.name, value: opt.id }))
      })
    },
    getTableOptions(connectionId) {
      this.tableOptionsLoading = true
      metadataInstancesApi
        .getTables(connectionId)
        .then(data => {
          let options = []
          let list = data || []
          list.forEach(opt => {
            if (opt) {
              options.push({ label: opt, value: opt })
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
    connectionInputHandler(connectionId) {
      this.form.tableName = ''
      this.form.cacheKeys = ''
      this.form.fields = ''
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
          let { name, connectionId, tableName, cacheKeys, fields, maxMemory, externalStorageId } = this.form
          let id = this.taskId
          let params = {
            id,
            name,
            dag: {
              nodes: [
                {
                  type: 'collection',
                  attrs: {
                    fields: fields.split(',')
                  },
                  tableName: tableName,
                  databaseType: 'mongodb',
                  connectionId: connectionId
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
          this.$emit('update:loading', true)
          sharedCacheApi[method](params)
            .then(() => {
              this.$message.success(this.$t('public_message_save_ok'))
              this.$emit('success')
            })
            .finally(() => {
              this.$emit('update:loading', false)
            })
        }
      })
    }
  }
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