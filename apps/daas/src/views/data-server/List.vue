<template>
  <section class="data-server-wrapper">
    <TablePage ref="table" row-key="id" :remoteMethod="getData" @selection-change="handleSelectionChange">
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <div slot="operation">
        <ElButton class="btn btn-create" type="primary" size="mini" @click.stop="showDrawer()">
          <span>{{ $t('daas_data_server_drawer_chuangjianfuwu') }}</span>
        </ElButton>
      </div>
      <ElTableColumn type="selection" width="45" :reserve-selection="true"></ElTableColumn>
      <ElTableColumn show-overflow-tooltip :label="$t('daas_data_server_list_fuwumingcheng')" min-width="180">
        <template #default="{ row }">
          <ElLink
            class="ellipsis"
            type="primary"
            style="display: block; line-height: 20px"
            @click.stop="showDrawer(row)"
          >
            {{ row.name }}
          </ElLink>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('public_connection_type')" min-width="120">
        <template #default="{ row }">
          {{ row.connectionType }}
        </template>
      </ElTableColumn>
      <ElTableColumn show-overflow-tooltip :label="$t('daas_data_server_drawer_lianjiemingcheng')" min-width="200">
        <template #default="{ row }">
          {{ row.connectionName }}
        </template>
      </ElTableColumn>
      <ElTableColumn show-overflow-tooltip :label="$t('daas_data_server_list_guanlianduixiang')" min-width="120">
        <template #default="{ row }">
          {{ row.tableName }}
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('daas_data_server_list_fuwuzhuangtai')" min-width="100">
        <template #default="{ row }">
          <span class="status-block" :class="'status-' + row.status">{{ row.statusFmt }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn width="200" :label="$t('column_operation')">
        <template #default="{ row }">
          <ElButton
            v-if="row.status !== 'active'"
            :disabled="row.status !== 'pending'"
            type="text"
            @click="changeStatus(row)"
            >{{ $t('button_public') }}</ElButton
          >
          <ElButton v-if="row.status === 'active'" type="text" @click="changeStatus(row)">{{
            $t('button_revoke')
          }}</ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton type="text" @click="output(row)">{{ $t('public_button_export') }}</ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton type="text" @click="removeServer(row)">{{ $t('public_button_delete') }}</ElButton>
        </template>
      </ElTableColumn>
    </TablePage>
    <Drawer ref="drawer" :host="apiServerHost" @save="table.fetch(1)"></Drawer>
  </section>
</template>
<script>
import i18n from '@/i18n'

import { databaseTypesApi, modulesApi, metadataInstancesApi, apiServerApi } from '@tap/api'
import { TablePage } from '@tap/business'
import { FilterBar } from '@tap/component'

import Drawer from './Drawer'

export default {
  components: { TablePage, FilterBar, Drawer },
  data() {
    return {
      filterItems: [],
      multipleSelection: [],
      order: 'createAt DESC',
      apiServerHost: '',
      searchParams: {
        type: '',
        status: '',
        keyword: ''
      },
      statusOptions: [
        {
          label: i18n.t('select_option_all'),
          value: ''
        },
        {
          label: i18n.t('modules_active'),
          value: 'active'
        },
        {
          label: i18n.t('modules_pending'),
          value: 'pending'
        },
        {
          label: i18n.t('api_monitor_total_api_list_status_generating'),
          value: 'generating'
        }
      ]
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
    this.getApiServerHost()
  },
  methods: {
    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('connection_list_form_database_type'),
          key: 'type', //对象分类
          type: 'select-inner',
          items: async () => {
            let data = await databaseTypesApi.get()
            data = data || []
            let databaseTypes = []
            databaseTypes = data?.filter(it =>
              ['mysql', 'sqlserver', 'oracle', 'mongodb', 'pg', 'tidb'].includes(it.pdkId)
            )
            let databaseTypeOptions = databaseTypes.sort((t1, t2) =>
              t1.name > t2.name ? 1 : t1.name === t2.name ? 0 : -1
            )
            //默认全部
            let all = {
              name: this.$t('select_option_all'),
              type: ''
            }
            databaseTypeOptions.unshift(all)
            return databaseTypeOptions.map(item => {
              return {
                label: item.name,
                value: item.type
              }
            })
          }
        },
        {
          label: i18n.t('modules_header_status'),
          key: 'status', //对象类型
          type: 'select-inner',
          items: this.statusOptions
        },
        {
          placeholder: i18n.t('daas_data_discovery_previewdrawer_qingshurumingcheng'),
          key: 'keyword', //输入搜索名称
          type: 'input'
        }
      ]
    },
    getData({ page }) {
      let { current, size } = page
      let { type, status, keyword } = this.searchParams
      let where = {}
      //精准搜索 iModel
      if (keyword && keyword.trim()) {
        where['or'] = [{ basePath: { like: keyword, options: 'i' } }, { description: { like: keyword, options: 'i' } }]
      }
      if (type) {
        where['connectionType'] = type
      }
      status && (where.status = status)
      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return modulesApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let list = (data?.items || []).map(item => {
            item.statusFmt = this.statusOptions.find(it => it.value === item.status)?.label || '-'
            return item
          })
          return {
            total: data?.total,
            data: list
          }
        })
    },
    async getApiServerHost() {
      const showError = () => {
        this.$message.error(i18n.t('daas_data_server_list_huoqufuwuyu'))
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
      const flag = await this.$confirm(i18n.t('daas_data_server_list_querenshanchufu'), '', {
        type: 'warning',
        showClose: false
      })
      if (flag) {
        await modulesApi.delete(row.id)
        this.table.fetch()
      }
    },
    async changeStatus(row) {
      let msg = i18n.t('daas_data_server_list_quedingfabugai')
      if (row.status === 'active') {
        msg = i18n.t('daas_data_server_list_quedingchexiaogai')
      }
      const flag = await this.$confirm(msg, '', {
        type: 'warning',
        showClose: false
      })
      if (flag) {
        await modulesApi.patch({
          id: row.id,
          status: row.status === 'active' ? 'pending' : 'active',
          tableName: row.tableName
        })
        this.table.fetch()
      }
    },
    output(row) {
      metadataInstancesApi.download(
        {
          _id: {
            in: [row.id]
          }
        },
        'Modules'
      )
    },
    showDrawer(item) {
      this.$refs.drawer.open(item)
    }
  }
}
</script>
<style lang="scss" scoped>
.data-server-wrapper {
  height: 100%;
  overflow: hidden;
}
</style>
