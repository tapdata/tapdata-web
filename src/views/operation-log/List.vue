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
          <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
            <span>{{ $t('gl_no_data') }}</span>
          </div>
        </div>
        <div v-else class="migration-table__empty" slot="empty">
          <VIcon size="120">search-no-data-color</VIcon>
          <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
            <span>{{ $t('gl_no_match_result') }}</span>
            <el-link type="primary" class="fs-7" @click="reset">{{ $t('gl_back_to_list') }}</el-link>
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
        { label: '创建连接', value: 'connection_create', desc: '创建了连接【@{parameter1}】' },
        { label: '编辑连接', value: 'connection_update', desc: '编辑了连接【@{parameter1}】的配置信息' },
        { label: '复制连接', value: 'connection_copy', desc: '复制了连接[${parameter1}]为【@{parameter2}】' },
        { label: '删除连接', value: 'connection_delete', desc: '删除了连接【${parameter1}】' },
        // 任务
        { label: '创建任务', value: 'migration_create', desc: '创建了任务【@{parameter1}】' },
        { label: '启动任务', value: 'migration_start', desc: '启动了任务【@{parameter1}】' },
        { label: '编辑任务', value: 'migration_update', desc: '编辑了任务【@{parameter1}】的配置信息' },
        { label: '复制任务', value: 'migration_copy', desc: '复制了任务[${parameter2}] 为【@{parameter1}】' },
        { label: '重置任务', value: 'migration_reset', desc: '重置了任务【@{parameter1}】' },
        { label: '删除任务', value: 'migration_delete', desc: '删除了任务【${parameter1}】' },
        { label: '停止任务', value: 'migration_stop', desc: '停止了任务【@{parameter1}】' },
        { label: '强制停止任务', value: 'migration_forceStop', desc: '强制停止了任务【@{parameter1}】' },
        // Agent
        { label: '修改Agent名称', value: 'agent_rename', desc: '将Agent名称[${parameter2}]修改为【@{parameter1}】' },
        { label: 'Agent升级', value: 'agent_update', desc: '进行了Agent升级' },
        // 校验
        { label: '新建数据校验', value: 'inspect_create', desc: '新建了数据校验任务【@{parameter1}】' },
        { label: '执行数据校验', value: 'inspect_start', desc: '执行数据校验任务【@{parameter1}】' },
        { label: '编辑数据校验', value: 'inspect_update', desc: '编辑了数据校验任务【@{parameter1}】' },
        { label: '删除数据校验', value: 'inspect_delete', desc: '删除了数据校验任务【${parameter1}】' },
        // 二次校验
        {
          label: '执行差异校验',
          value: 'differenceInspect_start',
          desc: '对数据校验任务【@{parameter1}】执行了差异校验'
        },
        // 通知
        { label: '已读全部通知', value: 'message_readAll', desc: '设置全部通知为已读' },
        { label: '删除全部通知', value: 'message_deleteAll', desc: '删除了全部通知' },
        { label: '标记通知为已读', value: 'message_read', desc: '将选中的通知全部标记为已读' },
        { label: '删除通知', value: 'message_delete', desc: '将选中的通知全部删除' },
        { label: '修改通知设置', value: 'userNotification_update', desc: '修改了系统通知设置' }
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
      let [modular, operation] = operationType.split('_')
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
          options: this.operationTypeOptions
        },
        {
          label: '操作对象',
          key: 'parameter1',
          type: 'input-pop'
        },
        {
          label: '操作时间',
          key: 'start,end',
          type: 'datetimerange'
        },
        {
          label: '用户名称',
          key: 'username',
          type: 'input-pop'
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
        where['parameter1'] = { like: toRegExp(parameter1), options: 'i' }
      }
      if (username) {
        where['username'] = { like: toRegExp(username), options: 'i' }
      }
      // 开始时间
      if (start) {
        where['start'] = start
      }
      if (end) {
        where['end'] = end
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
      return this.operationTypeOptions.find(item => item.value === `${row.modular}_${row.operation}`)?.label
    },
    descFnc(row) {
      let { modular, operation, rename } = row
      let findOne = this.operationTypeOptions.find(item => item.value === `${modular}_${operation}`)
      let desc = findOne?.desc ?? ''
      if (modular === 'connection' && operation === 'update' && rename) {
        desc = '将连接名称由[${parameter2}]修改为【@{parameter1}】'
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
    },
    startGreaterThanEndFnc() {
      let flag = false
      let { start, end } = this.searchParams
      if (start && end && start > end) {
        flag = '【结束时间】不能小于【开始时间】'
      }
      return flag
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
