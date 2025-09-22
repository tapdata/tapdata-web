<script>
import { externalStorageApi } from '@tap/api'

import Drawer from '@tap/component/src/Drawer.vue'
import { FilterBar } from '@tap/component/src/filter-bar'
import SchemaToForm from '@tap/form/src/SchemaToForm.vue'

import { openUrl } from '@tap/shared'
import dayjs from 'dayjs'
import { cloneDeep, escapeRegExp } from 'lodash-es'
import i18n from '@/i18n'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import { CONNECTION_STATUS_MAP, EXTERNAL_STORAGE_TYPE_MAP } from '../../shared'
import Test from '../connections/Test.vue'

let timeout = null

export default {
  components: {
    PageContainer,
    TablePage,
    FilterBar,
    Drawer,
    SchemaToForm,
    Test,
  },
  inject: ['checkAgent', 'buried'],
  data() {
    return {
      loading: false,
      filterItems: [],
      order: 'createAt DESC',
      searchParams: {
        type: '',
        keyword: '',
      },
      dialogVisible: false,
      dialogForm: {},
      form: {},
      rules: {
        name: [
          {
            required: true,
            message: i18n.t(
              'packages_business_external_storage_list_qingshuruwaicun',
            ),
            trigger: 'blur',
          },
        ],
        uri: [
          {
            required: true,
            message: i18n.t(
              'packages_business_external_storage_list_qingshurucunchu',
            ),
            trigger: 'blur',
          },
        ],
      },
      isShowDetails: false,
      details: '',
      info: [],
      labelWidth: '120px',
      schemaLabelWidth: 120,
      showUsingTaskDialog: false,
      usingTasks: [],
      schemaData: null,
      model: {},
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
  },
  watch: {
    '$route.query': function () {
      this.table.fetch(1)
    },
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
                  visible: '{{$self.value===true}}',
                },
              },
              target: '*(sslKey,sslPass,sslValidate)',
            },
          ],
          'x-component-props': {
            optionType: 'button',
          },
          type: 'boolean',
          title: i18n.t('packages_business_external_storage_list_shiyongTls'),
          'x-index': 80,
        },
        sslCA: {
          'x-decorator': 'FormItem',
          'x-component': 'TextFileReader',
          'x-component-props': {
            fileNameField: 'attrs.sslCAFile',
          },
          type: 'string',
          title: i18n.t(
            'packages_business_external_storage_list_zhengshubanfaji',
          ),
          'x-index': 120,
          required: true,
        },
        sslKey: {
          'x-decorator': 'FormItem',
          'x-component': 'TextFileReader',
          'x-component-props': {
            fileNameField: 'attrs.sslKeyFile',
          },
          type: 'string',
          title: i18n.t(
            'packages_business_external_storage_list_kehuduansiyao',
          ),
          'x-index': 90,
          required: true,
        },
        sslPass: {
          'x-decorator': 'FormItem',
          'x-component': 'Password',
          type: 'string',
          title: i18n.t('packages_business_external_storage_list_siyaomima'),
          'x-index': 100,
        },
        sslValidate: {
          'x-decorator': 'FormItem',
          'x-component': 'Switch',
          show: false,
          'x-reactions': [
            {
              fulfill: {
                state: {
                  visible: '{{$self.value===true}}',
                },
              },
              target: 'sslCA',
            },
          ],
          type: 'boolean',
          title: i18n.t(
            'packages_business_external_storage_list_yanzhengfuwuduan',
          ),
          'x-index': 110,
        },
      },
    }

    //定时轮询
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 10000)
  },
  unmounted() {
    clearInterval(timeout)
  },
  methods: {
    getFilterItems() {
      const typeOptions = [
        { label: i18n.t('public_select_option_all'), value: '' },
      ]
      for (const key in EXTERNAL_STORAGE_TYPE_MAP) {
        const label = EXTERNAL_STORAGE_TYPE_MAP[key]
        typeOptions.push({
          label,
          value: key,
        })
      }
      this.filterItems = [
        {
          label: this.$t('public_connection_form_database_type'),
          key: 'type', //对象分类
          type: 'select-inner',
          items: typeOptions,
        },
        {
          placeholder: i18n.t('public_input_placeholder_name'),
          key: 'keyword', //输入搜索名称
          type: 'input',
        },
      ]
    },
    getData({ page }) {
      const { current, size } = page
      const { type, keyword } = this.searchParams
      const where = {}

      if (keyword && keyword.trim()) {
        where.name = { like: escapeRegExp(keyword), options: 'i' }
      }
      type && (where.type = type)

      const filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where,
      }
      return externalStorageApi
        .list({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          const list = (data?.items || []).map((item) => {
            item.typeFmt = EXTERNAL_STORAGE_TYPE_MAP[item.type] || '-'
            item.createTimeFmt =
              dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') || '-'
            item.status = item.status || 'ready'
            return item
          })
          return {
            total: data?.total,
            data: list,
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
            defaultStorage: false,
          }
      this.$nextTick(() => {
        this.$refs?.form?.clearValidate()

        if (this.form.type === 'mongodb') {
          this.$refs.schemaToForm?.getForm().setValues(this.form, 'overwrite')
        }
      })
    },
    submit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const main = async () => {
            const formValues = this.$refs.schemaToForm?.getFormValues?.() || {}

            this.loading = true
            const { id, name, type, uri, defaultStorage } = this.form
            const params = Object.assign(formValues, {
              id,
              name,
              type,
              uri,
              defaultStorage,
            })
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
          }
          if (this.$refs.schemaToForm) {
            const schemaFormInstance = this.$refs.schemaToForm?.getForm?.()
            schemaFormInstance?.validate().then(() => {
              main()
            })
          } else {
            main()
          }
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
      const flag = await this.$confirm(
        i18n.t('packages_business_external_storage_list_querenshanchuwai'),
      )
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
          icon: 'name',
        },
        {
          label: this.$t('public_create_time'),
          value: row.createTimeFmt,
          icon: 'cacheTimeAtFmt',
        },
        {
          label: this.$t(
            'packages_business_external_storage_list_cunchulujing',
          ),
          value: row.uri,
          icon: 'database',
        },
        {
          label: this.$t('packages_business_external_storage_list_sheweimoren'),
          value: row.defaultStorage,
          icon: 'record',
        },
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
        connHeartbeat: 'HeartbeatTableList',
      }
      const routeUrl = this.$router.resolve({
        name: MAP[syncType],
        query: {
          keyword: item.name,
        },
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
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          let formValues
          if (this.$refs.schemaToForm) {
            const schemaFormInstance = this.$refs.schemaToForm.getForm?.()
            const feedback = await schemaFormInstance
              ?.validate()
              .catch((error) => error)

            if (feedback) return

            formValues = this.$refs.schemaToForm?.getFormValues?.()
          }

          this.loading = true
          const { id, name, type, uri, defaultStorage } = this.form
          const params = {
            ...formValues,
            id,
            name,
            type,
            uri,
            defaultStorage,
          }
          this.startTest(params)
        }
      })
    },

    startTest(data = {}) {
      const loading = this.$loading()
      this.model = data
      this.checkAgent(() => {
        this.$refs.test.start(false)
      })
        .catch(() => {
          this.buried('externalStorage_connectionTestAgentFail')
        })
        .finally(() => {
          loading.close()
        })
    },

    returnTestData(data) {
      if (!data.status || data.status === null) return
      const status = data.status
      if (status === 'ready') {
        this.$message.success(
          this.$t('public_connection_button_test') +
            this.$t('public_status_ready'),
          false,
        )
      } else {
        this.$message.error(
          this.$t('public_connection_button_test') +
            this.$t('public_status_invalid'),
          false,
        )
      }
      this.buried('externalStorage_connectionTest', '', {
        result: status === 'ready',
      })
      this.table.fetch()
    },

    getStatus(status) {
      return CONNECTION_STATUS_MAP[status]?.text || ''
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <ElButton class="btn btn-create" type="primary" @click="openDialog()">
        <span>{{
          $t('packages_business_external_storage_list_chuangjianwaicun')
        }}</span>
      </ElButton>
    </template>

    <TablePage ref="table" row-key="id" :remote-method="getData">
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="table.fetch(1)"
        />
      </template>

      <ElTableColumn
        show-overflow-tooltip
        min-width="180"
        :label="$t('public_external_memory_name')"
        prop="name"
      >
        <template #default="{ row }">
          <ElLink
            style="display: inline"
            type="primary"
            @click.stop="checkDetails(row)"
            >{{ row.name }}</ElLink
          >
        </template>
      </ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        min-width="150"
        :label="$t('public_external_memory_type')"
        prop="typeFmt"
      />
      <ElTableColumn
        show-overflow-tooltip
        min-width="150"
        :label="$t('public_status')"
        prop="typeFmt"
      >
        <template #default="{ row }">
          <div>
            <span :class="[`status-connection-${row.status}`, 'status-block']">
              {{ getStatus(row.status) }}
            </span>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        min-width="300"
        :label="$t('public_external_memory_info')"
        prop="uri"
      />
      <ElTableColumn
        show-overflow-tooltip
        min-width="120"
        :label="$t('public_create_time')"
        prop="createTimeFmt"
      />
      <ElTableColumn width="320" :label="$t('public_operation')">
        <template #default="{ row }">
          <span class="mr-2">{{
            $t('packages_business_external_storage_list_sheweimoren')
          }}</span>
          <ElSwitch
            v-model="row.defaultStorage"
            text
            :disabled="row.defaultStorage"
            @change="handleDefault(row)"
          />
          <ElDivider class="ml-2 mr-1" direction="vertical" />
          <ElButton
            :disabled="row.type === 'memory'"
            text
            type="primary"
            @click="handleTest(row)"
            >{{ $t('public_connection_button_test') }}
          </ElButton>
          <ElDivider class="mx-1" direction="vertical" />
          <ElButton
            text
            type="primary"
            :disabled="!row.canEdit"
            @click="handleEdit(row)"
            >{{ $t('public_button_edit') }}</ElButton
          >
          <ElDivider class="mx-1" direction="vertical" />
          <ElButton
            text
            type="primary"
            :disabled="!row.canDelete"
            @click="remove(row)"
            >{{ $t('public_button_delete') }}</ElButton
          >
        </template>
      </ElTableColumn>
    </TablePage>
    <ElDialog
      v-model="dialogVisible"
      append-to-body
      :title="
        form.id
          ? $t('packages_business_external_storage_list_bianjiwaicun')
          : $t('packages_business_external_storage_list_chuangjianwaicun')
      "
    >
      <ElForm
        ref="form"
        class=""
        label-position="left"
        :label-width="labelWidth"
        :model="form"
        :rules="rules"
      >
        <ElFormItem :label="$t('public_external_memory_name')" prop="name">
          <ElInput v-model="form.name" />
        </ElFormItem>
        <ElFormItem required :label="$t('public_external_memory_type')">
          <ElSelect v-model="form.type" :disabled="!!form.id">
            <ElOption label="MongoDB" value="mongodb" />
            <ElOption label="RocksDB" value="rocksdb" />
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
          />
        </ElFormItem>

        <SchemaToForm
          v-if="form.type === 'mongodb'"
          ref="schemaToForm"
          :schema="schemaData"
          :colon="true"
          :label-width="schemaLabelWidth"
        />

        <ElFormItem
          :label="$t('packages_business_external_storage_list_sheweimoren')"
        >
          <ElSwitch v-model="form.defaultStorage" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="handleEditorTest()"
            >{{ $t('public_connection_button_test') }}
          </ElButton>
          <ElButton @click="dialogVisible = false">{{
            $t('public_button_cancel')
          }}</ElButton>
          <ElButton type="primary" @click="submit">{{
            $t('public_button_confirm')
          }}</ElButton>
        </span>
      </template>
    </ElDialog>
    <Drawer v-model="isShowDetails" class="shared-cache-details">
      <template #header="{ titleClass }">
        <div
          v-if="details.id"
          class="flex align-center gap-3 overflow-hidden"
          :class="titleClass"
        >
          <VIcon class="icon">text</VIcon>
          <div class="ellipsis">{{ details.name }}</div>
        </div>
      </template>

      <ul>
        <li v-for="item in info" :key="item.label" class="drawer-info__item">
          <VIcon class="fs-7 mt-2">{{ item.icon }}</VIcon>
          <div class="body ml-4">
            <label class="label">{{ item.label }}</label>
            <p class="value mt-2">{{ item.value || '-' }}</p>
          </div>
        </li>
      </ul>
    </Drawer>
    <el-dialog
      v-model="showUsingTaskDialog"
      :title="$t('public_message_title_prompt')"
    >
      <div>
        {{
          $t('packages_business_external_storage_list_tishi', {
            val1: usingTasks.length,
          })
        }}
      </div>
      <el-table class="mt-4" height="250px" :data="usingTasks">
        <el-table-column
          min-width="240"
          :label="$t('public_task_name')"
          :show-overflow-tooltip="true"
        >
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
      :connection="model"
      test-type="testExternalStorage"
      @return-test-data="returnTestData"
    />
  </PageContainer>
</template>

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
    color: var(--color-danger);
    background: #ffecec;
  }
}

.shared-cache-details {
  padding: 16px;
}

.shared-cache-details--header {
  border-bottom: 1px solid var(--border-light);

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
    border-bottom: 1px solid var(--border-light);

    .label {
      font-size: var(--font-base-title);
      color: rgba(0, 0, 0, 0.6);
    }

    .value {
      font-size: var(--font-base-title);
      color: var(--text-dark);
    }
  }
}

.scheme-to-form {
  :deep(.formily-element-plus-form-item) {
    margin-bottom: 18px;
  }
}
</style>
