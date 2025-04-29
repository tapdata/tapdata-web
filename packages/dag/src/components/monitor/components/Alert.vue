<script>
import { alarmApi } from '@tap/api'
import { ALARM_LEVEL_MAP, ALARM_STATUS_MAP } from '@tap/business'

import { OverflowTooltip, SelectList, VIcon, VTable } from '@tap/component'

import i18n from '@tap/i18n'
import { mapGetters } from 'vuex'
import { $emit, $off, $on, $once } from '../../../../utils/gogocodeTransfer'

export default {
  name: 'Alert',
  components: { VIcon, VTable, OverflowTooltip, SelectList },
  props: {
    dataflow: {
      type: Object,
      default: () => {},
    },
    logsData: {
      type: Object,
      default: () => {
        return {
          total: 0,
          items: [],
        }
      },
    },
    alarmData: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      activeNodeId: 'all',
      form: {
        level: '',
        status: '',
      },
      columns: [
        {
          label: i18n.t('packages_dag_components_alert_gaojingjibie'),
          prop: 'level',
          slotName: 'levelSlot',
          width: 120,
        },
        {
          label: i18n.t('packages_dag_components_alert_gaojingzhuangtai'),
          prop: 'statusLabel',
          width: 100,
        },
        {
          label: i18n.t('packages_dag_components_alert_gaojingmiaoshu'),
          prop: 'summary',
          minWidth: 120,
        },
        {
          label: i18n.t('packages_dag_components_alert_gaojingshoucifa'),
          prop: 'firstOccurrenceTime',
          dataType: 'time',
          width: 180,
        },
        {
          label: i18n.t('packages_dag_components_alert_gaojingzuijinfa'),
          prop: 'lastOccurrenceTime',
          dataType: 'time',
          width: 180,
        },
        // {
        //   label: i18n.t('packages_dag_components_alert_gaojingfashengci'),
        //   prop: 'tally',
        //   dataType: 'number'
        // },
        {
          label: i18n.t('public_operation'),
          slotName: 'operation',
          // fixed: 'right',
          width: 150,
        },
      ],
      list: [],
    }
  },
  computed: {
    ...mapGetters('dataflow', ['allNodes']),

    levelItems() {
      const result = [
        {
          label: i18n.t('public_select_option_all'),
          value: '',
        },
      ]
      for (const key in ALARM_LEVEL_MAP) {
        result.push({
          label: ALARM_LEVEL_MAP[key].text,
          value: key,
        })
      }
      return result
    },

    statusItems() {
      const result = [
        {
          label: i18n.t('public_select_option_all'),
          value: '',
        },
      ]
      for (const key in ALARM_STATUS_MAP) {
        result.push({
          label: ALARM_STATUS_MAP[key].text,
          value: key,
        })
      }
      return result
    },

    items() {
      const nodeMap =
        this.alarmData?.nodeInfos?.reduce((cur, next) => {
          next.num = 0
          return { ...cur, [next.nodeId]: next }
        }, {}) || {}
      const alarmList = this.alarmData?.alarmList || []
      const totals = alarmList.length
      alarmList.forEach((el) => {
        if (el.nodeId) {
          nodeMap[el.nodeId].num++
        }
      })
      return [
        {
          label: i18n.t('packages_dag_components_alert_quanbugaojing'),
          value: 'all',
          num: totals,
        },
        ...this.allNodes
          .map((t) => {
            return {
              label: t.name,
              value: t.id,
              source: t.$outputs.length > 0,
              target: t.$inputs.length > 0,
              num: nodeMap[t.id]?.num || 0,
            }
          })
          .filter((t) => t.num),
      ]
    },
  },
  watch: {
    alarmData: {
      deep: true,
      handler() {
        this.getList()
      },
    },
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
        data = data.filter((t) => t.nodeId === activeNodeId)
      }
      if (level) {
        data = data.filter((t) => t.level === level)
      }
      if (status) {
        data = data.filter((t) => t.status === status)
      }
      this.list =
        data.map((t) => {
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
        this.$message.success(
          i18n.t('packages_dag_components_alert_guanbichenggong'),
        )
        $emit(this, 'load-data')
      })
    },

    handleLog(row = {}) {
      const params = {
        start: row.lastOccurrenceTime,
        nodeId: row.nodeId,
      }
      $emit(this, 'change-tab', 'log', params)
    },
  },
  emits: ['change-tab', 'load-data'],
}
</script>

<template>
  <div class="log-container flex justify-content-between">
    <div class="filter-items border-end flex-shrink-0">
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="[{ active: activeNodeId === item.value }]"
        class="filter-items__item flex justify-content-between align-items-center"
        @click="changeItem(item)"
      >
        <div class="flex flex-fill w-0" style="width: 0">
          <OverflowTooltip
            class="text-truncate"
            placement="right"
            :text="item.label"
            :open-delay="400"
          />
          <span class="ml-1">{{ `(${item.num})` }}</span>
        </div>
        <div><VIcon>arrow-right</VIcon></div>
      </div>
    </div>
    <div class="main alert-main flex-fill flex flex-column pt-5">
      <div class="flex ml-4 mb-4 align-items-center gap-4">
        <SelectList
          ref="select"
          v-model="form.level"
          :empty-values="[undefined]"
          :label="$t('packages_dag_components_alert_gaojingjibie')"
          :items="levelItems"
          @change="getList"
        />
        <SelectList
          v-model="form.status"
          :empty-values="[undefined]"
          :label="$t('packages_dag_components_alert_gaojingzhuangtai')"
          :items="statusItems"
          @change="getList"
        />
      </div>
      <VTable
        ref="table"
        :columns="columns"
        :data="list"
        :page-options="{
          layout: 'total, ->, prev, pager, next, sizes, jumper',
        }"
        height="100"
        class="table-list"
        hide-on-single-page
      >
        <template #levelSlot="scope">
          <span :class="[`status-${scope.row.levelType}`, 'status-block']">
            {{ scope.row.levelLabel }}
          </span>
        </template>
        <template #operation="scope">
          <div class="operate-columns flex flex-wrap">
            <ElButton
              class="ml-0"
             
              text type="primary"
              @click="handleLog(scope.row)"
              >{{ $t('packages_dag_monitor_bottompanel_rizhi') }}</ElButton
            >
            <ElButton
              class="ml-0"
             
              text type="primary"
              :disabled="scope.row.status === 'CLOESE'"
              @click="handleClose(scope.row)"
              >{{ $t('public_button_close') }}</ElButton
            >
          </div>
        </template>
      </VTable>
    </div>
  </div>
</template>

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

  :deep(.log-line) {
    font-family:
      'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  }

  :deep(.highlight-bg-color) {
    background-color: #ff0;
  }

  :deep(.empty-wrap) {
    margin: 24px 0;
  }
}
.no-more__alert {
  margin-left: -70px;
  top: 4px;
  left: 50%;
  width: 140px;

  :deep(.el-alert__closebtn) {
    top: 7px;
  }
}
.operate-columns {
  column-gap: 8px;
  row-gap: 0;
}
.operate-columns {
  column-gap: 8px;
  row-gap: 0;
}
</style>
