<script>
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { FilterBar, VIcon, VTable } from '@tap/component'
import { delayTrigger } from '@tap/shared'
import { escapeRegExp, isEmpty } from 'lodash-es'

import i18n from '@/i18n'

export default {
  components: { VIcon, FilterBar, VTable, PageContainer },
  data() {
    return {
      loading: true,
      searchParams: {
        operationType: '',
        parameter1: '',
        start: '',
        end: '',
        username: '',
      },
      source: [], // 所有数据
      list: [], // 展示的数据
      order: 'createTime desc',
      filterItems: [],
      operationTypeOptions: [
        // 连接
        {
          label: this.$t('public_connection_button_create'),
          value: 'connection&&create',
          desc: this.$t('operation_log_connection_create_tip'),
        },
        {
          label: this.$t('operation_log_connection_update'),
          value: 'connection&&update',
          desc: this.$t('operation_log_connection_update_tip'),
        },
        {
          label: this.$t('operation_log_connection_copy'),
          value: 'connection&&copy',
          desc: this.$t('operation_log_connection_copy_tip'),
        },
        {
          label: this.$t('operation_log_connection_delete'),
          value: 'connection&&delete',
          desc: this.$t('operation_log_connection_delete_tip'),
        },
        // 任务
        {
          label: this.$t('operation_log_migration_create'),
          value: 'migration&&create',
          desc: this.$t('operation_log_migration_create_tip'),
        },
        {
          label: this.$t('operation_log_migration_start'),
          value: 'migration&&start',
          desc: this.$t('operation_log_migration_start_tip'),
        },
        {
          label: this.$t('operation_log_migration_update'),
          value: 'migration&&update',
          desc: this.$t('operation_log_migration_update_tip'),
        },
        {
          label: this.$t('operation_log_migration_copy'),
          value: 'migration&&copy',
          desc: this.$t('operation_log_migration_copy_tip'),
        },
        {
          label: this.$t('operation_log_migration_reset'),
          value: 'migration&&reset',
          desc: this.$t('operation_log_migration_reset_tip'),
        },
        {
          label: this.$t('operation_log_migration_delete'),
          value: 'migration&&delete',
          desc: this.$t('operation_log_migration_delete_tip'),
        },
        {
          label: this.$t('operation_log_migration_stop'),
          value: 'migration&&stop',
          desc: this.$t('operation_log_migration_stop_tip'),
        },
        {
          label: this.$t('operation_log_migration_forceStop'),
          value: 'migration&&forceStop',
          desc: this.$t('operation_log_migration_forceStop_tip'),
        },
        {
          label: this.$t('operation_log_migration_create'),
          value: 'migration&&create',
          desc: this.$t('operation_log_migration_create_tip'),
        },
        {
          label: this.$t('operation_log_migration_start'),
          value: 'migration&&start',
          desc: this.$t('operation_log_migration_start_tip'),
        },
        {
          label: this.$t('operation_log_migration_update'),
          value: 'migration&&update',
          desc: this.$t('operation_log_migration_update_tip'),
        },
        {
          label: this.$t('operation_log_migration_copy'),
          value: 'migration&&copy',
          desc: this.$t('operation_log_migration_copy_tip'),
        },
        {
          label: this.$t('operation_log_migration_reset'),
          value: 'migration&&reset',
          desc: this.$t('operation_log_migration_reset_tip'),
        },
        {
          label: this.$t('operation_log_migration_delete'),
          value: 'migration&&delete',
          desc: this.$t('operation_log_migration_delete_tip'),
        },
        {
          label: this.$t('operation_log_migration_stop'),
          value: 'migration&&stop',
          desc: this.$t('operation_log_migration_stop_tip'),
        },
        {
          label: this.$t('operation_log_migration_forceStop'),
          value: 'migration&&forceStop',
          desc: this.$t('operation_log_migration_forceStop_tip'),
        },
        // 数据开发
        {
          label: this.$t('operation_log_migration_create'),
          value: 'sync&&create',
          desc: this.$t('operation_log_migration_create_tip'),
        },
        {
          label: this.$t('operation_log_migration_start'),
          value: 'sync&&start',
          desc: this.$t('operation_log_migration_start_tip'),
        },
        {
          label: this.$t('operation_log_migration_update'),
          value: 'sync&&update',
          desc: this.$t('operation_log_migration_update_tip'),
        },
        {
          label: this.$t('operation_log_migration_copy'),
          value: 'sync&&copy',
          desc: this.$t('operation_log_migration_copy_tip'),
        },
        {
          label: this.$t('operation_log_migration_reset'),
          value: 'sync&&reset',
          desc: this.$t('operation_log_migration_reset_tip'),
        },
        {
          label: this.$t('operation_log_migration_delete'),
          value: 'sync&&delete',
          desc: this.$t('operation_log_migration_delete_tip'),
        },
        {
          label: this.$t('operation_log_migration_stop'),
          value: 'sync&&stop',
          desc: this.$t('operation_log_migration_stop_tip'),
        },
        {
          label: this.$t('operation_log_migration_forceStop'),
          value: 'sync&&forceStop',
          desc: this.$t('operation_log_migration_forceStop_tip'),
        },
        // Agent
        {
          label: this.$t('public_agent_button_create'),
          value: 'agent&&create',
          desc: this.$t('operation_log_agent_create_tip'),
        },
        {
          label: this.$t('operation_log_agent_delete'),
          value: 'agent&&delete',
          desc: this.$t('operation_log_agent_delete_tip'),
        },
        {
          label: this.$t('operation_log_agent_stop'),
          value: 'agent&&stop',
          desc: this.$t('operation_log_agent_stop_tip'),
        },
        {
          label: this.$t('operation_log_agent_rename'),
          value: 'agent&&rename',
          desc: this.$t('operation_log_agent_rename_tip'),
        },
        {
          label: this.$t('operation_log_agent_update'),
          value: 'agent&&update',
          desc: this.$t('operation_log_agent_update_tip'),
        },
        {
          label: this.$t('operation_log_agent_start'),
          value: 'agent&&start',
          desc: this.$t('operation_log_agent_start_tip'),
        },
        {
          label: this.$t('operation_log_agent_restart'),
          value: 'agent&&restart',
          desc: this.$t('operation_log_agent_restart_tip'),
        },
        // 校验
        {
          label: this.$t('operation_log_inspect_create'),
          value: 'inspect&&create',
          desc: this.$t('operation_log_inspect_create_tip'),
        },
        {
          label: this.$t('operation_log_inspect_start'),
          value: 'inspect&&start',
          desc: this.$t('operation_log_inspect_start_tip'),
        },
        {
          label: this.$t('operation_log_inspect_update'),
          value: 'inspect&&update',
          desc: this.$t('operation_log_inspect_update_tip'),
        },
        {
          label: this.$t('operation_log_inspect_delete'),
          value: 'inspect&&delete',
          desc: this.$t('operation_log_inspect_delete_tip'),
        },
        // 二次校验
        {
          label: this.$t('operation_log_difference_inspect_start'),
          value: 'differenceInspect&&start',
          desc: this.$t('operation_log_difference_inspect_start_tip'),
        },
        // 通知
        {
          label: i18n.t('operation_log_List_yiDuQuanBuTong'),
          value: 'message&&readAll',
          desc: i18n.t('operation_log_List_sheZhiQuanBuTong'),
        },
        {
          label: i18n.t('operation_log_List_shanChuQuanBuTong'),
          value: 'message&&deleteAll',
          desc: i18n.t('operation_log_List_shanChuLeQuanBu'),
        },
        {
          label: i18n.t('operation_log_List_biaoJiTongZhiWei'),
          value: 'message&&read',
          desc: i18n.t('operation_log_List_jiangXuanZhongDeTong2'),
        },
        {
          label: i18n.t('operation_log_List_shanChuTongZhi'),
          value: 'message&&delete',
          desc: i18n.t('operation_log_List_jiangXuanZhongDeTong'),
        },
        {
          label: i18n.t('operation_log_List_xiuGaiTongZhiShe'),
          value: 'userNotification&&update',
          desc: i18n.t('operation_log_List_xiuGaiLeXiTong'),
        },
        // 用户中心
        // { label: '修改昵称', value: 'user&&update_nickname', desc: '修改了昵称' },
        {
          label: i18n.t('operation_log_List_xiuGaiYongHuXin'),
          value: 'user&&update',
          desc: i18n.t('operation_log_List_xiuGaiLeYongHu'),
        },
        {
          label: i18n.t('operation_log_List_bangDingShouJiHao'),
          value: 'user&&bind_phone',
          desc: i18n.t('operation_log_List_bangDingLeShouJi'),
        },
        {
          label: i18n.t('operation_log_List_xiuGaiShouJiHao'),
          value: 'user&&update_phone',
          desc: i18n.t('operation_log_List_xiuGaiLeShouJi'),
        },
        {
          label: i18n.t('operation_log_List_bangDingYouXiang'),
          value: 'user&&bind_email',
          desc: i18n.t('operation_log_List_bangDingLeYouXiang'),
        },
        {
          label: i18n.t('operation_log_List_xiuGaiYouXiang'),
          value: 'user&&update_email',
          desc: i18n.t('operation_log_List_xiuGaiLeYouXiang'),
        },
        {
          label: i18n.t('operation_log_List_xiuGaiMiMa'),
          value: 'user&&reset_password',
          desc: i18n.t('operation_log_List_xiuGaiLeMiMa'),
        },
        // { label: '修改头像', value: 'user&&update_avatar', desc: '修改了头像' },
        {
          label: i18n.t('operation_log_List_xiuGaiQiYeXin'),
          value: 'customer&&update',
          desc: i18n.t('operation_log_List_xiuGaiLeQiYe'),
        },
      ],
      columns: [
        {
          label: i18n.t('operation_log_user_name'),
          prop: 'username',
          minWidth: 160,
        },
        {
          label: i18n.t('operation_log_List_caoZuoShiJian'),
          prop: 'createTime',
          dataType: 'time',
          width: 180,
        },
        {
          label: i18n.t('operation_log_List_caoZuoDuiXiang'),
          prop: 'parameter1',
          width: 350,
        },
        {
          label: i18n.t('operation_log_List_caoZuoLeiXing'),
          prop: 'operationType',
          slotName: 'operationType',
          width: 140,
        },
        {
          label: i18n.t('operation_log_List_caoZuoMiaoShu'),
          prop: 'desc',
          slotName: 'desc',
          minWidth: 340,
        },
      ],
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
    isSearching() {
      return !!Object.values(this.searchParams).join('')
    },
  },
  watch: {
    $route(route) {
      if (route.name === 'OperationLog') {
        const query = route.query
        this.searchParams = Object.assign(this.searchParams, query)
        const pageNum = isEmpty(query) ? undefined : 1
        this.table.fetch(pageNum)
      }
    },
  },
  created() {
    const query = this.$route.query
    this.searchParams = Object.assign(this.searchParams, query)
    this.getSearchItems()
  },
  methods: {
    getModularAndOperation(operationType) {
      const [modular, operation] = operationType.split('&&')
      return { modular, operation }
    },
    search(debounce) {
      const { searchParams } = this
      const query = {}
      for (const key in searchParams) {
        if (searchParams[key]) {
          query[key] = searchParams[key]
        }
      }
      delayTrigger(() => {
        this.$router.replace({
          name: 'OperationLog',
          query,
        })
      }, debounce)
    },
    getSearchItems() {
      this.filterItems = [
        {
          label: i18n.t('operation_log_List_caoZuoLeiXing'),
          key: 'operationType',
          type: 'select-inner',
          items: this.operationTypeOptions,
        },
        {
          label: i18n.t('operation_log_List_caoZuoShiJian'),
          key: 'start,end',
          type: 'datetimerange',
        },
        {
          placeholder: i18n.t('operation_log_List_caoZuoDuiXiang'),
          key: 'parameter1',
          type: 'input',
        },
        {
          placeholder: i18n.t('operation_log_List_yongHuMingCheng'),
          key: 'username',
          type: 'input',
        },
      ]
    },
    getData({ page }) {
      const { current, size } = page
      const { operationType, parameter1, start, end, username } =
        this.searchParams
      const where = {
        type: 'userOperation', // 默认用户操作
      }
      // 操作类型
      if (operationType) {
        const { modular, operation } =
          this.getModularAndOperation(operationType)
        where.modular = modular
        where.operation = operation
      }
      // 操作对象
      if (parameter1) {
        where.parameter1 = {
          $regex: escapeRegExp(parameter1),
          $options: 'i',
        }
      }
      if (username) {
        where.username = { $regex: escapeRegExp(username), $options: 'i' }
      }
      const dateObj = {}
      // 开始时间
      if (start) {
        dateObj.$gt = {
          $date: start,
        }
      }
      if (end) {
        dateObj.$lt = {
          $date: end,
        }
      }
      if (!isEmpty(dateObj)) {
        where.createTime = dateObj
      }
      const filter = {
        where,
        limit: size,
        skip: size * (current - 1),
        order: this.order,
      }
      return this.$axios
        .get(
          `tm/api/UserLogs?filter=${encodeURIComponent(
            JSON.stringify(filter),
          )}`,
        )
        .then(({ total, items }) => {
          return {
            total,
            data: items.map((t) => {
              if (t.modular === 'user') {
                t.parameter1 = this.$t('operation_log_modular_name_user_center')
              }
              return t
            }),
          }
        })
    },
    sortChange({ prop, order }) {
      this.order = `${order ? prop : 'createTime'} ${order === 'ascending' ? 'asc' : 'desc'}`
      this.table.fetch(1)
    },
    getOperationTypeLabel(row) {
      return this.operationTypeOptions.find(
        (item) => item.value === `${row.modular}&&${row.operation}`,
      )?.label
    },
    descFnc(row) {
      const { modular, operation, rename } = row
      const findOne = this.operationTypeOptions.find(
        (item) => item.value === `${modular}&&${operation}`,
      )
      let desc = findOne?.desc ?? ''
      if (modular === 'connection' && operation === 'update' && rename) {
        desc = this.$t('operation_log_modify_connection_name')
      }
      // 不添加事件  ${parameter1} ${parameter2}  添加事件@{parameter1} @{parameter2}
      const replaceStr = desc.replaceAll(
        /\$\{(parameter\d+)\}/gi,
        (item, subItem) => {
          return row[subItem]
        },
      ) // 替换掉所有${}
      const vReg = /(@\{parameter\d+\})/gi
      // 根据@{}分割，保留分割符
      return replaceStr.split(vReg).map((item) => {
        // @{}添加标记，做事件处理
        if (vReg.test(item)) {
          return {
            text: row[item.match(/\w+/g)?.[0]],
            variable: true,
          }
        }
        return {
          text: item,
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
      const { modular, parameter1 } = row
      switch (modular) {
        // 任务
        case 'migration':
          this.$router.push({
            name: 'migrateList',
            query: {
              status: '',
              syncType: '',
              agentId: '',
              keyword: parameter1,
            },
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
              keyword: parameter1,
            },
          })
          break
        // 连接
        case 'connection':
          this.$router.push({
            name: 'connections',
            query: {
              status: '',
              keyword: parameter1,
            },
          })
          break
        // Agent
        case 'agent':
          this.$router.push({
            name: 'Instance',
            query: {
              status: '',
              keyword: parameter1,
            },
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
        username: '',
      }
      this.search()
    },
  },
}
</script>

<template>
  <PageContainer>
    <section class="operation-logs-wrapper">
      <div class="main">
        <div class="list-operation">
          <div class="list-operation-left">
            <FilterBar
              v-model:value="searchParams"
              :items="filterItems"
              @search="search"
              @fetch="table.fetch(1)"
            />
          </div>
        </div>
        <VTable
          ref="table"
          row-key="id"
          :columns="columns"
          :remote-method="getData"
          height="100%"
          class="mt-4"
          @sort-change="sortChange"
        >
          <template #operationType="scope">
            <div class="text-break">{{ getOperationTypeLabel(scope.row) }}</div>
          </template>
          <template #desc="scope">
            <span
              v-for="(item, index) in descFnc(scope.row)"
              :key="index"
              :class="[{ 'color-primary cursor-pointer': item.variable }]"
              @click="clickDescSpan(item, scope.row)"
            >
              {{ item.text || '' }}
            </span>
          </template>
          <template #empty>
            <div v-if="!isSearching" class="migration-table__empty">
              <VIcon size="120">no-data-color</VIcon>
              <div
                class="flex justify-content-center align-items-center lh-sm fs-7 font-color-sub"
              >
                <span>{{ $t('public_data_no_data') }}</span>
              </div>
            </div>
            <div v-else class="migration-table__empty">
              <VIcon size="120">search-no-data-color</VIcon>
              <div
                class="flex justify-content-center align-items-center lh-sm fs-7 font-color-sub"
              >
                <span style="line-height: 20px">{{
                  $t('public_data_no_find_result')
                }}</span>
                <ElLink type="primary" class="fs-7" @click="reset">{{
                  $t('link_back_to_list')
                }}</ElLink>
              </div>
            </div>
          </template>
        </VTable>
      </div>
    </section>
  </PageContainer>
</template>

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
:deep(.el-dropdown-menu__item.dropdown-item--disabled) {
  color: var(--color-disable);
  cursor: default;
  &:hover {
    background: unset;
    color: var(--color-disable);
  }
}
</style>
