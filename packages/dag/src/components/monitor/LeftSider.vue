<template>
  <aside class="layout-sidebar --left border-end flex-column flex-shrink-0">
    <div class="flex flex-column flex-1 min-h-0">
      <div class="info-box">
        <TimeSelect :range="[$attrs.startTime, $attrs.endTime]" @change="changeTimeSelect"></TimeSelect>
      </div>
      <div class="info-box">
        <div class="task-info__row">
          <span class="task-info__label">任务ID：</span>
          <span class="task-info__value">{{ dataflow.id }}</span>
        </div>
        <div class="task-info__row">
          <span class="task-info__label">任务类型：</span>
          <span class="task-info__value">{{ syncType[dataflow.type] }}</span>
        </div>
        <div class="task-info__row">
          <span class="task-info__label">所属FE：</span>
          <span class="task-info__value">{{ dataflow.agentName || '-' }}</span>
        </div>
        <div class="task-info__row">
          <span class="task-info__label">运行状态：</span>
          <span class="task-info__value">
            <span :class="['status-' + dataflow.status, 'status-block']">
              {{ $t('task_preview_status_' + dataflow.status) }}
            </span>
          </span>
        </div>
      </div>
      <div class="info-box">
        <div class="font-color-normal fw-bold mb-2">任务事件统计（条）</div>
        <EventChart :samples="[eventDataAll, eventDataPeriod]"></EventChart>
      </div>
      <div class="info-box">
        <CollapsePanel>
          <template #header>
            <span class="fw-bold font-color-normal">性能指标</span>
          </template>
          <template #header-right>
            <ElTooltip transition="tooltip-fade-in" content="放大">
              <VIcon @click.stop="toFullscreen">fullscreen</VIcon>
            </ElTooltip>
          </template>
          <template #content>
            <LineChart
              :data="qpsData"
              :color="['#26CF6C', '#2C65FF']"
              title="QPS（Q/S）"
              :time-format="timeFormat"
              :limit="20"
              style="height: 140px"
            ></LineChart>
            <LineChart
              :data="delayData"
              title="增量延迟（ms）"
              :color="['#2C65FF']"
              :time-format="timeFormat"
              :limit="20"
              class="mt-4"
              style="height: 140px"
            ></LineChart>
          </template>
        </CollapsePanel>
      </div>
      <div v-if="dataflow.type !== 'cdc'" class="info-box">
        <CollapsePanel>
          <template #header>
            <span class="fw-bold font-color-normal">全量信息</span>
          </template>
          <template #header-right>
            <ElTooltip transition="tooltip-fade-in" content="放大">
              <VIcon @click.stop="toInitialList">menu</VIcon>
            </ElTooltip>
          </template>
          <template #content>
            <div class="mb-4">
              <span>全量完成时间：</span>
              <span>{{ initialData.time }}</span>
            </div>
            <div class="flex justify-content-between">
              <div>
                <div class="text-center">表结构同步</div>
                <Chart :extend="initialStructureOptions" style="width: 140px; height: 200px"></Chart>
              </div>
              <div>
                <div class="text-center">表数据状态</div>
                <Chart ref="chart" :extend="initialDataOptions" style="width: 140px; height: 200px"></Chart>
              </div>
            </div>
          </template>
        </CollapsePanel>
      </div>
      <div v-if="dataflow.type !== 'initial_sync'" class="info-box">
        <CollapsePanel>
          <template #header>
            <span class="fw-bold font-color-normal">增量信息</span>
          </template>
          <template #content>
            <div class="flex justify-content-between mb-2">
              <span>源连接：</span>
              <span class="font-color-normal">{{ cdcData.source }}</span>
            </div>
            <div class="flex justify-content-between mb-2">
              <span>目标连接：</span>
              <span class="font-color-normal">{{ cdcData.target }}</span>
            </div>
            <div class="flex justify-content-between">
              <span>增量时间点：</span>
              <span class="font-color-normal">{{ cdcData.time }}</span>
            </div>
          </template>
        </CollapsePanel>
      </div>
    </div>

    <ElDialog
      title="性能指标"
      width="774px"
      :visible.sync="lineChartDialog"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <LineChart
        :data="qpsData"
        :color="['#26CF6C', '#2C65FF']"
        :limit="20"
        title="QPS（Q/S）"
        :time-format="timeFormat"
        style="height: 200px"
      ></LineChart>
      <LineChart
        :data="delayData"
        :color="['#2C65FF']"
        :limit="20"
        :time-format="timeFormat"
        title="增量延迟（ms）"
        class="mt-8"
        style="height: 200px"
      ></LineChart>
    </ElDialog>

    <InitialList v-model="initialListDialog"></InitialList>
  </aside>
