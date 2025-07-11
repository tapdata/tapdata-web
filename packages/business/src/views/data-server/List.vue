<script>
import {
  apiServerApi,
  appApi,
  databaseTypesApi,
  metadataInstancesApi,
  modulesApi,
} from '@tap/api'
import { VEmpty } from '@tap/component/src/base/v-empty'
import { VTable } from '@tap/component/src/base/v-table'
import FilterBar from '@tap/component/src/filter-bar/Main.vue'
import { ExportOutlined, ImportOutlined } from '@tap/component/src/icon'
import i18n from '@tap/i18n'
import { escapeRegExp } from 'lodash-es'
import PageContainer from '../../components/PageContainer.vue'
import Upload from '../../components/UploadDialog.vue'
import Drawer from './Drawer.vue'

export default {
  components: {
    PageContainer,
    FilterBar,
    Drawer,
    VTable,
    VEmpty,
    Upload,
    ImportOutlined,
    ExportOutlined,
  },
  props: {
    showFilter: {
      type: Boolean,
      default: true,
    },
    columns: {
      type: Array,
      default: () => [],
    },
    params: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  emits: ['drawer-visible'],
  data() {
    return {
      filterItems: [],
      multipleSelection: [],
      order: 'createAt DESC',
      apiServerHost: '',
      searchParams: {
        type: '',
        status: '',
        keyword: '',
        appId: '',
      },
      statusOptions: [
        {
          label: i18n.t('public_select_option_all'),
          value: '',
        },
        {
          label: i18n.t('public_status_published'),
          value: 'active',
        },
        {
          label: i18n.t('public_status_unpublished'),
          value: 'pending',
        },
        {
          label: i18n.t('public_status_to_be_generated'),
          value: 'generating',
        },
      ],
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },

    cols() {
      if (this.columns.length) return this.columns
      return [
        {
          type: 'selection',
          width: 32,
          align: 'center',
        },
        {
          label: this.$t('packages_business_data_server_list_fuwumingcheng'),
          prop: 'name',
          slotName: 'name',
          'min-width': 180,
          'show-overflow-tooltip': true,
        },
        {
          label: i18n.t('packages_business_application_list_yingyongmingcheng'),
          prop: 'appName',
          'min-width': 140,
        },
        {
          label: this.$t('public_connection_type'),
          prop: 'connectionType',
          'min-width': 120,
        },
        {
          label: this.$t('public_connection_name'),
          prop: 'connectionName',
          'min-width': 200,
        },
        {
          label: this.$t('packages_business_data_server_list_guanlianduixiang'),
          'min-width': 180,
          prop: 'tableName',
        },
        {
          label: this.$t('daas_data_server_drawer_path'),
          'min-width': 130,
          prop: '_path',
        },
        {
          label: this.$t('packages_business_data_server_list_fuwuzhuangtai'),
          'min-width': 106,
          prop: 'statusFmt',
          slotName: 'statusFmt',
        },
        {
          label: this.$t('public_operation'),
          width: 200,
          prop: 'operation',
          slotName: 'operation',
          fixed: 'right',
        },
      ]
    },
    // 选中的已发布数据
    multipleSelectionActive() {
      return this.multipleSelection.filter((t) => t.status === 'active')
    },

    pendingSelection() {
      return this.multipleSelection.filter((t) => t.status === 'pending')
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
    this.getApiServerHost()
  },
  beforeUnmount() {
    this.intervalId && clearTimeout(this.intervalId)
  },
  methods: {
    getFilterItems() {
      this.filterItems = [
        {
          label: i18n.t('packages_business_application_list_yingyongmingcheng'),
          key: 'appId',
          type: 'select-inner',
          items: async () => {
            const params = {
              where: {
                item_type: 'app',
              },
              order: 'createTime DESC',
              limit: 1000,
            }
            const res = await appApi.get({ filter: JSON.stringify(params) })
            const data =
              res.items.map((t) => {
                return {
                  label: t.value,
                  value: t.id,
                }
              }) || []
            //默认全部
            const all = {
              label: this.$t('public_select_option_all'),
              value: '',
            }
            data.unshift(all)
            return data
          },
        },
        {
          label: this.$t('public_connection_form_database_type'),
          key: 'type', //对象分类
          type: 'select-inner',
          items: async () => {
            let data = await databaseTypesApi.get()
            data = data || []
            let databaseTypes = []
            databaseTypes = data?.filter((it) =>
              [
                'mysql',
                'sqlserver',
                'oracle',
                'mongodb',
                'pg',
                'tidb',
              ].includes(it.pdkId),
            )
            const databaseTypeOptions = databaseTypes.sort((t1, t2) =>
              t1.name > t2.name ? 1 : t1.name === t2.name ? 0 : -1,
            )
            //默认全部
            const all = {
              name: this.$t('public_select_option_all'),
              type: '',
            }
            databaseTypeOptions.unshift(all)
            return databaseTypeOptions.map((item) => {
              return {
                label: item.name,
                value: item.type,
              }
            })
          },
        },
        {
          label: i18n.t('public_status'),
          key: 'status', //对象类型
          type: 'select-inner',
          items: this.statusOptions,
        },
        {
          placeholder: i18n.t('public_button_search'),
          key: 'keyword', //输入搜索名称
          type: 'input',
        },
      ]
    },
    getData({ page = {} }) {
      const { current, size } = page
      const { type, status, keyword, appId } = this.searchParams
      const where = {}
      if (keyword?.trim()) {
        const obj = { like: escapeRegExp(keyword), options: 'i' }
        where.or = [
          { name: obj },
          { tableName: obj },
          { basePath: obj },
          { prefix: obj },
          { apiVersion: obj },
        ]
      }
      if (type) {
        where.connectionType = type
      }
      if (appId) {
        where['listtags.id'] = appId
      }

      status && (where.status = status)

      const filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where,
      }

      if (this.params) {
        Object.assign(filter, this.params)
      }

      return modulesApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          const list = (data?.items || []).map((item) => {
            item.statusFmt =
              this.statusOptions.find((it) => it.value === item.status)
                ?.label || '-'
            item.appName = item.listtags?.[0]?.value || '-'

            const pathJoin = []
            item.apiVersion && pathJoin.push(item.apiVersion)
            item.prefix && pathJoin.push(item.prefix)
            item.basePath && pathJoin.push(item.basePath)
            item._path = `/${pathJoin.join('/')}`
            return item
          })
          this.doLayout()
          return {
            total: data?.total,
            data: list,
          }
        })
    },
    async getApiServerHost() {
      const showError = () => {
        this.$message.error(
          i18n.t('packages_business_data_server_list_huoqufuwuyu'),
        )
      }
      const data = await apiServerApi.get().catch(() => {
        showError()
      })
      this.apiServerHost = data?.items?.[0]?.clientURI || ''
      if (!this.apiServerHost) {
        showError()
      }
    },
    //列表全选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    async removeServer(row) {
      const flag = await this.$confirm(
        i18n.t('packages_business_data_server_list_querenshanchufu'),
      )
      if (flag) {
        await modulesApi.delete(row.id)
        this.table.fetch()
      }
    },
    async changeStatus(row) {
      let msg = i18n.t('packages_business_data_server_list_quedingfabugai')
      if (row.status === 'active') {
        msg = i18n.t('packages_business_data_server_list_quedingchexiaogai')
      }
      const flag = await this.$confirm(msg)
      if (flag) {
        await modulesApi.patch({
          id: row.id,
          status: row.status === 'active' ? 'pending' : 'active',
          tableName: row.tableName,
        })
        this.table.fetch()
      }
    },
    output(row) {
      metadataInstancesApi.download(
        {
          _id: {
            in: [row.id],
          },
        },
        'Modules',
      )
    },
    showDrawer(item) {
      this.$refs.drawer.open(item)
    },
    fetch() {
      this.table.fetch()
    },
    handleExport() {
      const ids = this.multipleSelection.map((t) => t.id)
      modulesApi.export(ids)
    },
    handleImport() {
      this.$refs.upload.show()
    },
    handleExportApiDoc() {
      const ids = this.multipleSelectionActive.map((t) => t.id)
      modulesApi.apiExport(ids, this.apiServerHost)
    },
    async batchPublish() {
      if (!this.pendingSelection.length) return

      await modulesApi.batchUpdate(
        this.pendingSelection.map((item) => ({
          id: item.id,
          status: 'active',
          tableName: item.tableName,
        })),
      )

      this.$message.success(this.$t('public_message_publish_successful'))
      this.fetch()
    },
    doLayout() {
      this.$nextTick(() => {
        this.$refs.table.doLayout()
      })
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #title>
      <slot name="title" />
    </template>
    <template #actions>
      <ElButton
        v-readonlybtn="'SYNC_job_import'"
        class="btn"
        @click="handleImport"
      >
        <template #icon>
          <ImportOutlined />
        </template>
        <span> {{ $t('packages_business_button_bulk_import') }}</span>
      </ElButton>
      <ElButton
        class="btn btn-create"
        type="primary"
        @click.stop="showDrawer()"
      >
        <span>{{
          $t('packages_business_data_server_drawer_chuangjianfuwu')
        }}</span>
      </ElButton>
    </template>

    <div class="flex flex-column h-100 gap-4">
      <div v-if="showFilter" class="flex justify-content-between">
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="table.fetch(1)"
        />
      </div>

      <VTable
        ref="table"
        :columns="cols"
        :remote-method="getData"
        height="100%"
        class="flex-fill"
        table-class="has-border-t"
        @selection-change="handleSelectionChange"
      >
        <template #multipleSelectionActions>
          <ElButton v-show="pendingSelection.length > 0" @click="batchPublish">
            <template #icon>
              <i-lucide:cloud-upload />
            </template>
            <span> {{ $t('public_batch_publish') }}</span>
          </ElButton>
          <ElButton v-readonlybtn="'SYNC_job_export'" @click="handleExport">
            <template #icon>
              <ExportOutlined />
            </template>
            <span> {{ $t('public_button_export') }}</span>
          </ElButton>
          <ElButton
            v-readonlybtn="'SYNC_job_export'"
            class="btn"
            @click="handleExportApiDoc"
          >
            <template #icon>
              <ExportOutlined />
            </template>
            <span>{{
              $t('packages_business_data_server_list_apIwendang')
            }}</span>
          </ElButton>
        </template>
        <template #name="{ row }">
          <ElLink
            class="ellipsis"
            type="primary"
            style="display: block; line-height: 20px"
            @click.stop="showDrawer(row)"
          >
            {{ row.name }}
          </ElLink>
        </template>
        <template #statusFmt="{ row }">
          <span class="status-block" :class="`status-${row.status}`">{{
            row.statusFmt
          }}</span>
        </template>
        <template #operation="{ row }">
          <ElButton
            v-if="row.status !== 'active'"
            :disabled="row.status !== 'pending'"
            text
            type="primary"
            @click="changeStatus(row)"
            >{{ $t('public_button_public') }}</ElButton
          >
          <ElButton
            v-if="row.status === 'active'"
            text
            type="primary"
            @click="changeStatus(row)"
            >{{ $t('public_button_revoke') }}</ElButton
          >
          <ElDivider class="mx-1" direction="vertical" />
          <ElButton text type="primary" @click="output(row)">{{
            $t('public_button_export')
          }}</ElButton>
          <ElDivider class="mx-1" direction="vertical" />
          <ElButton text type="primary" @click="removeServer(row)">{{
            $t('public_button_delete')
          }}</ElButton>
        </template>

        <template #empty>
          <VEmpty large />
        </template>
      </VTable>
    </div>

    <Drawer
      ref="drawer"
      :host="apiServerHost"
      @save="table.fetch(1)"
      @update="table.fetch()"
      @visible="$emit('drawer-visible', $event)"
    />
    <!-- 导入 -->
    <Upload
      ref="upload"
      type="Modules"
      :show-tag="false"
      @success="table.fetch()"
    />
  </PageContainer>
</template>

<style lang="scss" scoped>
.data-server-wrapper {
  height: 100%;
  overflow: hidden;
}
</style>
