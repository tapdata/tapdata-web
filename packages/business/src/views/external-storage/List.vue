<template>
  <section class="external-storage-wrapper">
    <TablePage ref="table" row-key="id" :remoteMethod="getData">
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <div slot="operation">
        <ElButton class="btn btn-create" type="primary" size="mini" @click="openDialog()">
          <span>{{ $t('packages_business_external_storage_list_chuangjianwaicun') }}</span>
        </ElButton>
      </div>
      <ElTableColumn show-overflow-tooltip min-width="180" :label="$t('public_external_memory_name')" prop="name">
        <template #default="{ row }">
          <ElLink style="display: inline" type="primary" @click.stop="checkDetails(row)">{{ row.name }}</ElLink>
        </template>
      </ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        min-width="150"
        :label="$t('public_external_memory_type')"
        prop="typeFmt"
      ></ElTableColumn>
<!--      <ElTableColumn show-overflow-tooltip min-width="150" :label="$t('public_status')" prop="typeFmt">-->
<!--        <template #default="{ row }">-->
<!--          <div>-->
<!--            <span :class="['status-connection-' + row.status, 'status-block']">-->
<!--              {{ getStatus(row.status) }}-->
<!--            </span>-->
<!--          </div>-->
<!--        </template>-->
<!--      </ElTableColumn>-->
      <ElTableColumn
        show-overflow-tooltip
        min-width="300"
        :label="$t('public_external_memory_info')"
        prop="uri"
      ></ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        min-width="120"
        :label="$t('public_create_time')"
        prop="createTimeFmt"
      ></ElTableColumn>
      <ElTableColumn width="320" :label="$t('public_operation')">
        <template #default="{ row }">
          <span class="mr-2">{{ $t('packages_business_external_storage_list_sheweimoren') }}</span>
          <ElSwitch
            type="text"
            v-model="row.defaultStorage"
            :disabled="row.defaultStorage"
            @change="handleDefault(row)"
          ></ElSwitch>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton :disabled="row.type !== 'mongodb'" type="text" @click="handleTest(row)"
            >{{ $t('public_connection_button_test') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton type="text" :disabled="!row.canEdit" @click="handleEdit(row)">{{
            $t('public_button_edit')
          }}</ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton type="text" :disabled="!row.canDelete" @click="remove(row)">{{
            $t('public_button_delete')
          }}</ElButton>
        </template>
      </ElTableColumn>
    </TablePage>
    <ElDialog
      append-to-body
      :visible.sync="dialogVisible"
      :title="
        form.id
          ? $t('packages_business_external_storage_list_bianjiwaicun')
          : $t('packages_business_external_storage_list_chuangjianwaicun')
      "
    >
      <ElForm
        class=""
        ref="form"
        label-position="left"
        :label-width="labelWidth"
        size="mini"
        :model="form"
        :rules="rules"
      >
        <ElFormItem :label="$t('public_external_memory_name')" prop="name">
          <ElInput v-model="form.name"></ElInput>
        </ElFormItem>
        <ElFormItem required :label="$t('public_external_memory_type')">
          <ElSelect v-model="form.type" :disabled="!!form.id">
            <ElOption label="MongoDB" value="mongodb"></ElOption>
            <ElOption label="RocksDB" value="rocksdb"></ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem
          v-if="form.type !== 'memory'"
          :label="$t('packages_business_external_storage_list_cunchulujing')"
          prop="uri"
        >
          <ElInput
            v-model.trim="form.uri"
            :placeholder="
              form.type === 'mongodb'
                ? 'Example: mongodb://admin:password@127.0.0.1:27017/mydb?replicaSet=xxx&authSource=admin'
                : 'Example: /xxx/xxx'
            "
            type="textarea"
            resize="none"
          ></ElInput>
        </ElFormItem>

        <SchemaToForm
          v-if="form.type === 'mongodb'"
          ref="schemaToForm"
          :schema="schemaData"
          :colon="true"
          :label-width="schemaLabelWidth"
        ></SchemaToForm>

        <ElFormItem :label="$t('packages_business_external_storage_list_sheweimoren')">
          <ElSwitch v-model="form.defaultStorage"></ElSwitch>
        </ElFormItem>
      </ElForm>
      <span slot="footer" class="dialog-footer">
        <ElButton :disabled="form.type !== 'mongodb'" @click="handleEditorTest()"
          >{{ $t('public_connection_button_test') }}
        </ElButton>
        <ElButton size="mini" @click="dialogVisible = false">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton type="primary" size="mini" @click="submit">{{ $t('public_button_confirm') }}</ElButton>
      </span>
    </ElDialog>
    <Drawer class="shared-cache-details" :visible.sync="isShowDetails">
      <div v-if="details.id" class="shared-cache-details--header flex pb-3">
        <div class="img-box">
          <VIcon class="icon">text</VIcon>
        </div>
        <div class="flex-fill ml-4 overflow-hidden">
          <div class="fs-6 ellipsis">{{ details.name }}</div>
        </div>
      </div>
      <ul class="mt-2">
        <li v-for="item in info" :key="item.label" class="drawer-info__item">
          <VIcon class="fs-7 mt-2">{{ item.icon }}</VIcon>
          <div class="body ml-4">
            <label class="label">{{ item.label }}</label>
            <p class="value mt-2">{{ item.value || '-' }}</p>
          </div>
        </li>
      </ul>
    </Drawer>
    <el-dialog :visible.sync="showUsingTaskDialog" :title="$t('public_message_title_prompt')">
      <div>{{ $t('packages_business_external_storage_list_tishi', { val1: usingTasks.length }) }}</div>
      <el-table class="mt-4" height="250px" :data="usingTasks">
        <el-table-column min-width="240" :label="$t('public_task_name')" :show-overflow-tooltip="true">
          <template #default="{ row }">
            <span class="dataflow-name link-primary flex">
              <ElLink
                role="ellipsis"
                type="primary"
                class="justify-content-start ellipsis block"
                :class="['name']"
                @click.stop="handleClickName(row)"
                >{{ row.name }}</ElLink
              >
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <Test
      ref="test"
      :visible.sync="dialogTestVisible"
      :formData="model"
      test-type="testExternalStorage"
      @returnTestData="returnTestData"
    ></Test>
  </section>
</template>
<script>
import i18n from '@/i18n'

import dayjs from 'dayjs'
import { cloneDeep, escapeRegExp } from 'lodash'

import { databaseTypesApi, externalStorageApi } from '@tap/api'
import { TablePage, EXTERNAL_STORAGE_TYPE_MAP } from '@tap/business'
import { CONNECTION_STATUS_MAP } from '@tap/business/src/shared'
import { FilterBar, Drawer } from '@tap/component'
import { openUrl } from '@tap/shared'
import { SchemaToForm } from '@tap/form'
import Test from '@tap/business/src/views/connections/Test'

export default {
  components: { TablePage, FilterBar, Drawer, SchemaToForm, Test },
  inject: ['checkAgent'],
  data() {
    return {
      loading: false,
      filterItems: [],
      order: 'createAt DESC',
      searchParams: {
        type: '',
        keyword: ''
      },
      dialogVisible: false,
      dialogForm: {},
      form: {},
      rules: {
        name: [
          {
            required: true,
            message: i18n.t('packages_business_external_storage_list_qingshuruwaicun'),
            trigger: 'blur'
          }
        ],
        uri: [
          {
            required: true,
            message: i18n.t('packages_business_external_storage_list_qingshurucunchu'),
            trigger: 'blur'
          }
        ]
      },
      isShowDetails: false,
      details: '',
      info: [],
      labelWidth: '120px',
      schemaLabelWidth: 120,
      showUsingTaskDialog: false,
      usingTasks: [],
      schemaData: null,
      dialogTestVisible: false,
      model: {}
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  watch: {
    '$route.query'() {
      this.table.fetch(1)
    }
  },
  created() {
    this.searchParams = Object.assign(this.searchParams, this.$route.query)
    this.getFilterItems()
    const { locale } = this.$i18n
    this.labelWidth = locale === 'en' ? '220px' : '120px'
    this.schemaLabelWidth = locale === 'en' ? 220 : 120
    this.schemaData = {
      type: 'object',
      properties: {
        ssl: {
          default: false,
          'x-decorator': 'FormItem',
          'x-component': 'Switch',
          'x-reactions': [
            {
              fulfill: {
                state: {
                  visible: '{{$self.value===true}}'
                }
              },
              target: '*(sslKey,sslPass,sslValidate)'
            }
          ],
          'x-component-props': {
            optionType: 'button'
          },
          type: 'boolean',
          title: i18n.t('packages_business_external_storage_list_shiyongTls'),
          'x-index': 80
        },
        sslCA: {
          'x-decorator': 'FormItem',
          'x-component': 'TextFileReader',
          type: 'string',
          title: i18n.t('packages_business_external_storage_list_zhengshubanfaji'),
          'x-index': 120,
          fileNameField: 'sslCAFile',
          required: true
        },
        sslKey: {
          'x-decorator': 'FormItem',
          'x-component': 'TextFileReader',
          type: 'string',
          title: i18n.t('packages_business_external_storage_list_kehuduansiyao'),
          'x-index': 90,
          fileNameField: 'sslKeyFile',
          required: true
        },
        sslPass: {
          'x-decorator': 'FormItem',
          'x-component': 'Password',
          type: 'string',
          title: i18n.t('packages_business_external_storage_list_siyaomima'),
          'x-index': 100
        },
        sslValidate: {
          'x-decorator': 'FormItem',
          'x-component': 'Switch',
          show: false,
          'x-reactions': [
            {
              fulfill: {
                state: {
                  visible: '{{$self.value===true}}'
                }
              },
              target: 'sslCA'
            }
          ],
          type: 'boolean',
          title: i18n.t('packages_business_external_storage_list_yanzhengfuwuduan'),
          'x-index': 110
        }
      }
    }
  },
  methods: {
    getFilterItems() {
      let typeOptions = [{ label: i18n.t('public_select_option_all'), value: '' }]
      for (const key in EXTERNAL_STORAGE_TYPE_MAP) {
        const label = EXTERNAL_STORAGE_TYPE_MAP[key]
        typeOptions.push({
          label,
          value: key
        })
      }
      this.filterItems = [
        {
          label: this.$t('public_connection_form_database_type'),
          key: 'type', //对象分类
          type: 'select-inner',
          items: typeOptions
        },
        {
          placeholder: i18n.t('public_input_placeholder_name'),
          key: 'keyword', //输入搜索名称
          type: 'input'
        }
      ]
    },
    getData({ page }) {
      let { current, size } = page
      let { type, keyword } = this.searchParams
      let where = {}

      if (keyword && keyword.trim()) {
        where.name = { like: escapeRegExp(keyword), options: 'i' }
      }
      type && (where.type = type)

      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return externalStorageApi
        .list({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let list = (data?.items || []).map(item => {
            item.typeFmt = EXTERNAL_STORAGE_TYPE_MAP[item.type] || '-'
            item.createTimeFmt = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') || '-'
            // item.status = item.status || 'ready'
            return item
          })
          return {
            total: data?.total,
            data: list
          }
        })
    },
    openDialog(row) {
      this.dialogVisible = true
      this.dialogForm = row || {}
      this.form = row
        ? cloneDeep(row)
        : {
            name: '',
            type: 'mongodb',
            uri: '',
            defaultStorage: false
          }
      this.$nextTick(() => {
        this.$refs?.form?.clearValidate()
      })
    },
    submit() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          const schemaFormInstance = this.$refs.schemaToForm.getForm?.()
          schemaFormInstance?.validate().then(async () => {
            let formValues = this.$refs.schemaToForm?.getFormValues?.()

            this.loading = true
            let { id, name, type, uri, defaultStorage } = this.form
            let params = Object.assign(
              {
                id,
                name,
                type,
                uri,
                defaultStorage
              },
              formValues
            )
            const catchFunc = () => {
              this.loading = false
            }
            if (id) {
              await externalStorageApi
                .updateById(id, params)
                .then(() => {
                  this.table.fetch()
                  this.dialogVisible = false
                  this.loading = false
                })
                .catch(catchFunc)
            } else {
              await externalStorageApi
                .post(params)
                .then(() => {
                  this.table.fetch()
                  this.dialogVisible = false
                  this.loading = false
                })
                .catch(catchFunc)
            }
          })
        }
      })
    },
    handleDefault(row) {
      externalStorageApi.changeExternalStorage(row.id).then(() => {
        this.$message.success(i18n.t('public_message_operation_success'))
        this.table.fetch()
      })
    },
    async remove(row) {
      //先去请求是否外存已被使用了
      this.usingTasks = (await externalStorageApi.usingTask(row.id)) || []
      const flag = await this.$confirm(i18n.t('packages_business_external_storage_list_querenshanchuwai'), '', {
        type: 'warning',
        showClose: false
      })
      if (flag) {
        if (this.usingTasks?.length) {
          this.showUsingTaskDialog = true
        } else {
          await externalStorageApi.delete(row.id)
          this.table.fetch()
        }
      }
    },
    checkDetails(row) {
      this.details = row
      this.info = [
        {
          label: this.$t('public_external_memory_type'),
          value: row.typeFmt,
          icon: 'name'
        },
        { label: this.$t('public_create_time'), value: row.createTimeFmt, icon: 'cacheTimeAtFmt' },
        { label: this.$t('packages_business_external_storage_list_cunchulujing'), value: row.uri, icon: 'database' },
        {
          label: this.$t('packages_business_external_storage_list_sheweimoren'),
          value: row.defaultStorage,
          icon: 'record'
        }
      ]
      this.isShowDetails = true
    },
    /**
     * 点击名称调整
     * @param row
     */
    handleClickName(item) {
      let { syncType, shareCache } = item
      if (shareCache) {
        syncType = 'mem_cache'
      }
      const MAP = {
        migrate: 'migrateList',
        sync: 'dataflowList',
        logCollector: 'sharedMiningList',
        mem_cache: 'sharedCacheList',
        connHeartbeat: 'HeartbeatTableList'
      }
      const routeUrl = this.$router.resolve({
        name: MAP[syncType],
        query: {
          keyword: item.name
        }
      })
      openUrl(routeUrl.href)
    },

    // 编辑
    handleEdit(row = {}) {
      this.openDialog(row)
    },

    handleTest(row = {}) {
      this.startTest({ id: row.id })
    },

    handleEditorTest() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          const schemaFormInstance = this.$refs.schemaToForm.getForm?.()
          schemaFormInstance?.validate().then(async () => {
            let formValues = this.$refs.schemaToForm?.getFormValues?.()

            this.loading = true
            let { id, name, type, uri, defaultStorage } = this.form
            let params = Object.assign(
              {
                id,
                name,
                type,
                uri,
                defaultStorage
              },
              formValues
            )
            let result = { id }
            for (let key in params) {
              if (params[key] !== this.dialogForm[key]) {
                result[key] = params[key]
              }
            }

            this.startTest(result)
          })
        }
      })
    },

    startTest(data = {}) {
      this.checkAgent(() => {
        Object.assign(this.model, data)
        this.dialogTestVisible = true
        this.$refs.test.start(false)
      }).catch(() => {
        this.buried('connectionTestAgentFail')
      })
    },

    returnTestData(data) {},

    getStatus(status) {
      return CONNECTION_STATUS_MAP[status || 'ready']?.text || ''
    }
  }
}
</script>
<style lang="scss" scoped>
.external-storage-wrapper {
  height: 100%;
  overflow: hidden;
}
.shared-cache-list-wrap {
  overflow: hidden;
}
.icon-status {
  display: block;
  width: 60px;
  height: 25px;
  line-height: 25px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  box-sizing: border-box;
  overflow: hidden;
  text-align: center;
  &.icon-status--success {
    color: #178061;
    background: #c4f3cb;
  }
  &.icon-status--warning {
    color: #d5760e;
    background: #ffe9cf;
  }
  &.icon-status--danger {
    color: map-get($color, danger);
    background: #ffecec;
  }
}
.shared-cache-details {
  padding: 16px;
}
.shared-cache-details--header {
  border-bottom: 1px solid map-get($borderColor, light);
  .icon {
    font-size: 18px;
  }
}
.drawer-info__item {
  display: flex;
  .body {
    flex: 1;
    padding: 8px 0;
    line-height: 17px;
    border-bottom: 1px solid map-get($borderColor, light);
    .label {
      font-size: $fontBaseTitle;
      color: rgba(0, 0, 0, 0.6);
    }
    .value {
      font-size: $fontBaseTitle;
      color: map-get($fontColor, dark);
    }
  }
}
.scheme-to-form {
  ::v-deep {
    .formily-element-form-item {
      margin-bottom: 18px;
    }
  }
}
</style>
