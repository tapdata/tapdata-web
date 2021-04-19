<template>
  <section class="milestone-wrap" v-loading="loading">
    <ul class="milestone-list">
      <li class="milestone-item" v-for="(item, index) in list" :key="index">
        <div class="label">
          <span>{{ item.label }}</span>
          <el-button
            v-if="item.status === 'error'"
            class="btn-error"
            size="mini"
            type="text"
            @click="checkError(item.errorMessage)"
          >
            {{ $t('milestone.btn_check_error') }}
          </el-button>
        </div>
        <div
          v-if="
            ['draft', 'paused', 'error'].includes(dataFlow.status) &&
            item.status === 'running'
          "
        >
          <div class="status paused">
            <span class="milestone-icon-wrap">
              <i class="milestone-status__icon el-icon-video-pause"></i>
            </span>
            <span>{{ $t('milestone.status_paused') }}</span>
          </div>
        </div>
        <div :class="'status ' + item.status" v-else>
          <span class="milestone-icon-wrap">
            <i class="milestone-status__icon el-icon-success"></i>
            <i class="milestone-status__icon el-icon-error"></i>
            <i class="milestone-status__icon el-icon-loading"></i>
          </span>
          <span>{{ $t('milestone.status_' + item.status) }}</span>
        </div>
        <div class="from-now">{{ item.fromNow }}</div>
      </li>
    </ul>
    <div class="empty" v-if="!loading && !list.length">
      {{ $t('milestone.emptyText') }}
    </div>
  </section>
</template>

<script>
import factory from '../../api/factory'
import ws from '../../api/ws'
const dataFlowsAPI = factory('DataFlows')

let event = null

export default {
  props: {
    dataFlow: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      list: []
    }
  },
  created() {
    this.getData(true)
    event = (data) => {
      let dataflow = data.data.fullDocument
      if (dataflow && dataflow.milestones) {
        this.formatData(dataflow.milestones)
      }
    }
    ws.on('watch', event)
  },
  destroyed() {
    ws.off('watch', event)
  },
  methods: {
    checkError(msg) {
      const h = this.$createElement
      this.$msgbox({
        width: 850,
        customClass: 'error-box-body',
        message: h(
          'pre',
          {
            style: {
              whiteSpace: 'pre-wrap',
              maxHeight: '400px',
              overflow: 'auto'
            }
          },
          [msg]
        )
      })
    },
    getData(showLoading) {
      let id = this.dataFlow.id
      if (id) {
        showLoading && (this.loading = true)
        dataFlowsAPI
          .findOne({
            filter: JSON.stringify({
              where: {
                id
              }
            })
          })
          .then((res) => {
            if (res.data) {
              let dataFlow = res.data
              let milestones = dataFlow.milestones || []
              this.formatData(milestones)
            }
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    formatData(milestones = []) {
      this.list = milestones.map((m) => {
        let time = m.status === 'running' ? m.start : m.end
        if (time) {
          time = this.$moment(time).format('YYYY-MM-DD HH:mm:ss')
        }
        return {
          label: this.$t(`milestone.${m.code}`),
          status: m.status,
          fromNow: time || '-',
          errorMessage: m.errorMessage
        }
      })
    }
  }
}
</script>
<style lang="scss">
.error-box-body {
  width: 850px;
}
</style>
<style lang="scss" scoped>
.milestone-wrap {
  position: relative;
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
  .empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 18px;
    color: #999;
  }
  .milestone-list {
    padding: 7px 0;
    display: flex;
    flex-direction: column;
    .milestone-item {
      margin: 4px 13px;
      display: flex;
      align-items: center;
      height: 40px;
      line-height: 40px;
      background: #f2f2f2;
      border-radius: 3px;
      color: #666;
      font-size: 12px;
      .label {
        flex: 1;
        .btn-error {
          margin-left: 10px;
        }
      }
      .from-now {
        width: 150px;
        color: #999;
      }
      .status {
        position: relative;
        width: 100px;
        color: #999;
        .milestone-icon-wrap {
          position: absolute;
          left: -21px;
          top: 50%;
          transform: translate(0, -50%);
          i {
            display: none;
          }
        }
        .milestone-status__icon {
          display: inline-block;
        }
        &.running {
          color: #48b6e2;
        }
        &.error {
          color: #f56c6c;
        }
        &.finish {
          color: #67c23a;
        }
        &.paused {
          color: #999;
        }
      }
    }
  }
}
</style>
