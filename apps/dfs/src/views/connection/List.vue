<template>
  <section class="connection-wrapper g-panel-container" v-loading="loading" v-if="$route.name === 'Connection'">
    <div class="main">
      <div class="connection-operation">
        <div class="connection-operation-left">
          <FilterBar v-model="searchParams" :items="filterItems" @search="search" @fetch="fetch"></FilterBar>
        </div>
        <div class="connection-operation-right">
          <ElButton type="primary" @click="create">
            <span>{{ $t('connection_form_creat_connection') }}</span>
          </ElButton>
        </div>
      </div>
      <ElTable class="connection-table table-border mt-4" height="100%" :data="list" @sort-change="sortChange">
        <ElTableColumn :label="$t('connection_List_lianJieMing')" prop="name" min-width="200px">
          <template slot-scope="scope">
            <div class="flex flex-row align-items-center">
              <img class="mr-2 db-img" :src="getSvg(scope.row)" />
              <ElLink
                type="primary"
                style="display: block; line-height: 20px"
                @click="preview(scope.row.id, scope.row.database_type)"
              >
                {{ scope.row.name }}
              </ElLink>
              <div class="flex align-items-center">
                <img
                  v-if="isCloud(scope.row)"
                  src="../../../public/images/only_test.png"
                  alt=""
                  class="ml-3"
                  style="height: 18px"
                />
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('connection_list_status')" width="120">
          <template slot-scope="scope">
            <StatusTag type="text" target="connection" :status="scope.row.status"></StatusTag>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('connection_list_type')" width="130">
          <template slot-scope="scope">{{
            {
              source: $t('connection_list_source'),
              target: $t('connection_list_target'),
              source_and_target: $t('connection_list_source_and_target')
            }[scope.row.connection_type]
          }}</template>
        </ElTableColumn>
        <ElTableColumn width="190">
          <div slot="header">
            {{ $t('connection_list_column_schema_status') }}
            <ElTooltip placement="top" :content="$t('connection_list_column_schema_status_tips')">
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>
          <template slot-scope="scope">
            <SchemaProgress :data="scope.row"></SchemaProgress>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('connection_list_change_time')" prop="last_updated" width="150" sortable="custom">
          <template slot-scope="scope">{{ $moment(scope.row.last_updated).format('YYYY-MM-DD HH:mm:ss') }}</template>
        </ElTableColumn>
        <ElTableColumn :label="$t('connection_list_operate')" width="280">
          <template slot-scope="scope">
            <div class="operate-columns">
              <ElButton size="mini" type="text" @click="testConnection(scope.row)">{{
                $t('connection_List_lianJieCeShi')
              }}</ElButton>
              <ElDivider direction="vertical"></ElDivider>
              <ElButton size="mini" type="text" :disabled="isCloud(scope.row)" @click="edit(scope.row)">{{
                $t('components_InlineInput_bianJi')
              }}</ElButton>
              <ElDivider direction="vertical"></ElDivider>
              <ElButton size="mini" type="text" :disabled="isCloud(scope.row)" @click="copy(scope.row)">{{
                $t('connection_List_fuZhi')
              }}</ElButton>
              <ElDivider direction="vertical"></ElDivider>
              <ElButton size="mini" type="text" @click="del(scope.row)">{{ $t('connection_List_shanChu') }}</ElButton>
            </div>
          </template>
        </ElTableColumn>
        <div v-if="!isSearching" class="connection-table__empty" slot="empty">
          <VIcon size="120">no-data-color</VIcon>
          <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
            <span>{{ $t('gl_no_data') }}</span>
            <ElLink type="primary" class="fs-7" @click="create">{{ $t('connection_List_chuangJianLianJie') }}</ElLink>
          </div>
        </div>
        <div v-else class="connection-table__empty" slot="empty">
          <VIcon size="120">search-no-data-color</VIcon>
          <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
            <span>{{ $t('gl_no_match_result') }}</span>
            <ElLink type="primary" class="fs-7" @click="reset">{{ $t('gl_back_to_list') }}</ElLink>
          </div>
        </div>
      </ElTable>
      <ElPagination
        background
        class="mt-3"
        layout="total, sizes, ->, prev, pager, next, jumper"
        :current-page.sync="page.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size.sync="page.size"
        :total="page.total"
        @size-change="fetch(1)"
        @current-change="fetch"
      >
      </ElPagination>
      <!-- {{$t('connection_List_lianJieCeShi')}} -->
      <ConnectionTest ref="test"></ConnectionTest>
      <Preview ref="preview" @close="fetch()" @reload-schema="fetch()"></Preview>
    </div>
  </section>
  <RouterView v-else></RouterView>