</template>

<script>
import 'web-core/assets/icons/svg/magnify.svg'
import 'web-core/assets/icons/svg/table.svg'
import 'web-core/assets/icons/svg/javascript.svg'
import 'web-core/assets/icons/svg/joint-cache.svg'
import 'web-core/assets/icons/svg/row-filter.svg'
import 'web-core/assets/icons/svg/aggregator.svg'
import 'web-core/assets/icons/svg/field-processor.svg'
import 'web-core/assets/icons/svg/join.svg'
import 'web-core/assets/icons/svg/custom-node.svg'
import 'web-core/assets/icons/svg/merge_table.svg'
import 'web-core/assets/icons/svg/field_calc.svg'
import 'web-core/assets/icons/svg/field_add_del.svg'
import 'web-core/assets/icons/svg/field_rename.svg'
import 'web-core/assets/icons/svg/field_mod_type.svg'
import Locale from '../../mixins/locale'
import EventChart from './components/EventChart'
import LineChart from './components/LineChart'
import TimeSelect from './components/TimeSelect'
import CollapsePanel from './components/CollapsePanel'
import VIcon from 'web-core/components/VIcon'
import InitialList from './components/InitialList'
import { Chart } from '@tap/component'
import { getPieOptions } from './util'
import dayjs from 'dayjs'

