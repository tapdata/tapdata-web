<template>
  <section class="operation-logs-wrapper g-panel-container" v-if="$route.name === 'OperationLog'">
    <div class="main">
      <div class="list-operation">
        <div class="list-operation-left">
          <FilterBar v-model="searchParams" :items="filterItems" @search="search" @fetch="table.fetch(1)"> </FilterBar>
        </div>
      </div>
      <VTable
        ref="table"
        row-key="id"
        :columns="columns"
        :remoteMethod="getData"
        height="100%"
        class="mt-4"
        @sort-change="sortChange"
      >
        <template slot="operationType" slot-scope="scope">
          <div class="text-break">{{ getOperationTypeLabel(scope.row) }}</div>
        </template>
        <template slot="desc" slot-scope="scope">
          <span
            v-for="(item, index) in descFnc(scope.row)"
            :key="index"
            :class="[{ 'color-primary cursor-pointer': item.variable }]"
            @click="clickDescSpan(item, scope.row)"
          >
            {{ item.text || '' }}
          </span>
        </template>
        <div v-if="!isSearching" class="migration-table__empty" slot="empty">
          <VIcon size="120">no-data-color</VIcon>
          <div class="flex justify-content-center align-items-center lh-sm fs-7 font-color-sub">
            <span>{{ $t('data_no_data') }}</span>
          </div>
        </div>
        <div v-else class="migration-table__empty" slot="empty">
          <VIcon size="120">search-no-data-color</VIcon>
          <VIcon>rollback_kennen</VIcon>
          <VIcon>row-filter</VIcon>
          <div class="flex justify-content-center align-items-center lh-sm fs-7 font-color-sub">
            <span style="line-height: 20px">{{ $t('data_no_find_result') }}</span>
            <ElLink type="primary" class="fs-7" @click="reset">{{ $t('link_back_to_list') }}</ElLink>
          </div>
        </div>
      </VTable>
    </div>
  </section>
  <RouterView v-else></RouterView>
</template>

<script>
import { VIcon, FilterBar, VTable } from '@tap/component'
import { delayTrigger, toRegExp } from '@tap/shared'

import i18n from '@/i18n'
import { isEmpty } from '@/util'

