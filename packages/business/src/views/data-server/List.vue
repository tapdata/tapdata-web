<template>
  <section class="data-server-wrapper flex flex-column">
    <div v-if="showFilter" class="flex justify-content-between my-2">
      <FilterBar v-model:value="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      <div>
        <ElButton
          v-show="multipleSelection.length > 0"
          :disabled="$disabledReadonlyUserBtn()"
          v-readonlybtn="'SYNC_job_export'"
          class="btn message-button-cancel"
          @click="handleExport"
        >
          <span> {{ $t('public_button_export') }}</span>
        </ElButton>
        <ElButton
          v-readonlybtn="'SYNC_job_import'"
          class="btn"
          :disabled="$disabledReadonlyUserBtn()"
          @click="handleImport"
        >
          <span> {{ $t('packages_business_button_bulk_import') }}</span>
        </ElButton>
        <ElButton
          v-readonlybtn="'SYNC_job_export'"
          class="btn"
          :disabled="$disabledReadonlyUserBtn() || !multipleSelectionActive.length"
          @click="handleExportApiDoc"
        >
          <span>{{ $t('packages_business_data_server_list_apIwendang') }}</span>
        </ElButton>
        <ElButton class="btn btn-create" type="primary" @click.stop="showDrawer()">
          <span>{{ $t('packages_business_data_server_drawer_chuangjianfuwu') }}</span>
        </ElButton>
      </div>
    </div>
    <VTable
      :columns="cols"
      :remote-method="getData"
      ref="table"
      height="100%"
      class="flex-fill"
      @selection-change="handleSelectionChange"
    >
      <template #name="{ row }">
        <ElLink class="ellipsis" type="primary" style="display: block; line-height: 20px" @click.stop="showDrawer(row)">
          {{ row.name }}
        </ElLink>
      </template>
      <template #statusFmt="{ row }">
        <span class="status-block" :class="'status-' + row.status">{{ row.statusFmt }}</span>
      </template>
      <template #operation="{ row }">
        <ElButton v-if="row.status !== 'active'" :disabled="row.status !== 'pending'" text @click="changeStatus(row)">{{
          $t('public_button_public')
        }}</ElButton>
        <ElButton v-if="row.status === 'active'" text @click="changeStatus(row)">{{
          $t('public_button_revoke')
        }}</ElButton>
        <ElDivider direction="vertical"></ElDivider>
        <ElButton text @click="output(row)">{{ $t('public_button_export') }}</ElButton>
        <ElDivider direction="vertical"></ElDivider>
        <ElButton text @click="removeServer(row)">{{ $t('public_button_delete') }}</ElButton>
      </template>

      <template v-slot:empty>
        <VEmpty large></VEmpty>
      </template>
    </VTable>
    <Drawer
      ref="drawer"
      :host="apiServerHost"
      @save="table.fetch(1)"
      @visible="$emit('drawer-visible', arguments[0])"
    ></Drawer>
    <!-- 导入 -->
    <Upload type="Modules" :show-tag="false" ref="upload" @success="table.fetch()"></Upload>
  </section>
</template>

<script>
import { escapeRegExp } from 'lodash'
import i18n from '@tap/i18n'

import { databaseTypesApi, modulesApi, metadataInstancesApi, apiServerApi, appApi } from '@tap/api'
import { FilterBar, VTable, VEmpty } from '@tap/component'
import Upload from '../../components/UploadDialog'

import Drawer from './Drawer'

export default {
  components: { FilterBar, Drawer, VTable, VEmpty, Upload },
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
          'min-width': 120,
          prop: 'tableName',
        },
        {
          label: this.$t('daas_data_server_drawer_path'),
          'min-width': 130,
          prop: '_path'
        },
        {
          label: this.$t('packages_business_data_server_list_fuwuzhuangtai'),
          'min-width': 100,
          prop: 'statusFmt',
          slotName: 'statusFmt',
        },
        {
          label: this.$t('public_operation'),
          width: 200,
          prop: 'operation',
          slotName: 'operation',
        },
      ]
    },
    // 选中的已发布数据
    multipleSelectionActive() {
      return this.multipleSelection.filter((t) => t.status === 'active')
    },
  },
  watch: {
    '$route.query'() {
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
            let params = {
              where: {
                item_type: 'app',
              },
              order: 'createTime DESC',
              limit: 1000,
            }
            let res = await appApi.get({ filter: JSON.stringify(params) })
            let data =
              res.items.map((t) => {
                return {
                  label: t.value,
                  value: t.id,
                }
              }) || []
            //默认全部
            let all = {
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
              ['mysql', 'sqlserver', 'oracle', 'mongodb', 'pg', 'tidb'].includes(it.pdkId),
            )
            let databaseTypeOptions = databaseTypes.sort((t1, t2) =>
              t1.name > t2.name ? 1 : t1.name === t2.name ? 0 : -1,
            )
            //默认全部
            let all = {
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
      let { current, size } = page
      let { type, status, keyword, appId } = this.searchParams
      let where = {}
      if (keyword?.trim()) {
        const obj = { like: escapeRegExp(keyword), options: 'i' }
        where.or = [{ name: obj }, { tableName: obj }, { basePath: obj }, { prefix: obj }, { apiVersion: obj }]
      }
      if (type) {
        where['connectionType'] = type
      }
      if (appId) {
        where['listtags.id'] = appId
      }

      status && (where.status = status)

      let filter = {
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
          let list = (data?.items || []).map((item) => {
            item.statusFmt = this.statusOptions.find((it) => it.value === item.status)?.label || '-'
            item.appName = item.listtags?.[0]?.value || '-'

            const pathJoin = []
            item.apiVersion && pathJoin.push(item.apiVersion)
            item.prefix && pathJoin.push(item.prefix)
            item.basePath && pathJoin.push(item.basePath)
            item._path = `/${pathJoin.join('/')}`
            return item
          })
          return {
            total: data?.total,
            data: list,
          }
        })
    },
    async getApiServerHost() {
      const showError = () => {
        this.$message.error(i18n.t('packages_business_data_server_list_huoqufuwuyu'))
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
      const flag = await this.$confirm(i18n.t('packages_business_data_server_list_querenshanchufu'), '', {
        type: 'warning',
        showClose: false,
      })
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
      const flag = await this.$confirm(msg, '', {
        type: 'warning',
        showClose: false,
      })
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
  },
  emits: ['drawer-visible'],
}
</script>

<style lang="scss" scoped>
.data-server-wrapper {
  height: 100%;
  overflow: hidden;
}
</style>
