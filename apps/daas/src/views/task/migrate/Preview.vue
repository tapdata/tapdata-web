<template>
  <el-drawer
    class="task-drawer"
    ref="drawer"
    :visible.sync="visible"
    :title="$t('dataForm.title')"
    size="40%"
    :withHeader="false"
    :before-close="handleClose"
  >
    <div class="task-drawer-wrap" v-loading="previewLoading">
      <div class="bar">
        <button type="button" class="el-button back-btn-icon-box el-button--default" @click="handleClose">
          <span>
            <VIcon class="back-btn-icon">arrow-right-circle</VIcon>
          </span>
        </button>
        <span class="back-btn-text">{{ $t('task_preview_title') }}</span>
      </div>
      <header class="header">
        <div class="tab">
          <div class="img-box">
            <img src="../../../assets/images/task/task.png" />
          </div>
          <div class="content">
            <div>{{ previewData.name }}</div>
            <div class="fs-8 py-2">{{ $t('task_details_desc') }}:{{ previewData.description }}</div>
            <div class="status">
              {{ $t('task_preview_status_' + previewData.status) }}
            </div>
          </div>
        </div>
      </header>
      <ul class="info-list">
        <li v-for="item in previewList" :key="item.label">
          <span class="label">{{ $t('task_preview_' + item.label) }}</span>
          <span
            class="value align-items-center align-middle"
            :class="{ 'align-top': item.value && item.value.length > 15 }"
            >{{ item.value }}</span
          >
        </li>
      </ul>
    </div>
  </el-drawer>
</template>

<script>
import VIcon from '@/components/VIcon'