export default {
  components: { VIcon, FilterBar, VTable },
  data() {
    return {
      loading: true,
      searchParams: {
        operationType: '',
        parameter1: '',
        start: '',
        end: '',
        username: ''
      },
      source: [], // 所有数据
      list: [], // 展示的数据
      order: 'createTime desc',
      filterItems: [],
      operationTypeOptions: [
        // 连接
        {
          label: this.$t('operation_log_connection_create'),
          value: 'connection&&create',
          desc: this.$t('operation_log_connection_create_tip')
        },
        {
          label: this.$t('operation_log_connection_update'),
          value: 'connection&&update',
          desc: this.$t('operation_log_connection_update_tip')
        },
        {
          label: this.$t('operation_log_connection_copy'),
          value: 'connection&&copy',
          desc: this.$t('operation_log_connection_copy_tip')
        },
        {
          label: this.$t('operation_log_connection_delete'),
          value: 'connection&&delete',
          desc: this.$t('operation_log_connection_delete_tip')
        },
        // 任务
        {
          label: this.$t('operation_log_migration_create'),
          value: 'migration&&create',
          desc: this.$t('operation_log_migration_create_tip')
        },
        {
          label: this.$t('operation_log_migration_start'),
          value: 'migration&&start',
          desc: this.$t('operation_log_migration_start_tip')
        },
        {
          label: this.$t('operation_log_migration_update'),
          value: 'migration&&update',
          desc: this.$t('operation_log_migration_update_tip')
        },
        {
          label: this.$t('operation_log_migration_copy'),
          value: 'migration&&copy',
          desc: this.$t('operation_log_migration_copy_tip')
        },
        {
          label: this.$t('operation_log_migration_reset'),
          value: 'migration&&reset',
          desc: this.$t('operation_log_migration_reset_tip')
        },
        {
          label: this.$t('operation_log_migration_delete'),
          value: 'migration&&delete',
          desc: this.$t('operation_log_migration_delete_tip')
        },
        {
          label: this.$t('operation_log_migration_stop'),
          value: 'migration&&stop',
          desc: this.$t('operation_log_migration_stop_tip')
        },
        {
          label: this.$t('operation_log_migration_forceStop'),
          value: 'migration&&forceStop',
          desc: this.$t('operation_log_migration_forceStop_tip')
        },
        {
          label: this.$t('operation_log_migration_create'),
          value: 'migration&&create',
          desc: this.$t('operation_log_migration_create_tip')
        },
        {
          label: this.$t('operation_log_migration_start'),
          value: 'migration&&start',
          desc: this.$t('operation_log_migration_start_tip')
        },
        {
          label: this.$t('operation_log_migration_update'),
          value: 'migration&&update',
          desc: this.$t('operation_log_migration_update_tip')
        },
        {
          label: this.$t('operation_log_migration_copy'),
          value: 'migration&&copy',
          desc: this.$t('operation_log_migration_copy_tip')
        },
        {
          label: this.$t('operation_log_migration_reset'),
          value: 'migration&&reset',
          desc: this.$t('operation_log_migration_reset_tip')
        },
        {
          label: this.$t('operation_log_migration_delete'),
          value: 'migration&&delete',
          desc: this.$t('operation_log_migration_delete_tip')
        },
        {
          label: this.$t('operation_log_migration_stop'),
          value: 'migration&&stop',
          desc: this.$t('operation_log_migration_stop_tip')
        },
        {
          label: this.$t('operation_log_migration_forceStop'),
          value: 'migration&&forceStop',
          desc: this.$t('operation_log_migration_forceStop_tip')
        },
        // 数据开发
        {
          label: this.$t('operation_log_migration_create'),
          value: 'sync&&create',
          desc: this.$t('operation_log_migration_create_tip')
        },
        {
          label: this.$t('operation_log_migration_start'),
          value: 'sync&&start',
          desc: this.$t('operation_log_migration_start_tip')
        },
        {
          label: this.$t('operation_log_migration_update'),
          value: 'sync&&update',
          desc: this.$t('operation_log_migration_update_tip')
        },
        {
          label: this.$t('operation_log_migration_copy'),
          value: 'sync&&copy',
          desc: this.$t('operation_log_migration_copy_tip')
        },
        {
          label: this.$t('operation_log_migration_reset'),
          value: 'sync&&reset',
          desc: this.$t('operation_log_migration_reset_tip')
        },
        {
          label: this.$t('operation_log_migration_delete'),
          value: 'sync&&delete',
          desc: this.$t('operation_log_migration_delete_tip')
        },
        {
          label: this.$t('operation_log_migration_stop'),
          value: 'sync&&stop',
          desc: this.$t('operation_log_migration_stop_tip')
        },
        {
          label: this.$t('operation_log_migration_forceStop'),
          value: 'sync&&forceStop',
          desc: this.$t('operation_log_migration_forceStop_tip')
        },
        // Agent
        {
          label: this.$t('operation_log_agent_create'),
          value: 'agent&&create',
          desc: this.$t('operation_log_agent_create_tip')
        },
        {
          label: this.$t('operation_log_agent_delete'),
          value: 'agent&&delete',
          desc: this.$t('operation_log_agent_delete_tip')
        },
        {
          label: this.$t('operation_log_agent_stop'),
          value: 'agent&&stop',
          desc: this.$t('operation_log_agent_stop_tip')
        },
        {
          label: this.$t('operation_log_agent_rename'),
          value: 'agent&&rename',
          desc: this.$t('operation_log_agent_rename_tip')
        },
        {
          label: this.$t('operation_log_agent_update'),
          value: 'agent&&update',
          desc: this.$t('operation_log_agent_update_tip')
        },
        // 校验
        {
          label: this.$t('operation_log_inspect_create'),
          value: 'inspect&&create',
          desc: this.$t('operation_log_inspect_create_tip')
        },
        {
          label: this.$t('operation_log_inspect_start'),
          value: 'inspect&&start',
          desc: this.$t('operation_log_inspect_start_tip')
        },
        {
          label: this.$t('operation_log_inspect_update'),
          value: 'inspect&&update',
          desc: this.$t('operation_log_inspect_update_tip')
        },
        {
          label: this.$t('operation_log_inspect_delete'),
          value: 'inspect&&delete',
          desc: this.$t('operation_log_inspect_delete_tip')
        },
        // 二次校验
        {
          label: this.$t('operation_log_difference_inspect_start'),
          value: 'differenceInspect&&start',
          desc: this.$t('operation_log_difference_inspect_start_tip')
        },
        // 通知
        {
          label: i18n.t('operation_log_List_yiDuQuanBuTong'),
          value: 'message&&readAll',
          desc: i18n.t('operation_log_List_sheZhiQuanBuTong')
        },
        {
          label: i18n.t('operation_log_List_shanChuQuanBuTong'),
          value: 'message&&deleteAll',
          desc: i18n.t('operation_log_List_shanChuLeQuanBu')
        },
        {
          label: i18n.t('operation_log_List_biaoJiTongZhiWei'),
          value: 'message&&read',
          desc: i18n.t('operation_log_List_jiangXuanZhongDeTong2')
        },
        {
          label: i18n.t('operation_log_List_shanChuTongZhi'),
          value: 'message&&delete',
          desc: i18n.t('operation_log_List_jiangXuanZhongDeTong')
        },
        {
          label: i18n.t('operation_log_List_xiuGaiTongZhiShe'),
          value: 'userNotification&&update',
          desc: i18n.t('operation_log_List_xiuGaiLeXiTong')
        },
        // 用户中心
        // { label: '修改昵称', value: 'user&&update_nickname', desc: '修改了昵称' },
        {
          label: i18n.t('operation_log_List_xiuGaiYongHuXin'),
          value: 'user&&update',
          desc: i18n.t('operation_log_List_xiuGaiLeYongHu')
        },
        {
          label: i18n.t('operation_log_List_bangDingShouJiHao'),
          value: 'user&&bind_phone',
          desc: i18n.t('operation_log_List_bangDingLeShouJi')
        },
        {
          label: i18n.t('operation_log_List_xiuGaiShouJiHao'),
          value: 'user&&update_phone',
          desc: i18n.t('operation_log_List_xiuGaiLeShouJi')
        },
        {
          label: i18n.t('operation_log_List_bangDingYouXiang'),
          value: 'user&&bind_email',
          desc: i18n.t('operation_log_List_bangDingLeYouXiang')
        },
        {
          label: i18n.t('operation_log_List_xiuGaiYouXiang'),
          value: 'user&&update_email',
          desc: i18n.t('operation_log_List_xiuGaiLeYouXiang')
        },
        {
          label: i18n.t('operation_log_List_xiuGaiMiMa'),
          value: 'user&&reset_password',
          desc: i18n.t('operation_log_List_xiuGaiLeMiMa')
        },
        // { label: '修改头像', value: 'user&&update_avatar', desc: '修改了头像' },
        {
          label: i18n.t('operation_log_List_xiuGaiQiYeXin'),
          value: 'customer&&update',
          desc: i18n.t('operation_log_List_xiuGaiLeQiYe')
        }
      ],
      columns: [
        {
          label: i18n.t('operation_log_user_name'),
          prop: 'username',
          minWidth: 160
        },
        {
          label: i18n.t('operation_log_List_caoZuoShiJian'),
          prop: 'createTime',
          dataType: 'time',
          width: 180
        },
        {
          label: i18n.t('operation_log_List_caoZuoDuiXiang'),
          prop: 'parameter1',
          width: 350
        },
        {
          label: i18n.t('operation_log_List_caoZuoLeiXing'),
          prop: 'operationType',
          slotName: 'operationType',
          width: 120
        },
        {
          label: i18n.t('operation_log_List_caoZuoMiaoShu'),
          prop: 'desc',
          slotName: 'desc',
          minWidth: 300
        }
      ]
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
    isSearching() {
      return !!Object.values(this.searchParams).join('')
    }
  },
  watch: {
    $route(route) {
      if (route.name === 'OperationLog') {
        let query = route.query
        this.searchParams = Object.assign(this.searchParams, query)
        let pageNum = isEmpty(query) ? undefined : 1
        this.table.fetch(pageNum)
      }
    }
  },
  created() {
    let query = this.$route.query
    this.searchParams = Object.assign(this.searchParams, query)
    this.getSearchItems()
  },
  methods: {
    getModularAndOperation(operationType) {
      let [modular, operation] = operationType.split('&&')
      return { modular, operation }
    },
    search(debounce) {
      let { searchParams } = this
      let query = {}
      for (let key in searchParams) {
        if (searchParams[key]) {
          query[key] = searchParams[key]
        }
      }
      delayTrigger(() => {
        this.$router.replace({
          name: 'OperationLog',
          query: query
        })
      }, debounce)
    },
    getSearchItems() {
      this.filterItems = [
        {
          label: i18n.t('operation_log_List_caoZuoLeiXing'),
          key: 'operationType',
          type: 'select-inner',
          items: this.operationTypeOptions
        },
        {
          label: i18n.t('operation_log_List_caoZuoShiJian'),
          key: 'start,end',
          type: 'datetimerange'
        },
        {
          placeholder: i18n.t('operation_log_List_caoZuoDuiXiang'),
          key: 'parameter1',
          type: 'input'
        },
        {
          placeholder: i18n.t('operation_log_List_yongHuMingCheng'),
          key: 'username',
          type: 'input'
        }
      ]
    },
    getData({ page }) {
      let { current, size } = page
      let { operationType, parameter1, start, end, username } = this.searchParams
      let where = {
        type: 'userOperation' // 默认用户操作
      }
      // 操作类型
      if (operationType) {
        let { modular, operation } = this.getModularAndOperation(operationType)
        where['modular'] = modular
        where['operation'] = operation
      }
      // 操作对象
      if (parameter1) {
        where['parameter1'] = { $regex: toRegExp(parameter1), $options: 'i' }
      }
      if (username) {
        where['username'] = { $regex: toRegExp(username), $options: 'i' }
      }
      let dateObj = {}
      // 开始时间
      if (start) {
        dateObj.$gt = {
          $date: start
        }
      }
      if (end) {
        dateObj.$lt = {
          $date: end
        }
      }
      if (!isEmpty(dateObj)) {
        where['createTime'] = dateObj
      }
      let filter = {
        where,
        limit: size,
        skip: size * (current - 1),
        order: this.order
      }
      return this.$axios
        .get('tm/api/UserLogs?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(({ total, items }) => {
          return {
            total: total,
            data: items.map(t => {
              if (t.modular === 'user') {
                t.parameter1 = this.$t('operation_log_modular_name_user_center')
              }
              return t
            })
          }
        })
    },
    sortChange({ prop, order }) {
      this.order = `${order ? prop : 'createTime'} ${order === 'ascending' ? 'asc' : 'desc'}`
      this.table.fetch(1)
    },
    getOperationTypeLabel(row) {
      return this.operationTypeOptions.find(item => item.value === `${row.modular}&&${row.operation}`)?.label
    },
    descFnc(row) {
      let { modular, operation, rename } = row
      let findOne = this.operationTypeOptions.find(item => item.value === `${modular}&&${operation}`)
      let desc = findOne?.desc ?? ''
      if (modular === 'connection' && operation === 'update' && rename) {
        desc = this.$t('operation_log_modify_connection_name')
      }
      // 不添加事件  ${parameter1} ${parameter2}  添加事件@{parameter1} @{parameter2}
      let replaceStr = desc.replace(/\${(parameter\d+)}/gi, (item, subItem) => {
        return row[subItem]
      }) // 替换掉所有${}
      let vReg = /(@{parameter\d+})/gi
      // 根据@{}分割，保留分割符
      return replaceStr.split(vReg).map(item => {
        // @{}添加标记，做事件处理
        if (vReg.test(item)) {
          return {
            text: row[item.match(/\w+/g)?.[0]],
            variable: true
          }
        }
        return {
          text: item
        }
      })
    },
    clickDescSpan(item, row) {
      if (!item.variable) {
        return
      }
      this.toGoList(row)
    },
    toGoList(row) {
      let { modular, parameter1 } = row
      switch (modular) {
        // 任务
        case 'migration':
          this.$router.push({
            name: 'migrateList',
            query: {
              status: '',
              syncType: '',
              agentId: '',
              keyword: parameter1
            }
          })
          break
        // 数据开发
        case 'sync':
          this.$router.push({
            name: 'dataflowList',
            query: {
              status: '',
              syncType: '',
              agentId: '',
              keyword: parameter1
            }
          })
          break
        // 连接
        case 'connection':
          this.$router.push({
            name: 'connections',
            query: {
              status: '',
              keyword: parameter1
            }
          })
          break
        // Agent
        case 'agent':
          this.$router.push({
            name: 'Instance',
            query: {
              status: '',
              keyword: parameter1
            }
          })
          break
      }
    },
    reset() {
      this.searchParams = {
        operationType: '',
        parameter1: '',
        start: '',
        end: '',
        username: ''
      }
      this.search()
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-logs-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  .pointer {
    cursor: pointer;
  }
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
  .operation-logs-table {
    flex: 1;
    overflow: auto;
    border-bottom: none;
  }
}
::v-deep {
  .el-dropdown-menu__item.dropdown-item--disabled {
    color: map-get($color, disable);
    cursor: default;
    &:hover {
      background: unset;
      color: map-get($color, disable);
    }
  }
}
</style>
