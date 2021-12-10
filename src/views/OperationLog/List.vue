<template>
  <section class="operation-logs-wrapper main-container" v-if="$route.name === 'OperationLog'">
    <div class="main">
      <div class="list-operation">
        <div class="list-operation-left">
          <el-form inline @submit.native.prevent>
            <el-form-item :label="$t('operation_log_type') + ':'" class="small">
              <el-select v-model="searchParams.operationType" clearable @input="search()">
                <el-option
                  v-for="(item, key) in operationTypeOptions"
                  :key="key"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('operation_log_Object') + ':'" class="small">
              <el-input v-model="searchParams.parameter1" clearable @input="search(800)">
                <VIcon slot="prefix" size="14" class="ml-1" style="height: 100% !important">search</VIcon>
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('operation_log_start_time') + ':'">
              <el-datePicker
                v-model="searchParams.start"
                type="datetime"
                :placeholder="$t('operation_log_start_time')"
                value-format="timestamp"
                @change="search()"
              ></el-datePicker>
            </el-form-item>
            <el-form-item :label="$t('operation_log_end_time') + ':'">
              <el-tooltip
                placement="top"
                manual
                popper-class="copy-tooltip"
                :content="$t('operation_log_time_tip')"
                :value="startGreaterThanEnd"
              >
                <el-datePicker
                  v-model="searchParams.end"
                  type="datetime"
                  placeholder="结束时间"
                  value-format="timestamp"
                  @change="search()"
                ></el-datePicker>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('operation_log_user_name') + ':'" class="medium">
              <el-input v-model="searchParams.username" clearable @input="search(800)">
                <VIcon slot="prefix" size="14" class="ml-1" style="height: 100% !important">search</VIcon>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button plain class="btn-refresh" @click="table.fetch(1)">
                <VIcon>refresh</VIcon>
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <VList ref="table" row-key="id" :remoteMethod="getData" @sort-change="sortChange">
        <el-table-column :label="$t('operation_log_username')" min-width="160">
          <template slot-scope="scope">
            <div>{{ scope.row.username }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operation_log_time')" prop="createTime" sortable="custom" width="180">
          <template slot-scope="scope">
            <div>{{ $moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip :label="$t('operation_log_Object')" width="350">
          <template slot-scope="scope">
            <div class="ellipsis">{{ scope.row.parameter1 }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operation_log_type')" width="120">
          <template slot-scope="scope">
            <div>{{ getOperationTypeLabel(scope.row) }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operation_log_describe')" min-width="300">
          <template slot-scope="scope">
            <span
              v-for="(item, index) in descFnc(scope.row)"
              :key="index"
              :class="[{ 'color-primary cursor-pointer': item.variable }]"
              @click="clickDescSpan(item, scope.row)"
            >
              {{ item.text || '' }}
            </span>
          </template>
        </el-table-column>
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
      </VList>
    </div>
  </section>
  <RouterView v-else></RouterView>
</template>

<script>
import VIcon from '@/components/VIcon'
import VList from '../../_packages/tapdata-web-core/components/base/VList'
export default {
  components: { VList, VIcon },
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
      operationTypeOptions: [
        // 连接
        {
          label: this.$t('operation_log_connection_create'),
          value: 'connection_create',
          desc: this.$t('operation_log_connection_create_tip')
        },
        {
          label: this.$t('operation_log_connection_update'),
          value: 'connection_update',
          desc: this.$t('operation_log_connection_update_tip')
        },
        {
          label: this.$t('operation_log_connection_copy'),
          value: 'connection_copy',
          desc: this.$t('operation_log_connection_copy_tip')
        },
        {
          label: this.$t('operation_log_connection_delete'),
          value: 'connection_delete',
          desc: this.$t('operation_log_connection_delete_tip')
        },
        // 任务
        {
          label: this.$t('operation_log_migration_create'),
          value: 'migration_create',
          desc: this.$t('operation_log_migration_create_tip')
        },
        {
          label: this.$t('operation_log_migration_start'),
          value: 'migration_start',
          desc: this.$t('operation_log_migration_start_tip')
        },
        {
          label: this.$t('operation_log_migration_update'),
          value: 'migration_update',
          desc: this.$t('operation_log_migration_update_tip')
        },
        {
          label: this.$t('operation_log_migration_copy'),
          value: 'migration_copy',
          desc: this.$t('operation_log_migration_copy_tip')
        },
        {
          label: this.$t('operation_log_migration_reset'),
          value: 'migration_reset',
          desc: this.$t('operation_log_migration_reset_tip')
        },
        {
          label: this.$t('operation_log_migration_delete'),
          value: 'migration_delete',
          desc: this.$t('operation_log_migration_delete_tip')
        },
        {
          label: this.$t('operation_log_migration_stop'),
          value: 'migration_stop',
          desc: this.$t('operation_log_migration_stop_tip')
        },
        {
          label: this.$t('operation_log_migration_forceStop'),
          value: 'migration_forceStop',
          desc: this.$t('operation_log_migration_forceStop_tip')
        },
        // Agent
        {
          label: this.$t('operation_log_agent_rename'),
          value: 'agent_rename',
          desc: this.$t('operation_log_agent_rename_tip')
        },
        {
          label: this.$t('operation_log_agent_update'),
          value: 'agent_update',
          desc: this.$t('operation_log_agent_update_tip')
        },
        // 校验
        {
          label: this.$t('operation_log_inspect_create'),
          value: 'inspect_create',
          desc: this.$t('operation_log_inspect_create_tip')
        },
        {
          label: this.$t('operation_log_inspect_start'),
          value: 'inspect_start',
          desc: this.$t('operation_log_inspect_start_tip')
        },
        {
          label: this.$t('operation_log_inspect_update'),
          value: 'inspect_update',
          desc: this.$t('operation_log_inspect_update_tip')
        },
        {
          label: this.$t('operation_log_inspect_delete'),
          value: 'inspect_delete',
          desc: this.$t('operation_log_inspect_delete_tip')
        },
        // 二次校验
        {
          label: this.$t('operation_log_difference_inspect_start'),
          value: 'differenceInspect_start',
          desc: this.$t('operation_log_difference_inspect_start_tip')
        },
        // 通知
        {
          label: this.$t('operation_log_message_read_all'),
          value: 'message_readAll',
          desc: this.$t('operation_log_message_read_all_tip')
        },
        {
          label: this.$t('operation_log_message_delete_all'),
          value: 'message_deleteAll',
          desc: this.$t('operation_log_message_delete_all_tip')
        },
        {
          label: this.$t('operation_log_message_read'),
          value: 'message_read',
          desc: this.$t('operation_log_message_read_tip')
        },
        {
          label: this.$t('operation_log_message_delete'),
          value: 'message_delete',
          desc: this.$t('operation_log_message_delete_tip')
        },
        {
          label: this.$t('operation_log_modify_notification_setting'),
          value: 'userNotification_update',
          desc: this.$t('operation_log_modify_notification_setting_tip')
        }
      ]
    }
  },
  computed: {
    // 开始时间大于结束时间
    startGreaterThanEnd() {
      let flag = false
      let { start, end } = this.searchParams
      if (start && end && start > end) {
        flag = true
      }
      return flag
    },
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
        let pageNum = JSON.stringify(query) === '{}' ? undefined : 1
        this.table.fetch(pageNum)
      }
    }
  },
  created() {
    let query = this.$route.query
    this.searchParams = Object.assign(this.searchParams, query)
  },
  methods: {
    getModularAndOperation(operationType) {
      let [modular, operation] = operationType.split('_')
      return { modular, operation }
    },
    search(debounce) {
      let { searchParams } = this
      if (this.startGreaterThanEnd) {
        return
      }
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
        skip: (current - 1) * size,
        order: this.order
      }
      return Promise.all([
        this.$axios.get('tm/api/UserLogs?filter=' + encodeURIComponent(JSON.stringify(filter))),
        this.$axios.get('tm/api/UserLogs/count?where=' + encodeURIComponent(JSON.stringify(where)))
      ]).then(([data, countData]) => {
        return {
          total: countData.count,
          data: data
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
    padding: 20px;
    background: #fff;
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
