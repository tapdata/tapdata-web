<template>
  <section class="shared-cache-form section-wrap" v-loading="loading">
    <div class="section-wrap-box flex">
      <ElForm
        ref="form"
        class="flex-fill overflow-auto"
        label-width="100px"
        label-position="left"
        :model="form"
        :rules="rules"
      >
        <ElFormItem prop="name" :label="$t('shared_cache_name') + ':'">
          <ElInput v-model="form.name" style="width: 504px"></ElInput>
        </ElFormItem>
        <ElFormItem prop="connectionId" :label="$t('column_connection') + ':'">
          <VirtualSelect
            v-model="form.connectionId"
            filterable
            :item-size="50"
            :items="connectionOptions"
            :loading="!connectionOptions.length"
            @input="getTableOptions"
          />
        </ElFormItem>
        <ElFormItem prop="tableName" :label="$t('column_table') + ':'">
          <VirtualSelect
            v-model="form.tableName"
            filterable
            :item-size="50"
            :items="tableOptions"
            :loading="tableOptionsLoading"
            @input="getTableSchema"
          />
        </ElFormItem>
        <ElFormItem prop="cacheKeys" :label="$t('shared_cache_keys') + ':'">
          <MultiSelection v-model="form.cacheKeys" :options="fieldOptions"></MultiSelection>
        </ElFormItem>
        <ElFormItem prop="fields" :label="$t('shared_cache_fields') + ':'">
          <MultiSelection v-model="form.fields" :options="fieldOptions"></MultiSelection>
        </ElFormItem>
        <ElFormItem prop="maxRows" :label="$t('shared_cache_max_rows') + ':'">
          <div class="flex">
            <ElSelect v-model="form.maxRows">
              <ElOption :label="$t('shared_cache_custom_max_record')" :value="10000"></ElOption>
              <ElOption :label="$t('shared_cache_custom_no_limit')" :value="0"></ElOption>
            </ElSelect>
            <template v-if="form.maxRows > 0">
              <ElInput v-model.number="form.maxRows" class="ml-3" style="width: 100px"> </ElInput>
              <span class="ml-1">{{ $t('shared_cache_custom_record_unit') }}</span>
            </template>
          </div>
        </ElFormItem>
        <ElFormItem prop="ttl" :label="$t('shared_cache_ttl') + ':'">
          <ElInput v-model="form.ttl" style="width: 100px"></ElInput>
          <span class="ml-1">{{ $t('shared_cache_ttl_unit') }}</span>
        </ElFormItem>
        <ElFormItem :label="$t('shared_cache_code') + ':'">
          <template>
            <div class="overflow-hidden">
              <div class="code">
                <span class="color-primary">var</span> cachedRow = CacheService.getCache(
                <span class="color-danger">'{{ form.name || 'cachename' }}'</span>
                <template v-if="!form.cacheKeys || !form.cacheKeys.length">
                  ,<span class="bold">record</span>.<span class="color-danger">category_code</span>
                </template>
                <span v-for="key in form.cacheKeys.split(',')" :key="key">
                  <template v-if="key">
                    , <span class="bold">record</span>.<span class="color-danger">{{ key }}</span>
                  </template>
                </span>
                );<br />
                <span class="bold">record</span>.category_name = cachedRow.category_name;<br />
              </div>
              <span>OR</span>
              <div class="code">
                <span class="bold">record</span>.category_name = CacheService.getCacheItem(
                <span class="color-danger">'{{ form.name || 'cachename' }}'</span>, <span>'category_name'</span>,
                defaultValue
                <span v-for="key in form.cacheKeys.split(',')" :key="key">
                  <template v-if="key">
                    ,<span class="bold">record</span>.<span class="color-danger">{{ key }}</span>
                  </template>
                </span>
                );
              </div>
            </div>
          </template>
        </ElFormItem>
      </ElForm>
      <div class="pt-6">
        <ElButton @click="$router.back()">{{ $t('button_cancel') }}</ElButton>
        <ElButton type="primary" @click="submit">{{ $t('button_save') }}</ElButton>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.code {
  padding: 5px 15px;
  max-width: 886px;
  background: #fff;
  overflow-x: auto;
  white-space: nowrap;
  background: rgba(239, 241, 244, 0.2);
  .color-primary {
    color: #409eff;
  }
  .color-danger {
    color: #ee5353;
  }
  .bold {
    font-weight: bold;
  }
}
</style>
<script>
// import CodeEditor from '@/components/CodeEditor'
import VirtualSelect from 'web-core/components/virtual-select'
import MultiSelection from '@/components/MultiSelection'
export default {
  components: { VirtualSelect, MultiSelection },
  data() {
    return {
      loading: false,
      form: {
        name: '',
        connectionId: '',
        tableName: '',
        cacheKeys: '',
        fields: '',
        maxRows: 10000,
        ttl: 7
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
        maxRows: [{ required: true, trigger: 'blur', message: this.$t('shared_cache_placeholder_max_rows') }],
        ttl: [{ required: true, trigger: 'blur', message: this.$t('shared_cache_placeholder_ttl') }]
      }
    }
  },
  computed: {
    script() {
      let cacheKeys = this.form.cacheKeys || ''
      return `  var cacheRow = CacheService.getCache(${this.form.name || 'cachename'}, ${
        cacheKeys.length ? 'record.' + cacheKeys.split(',').join(', record.') : 'record.category_code'
      })\n  record.category_name = cachedRow.category_name`
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
      this.$api('shareCache')
        .findOne(id)
        .then(res => {
          let data = res?.data || {}
          this.form = {
            name: data.name,
            connectionId: data.connectionId,
            tableName: data.tableName,
            cacheKeys: data.cacheKeys,
            fields: data.fields?.join(',') || '',
            maxRows: data.maxRows,
            ttl: data.ttl
          }
          this.getTableOptions(data.connectionId)
          this.getTableSchema(data.tableName)
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
          database_type: 'mongodb'
        }
      }
      this.$api('connections')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let options = res?.data?.items || []
          this.connectionOptions = options.map(opt => ({ label: opt.name, value: opt.id }))
        })
    },
    getTableOptions(id) {
      this.tableOptionsLoading = true
      this.$api('MetadataInstances')
        .getTables(id)
        .then(res => {
          let options = res?.data || []
          this.tableOptions = options.map(opt => ({ label: opt, value: opt }))
        })
        .finally(() => {
          this.tableOptionsLoading = false
        })
    },
    getTableSchema(name) {
      let params = {
        filter: JSON.stringify({
          where: {
            'source.id': this.form.connectionId,
            original_name: name,
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
      this.$api('MetadataInstances')
        .get(params)
        .then(res => {
          let table = res?.data?.items?.[0]
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
    submit() {
      this.$refs.form.validate(flag => {
        if (flag) {
          let { name, connectionId, tableName, cacheKeys, fields, maxRows, ttl } = this.form
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
                  ttl: ttl,
                  cacheKeys: cacheKeys,
                  maxRows: maxRows
                }
              ],
              edges: []
            }
          }
          let method = id ? 'patch' : 'post'
          this.loading = true
          this.$api('shareCache')
            [method](params)
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
