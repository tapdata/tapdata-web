<template>
  <ElDrawer
    :modal="false"
    :visible.sync="drawer"
    :direction="direction"
    :show-close="false"
    :with-header="false"
    size="304px"
    style="top: 70px"
    @opened="openedFnc"
    @closed="closedFnc"
  >
    <div v-loading="loading" class="details-container">
      <div class="container-item border-item flex pb-5">
        <div class="pt-2">
          <VIcon size="24" class="font-color-sub">computer</VIcon>
        </div>
        <div class="ml-4">
          <div class="fs-6 mb-2 ellipsis"><slot name="title"></slot></div>
          <div><StatusTag type="text" :status="agent.status"></StatusTag></div>
        </div>
      </div>
      <div class="button-line container-item border-item pt-4 pb-5">
        <slot name="operation"></slot>
      </div>
      <div v-for="(item, index) in list" :key="index + ''" class="container-item flex">
        <div class="pt-3">
          <VIcon class="font-color-sub">{{ item.icon }}</VIcon>
        </div>
        <div class="flex-fill ml-4">
          <div v-for="(temp, k) in item.items" :key="index + '' + k" class="box-line">
            <div class="box-line__label">{{ temp.label + $t('field_mapping_field_mapping_dialog_') }}</div>
            <div class="box-line__value">{{ agent[temp.key] || '-' }}</div>
          </div>
        </div>
      </div>
    </div>
  </ElDrawer>
</template>

<script>
import VIcon from '@/components/VIcon'
import StatusTag from '@/components/StatusTag'
import timeFunction from '@/mixins/timeFunction'

export default {
  name: 'Details',
  components: { VIcon, StatusTag },
  mixins: [timeFunction],
  props: {
    value: Boolean,
    detailId: [String, Number]
  },
  data() {
    const $t = this.$t.bind(this)
    return {
      drawer: false,
      direction: 'rtl',
      loading: false,
      agent: {
        btnLoading: {
          deploy: false,
          stop: false,
          delete: false
        }
      },
      list: [
        {
          icon: 'sync-task',
          items: [
            {
              label: $t('agent_detail_synchronization_task_number'),
              key: 'runningTaskNum'
            }
          ]
        },
        {
          icon: 'list',
          items: [
            {
              label: $t('agent_id'),
              key: 'id'
            },
            {
              label: $t('agent_version'),
              key: 'version'
            },
            {
              label: $t('agent_key') + $t('agent_create_time'),
              key: 'createAt'
            }
          ]
        },
        {
          icon: 'host',
          items: [
            {
              label: $t('agent_detail_host_name'),
              key: 'hostname'
            },
            {
              label: $t('agent_detail_host_ip'),
              key: 'ips'
            },
            {
              label: $t('agent_detail_host_cpu_number'),
              key: 'cpus'
            },
            {
              label: $t('agent_detail_host_cpu_memory'),
              key: 'totalmem'
            }
          ]
        },
        {
          icon: 'install',
          items: [
            {
              label: $t('agent_detail_installation_manual'),
              key: 'installationDirectory'
            },
            {
              label: $t('agent_detail_run_manual'),
              key: 'logDir'
            }
          ]
        }
      ]
    }
  },
  watch: {
    value(v) {
      this.drawer = v
      if (v) {
        this.init()
      }
    }
  },
  methods: {
    init() {
      this.loadData()
    },
    loadData() {
      this.loading = true
      this.$axios
        .get('api/tcm/agent/' + this.detailId)
        .then(data => {
          if (data) {
            // 是否显示版本号：待部署不显示
            if (!this.showVersionFlag(data) && data.spec) {
              data.spec.version = ''
            }
            Object.assign(data, data?.metric || {}, data?.spec || {}, data?.tmInfo || {})
            data.hostname = data?.tmInfo?.hostname
            data.createAt = this.formatTime(data.createAt)
            if (data?.metric?.systemInfo) {
              let arr = ['cpus', 'installationDirectory', 'ips', 'logDir']
              arr.forEach(el => {
                data[el] = data.metric?.systemInfo?.[el] || ''
              })
              let num = Number(data.metric.systemInfo.totalmem) || 0
              let size = ''
              if (num < 0.1 * 1024) {
                //小于0.1KB，则转化成B
                size = num.toFixed(2) + 'B'
              } else if (num < 0.1 * 1024 * 1024) {
                //小于0.1MB，则转化成KB
                size = (num / 1024).toFixed(2) + 'KB'
              } else if (num < 0.1 * 1024 * 1024 * 1024) {
                //小于0.1GB，则转化成MB
                size = (num / (1024 * 1024)).toFixed(2) + 'MB'
              } else {
                //其他转化成GB
                size = (num / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
              }
              data.totalmem = size
            }
            this.agent = Object.assign(this.agent, data)
            this.$emit('load-data', this.agent)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    showVersionFlag(row) {
      let { status, tmInfo } = row
      return !(status === 'Creating' && !tmInfo?.pingTime)
    },
    openedFnc() {
      this.$emit('input', this.drawer).$emit('opened')
    },
    closedFnc() {
      this.$emit('input', this.drawer).$emit('closed')
    }
  }
}
</script>

<style lang="scss" scoped>
.details-container {
  padding: 16px 12px 16px 20px;
  overflow-y: auto;
}
.container-item {
  &.border-item {
    border-bottom: 1px solid #f2f2f2;
  }
  &.button-line {
    margin-bottom: -1px;
  }
}
.el-button + .el-button {
  margin-left: 16px;
}
.box-line {
  padding: 8px 0;
  border-top: 1px solid #f2f2f2;
  //&:first-child {
  //  border-top: 0;
  //}
}
.box-line__label {
  color: rgba(0, 0, 0, 0.6);
}
.box-line__value {
  margin-top: 8px;
  color: #000;
}
</style>