export default {
  name: 'LeftSider',
  mixins: [Locale],
  props: {
    dataflow: Object,
    quota: Object,
    timeFormat: String
  },
  components: {
    EventChart,
    LineChart,
    Chart,
    TimeSelect,
    CollapsePanel,
    VIcon,
    InitialList
  },

  data() {
    return {
      syncType: {
        initial_sync: '全量',
        cdc: '增量',
        'initial_sync+cdc': '全量+增量'
      },
      lineChartDialog: false,
      initialListDialog: false
    }
  },

  computed: {
    // 任务事件统计（条）-任务累计
    eventDataAll() {
      const data = this.quota.samples?.totalData?.[0]
      if (!data) {
        return
      }
      return this.getInputOutput(data)
    },

    // 任务事件统计（条）-所选周期累计
    eventDataPeriod() {
      const data = this.quota.samples?.barChartData?.[0]
      if (!data) {
        return
      }
      return this.getInputOutput(data)
    },

    // qps
    qpsData() {
      const data = this.quota.samples?.lineChartData?.[0]
      if (!data) {
        return {
          x: [],
          name: [],
          value: []
        }
      }
      const { time = [] } = this.quota
      return {
        x: time,
        name: ['输入', '输出'],
        value: [data.inputQps, data.outputQps]
      }
    },

    // 增量延迟
    delayData() {
      const data = this.quota.samples?.lineChartData?.[0]
      const { time = [] } = this.quota
      if (!data) {
        return {
          x: [],
          value: []
        }
      }
      return {
        x: time,
        value: data.timeCostAvg
      }
    },

    // 全量信息
    initialData() {
      const data = this.quota.samples?.totalData?.[0]
      const initialCompleteTime = data?.initialCompleteTime
        ? dayjs(data?.initialCompleteTime).format('YYYY-MM-DD HH:mm:ss')
        : '-'
      return {
        initialCompleteTime
      }
      // const { initialTime } = this.quota.statistics?.[0] || {}
      // return {
      //   time: initialTime
      // }
    },

    // 全量-表结构同步
    initialStructureOptions() {
      let arr = [
        {
          name: '待进行',
          key: 'wait',
          value: 0,
          color: '#F7D762'
        },
        // {
        //   name: '无需创建',
        //   key: 'noCreate',
        //   value: 0,
        //   color: '#88DBDA'
        // },
        {
          name: '已完成',
          key: 'finished',
          value: 0,
          color: '#82C647'
        }
        // {
        //   name: '错误',
        //   key: 'error',
        //   value: 0,
        //   color: '#EC8181'
        // }
      ]
      const data = this.quota.samples?.totalData?.[0] || {}
      const { tableTotal = 0, createTableTotal = 0 } = data
      let result = {
        wait: 0,
        finished: createTableTotal
      }
      result.wait = tableTotal - result.finished
      // const { structure } = this.quota.statistics?.[0] || {}
      return getPieOptions(
        arr.map(t =>
          Object.assign({}, t, {
            value: result[t.key] ?? 0
          })
        )
      )
    },

    // 全量-表数据同步
    initialDataOptions() {
      let arr = [
        {
          name: '待进行',
          key: 'wait',
          value: 0,
          color: '#F7D762'
        },
        // {
        //   name: '进行中',
        //   key: 'running',
        //   value: 0,
        //   color: '#88DBDA'
        // },
        {
          name: '已完成',
          key: 'finished',
          value: 0,
          color: '#82C647'
        }
        // {
        //   name: '错误',
        //   key: 'error',
        //   value: 0,
        //   color: '#EC8181'
        // }
      ]
      // const { data } = this.quota.statistics?.[0] || {}
      const data = this.quota.samples?.totalData?.[0] || {}
      const { tableTotal = 0, snapshotTableTotal = 0 } = data
      let result = {
        wait: 0,
        finished: snapshotTableTotal
      }
      result.wait = tableTotal - result.finished
      return getPieOptions(
        arr.map(t =>
          Object.assign({}, t, {
            value: result?.[t.key] ?? 0
          })
        )
      )
    },

    // 增量信息
    cdcData() {
      const { task_data_source_Data = {} } = this.dataflow?.attrs || {}
      const { source_connectionName, target_connectionName } = task_data_source_Data
      // const { cdcTime } = this.quota.statistics?.[0] || {}
      const data = this.quota.samples?.totalData?.[0] || {}
      const { cdcTime } = data
      const time = cdcTime ? dayjs(cdcTime).format('YYYY-MM-DD HH:mm:ss') : '-'
      return {
        source: source_connectionName,
        target: target_connectionName,
        time
      }
    }
  },

  methods: {
    changeTimeSelect(val, isTime, source) {
      this.$emit('changeTimeSelect', val, isTime, source)
    },

    toFullscreen() {
      this.lineChartDialog = true
    },

    toInitialList() {
      this.initialListDialog = true
    },

    getInputOutput(data) {
      let keyArr = [
        'inputInsertTotal',
        'inputUpdateTotal',
        'inputDeleteTotal',
        'inputDdlTotal',
        'inputOthersTotal',
        'outputInsertTotal',
        'outputUpdateTotal',
        'outputDeleteTotal',
        'outputDdlTotal',
        'outputOthersTotal'
      ]
      let result = {
        input: {},
        output: {}
      }
      keyArr.forEach(el => {
        for (let key in result) {
          let item = result[key]
          if (el.includes(key)) {
            item[el.replace(key, '')] = data[el] || 0
          }
        }
      })
      return result
    }
  }
}
</script>

<style scoped lang="scss">
$hoverBg: #eef3ff;

.drag-node {
  position: fixed !important;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transform-origin: center center;
}

