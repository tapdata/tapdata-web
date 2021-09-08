<template>
  <el-drawer
    :modal="false"
    :visible.sync="drawer"
    :direction="direction"
    :show-close="false"
    :with-header="false"
    size="304"
    @opened="openedFnc"
    @closed="closedFnc"
  >
    <div v-if="agent.id" v-loading="loading" class="details-container">
      <div class="container-item border-item flex pb-5">
        <div class="pt-2">
          <VIcon size="24">task</VIcon>
        </div>
        <div class="ml-4">
          <div class="fs-6 mb-2 ellipsis">{{ agent.name }}</div>
          <div><status-tag type="text" :status="agent.status"></status-tag></div>
        </div>
      </div>
      <div class="button-line container-item border-item flex pt-4 pb-5">
        <el-button :loading="agent.btnLoading.deploy" type="primary" class="flex-fill" @click="emitFnc('deploy')">
          <VIcon>creating</VIcon>
          <span>{{ $t('agent_button_deploy') }}</span>
        </el-button>
        <el-button :loading="agent.btnLoading.stop" type="primary" class="flex-fill" @click="emitFnc('stop')">
          <VIcon>creating</VIcon>
          <span>{{ $t('agent_button_stop') }}</span>
        </el-button>
        <el-button :loading="agent.btnLoading.delete" class="flex-fill" @click="emitFnc('delete')">
          <VIcon>creating</VIcon>
          <span>{{ $t('agent_button_delete') }}</span>
        </el-button>
      </div>
      <div v-for="(item, index) in list" :key="index + ''" class="container-item flex">
        <div class="pt-2">
          <VIcon>{{ item.icon }}</VIcon>
        </div>
        <div class="flex-fill ml-4">
          <div v-for="(temp, k) in item.items" :key="index + '' + k" class="box-line">
            <div class="box-line__label">{{ temp.label + '：' }}</div>
            <div class="box-line__value">{{ agent[temp.key] || '-' }}</div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import VIcon from '@/components/VIcon'
import StatusTag from '@/components/StatusTag'

export default {
  name: 'DetailsDrawer',
  components: { VIcon, StatusTag },
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
          icon: 'connection',
          items: [
            {
              label: $t('agent_detail_synchronization_task_number'),
              key: 'runningTaskNum'
            }
          ]
        },
        {
          icon: 'connection',
          items: [
            {
              label: $t('agent_id'),
              key: 'agentId'
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
          icon: 'connection',
          items: [
            {
              label: '宿主机主机名：',
              key: '-'
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
              label: '宿主机CPU内存：',
              key: 'totalmem'
            }
          ]
        },
        {
          icon: 'connection',
          items: [
            {
              label: '安装目录：',
              key: 'installationDirectory'
            },
            {
              label: '运行日志所在目录：',
              key: '-'
            }
          ]
        }
      ]
    }
  },
  watch: {
    value(v) {
      console.log('watch-v', v)
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
          console.log('data', data)
          if (data) {
            // data.runningTaskNum = data.metric?.runningTaskNum ?? 0
            // data.version = data.spec?.version
            Object.assign(
              data,
              data?.metric || {},
              data?.metric?.systemInfo || {},
              data?.spec || {},
              data?.tmInfo || {}
            )
            // this.agent = data
            data.createAt = data.createAt ? this.$moment(data.createAt).format('YYYY-MM-DD HH:mm:ss') : ''
            if (data?.metric?.systemInfo) {
              data.cpus = data.metric.systemInfo.cpus || ''
              data.installationDirectory = data.metric.systemInfo.installationDirectory || ''
              data.ips = data.metric.systemInfo.ips || ''

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
            console.log('this.agent', this.agent)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    openedFnc() {
      console.log('openedFnc')
      this.$emit('input', this.drawer).$emit('opened')
    },
    closedFnc() {
      console.log('closedFnc')
      this.$emit('input', this.drawer).$emit('closed')
    },
    setBtnLoading(key = 'stop', value = false) {
      this.btnLoading[key] = value
    },
    emitFnc(key) {
      this.$emit(key, this.agent)
    }
    // deployFnc() {
    //   this.$emit('deploy')
    // },
    // stopFnc() {
    //   this.$emit('stop')
    // },
    // deleteFnc() {
    //   this.$emit('delete')
    // }
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
