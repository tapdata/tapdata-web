<template>
  <div class="log-container flex justify-content-between">
    <div class="filter-items border-end">
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="[{ active: activeNodeId === item.value }]"
        class="filter-items__item flex justify-content-between align-items-center"
        @click="changeItem(item)"
      >
        <div class="flex flex-fill w-0" style="width: 0">
          <OverflowTooltip class="text-truncate" placement="right" :text="item.label" :open-delay="400" />
          <span class="ml-1">{{ `(${item.num})` }}</span>
        </div>
        <div><VIcon>arrow-right</VIcon></div>
      </div>
    </div>
    <div class="main flex-fill flex flex-column pt-5">
      <div class="flex ml-4 mb-4 align-items-center">
        <div>
          <span>{{ $t('packages_dag_components_alert_gaojingjibie') }}</span>
          <ElSelect
            v-model="form.level"
            :popper-append-to-body="false"
            popper-class="time-select__popper"
            class="ml-2 dark"
            size="mini"
            ref="select"
            @change="getList"
          >
            <ElOption
              v-for="(item, index) in levelItems"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></ElOption>
          </ElSelect>
        </div>
        <div class="ml-4">
          <span>{{ $t('packages_dag_components_alert_gaojingzhuangtai') }}</span>
          <ElSelect
            v-model="form.status"
            :popper-append-to-body="false"
            popper-class="time-select__popper"
            class="ml-2 dark"
            size="mini"
            ref="select"
            @change="getList"
          >
            <ElOption
              v-for="(item, index) in statusItems"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></ElOption>
          </ElSelect>
        </div>
      </div>
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

import { VIcon, VTable, OverflowTooltip } from '@tap/component'
import { ALARM_LEVEL_MAP, ALARM_STATUS_MAP } from '@tap/business'
import { alarmApi } from '@tap/api'

export default {
  name: 'Alert',

  components: { VIcon, VTable, OverflowTooltip },

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
    },
    alarmData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data() {
    return {
      activeNodeId: 'all',
      form: {
        level: '',
        status: ''
      },
      columns: [
        {
          label: i18n.t('packages_dag_components_alert_gaojingjibie'),
          prop: 'level',
          slotName: 'levelSlot',
          width: 120
        },
        {
          label: i18n.t('packages_dag_components_alert_gaojingzhuangtai'),
          prop: 'statusLabel',
          width: 80
        },
        {
          label: i18n.t('packages_dag_components_alert_gaojingmiaoshu'),
          prop: 'summary'
        },
        // {
        //   label: i
        //   18n.t('packages_dag_components_alert_gaojingshoucifa'),
        //   prop: 'first_occurrence_time',
        //   dataType: 'time'
        // },
        {
          label: i18n.t('packages_dag_components_alert_gaojingzuijinfa'),
          prop: 'lastOccurrenceTime',
          dataType: 'time',
          width: 150
        },
        // {
        //   label: i18n.t('packages_dag_components_alert_gaojingfashengci'),
        //   prop: 'tally',
        //   dataType: 'number'
        // },
        {
          label: i18n.t('packages_dag_components_record_caozuo'),
          slotName: 'operation',
          fixed: 'right',
          width: 150
        }
      ],
      list: []
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
      let nodeMap =
        this.alarmData?.nodeInfos?.reduce((cur, next) => {
          next.num = 0
          return { ...cur, [next.nodeId]: next }
        }, {}) || {}
      const alarmList = this.alarmData?.alarmList || []
      const totals = alarmList.length
      alarmList.forEach(el => {
        if (el.nodeId) {
          nodeMap[el.nodeId].num++
        }
      })
      return [
        {
          label: i18n.t('packages_dag_components_alert_quanbugaojing'),
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
        this.getList()
      }
    }
  },

  mounted() {
    this.getList()
  },

  methods: {
    getList() {
      let data = this.alarmData?.alarmList || []
      const { activeNodeId } = this
      const { level, status } = this.form
      if (activeNodeId !== 'all') {
        data = data.filter(t => t.nodeId === activeNodeId)
      }
      if (level) {
        data = data.filter(t => t.level === level)
      }
      if (status) {
        data = data.filter(t => t.status === status)
      }
      this.list =
        data.map(t => {
          t.levelLabel = ALARM_LEVEL_MAP[t.level].text
          t.levelType = ALARM_LEVEL_MAP[t.level].type
          t.statusLabel = ALARM_STATUS_MAP[t.status].text
          return t
        }) || []
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
        this.$message.success(i18n.t('packages_dag_components_alert_guanbichenggong'))
        this.$emit('load-data')
      })
    },

    handleLog(row = {}) {
      const params = {
        start: row.lastOccurrenceTime,
        nodeId: row.nodeId
      }
      this.$emit('change-tab', 'log', params)
    }
  }
}
</script>

<style lang="scss" scoped>
.log-container {
  height: inherit;
}
.filter-items {
  width: 200px;
  user-select: none;
}
.filter-items__item {
  padding: 0 16px;
  height: 40px;
  cursor: pointer;
  &.active {
    background: rgba(44, 101, 255, 0.05);
  }
}
.main {
  width: 0;
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
