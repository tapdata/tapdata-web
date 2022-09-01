<template>
  <section class="shared-cache-form" v-loading="loading">
    <div class="section-wrap-box flex">
      <div class="title mb-6">
        {{ $t($route.params.id ? 'page_title_shared_cache_edit' : 'page_title_shared_cache_create') }}
      </div>
      <ElForm
        ref="form"
        class="flex-fill overflow-auto pb-4"
        label-width="120px"
        label-position="left"
        :model="form"
        :rules="rules"
      >
        <ElFormItem prop="name" :label="$t('shared_cache_name') + ':'">
          <ElInput v-model="form.name" class="form-input" :placeholder="$t('shared_cache_placeholder_name')"></ElInput>
        </ElFormItem>
        <ElFormItem prop="connectionId" :label="$t('column_connection') + ':'">
          <VirtualSelect
            v-model="form.connectionId"
            filterable
            class="form-input"
            :item-size="34"
            :items="connectionOptions"
            :loading="!connectionOptions.length"
            :placeholder="$t('shared_cache_placeholder_connection')"
            @input="connectionInputHandler"
          />
        </ElFormItem>
        <ElFormItem prop="tableName" :label="$t('column_table') + ':'">
          <VirtualSelect
            v-model="form.tableName"
            filterable
            class="form-input"
            :item-size="34"
            :items="tableOptions"
            :loading="tableOptionsLoading"
            :placeholder="$t('shared_cache_placeholder_table')"
            @input="tableInputHandler"
          />
        </ElFormItem>
        <ElFormItem prop="cacheKeys" :label="$t('shared_cache_keys') + ':'">
          <template slot="label">
            <span>{{ $t('shared_cache_keys') }}</span>
            <el-tooltip placement="top" :content="$t('shared_cache_keys_tooltip')">
              <i class="el-icon-info color-primary ml-1"></i>
            </el-tooltip>
            <span>:</span>
          </template>
          <FieldSelector
            v-model="form.cacheKeys"
            class="form-field-selector"
            :options="fieldOptions"
            :placeholder="$t('shared_cache_placeholder_keys')"
          ></FieldSelector>
        </ElFormItem>
        <ElFormItem prop="fields" :label="$t('shared_cache_fields') + ':'">
          <template slot="label">
            <span>{{ $t('shared_cache_fields') }}</span>
            <el-tooltip placement="top" :content="$t('shared_cache_fields_tooltip')">
              <i class="el-icon-info color-primary ml-1"></i>
            </el-tooltip>
            <span>:</span>
          </template>
          <FieldSelector
            v-model="form.fields"
            class="form-field-selector"
            :options="fieldOptions"
            :placeholder="$t('shared_cache_placeholder_fields')"
          ></FieldSelector>
        </ElFormItem>
        <ElFormItem prop="maxMemory" :placeholder="$t('shared_cache_placeholder_max_memory')">
          <template slot="label">
            <span>{{ $t('shared_cache_max_memory') }}</span>
            <el-tooltip placement="top" :content="$t('shared_cache_max_memory_tooltip')">
              <i class="el-icon-info color-primary ml-1"></i>
            </el-tooltip>
            <span>:</span>
          </template>
          <ElInputNumber
            v-model="form.maxMemory"
            style="width: 200px"
            :min="1"
            :max="999999999"
            controls-position="right"
          ></ElInputNumber>
          <span class="ml-1">M</span>
        </ElFormItem>
        <ElFormItem>
          <template slot="label">
            <span>{{ $t('shared_cache_code') }}</span>
            <el-tooltip placement="top" :content="$t('shared_cache_code_tooltip')">
              <i class="el-icon-info color-primary ml-1"></i>
            </el-tooltip>
            <span>:</span>
          </template>
        </ElFormItem>
        <CodeView :data="form"></CodeView>
      </ElForm>
      <div class="pt-6">
        <ElButton @click="$router.back()">{{ $t('button_back') }}</ElButton>
        <ElButton type="primary" @click="submit">{{ $t('button_save') }}</ElButton>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.shared-cache-form .title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  line-height: 22px;
}
.form-input {
  width: 504px;
}
.form-field-selector {
  width: 905px;
  max-width: 100%;
}
</style>
<script>
import { VirtualSelect } from '@tap/component'
import FieldSelector from './FieldSelector'
import CodeView from './CodeView.vue'
import { sharedCacheApi, metadataInstancesApi, connectionsApi } from '@tap/api'

export default {
  components: { VirtualSelect, FieldSelector, CodeView },
  data() {
    return {
      loading: false,
      form: {
        name: '',
        connectionId: '',
        tableName: '',
        cacheKeys: '',
        fields: '',
        maxMemory: 500
      },
      connectionOptions: [],
      tableOptions: [],
      fieldOptions: [],
      tableOptionsLoading: false,
      fieldOptionsLoading: false,
      rules: {
        name: [{ required: true, trigger: 'blur', message: this.$t('shared_cache_placeholder_name') }],
        connectionId: [{ required: true, trigger: 'blur', message: this.$t('shared_cache_placeholder_connection') }],
        tableName: [{ required: true, trigger: 'blur', message: this.$t('shared_cache_placeholder_table') }],
        cacheKeys: [{ required: true, trigger: 'blur', message: this.$t('shared_cache_placeholder_keys') }],
        fields: [{ required: true, trigger: 'blur', message: this.$t('shared_cache_placeholder_fields') }],
        maxMemory: [{ required: true, trigger: 'blur', message: this.$t('shared_cache_placeholder_max_memory') }]
      }
    }
  },
  created() {
    this.getConnectionOptions()
    let id = this.$route.params.id
    if (id) {
      this.getData(id)
    }
  },
  methods: {
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
            maxMemory: data.maxMemory
          }
          this.getTableOptions(data.connectionId)
          this.getTableSchema(data.tableName)
        })
        .finally(() => {
          this.loading = false
        })
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
            this.$message.error(this.$t('shared_cache_messge_no_table'))
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
          let { name, connectionId, tableName, cacheKeys, fields, maxMemory } = this.form
          let id = this.$route.params.id
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
                  maxMemory: maxMemory
                }
              ],
              edges: []
            }
          }
          let method = id ? 'patch' : 'post'
          this.loading = true
          sharedCacheApi[method](params)
            .then(() => {
              this.$message.success(this.$t('message_save_ok'))
              this.$router.replace({
                name: 'sharedCacheList'
              })
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>
