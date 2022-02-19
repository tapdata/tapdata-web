<template>
  <section class="operation-logs-wrapper g-panel-container" v-if="$route.name === 'OperationLog'">
    <div class="main">
      <div class="list-operation">
        <div class="list-operation-left">
          <FilterBar v-model="searchParams" :items="filterItems" @search="search" @fetch="table.fetch(1)"> </FilterBar>
        </div>
      </div>
      <TableList
        ref="table"
        row-key="id"
        :columns="columns"
        :remoteMethod="getData"
        class="mt-4"
        @sort-change="sortChange"
      >
        <template slot="operationType" slot-scope="scope">
          <div>{{ getOperationTypeLabel(scope.row) }}</div>
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
            <span>{{ $t('gl_no_data') }}</span>
          </div>
        </div>
        <div v-else class="migration-table__empty" slot="empty">
          <VIcon size="120">search-no-data-color</VIcon>
          <div class="flex justify-content-center align-items-center lh-sm fs-7 font-color-sub">
            <span style="line-height: 20px">{{ $t('gl_no_match_result') }}</span>
            <ElLink type="primary" class="fs-7" @click="reset">{{ $t('gl_back_to_list') }}</ElLink>
          </div>
        </div>
      </TableList>
    </div>
  </section>
  <RouterView v-else></RouterView>
</template>

<script>
import VIcon from '@/components/VIcon'
import FilterBar from '@/components/filter-bar'
import TableList from '@/components/TableList'
import { isEmpty } from '@/util'

export default {
  components: { VIcon, FilterBar, TableList },
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
        // Agent
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
        { label: '已读全部通知', value: 'message&&readAll', desc: '设置全部通知为已读' },
        { label: '删除全部通知', value: 'message&&deleteAll', desc: '删除了全部通知' },
        { label: '标记通知为已读', value: 'message&&read', desc: '将选中的通知全部标记为已读' },
        { label: '删除通知', value: 'message&&delete', desc: '将选中的通知全部删除' },
        { label: '修改通知设置', value: 'userNotification&&update', desc: '修改了系统通知设置' },
        // 用户中心
        // { label: '修改昵称', value: 'user&&update_nickname', desc: '修改了昵称' },
        // { label: '绑定手机号', value: 'user&&bind_phone', desc: '绑定了手机号' },
        { label: '修改手机号', value: 'user&&update_phone', desc: '修改了手机号' },
        // { label: '绑定邮箱', value: 'user&&bind_email', desc: '绑定了邮箱' },
        { label: '修改邮箱', value: 'user&&update_email', desc: '修改了邮箱' }
        // { label: '修改密码', value: 'user&&update_password', desc: '修改了密码' },
        // { label: '修改头像', value: 'user&&update_avatar', desc: '修改了头像' },
        // { label: '修改企业信息', value: 'user&&update_enterprise_info', desc: '修改了企业信息' }
      ],
      columns: [
        {
          label: '用户名',
          prop: 'username',
          minWidth: 160
        },
        {
          label: '操作时间',
          prop: 'createTime',
          dataType: 'time',
          width: 180
        },
        {
          label: '操作对象',
          prop: 'parameter1',
          width: 350
        },
        {
          label: '操作类型',
          prop: 'operationType',
          slotName: 'operationType',
          width: 120
        },
        {
          label: '操作描述',
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
      const { delayTrigger } = this.$util
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
          label: '操作类型',
          key: 'operationType',
          type: 'select-inner',
          items: this.operationTypeOptions
        },
        {
          label: '操作时间',
          key: 'start,end',
          type: 'datetimerange'
        },
        {
          placeholder: '操作对象',
          key: 'parameter1',
          type: 'input'
        },
        {
          placeholder: '用户名称',
          key: 'username',
          type: 'input'
        }
      ]
    },
    getData({ page }) {
      const { toRegExp } = this.$util
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
            data: items
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
            name: 'Task',
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
            name: 'Connection',
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
        // 二次校验
        case 'differenceInspect':
          this.$router.push({
            name: 'Verify',
            query: {
              keyword: parameter1
            }
          })
          break
        // 数据校验
        case 'inspect':
          this.$router.push({
            name: 'Verify',
            query: {
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
