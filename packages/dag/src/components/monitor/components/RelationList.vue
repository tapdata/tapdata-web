<template>
  <div class="log-container flex justify-content-between">
    <div class="flex flex-column pt-5 w-100">
      <FilterBar
        v-model="searchParams"
        :items="filterItems"
        :change-route="false"
        @search="handleSearch"
        @fetch="handleFetch"
      ></FilterBar>
      <VTable
        :columns="columns"
        :data="list"
        :page-options="{
          layout: 'total, ->, prev, pager, next, sizes, jumper'
        }"
        ref="table"
        height="100"
        class="table-list"
        hide-on-single-page
      >
        <template slot="status" slot-scope="scope">
          <TaskStatus :task="scope.row" />
        </template>
        <template slot="levelSlot" slot-scope="scope">
          <span :class="['status-' + scope.row.levelType, 'status-block']">
            {{ scope.row.levelLabel }}
          </span>
        </template>
        <template slot="operation" slot-scope="scope" fixed="right">
          <div class="operate-columns">
            <ElButton
              size="mini"
              type="text"
              :disabled="scope.row.status === 'CLOESE'"
              @click="handleClose(scope.row)"
              >{{ $t('packages_dag_components_alert_guanbi') }}</ElButton
            >
            <ElButton size="mini" type="text" @click="handleLog(scope.row)">{{
              $t('packages_dag_monitor_bottompanel_rizhi')
            }}</ElButton>
          </div>
        </template>
      </VTable>
    </div>
  </div>
</template>

<script>
import i18n from '@tap/i18n'

import { mapGetters } from 'vuex'

import { VTable, FilterBar, DarkSelect } from '@tap/component'
import { ALARM_LEVEL_MAP, ALARM_STATUS_MAP, TaskStatus } from '@tap/business'
import { alarmApi } from '@tap/api'

export default {
  name: 'Alert',

  components: { VTable, FilterBar, DarkSelect, TaskStatus },

  props: {
    dataflow: {
      type: Object,
      default: () => {}
    },
    logsData: {
      type: Object,
      default: () => {
        return {
          total: 0,
          items: []
        }
      }
    }
  },

  data() {
    return {
      searchParams: {
        taskType: '',
        taskStatus: '',
        taskName: ''
      },
      filterItems: [],
      activeNodeId: 'all',
      form: {
        level: '',
        status: ''
      },
      columns: [
        {
          label: '任务名称',
          prop: 'taskName',
          width: 120
        },
        {
          label: '任务类型',
          prop: 'taskType',
          width: 80
        },
        {
          label: '任务状态',
          prop: 'status',
          slotName: 'status'
        },
        {
          label: '启动时间',
          prop: 'startTime',
          dataType: 'time',
          width: 150
        },
        {
          label: '操作',
          slotName: 'operation',
          fixed: 'right',
          width: 150
        }
      ],
      list: [],
      taskTypesItems: [
        {
          label: '挖掘任务',
          value: '挖掘任务'
        },
        {
          label: '校验任务',
          value: '校验任务'
        },
        {
          label: '缓存任务',
          value: '缓存任务'
        },
        {
          label: '精准延时',
          value: '精准延时'
        }
      ],
      taskStatusItems: [
        {
          label: '挖掘任务',
          value: '挖掘任务'
        },
        {
          label: '校验任务',
          value: '校验任务'
        },
        {
          label: '缓存任务',
          value: '缓存任务'
        },
        {
          label: '精准延时',
          value: '精准延时'
        }
      ]
    }
  },

  computed: {
    ...mapGetters('dataflow', ['allNodes']),

    levelItems() {
      let result = [
        {
          label: i18n.t('packages_dag_components_log_quanbu'),
          value: ''
        }
      ]
      for (let key in ALARM_LEVEL_MAP) {
        result.push({
          label: ALARM_LEVEL_MAP[key].text,
          value: key
        })
      }
      return result
    },

    statusItems() {
      let result = [
        {
          label: i18n.t('packages_dag_components_log_quanbu'),
          value: ''
        }
      ]
      for (let key in ALARM_STATUS_MAP) {
        result.push({
          label: ALARM_STATUS_MAP[key].text,
          value: key
        })
      }
      return result
    },

    items() {
      const nodeMap =
        this.alarmData?.nodeInfos?.reduce((cur, next) => {
          return { ...cur, [next.nodeId]: next }
        }, {}) || {}
      const totals =
        this.alarmData?.nodeInfos?.reduce((cur, next) => {
          return cur + (next.num || 0)
        }, 0) || 0
      return [
        {
          label: '全部告警',
          value: 'all',
          num: totals
        },
        ...this.allNodes
          .map(t => {
            return {
              label: t.name,
              value: t.id,
              source: t.$outputs.length > 0,
              target: t.$inputs.length > 0,
              num: nodeMap[t.id]?.num || 0
            }
          })
          .filter(t => t.num)
      ]
    }
  },

  watch: {
    alarmData: {
      deep: true,
      handler() {
        this.init()
      }
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    init() {
      this.getSearchItems()
      this.getList()
    },

    getSearchItems() {
      this.filterItems = [
        {
          label: '任务类型',
          key: 'taskType',
          type: 'dark-select',
          items: [
            {
              label: '挖掘任务',
              value: '挖掘任务'
            },
            {
              label: '校验任务',
              value: '校验任务'
            },
            {
              label: '缓存任务',
              value: '缓存任务'
            },
            {
              label: '精准延时',
              value: '精准延时'
            }
          ]
        },
        {
          label: '任务状态',
          key: 'taskStatus',
          type: 'dark-select',
          items: [
            {
              label: '挖掘任务',
              value: '挖掘任务'
            },
            {
              label: '校验任务',
              value: '校验任务'
            },
            {
              label: '缓存任务',
              value: '缓存任务'
            },
            {
              label: '精准延时',
              value: '精准延时'
            }
          ]
        },
        {
          placeholder: '请输入任务名称...',
          key: 'taskName',
          type: 'input'
        }
      ]
    },

    getList() {
      let data = [
        {
          taskName: 'taskName',
          taskType: 'taskType',
          status: 'running',
          startTime: Date.now()
        },
        {
          taskName: 'taskName',
          taskType: 'taskType',
          status: 'running',
          startTime: Date.now()
        },
        {
          taskName: 'taskName',
          taskType: 'taskType',
          status: 'stopping',
          startTime: Date.now()
        }
      ]
      this.list = data
    },

    changeItem(item) {
      if (this.activeNodeId === item.value) {
        return
      }
      this.activeNodeId = item.value
      this.getList()
    },

    handleClose(row = {}) {
      alarmApi.close([row.id]).then(() => {
        this.$message.success('关闭成功')
        this.$emit('load-data')
      })
    },

    handleLog(row = {}) {
      this.$emit('change-tab', 'log', row)
    },

    handleFetch() {
      console.log('handleFetch')
      this.$refs.table?.fetch(1)
    },

    handleSearch() {
      console.log('handleSearch', this.searchParams)
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.log-container {
  height: inherit;
}
.white-space-nowrap {
  white-space: nowrap;
}

.log-list {
  border-radius: 1px;
  background-color: rgba(229, 236, 255, 0.22);
  ::v-deep {
    .log-line {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    }
    .highlight-bg-color {
      background-color: #ff0;
    }
    .empty-wrap {
      margin: 24px 0;
    }
  }
}
.no-more__alert {
  margin-left: -70px;
  top: 4px;
  left: 50%;
  width: 140px;
  ::v-deep {
    .el-alert__closebtn {
      top: 7px;
    }
  }
}
</style>