</template>
<style lang="scss" scoped>
.connection-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    font-size: 16px;
  }
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .connection-operation {
    display: flex;
    justify-content: space-between;
    .connection-operation-left {
      li {
        float: left;
      }
    }
  }
  .connection-table {
    flex: 1;
    overflow: auto;
    border-bottom: none;
    .agent-link {
      color: unset;
      cursor: unset;
    }
    .db-img {
      height: 20px;
    }
    .operate-columns {
      .el-divider {
        margin: 0 16px;
      }
    }
  }
  .connection-table__empty {
    color: map-get($fontColor, light);
  }
}
</style>
<script>
import i18n from '@/i18n'

import { CONNECTION_STATUS_MAP, SUPPORT_DB } from '../../const'
import StatusTag from '../../components/StatusTag'
import SchemaProgress from 'web-core/components/SchemaProgress'
import Preview from './Preview.vue'
import VIcon from '@/components/VIcon'
import FilterBar from '@/components/filter-bar'
import { getDatabaseTypes } from '@/util'

let timer = null
export default {
  components: { StatusTag, Preview, VIcon, SchemaProgress, FilterBar },
  data() {
    return {
      loading: true,
      searchParams: {
        status: '',
        database_type: '',
        keyword: ''
      },
      list: [],
      page: {
        current: 1,
        size: 10,
        total: 0
      },
      order: 'createTime desc',
      statusMap: CONNECTION_STATUS_MAP,
      whiteList: SUPPORT_DB,
      showDetails: false,
      filterItems: []
    }
  },
  computed: {
    isSearching() {
      return !!Object.values(this.searchParams).join('')
    },
    statusOptions() {
      let result = []
      const { statusMap } = this
      for (let key in statusMap) {
        result.push({
          label: statusMap[key].text,
          value: key
        })
      }
      return result
    }
  },
  watch: {
    $route(route) {
      if (route.name === 'Connection') {
        let query = route.query
        this.searchParams = Object.assign(this.searchParams, query)
        let pageNum = JSON.stringify(query) === '{}' ? undefined : 1
        this.fetch(pageNum)
      }
    }
  },
  created() {
    let query = this.$route.query
    this.searchParams = Object.assign(this.searchParams, query)
    this.fetch()
    timer = setInterval(() => {
      let list = this.list || []
      let ids = []
      list.forEach(item => {
        if (
          ['testing'].includes(item.status) ||
          ['loading'].includes(item.loadFieldsStatus) ||
          // TODO 狗皮膏药：点击加载schema前端请求成功之后会获取数据更新状态，但后端数据并未更新，因此要一直轮询
          !item.loadFieldsStatus
        ) {
          ids.push(item.id)
        }
      })
      if (ids.length && this.$route.name === 'Connection') {
        this.updateStatusByIds(ids)
      }
    }, 5000)
    this.getFilterItems()
  },
  mounted() {
    if (this.$route.query?.action === 'create') {
      this.clearRouter()
      this.create()
    }
  },
  beforeDestroy() {
    clearInterval(timer)
    timer = null
  },
  methods: {
    getFilterItems() {
      const TYPEMAP = getDatabaseTypes(true)
      this.filterItems = [
        {
          label: i18n.t('connection_List_quanBuZhuangTai'),
          key: 'status',
          type: 'select-inner',
          items: this.statusOptions
        },
        {
          label: i18n.t('connection_List_shuJuKuLeiXing'),
          key: 'database_type',
          type: 'select-inner',
          menuMinWidth: '240px',
          items: async () => {
            let data = await this.$axios.get('tm/api/Connections/databaseType')
            return data.map(item => {
              return {
                label: TYPEMAP[item] || item,
                value: item
              }
            })
          }
        },
        {
          placeholder: i18n.t('connection_List_anLianJieMingSou'),
          key: 'keyword',
          type: 'input'
        }
      ]
    },
    async updateStatusByIds(ids) {
      let fields = {
        id: true,
        name: true,
        status: true,
        loadFieldsStatus: true,
        loadCount: true,
        tableCount: true,
        loadFieldErrMsg: true,
        database_type: true
      }
      let filter = {
        fields,
        where: {
          id: {
            $inq: ids
          }
        }
      }
      let data = await this.$axios.get('tm/api/Connections?filter=' + encodeURIComponent(JSON.stringify(filter)))
      let changeList = data?.items || []
      let statusMap = {}
      changeList.forEach(item => {
        statusMap[item.id] = this.formatData(item)
      })
      let list = this.list || []
      list.forEach((item, index) => {
        let changeParams = statusMap[item.id]
        if (changeParams) {
          for (const key in changeParams) {
            this.$set(this.list[index], key, changeParams[key])
          }
        }
      })
    },
    // 清除路由
    clearRouter() {
      this.$router.replace({
        name: 'Connection'
      })
    },
    search(debounce) {
      const { delayTrigger } = this.$util
      delayTrigger(() => {
        this.$router.replace({
          name: 'Connection',
          query: this.searchParams
        })
      }, debounce)
    },
    fetch(pageNum) {
      const { toRegExp } = this.$util
      this.loading = true
      let current = pageNum || this.page.current
      let { keyword, status, database_type } = this.searchParams
      let where = {}
      if (keyword && keyword.trim()) {
        where.name = { $regex: toRegExp(keyword), $options: 'i' }
      }
      if (database_type) {
        where.database_type = database_type
      }
      status && (where.status = status)
      let filter = {
        // fields, noSchema:1 不加载schema
        noSchema: 1,
        where,
        size: this.page.size,
        page: current,
        order: this.order
      }
      this.$axios
        .get('tm/api/Connections?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(({ total, items }) => {
          this.page.total = total
          let list = items || []
          this.list = list.map(this.formatData)
          if (!list.length && total > 0) {
            setTimeout(() => {
              this.fetch(this.page.current - 1)
            }, 0)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    formatData(item) {
      let statusInfo = this.statusMap[item.status] || {}
      item.statusText = statusInfo.text || ''
      item.statusIcon = statusInfo.icon || ''
      return item
    },
    sortChange({ prop, order }) {
      this.order = `${order ? prop : 'createTime'} ${order === 'ascending' ? 'asc' : 'desc'}`
      this.fetch()
    },
    reset() {
      this.searchParams = {
        status: '',
        keyword: ''
      }
      this.fetch(1)
    },
    create() {
      this.$root.$emit('select-connection-type')
    },
    edit(item) {
      if (this.isCloud(item)) {
        return
      }
      this.$router.push({
        path: `connection/${item.id}?databaseType=${item.search_databaseType || item.database_type}`
      })
    },
    async copy(item) {
      if (this.isCloud(item)) {
        return
      }
      try {
        let data = await this.$axios.post(`tm/api/Connections/${item.id}/copy`, {
          uri: `${item.id}/copy`,
          headers: { 'lconname-name': item.name }
        })
        this.fetch()
        this.$message.success(i18n.t('connection_List_fuZhiChengGong'))
        this.test(data?.result || data, false)
      } catch (error) {
        if (error?.response?.msg === 'duplicate source') {
          this.$message.success(this.$t('connection_list_copy_failed'))
        }
      }
    },
    del(item) {
      let msg = `<p> ${this.$t('connection_list_delete_connection')} <span>${item.name}</span> ${this.$t(
        'connection_list_delete_connection_tip'
      )}</p>`
      this.$confirm(msg, this.$t('connection_list_delete_connection_title'), {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel'),
        dangerouslyUseHTMLString: true
      }).then(async resFlag => {
        if (resFlag) {
          try {
            await this.$axios.delete(`tm/api/Connections/${item.id}?name=${item.name}`)
            if (this.isCloud(item)) {
              // 释放资源
              this.$axios
                .post('api/tcm/connection/delete', {
                  type: item.connection_type,
                  databaseType: item.database_type
                })
                .then(() => {
                  this.$message.success(this.$t('connection_list_delete_success'))
                  this.fetch()
                })
            } else {
              this.$message.success(this.$t('connection_list_delete_success'))
              this.fetch()
            }
          } catch (error) {
            // 删除失败
            let errorTip = i18n.t('connection_List_shanChuShiBai')
            const data = error?.data
            if (data.code === 'Datasource.LinkJobs') {
              errorTip = data.message
            } else if (error?.data?.msg) {
              let { dataFlows, jobs, modules } = error?.data?.msg
              if ([...dataFlows, ...jobs, ...modules].length > 0) {
                errorTip = this.$t('connection_list_task_occupied')
              }
            }
            this.$message.error(errorTip)
          }
        }
      })
    },
    testConnection(item) {
      this.$checkAgentStatus(async () => {
        let loading = this.$loading()
        this.test(item)
        loading.close()
      })
    },
    async test(data, isShowDialog = true) {
      if (data && ['gridfs', 'mongodb'].includes(data.database_type)) {
        delete data.database_uri
        data.justTest = true
      }
      if (data.database_type !== 'redis') {
        delete data['database_password']
      }
      try {
        await this.$axios.patch(`tm/api/Connections/${data.id}`, {
          status: 'testing'
        })
        this.$refs.test.start(data, isShowDialog)
        this.fetch()
      } catch (error) {
        this.$message.error(error?.response?.msg || this.$t('connection_list_test_failed'))
      }
    },
    loadDetailsData(data) {
      if (this.selectedRow?.id) {
        return
      }
      this.selectedRow = data
    },
    detailsClosedFnc() {
      this.showDetails = false
      this.$router.replace({
        name: 'Instance',
        query: this.searchParams
      })
    },
    preview(id, type) {
      this.$refs.preview.open(id, type)
    },
    isCloud(row) {
      return row.agentType === 'Cloud'
    },
    getSvg(row = {}) {
      if (!row.database_type) {
        return null
      }
      return require('web-core/assets/icons/node/' + row.database_type.toLowerCase() + '.svg')
    }
  }
}
</script>