.layout-sidebar.--left {
  overflow: hidden auto;
  will-change: width;
  $headerH: 34px;

  .connection-tabs {
    position: relative;
    font-size: 0.875rem;

    &-pane {
      position: relative;
      height: 40px;
      cursor: pointer;
      &:hover {
        color: #2c65ff;
      }
      &.active {
        color: #2c65ff;
        &:before {
          position: absolute;
          content: '';
          height: 2px;
          background: #2c65ff;
          left: 12px;
          right: 12px;
          bottom: 0;
        }
      }
    }
  }

  ::v-deep {
    .type-tabs {
      .el-tabs__header {
        margin-bottom: 0;
      }
      .el-tabs__nav-wrap {
        padding: 0 4px;
      }
      .el-tabs__item {
        padding: 0 12px;
      }
    }

    .db-list-container {
      max-height: 50%;
      .el-collapse-item:last-child {
        margin-bottom: -2px;
      }
    }

    .click-btn {
      width: 24px !important;
      height: 24px !important;
      z-index: 2;
      border-radius: 4px;

      &:hover {
        color: #2c65ff;
        background: $hoverBg;
      }
    }

    .badge {
      display: inline-block;
      margin-left: 4px;
      padding: 2px 6px;
      border-radius: 18px;
      background: #f2f4f6;
      color: rgba(0, 0, 0, 0.4);
      font-size: 12px;
      font-weight: 500;
      line-height: 1;
      vertical-align: baseline;
    }

    .tb-header {
      position: relative;
      height: $headerH;
      font-size: 14px;
      font-weight: 500;
      border-bottom: 1px solid transparent;
      &-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
      }
    }

    .db-item,
    .node-item {
      height: 42px;
      margin-bottom: 4px;
      font-size: 12px;
      &.active {
        background-color: #eef3ff;
      }

      &:not(.active):hover {
        background-color: #edf1f9;
      }

      .el-image {
        width: 20px;
        height: 20px;
        vertical-align: middle;
      }

      &-icon {
        padding: 4px;
        border: 1px solid #f2f2f2;
        border-radius: 50%;
      }

      &-content {
        overflow: hidden;
        > :not(:last-child) {
          margin-bottom: 4px;
          font-size: 13px;
        }

        > :last-child {
          color: rgb(83 95 114 / 70%);
        }
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    .node-item {
      height: 30px;

      .el-image {
        width: 20px;
        height: 20px;
      }
    }

    .tb-item-icon {
      width: 20px;
      height: 20px;
      background-color: #6236ff;
      text-align: center;
      border-radius: 100%;
    }

    .el-collapse {
      border-top: 0;
      &.processor-collapse {
        max-height: 30%;
      }
      &.collapse-fill {
        .el-collapse-item:first-child:last-child {
          height: 100%;
          .el-collapse-item__wrap {
            height: calc(100% - #{$headerH - 1});
          }
          .el-collapse-item__content {
            height: 100%;
          }
        }
      }

      &-item {
        &.is-active [role='tab'] {
          position: sticky;
          top: 0;
          z-index: 1;
        }

        &__header {
          position: relative;
          padding-left: 16px;
          padding-right: 16px;
          height: $headerH;
          font-size: 14px;

          &:hover {
            background-color: rgba(47, 46, 63, 0.05);
          }
        }

        &__wrap {
          padding-top: 16px;
        }

        &__arrow {
          order: -1;
          &:before {
            content: '\e791';
          }
        }

        &__content {
          padding-bottom: 0;
        }
      }
    }

    .el-scrollbar {
      height: 100%;
    }

    .header__input {
      position: absolute;
      z-index: 3;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      margin-bottom: -1px;

      input {
        width: 100%;
        height: 100%;
        border-width: 0 0 1px;
        border-radius: 0;
      }

      input,
      .v-icon,
      .el-input__icon {
        vertical-align: top;
      }

      input,
      .el-input__icon {
        line-height: $headerH;
      }
    }
  }
}

.node-list {
  .node-item {
    border-radius: 4px;

    &:hover {
      background-color: #eef3ff;
    }

    &-icon {
      width: 32px;
      height: 32px;
      background: rgba(44, 101, 255, 0.07);
      border-radius: 4px;
      border: 1px solid #2c65ff;
    }

    &-txt {
      font-size: 12px;
      line-height: 1;
      white-space: nowrap;
    }
  }
}
.info-box {
  padding: 16px;
  border-bottom: 1px solid #f2f2f2;
}
.task-info__row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
</style>