export default {
  name: 'MigratePreview',
  components: { VIcon },
  props: {
    id: {
      required: true,
      value: String
    },
    // databaseType: {
    //   required: true,
    //   value: String
    // },
    visible: {
      required: true,
      value: String
    }
  },
  data() {
    return {
      previewData: {},
      previewList: [],
      data: {},
      name: '',
      type: '',
      status: '',
      progress: 0,
      timer: null,
      showProgress: false,
      dialogTestVisible: false,
      previewLoading: false,
      userId: '',
      kafkaACK: [
        { label: this.$t('dataForm.form.kafka.kafkaAcks0'), value: '0' },
        { label: this.$t('dataForm.form.kafka.kafkaAcks1'), value: '1' },
        { label: this.$t('dataForm.form.kafka.kafkaAcks_1'), value: '-1' },
        { label: this.$t('dataForm.form.kafka.kafkaAcksAll'), value: 'all' }
      ],
      sourceType: {
        rds: 'RDS实例',
        ecs: 'ECS自建库',
        selfDB: '云外自建库',
        dds: 'DDS实例'
      }
    }
  },
  watch: {
    visible: {
      handler() {
        if (this.visible) {
          this.getData(this.id)
        }
        this.showProgress = false
      }
    }
  },
  created() {
    this.getData(this.id)
  },
  beforeDestroy() {
    this.clearInterval()
  },
  destroyed() {
    this.form = {}
    this.clearInterval()
  },
  methods: {
    returnTestData(data) {
      if (!data.status || data.status === null) return
      this.status = data.status
    },
    clearInterval() {
      // 清除定时器
      clearInterval(this.timer)
      this.timer = null
    },
    async getData(id) {
      this.loading = true
      this.$api('DataFlows')
        .get([id])
        .then(res => {
          if (res) {
            let previewData = []
            this.previewData = res.data
            for (let item in res.data) {
              if (item === 'setting') {
                let setting = res.data[item]
                res.data['sync_type'] = setting.sync_type
                item = 'sync_type'
              }
              if (['createUser', 'sync_type', 'id', 'createTime', 'startTime'].includes(item)) {
                previewData.push({ label: item, value: res.data[item] })
              }
            }
            this.previewList = previewData
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleClose() {
      this.form = {}
      this.clearInterval()
      this.$emit('previewVisible', false)
    },
    confirm(callback, catchCallback, config) {
      this.$confirm(config.Message + config.name + '?', config.title, {
        confirmButtonText: config.confirmButtonText,
        cancelButtonText: config.cancelButtonText,
        type: 'warning',
        closeOnClickModal: false
      }).then(resFlag => {
        if (resFlag) {
          callback()
        } else {
          catchCallback()
        }
      })
    },
    reloadApi(type) {
      this.clearInterval()
      let parms
      if (type === 'first') {
        parms = {
          loadCount: 0,
          loadFieldsStatus: 'loading'
        }
        this.loadFieldsStatus = 'loading'
      }
      this.$api('connections')
        .updateById(this.data.id, parms)
        .then(result => {
          if (result.data) {
            let data = result.data
            this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
            if (type === 'first') {
              this.$refs.test.start(true)
            }
            if (data.loadFieldsStatus === 'finished') {
              this.progress = 100
              setTimeout(() => {
                this.showProgress = false
                this.progress = 0 //加载完成
              }, 800)
            } else {
              let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100
              this.progress = progress ? progress : 0
              this.timer = setInterval(() => {
                this.reloadApi()
              }, 800)
            }
          }
        })
        .catch(() => {
          this.$message.error(this.$t('connection.reloadFail'))
          this.showProgress = false
          this.progress = 0 //加载完成
        })
    },
    //test
    handleTestVisible() {
      this.dialogTestVisible = false
    },
    //检测agent 是否可用
    async checkTestConnectionAvailable() {
      let result = await this.$api('Workers').getAvailableAgent()
      if (!result.data.result || result.data.result.length === 0) {
        this.$message.error(this.$t('dataForm.form.agentMsg'))
      }
    }
  }
}
</script>

<style scoped lang="scss">
.task-drawer {
  .task-drawer-wrap {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
  }
  .header {
    display: flex;
    flex-direction: column;
    margin: 20px 0;
    border-bottom: 1px solid #eee;
  }
  .test-progress {
    width: 94.5%;
    margin: 0 10px 10px 30px;
  }
  .tab {
    display: flex;
    justify-content: flex-start;
    padding-bottom: 10px;
    padding-top: 10px;
    .img-box {
      display: flex;
      width: 60px;
      height: 60px;
      justify-content: center;
      align-items: center;
      background: #fff;
      //border: 1px solid #dedee4;
      border-radius: 3px;
      margin-left: 30px;
      margin-right: 20px;
      img {
        width: 100%;
      }
    }
    .content {
      margin-left: 10px;
      font-weight: 500;
      margin-top: 4px;
      width: 100%;
    }
    .status {
      font-size: 12px;
      padding-bottom: 2px;
      margin-top: 4px;
      border-top-width: 2px;
      .error {
        color: #f56c6c;
      }
      .success {
        color: #67c23a;
      }
      .warning {
        color: #e6a23c;
      }
    }
  }
  .label {
    color: #999;
    font-size: 12px;
    display: inline-block;
    width: 110px;
    margin-right: 15px;
    text-align: left;
  }
  .value {
    width: 62%;
    color: #666;
    font-size: 12px;
    display: inline-block;
    word-break: break-all;
  }
  .schema-load {
    color: #999;
    display: inline-block;
    margin-left: 20px;
    font-size: 12px;
    font-weight: normal;
  }
  .info-list {
    flex: 1;
    overflow-y: auto;
    max-height: 690px;
    margin: 0 auto;
    padding-left: 56px;
    width: 100%;
    box-sizing: border-box;
    li {
      margin-bottom: 20px;
    }
  }
  .bar {
    display: block;
    width: 100%;
    height: 30px;
    background: #f5f5f5;
    border-bottom: 1px solid #dedee4;
  }
  .back-btn-icon-box {
    width: 30px;
    height: 30px;
    margin: 0;
    padding: 0;
    line-height: 1;
    font-weight: normal;
    font-size: 14px;
    color: red;
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
    outline: 0;
    border: 0;
    border-radius: 0;
    box-sizing: border-box;
    background: #409eff;
    transition: 0.1s;
    -webkit-appearance: none;
    -webkit-box-sizing: border-box;
    -webkit-transition: 0.1s;
  }
  .back-btn-icon-box:hover {
    background: #6dc5e8;
  }
  .back-btn-icon {
    color: #fff;
  }
  .back-btn-text {
    padding-left: 10px;
    font-size: 12px;
  }
}
</style>
<style lang="scss">
.connection-drawer {
  .top-drawer {
    .el-drawer {
      box-shadow: -2px 0px 8px 0px rgba(0, 0, 0, 0.1);
    }
    .el-drawer.rtl {
      top: 48px;
    }
  }
  .no-top-drawer {
    .el-drawer {
      box-shadow: -2px 0px 8px 0px rgba(0, 0, 0, 0.1);
    }
  }
  .test-progress {
    .el-progress-bar__outer {
      border-radius: 0;
    }
    .el-progress-bar__inner {
      border-radius: 0;
    }
    margin-bottom: 10px;
  }
  .el-drawer__body {
    overflow: hidden;
  }
}
</style>
