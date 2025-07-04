<script>
import { InfoFilled } from '@element-plus/icons-vue'
import {
  externalStorageApi,
  metadataInstancesApi,
  sharedCacheApi,
} from '@tap/api'
import { Switch as ConfirmSwitch } from '@tap/form/src/components/switch'
import i18n from '@tap/i18n'
import ConnectionListSelect from '../connections/ListSelect.vue'
import CodeView from './CodeView.vue'
import FieldSelector from './FieldSelector'

export default {
  components: {
    FieldSelector,
    CodeView,
    ConnectionListSelect,
    ConfirmSwitch,
    InfoFilled,
  },
  props: {
    taskId: {
      type: String,
    },
  },
  emits: ['update:loading', 'success'],
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
            message: this.$t('packages_business_shared_cache_placeholder_name'),
          },
        ],
        connectionId: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t(
              'packages_business_shared_cache_placeholder_connection',
            ),
          },
        ],
        tableName: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t(
              'packages_business_shared_cache_placeholder_table',
            ),
          },
        ],
        cacheKeys: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('packages_business_shared_cache_placeholder_keys'),
          },
        ],
        fields: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t(
              'packages_business_shared_cache_placeholder_fields',
            ),
          },
        ],
        maxMemory: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t(
              'packages_business_shared_cache_placeholder_max_memory',
            ),
          },
        ],
        externalStorageId: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t(
              'packages_business_shared_cache_placeholder_external_storage',
            ),
          },
        ],
      },
      isEn: i18n.locale === 'en',
      metadataInstancesId: '',
      showCachekeysCheckMsg: false,
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
        autoCreateIndex: false,
        fields: '',
        maxMemory: 500,
        externalStorageId: '',
        shareCdcEnable: false,
        enforceShareCdc: true,
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
        .then(async (data) => {
          data = data || {}
          let externalStorageId = data.externalStorageId
          const externalStorage =
            await externalStorageApi.get(externalStorageId)
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
            autoCreateIndex: data.autoCreateIndex,
            fields: data.fields?.join(',') || '',
            maxMemory: data.maxMemory,
            externalStorageId,
            shareCdcEnable: data.shareCdcEnable,
            enforceShareCdc: data.enforceShareCdc,
          }
          this.getTableOptions(data.connectionId)
          this.getTableSchema(data.tableName)
        })
        .finally(() => {
          this.loading = false
        })
    },
    async getExternalStorageOptions() {
      const filter = {
        where: {},
      }

      const { externalStorageId } = this.form
      if (externalStorageId) {
        const ext = await externalStorageApi.get(externalStorageId)
        filter.where.type = ext?.type
      }
      const data = await externalStorageApi
        .get({
          filter: JSON.stringify(filter),
        })
        .catch(() => {
          this.externalStorageOptions = []
        })
      let defaultStorageId = ''
      this.externalStorageOptions =
        data?.items?.map((it) => {
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
        .then((data) => {
          const options = []
          const list = data || []
          list.forEach((opt) => {
            if (opt) {
              options.push({
                label: opt.tableName,
                value: opt.tableName,
                comment: opt.tableComment,
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
      const params = {
        filter: JSON.stringify({
          where: {
            'source.id': this.form.connectionId,
            original_name: tableName,
            is_deleted: false,
            'fields.is_deleted': false,
            sourceType: 'SOURCE',
          },
          fields: {
            'fields.field_name': true,
            'fields.original_field_name': true,
            indices: true,
          },
        }),
      }
      this.fieldOptionsLoading = true
      metadataInstancesApi
        .get(params)
        .then((data) => {
          const table = data?.items?.[0]
          if (table) {
            this.metadataInstancesId = table.id
            if (this.taskId) {
              this.handleChangeCacheKeys()
            }
            const fields = table.fields || []
            this.fieldOptions = fields.map((opt) => {
              opt.label = opt.field_name
              opt.value = opt.field_name
              return opt
            })
          } else {
            this.$message.error(
              this.$t('packages_business_shared_cache_messge_no_table'),
            )
          }
        })
        .finally(() => {
          this.fieldOptionsLoading = false
        })
    },
    connectionInputHandler(opt) {
      this.form.tableName = ''
      this.form.connectionName = opt.label
      this.form.cacheKeys = ''
      this.form.fields = ''
      this.form.databaseType = opt.data?.definitionPdkId
      this.fieldOptions = []
      this.getTableOptions(opt.value)
    },
    tableInputHandler(tableName) {
      this.form.cacheKeys = ''
      this.form.fields = ''
      this.fieldOptions = []
      this.getTableSchema(tableName)
    },
    submit() {
      this.$refs.form.validate((flag) => {
        if (flag) {
          const {
            name,
            connectionId,
            connectionName,
            databaseType,
            tableName,
            cacheKeys,
            autoCreateIndex,
            fields,
            maxMemory,
            externalStorageId,
            shareCdcEnable,
            enforceShareCdc,
          } = this.form
          const id = this.taskId
          const needCreateIndex = cacheKeys
            .split(',')
            .filter((t) =>
              this.fieldOptions.some(
                (field) => t === field.value && !field.is_index,
              ),
            )
          const params = {
            id,
            name,
            shareCdcEnable,
            enforceShareCdc,
            dag: {
              nodes: [
                {
                  type: 'table',
                  attrs: {
                    fields: fields.split(','),
                  },
                  tableName,
                  databaseType,
                  connectionId,
                  connectionName,
                },
                {
                  cacheKeys,
                  maxMemory,
                  externalStorageId,
                  needCreateIndex,
                  autoCreateIndex,
                },
              ],
              edges: [],
            },
          }
          const method = id ? 'patch' : 'post'
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
    },

    handleChangeCacheKeys() {
      const params = {
        cacheKeys: this.form.cacheKeys,
        id: this.metadataInstancesId,
      }
      metadataInstancesApi.checkFiledIndex(params).then((data) => {
        this.showCachekeysCheckMsg = !data
      })
    },
  },
}
</script>

<template>
  <section v-loading="loading">
    <ElForm
      ref="form"
      class="flex-fill overflow-y-auto overflow-x-hidden pb-4"
      :label-width="isEn ? '180px' : '140px'"
      label-position="top"
      :model="form"
      :rules="rules"
    >
      <el-row :gutter="24">
        <el-col :span="12">
          <ElFormItem
            prop="name"
            :label="$t('packages_business_shared_cache_name')"
          >
            <ElInput
              v-model.trim="form.name"
              class="form-input"
              :placeholder="
                $t('packages_business_shared_cache_placeholder_name')
              "
            />
          </ElFormItem>
        </el-col>
        <el-col :span="12">
          <ElFormItem
            prop="connectionId"
            :label="`${$t('packages_business_shared_cache_column_connection')}`"
          >
            <ConnectionListSelect
              v-model="form.connectionId"
              :label="form.connectionName"
              :placeholder="
                $t('packages_business_shared_cache_placeholder_connection')
              "
              filterable
              :params="{
                where: {
                  connection_type: { in: ['source', 'source_and_target'] },
                },
              }"
              class="form-input"
              @option-select="connectionInputHandler"
            />
          </ElFormItem>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <ElFormItem
            prop="tableName"
            :label="`${$t('packages_business_shared_cache_column_table')}`"
          >
            <ElSelectV2
              v-model="form.tableName"
              filterable
              class="form-input"
              :options="tableOptions"
              :loading="tableOptionsLoading"
              :placeholder="
                $t('packages_business_shared_cache_placeholder_table')
              "
              @change="tableInputHandler"
            >
              <template #option="{ item }">
                <span>{{ item.label }}</span>
                <span v-if="item.comment" class="font-color-sslight">{{
                  `(${item.comment})`
                }}</span>
              </template>
            </ElSelectV2>
          </ElFormItem>
        </el-col>
        <el-col :span="12">
          <ElFormItem prop="autoCreateIndex">
            <template #label>
              <span>{{
                $t('packages_business_shared_cache_cache_key_auto_create')
              }}</span>
              <el-tooltip
                placement="top"
                :content="
                  $t('packages_business_shared_cache_cache_key_auto_create_tip')
                "
              >
                <i class="el-icon-info color-primary ml-1" />
              </el-tooltip>
            </template>
            <ConfirmSwitch
              v-model:value="form.autoCreateIndex"
              :confirm="{
                title: $t(
                  'packages_business_shared_cache_cache_key_auto_create_tip',
                ),
              }"
            />
          </ElFormItem>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <ElFormItem
            prop="cacheKeys"
            :label="`${$t('packages_business_shared_cache_keys')}`"
          >
            <template #label>
              <span class="align-middle">{{
                $t('packages_business_shared_cache_keys')
              }}</span>
              <el-tooltip
                placement="top"
                :content="$t('packages_business_shared_cache_keys_tooltip')"
              >
                <el-icon class="ml-1 font-color-light align-middle"
                  ><InfoFilled
                /></el-icon>
              </el-tooltip>
            </template>
            <FieldSelector
              v-model="form.cacheKeys"
              class="form-field-selector"
              :options="fieldOptions"
              :placeholder="
                $t('packages_business_shared_cache_placeholder_keys')
              "
              @change="handleChangeCacheKeys"
            />
            <div v-if="showCachekeysCheckMsg" class="color-danger">
              {{ $t('packages_business_shared_cache_cache_key_message') }}
            </div>
          </ElFormItem>
        </el-col>
        <el-col :span="12">
          <ElFormItem
            prop="fields"
            :label="`${$t('packages_business_shared_cache_fields')}`"
          >
            <template #label>
              <span class="align-middle">{{
                $t('packages_business_shared_cache_fields')
              }}</span>
              <el-tooltip
                placement="top"
                :content="$t('packages_business_shared_cache_fields_tooltip')"
              >
                <el-icon class="ml-1 font-color-light align-middle"
                  ><InfoFilled
                /></el-icon>
              </el-tooltip>
            </template>
            <FieldSelector
              v-model="form.fields"
              class="form-field-selector"
              :options="fieldOptions"
              :placeholder="
                $t('packages_business_shared_cache_placeholder_fields')
              "
            />
          </ElFormItem>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <ElFormItem
            prop="externalStorageId"
            :label="$t('public_external_memory_configuration')"
          >
            <ElSelect
              v-model="form.externalStorageId"
              filterable
              :loading="!externalStorageOptions"
            >
              <ElOption
                v-for="opt in externalStorageOptions"
                :key="opt.value"
                :value="opt.value"
                :label="opt.label"
              />
            </ElSelect>
          </ElFormItem>
        </el-col>
        <el-col :span="12">
          <ElFormItem prop="maxMemory">
            <template #label>
              <span class="align-middle">{{
                $t('packages_business_shared_cache_max_memory')
              }}</span>
              <el-tooltip
                placement="top"
                :content="
                  $t('packages_business_shared_cache_max_memory_tooltip')
                "
              >
                <el-icon class="ml-1 font-color-light align-middle"
                  ><InfoFilled
                /></el-icon>
              </el-tooltip>
            </template>
            <ElInputNumber
              v-model="form.maxMemory"
              style="width: 200px"
              controls-position="right"
              :min="1"
              :max="999999999"
            />
            <span class="ml-1">M</span>
          </ElFormItem>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <ElFormItem prop="shareCdcEnable">
            <template #label>
              <span>
                <span class="align-middle">{{
                  $t('packages_dag_connection_form_shared_mining')
                }}</span>
                <el-tooltip
                  placement="top"
                  :content="
                    $t('packages_business_connection_form_shared_mining_tip')
                  "
                >
                  <el-icon class="ml-1 font-color-light align-middle"
                    ><InfoFilled
                  /></el-icon>
                </el-tooltip>
              </span>
            </template>
            <ElSwitch v-model="form.shareCdcEnable" />
          </ElFormItem>
        </el-col>
        <el-col :span="12">
          <ElFormItem v-if="form.shareCdcEnable" prop="enforceShareCdc">
            <template #label>
              <span>{{
                $t('packages_business_shared_cache_enforceShareCdc')
              }}</span>
            </template>
            <ElSelect v-model="form.enforceShareCdc">
              <ElOption
                :value="true"
                :label="
                  $t('packages_business_shared_cache_enforceShareCdc_true')
                "
              />
              <ElOption
                :value="false"
                :label="
                  $t('packages_dag_migration_settingpanel_zhuanweiputongC')
                "
              />
            </ElSelect>
          </ElFormItem>
        </el-col>
      </el-row>
      <ElFormItem>
        <template #label>
          <span class="align-middle">{{
            $t('packages_business_shared_cache_code')
          }}</span>
          <el-tooltip
            placement="top"
            :content="$t('packages_business_shared_cache_code_tooltip')"
          >
            <el-icon class="ml-1 font-color-light align-middle"
              ><InfoFilled
            /></el-icon>
          </el-tooltip>
        </template>
      </ElFormItem>
      <CodeView :data="form" class="w-100 rounded-lg" />
    </ElForm>
  </section>
</template>

<style lang="scss" scoped>
.el-input,
.el-select,
.form-input,
.fields-selector {
  width: 100%;
  max-width: 600px;
}
</style>
