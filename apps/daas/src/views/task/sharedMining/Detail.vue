<template>
  <div class="share-detail">
    <div class="share-detail-box flex justify-content-between fs-8">
      <div class="share-detail-head-left">
        <div class="flex align-items-center mb-2">
          <span>{{ $t('share_detail_mining_info') }}</span>
        </div>
        <div class="flex justify-content-between text-center">
          <div class="mb-3 fs-8">{{ $t('share_detail_name') }}</div>
          <div class="fs-6 font-color-main">444444</div>
        </div>
        <div class="flex justify-content-between text-center">
          <div class="mb-3 fs-8">{{ $t('share_detail_log_mining_time') }}</div>
          <div class="fs-6 font-color-main">555555</div>
        </div>
        <div class="flex justify-content-between text-center">
          <div class="mb-3 fs-8">{{ $t('hare_detail_log_time') }}</div>
          <div class="fs-6 font-color-main">ggggg</div>
        </div>
      </div>
      <div class="flex-fill px-10" style="min-height: 250px">
        <div class="flex justify-content-between ml-6">
          {{ $t('share_detail_statistics_time') }}
          <el-date-picker
            v-model="statisticsTime"
            type="datetimerange"
            :range-separator="$t('share_detail_to')"
            :start-placeholder="$t('share_detail_start_time')"
            :end-placeholder="$t('share_detail_end_time')"
          >
          </el-date-picker>
        </div>
        <Chart type="line" :data="lineData" :options="lineOptions" no-x="second" class="v-echart h-100"></Chart>
      </div>
      <div class="flex dig-info-right">
        <div class="box py-3 mt-2" style="background-color: #fafafa">
          <div class="title fs-8">增量延迟</div>
          <div class="time py-4 fs-4 text-primary">0s</div>
          <div class="text-muted">增量所处时间点：2021-12-20 18:00:00</div>
        </div>
      </div>
    </div>
    <div class="card-box__content px-6 flex-1">
      <TableList
        :remoteMethod="remoteMethod"
        :columns="columns"
        :remote-data="id"
        height="100%"
        :has-pagination="false"
        ref="tableList"
      >
        <template slot="operation" slot-scope="scope">
          <div class="operate-columns">
            <ElButton size="mini" type="text" @click="handleDetail(scope.row)">{{ $t('button_check') }}</ElButton>
            <ElButton size="mini" type="text" @click="handleDetail(scope.row)">{{
              $t('share_detail_button_table_info')
            }}</ElButton>
          </div>
        </template>
      </TableList>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Info',
  data() {
    return {
      id: '',
      statisticsTime: [],
      lineData: {
        x: [],
        y: [[], []]
      },
      loading: true,
      task: {},
      selectFlow: 'flow_', // 选中节点
      dataOverviewAll: 'flow',
      // 事件统计
      overviewObj: {
        title: {
          key: 'overview',
          statsType: 'data_overview',
          title: this.$t('task_info_data_screening'),
          loading: false
        }
      },
      throughputObj: {
        title: {
          key: 'throughput',
          statsType: 'throughput',
          time: 'second',
          title: this.$t('task_info_input_output'),
          tip: this.$t('task_info_throughputpop'),
          unit: 'QPS',
          class: 'putColor',
          loading: false
        },
        body: null,
        input: 0,
        output: 0
      },
      activeTab: 'schedule',
      showContent: false,
      field_process: [],
      operations: ['start', 'stop', 'forceStop'],
      columns: [
        {
          label: this.$t('share_detail_call_task'),
          slotName: 'name'
        },
        {
          label: this.$t('share_detail_source_time'),
          prop: 'point'
        },
        {
          label: this.$t('share_detail_sycn_time_point'),
          prop: 'pointTime'
        },
        {
          label: this.$t('share_detail_mining_status'),
          prop: 'status'
        },
        {
          label: this.$t('column_operation'),
          prop: 'operation',
          slotName: 'operation'
        }
      ]
    }
  },
  computed: {
    connectionIds() {
      return (
        this.task?.stages?.map(item => {
          return item.connectionId
        }) || []
      )
    }
  },
  created() {},

  destroyed() {
    this.$ws.off('watch', this.taskChange)
  },
  methods: {
    remoteMethod({ page }) {
      const { ids } = this
      let { current, size } = page
      let filter = {
        where: {
          id: {
            inq: ids
          }
        },
        limit: size,
        skip: size * (current - 1)
      }
      return this.$api('connections')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          return {
            total: res.data.total,
            data: res.data.items
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.share-detail {
  width: 100%;
  padding: 0 20px;
  background-color: #eff1f4;
  .share-detail-box {
    width: 100%;
    background: #fff;
    border-radius: 4px;
    .share-detail-head-left {
      min-width: 240px;
    }
  }
}
.statistics-container {
  font-size: 12px;
  overflow-y: auto;
}
.card-box {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  ::v-deep {
    .table-list {
      //height: 300px;
    }
    .el-tab-pane {
      min-height: 400px;
    }
    .field-mapping {
      min-height: 400px;
      .task-form-body {
        max-height: 350px;
      }
    }
  }
}
.card-box__info {
  border-bottom: 1px solid #e4e7ed;
}
.card-box__content {
  padding-left: 24px;
  //height: 0;
  ::v-deep {
    .el-tabs__content {
      overflow-y: auto;
    }
  }
}
</style>
