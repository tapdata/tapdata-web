<template>
  <el-dialog
    class="connection-test-dialog"
    :visible="visible"
    width="770px"
    :show-close="false"
    append-to-body
    :before-close="handleClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="test-result">
      <div v-if="testData.testLogs && testData.testLogs.length === 0 && wsError === 'ERROR'" style="color: #d54e21">
        <i class="el-icon-warning" style="color: #d54e21"></i>
        <span class="test-title">{{ wsErrorMsg ? wsErrorMsg : $t('dataForm.test.error') }}</span>
      </div>
      <div v-else>
        <div class="test-status" v-if="['invalid', 'ERROR'].includes(status)">
          <i class="el-icon-error" :style="{ color: colorMap[status] }"></i>
          <span class="test-title">{{ $t('dataForm.test.testResultFail') }}</span>
        </div>
        <div class="test-status" v-if="['ready'].includes(status)">
          <i class="el-icon-success" :style="{ color: colorMap[status] }"></i>
          <span class="test-title">{{ $t('dataForm.test.testResultSuccess') }}</span>
        </div>
        <div class="test-status" v-if="!['ready', 'invalid', 'ERROR'].includes(status)">
          <el-image
            style="width: 20px; height: 20px; vertical-align: bottom"
            :src="require('../assets/icons/loading.svg')"
          ></el-image>
          <span v-if="testData.testLogs.length === 0">{{ $t('dataForm.primaryTest') }}</span>
          <span v-else>{{ $t('dataForm.testing') }}</span>
        </div>
      </div>
    </div>
    <el-table
      ref="table"
      :data="testData.testLogs"
      style="width: 100%"
      class="test-block"
      :row-style="rowStyleHandler"
      v-show="testData.testLogs && testData.testLogs.length > 0"
    >
      <el-table-column prop="show_msg" :label="$t('dataForm.test.items')">
        <template slot-scope="scope">
          <span>{{ $t(`dataForm.form.response_body.${scope.row.show_msg}`) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('dataForm.test.result')" width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 'failed' && !scope.row.required" :style="`color: ${colorMap['warning']};`">
            <i class="el-icon-warning" :style="{ color: colorMap[status] }"></i>
            {{ statusMap[scope.row.status] }}
          </span>
          <span v-else-if="scope.row.status === 'unTest'" :style="`color: ${colorMap[scope.row.status]};`">
            <el-image
              style="width: 20px; height: 20px; vertical-align: bottom"
              :src="require('../assets/icons/loading.svg')"
            ></el-image>
            {{ statusMap[scope.row.status] }}
          </span>
          <span v-else :style="`color: ${colorMap[scope.row.status]};`">
            <i :class="iconMap[scope.row.status]" :style="{ color: colorMap[scope.row.status] }"></i>
            {{ statusMap[scope.row.status] }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="fail_message" :label="$t('dataForm.test.information')" width="308"></el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" @click="start()" v-if="isTimeout">{{ $t('dataForm.test.retryBtn') }}</el-button>
      <el-button size="mini" type="primary" @click="handleClose()">{{ $t('dataForm.close') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'ConnectionTest',
  data() {
    return {
      visible: false,
      progress: 0,
      testData: {
        testLogs: [],
        testResult: '',
        progress: 0
      },
      wsError: '',
      wsErrorMsg: '',
      isTimeout: true,
      retryData: {}, //重试
      status: '',
      timer: null,
      callback: null,
      // hideTableInfo: false,
      colorMap: {
        passed: '#70AD47',
        waiting: '#aaaaaa',
        failed: '#f56c6c',
        warning: '#ffc107',
        ready: '#70AD47',
        invalid: '#f56c6c',
        testing: '#aaaaaa',
        unTest: '#aaaaaa'
      },
      iconMap: {
        ready: 'el-icon-success',
        invalid: 'el-icon-error',
        testing: '',
        passed: 'el-icon-success',
        waiting: 'el-icon-question',
        failed: 'el-icon-error',
        unTest: ''
      },
      statusMap: {
        ready: this.$t('dataForm.test.success'),
        invalid: this.$t('dataForm.test.fail'),
        testing: this.$t('dataForm.test.testing'),
        passed: this.$t('dataForm.test.success'),
        waiting: this.$t('dataForm.test.testing'),
        failed: this.$t('dataForm.test.fail'),
        unTest: this.$t('dataForm.test.unTest')
      }
    }
  },
  mounted() {
    if (this.$ws) {
      //接收数据
      this.$ws.on('testConnectionResult', this.hanlderTestConnectionResult)
      //长连接失败
      this.$ws.on('testConnection', this.handleTestConnection)
    }
  },
  destroyed() {
    if (this.$ws) {
      if (this.callback) {
        this.$ws.off('open', this.callback)
      }
      this.$ws.off('testConnectionResult', this.hanlderTestConnectionResult)
      this.$ws.off('testConnection', this.handleTestConnection)
    }
    this.testData.testLogs = []
    this.status = ''
    //清除定时器
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  },
  methods: {
    rowStyleHandler({ row }) {
      return row.status === 'waiting' ? { background: '#fff' } : ''
    },
    handleClose() {
      this.visible = false
    },
    hanlderTestConnectionResult(data) {
      if (!this.status && this.wsError !== 'ERROR') {
        this.isTimeout = false //有回调
        // this.wsErrorMsg = data.error
        let result = data.result || []
        this.wsError = data.status
        let testData = {
          wsError: data.status
        }
        this.$refs.table.doLayout()
        if (result.response_body) {
          let validate_details = result.response_body.validate_details || []
          let res = validate_details.filter(item => item.status !== 'waiting')
          // let unPassedNums = validate_details.filter(item => item.status !== 'passed');
          if (res.length === 0) {
            validate_details = validate_details.map(item => {
              item.status = 'unTest'
              return item
            })
          }
          // if (unPassedNums.length === 0) {
          // 	this.hideTableInfo = true;
          // }
          this.testData.testLogs = validate_details
          testData['testLogs '] = validate_details
          testData['status'] = result.status
          this.status = result.status
        } else {
          let logs = this.testData.testLogs.map(item => {
            item.status = 'invalid'
            return item
          })
          this.testData.testLogs = logs
          testData['testLogs '] = logs
          testData['status'] = data.status
          this.status = data.status
        }
        this.$emit('receive', testData)
      }
    },
    handleTestConnection(data) {
      this.wsError = 'ERROR'
      //this.wsErrorMsg = data.error
      let testData = {
        wsError: data.status
      }
      this.$emit('receive', testData)
    },
    start(formData, isShowDialog = true, updateSchema = false, editTest) {
      //继续传进来的值 重试功能使用
      if (formData) {
        this.retryData = {
          formData: formData,
          isShowDialog: isShowDialog,
          updateSchema: updateSchema,
          editTest: editTest
        }
      } else {
        formData = this.retryData.formData
        isShowDialog = this.retryData.isShowDialog
        updateSchema = this.retryData.updateSchema
        editTest = this.retryData.editTest
      }
      if (!this.$ws) {
        throw new Error('未引入ws-client')
      }
      this.wsErrorMsg = ''
      this.status = ''
      this.visible = isShowDialog
      let data = formData
      if (data.database_type === 'mq' && (typeof data.mqQueueSet === 'string' || typeof data.mqTopicSet === 'string')) {
        data.mqQueueSet = data.mqQueueSet ? data.mqQueueSet.split(',') : []
        data.mqTopicSet = data.mqTopicSet ? data.mqTopicSet.split(',') : []
      }
      delete data.schema
      delete data.response_body
      let msg = {
        type: 'testConnection',
        data: data
      }
      msg.data['updateSchema'] = updateSchema //是否需要更新Schema
      msg.data['editTest'] = editTest //是否编辑测试
      this.wsError = ''
      this.testData.testLogs = []
      let self = this
      self.timer = null
      self.timer = setTimeout(() => {
        if (self.isTimeout) {
          self.wsError = 'ERROR'
          self.wsErrorMsg = self.$t('dataForm.test.retryTest')
          let testData = {
            wsError: 'ERROR'
          }
          self.$emit('receive', testData)
        }
      }, 15000)
      this.callback = () => {
        if (!this.status && this.wsError !== 'ERROR') {
          this.$ws.send(msg)
        }
      }
      this.callback()
    }
  }
}
</script>
<style lang="scss" scoped>
.connection-test-dialog {
  .test-result {
    .test-status {
      margin-bottom: 20px;
    }

    .test-title {
      font-size: 14px;
      font-weight: bold;
      vertical-align: bottom;
      margin-left: 10px;
    }

    i {
      font-size: 18px;
    }

    margin-bottom: 10px;
  }
}
</style>

<style lang="scss">
.connection-test-dialog {
  .test-progress {
    .el-progress-bar__outer {
      border-radius: 0;
    }

    .el-progress-bar__inner {
      border-radius: 0;
    }

    margin-bottom: 10px;
  }

  .el-dialog__body {
    padding: 0 20px 20px;
  }

  .test-block {
    th,
    tr {
      .cell {
        white-space: normal !important;
        word-break: break-word;
      }
    }

    td,
    th.is-leaf {
      border-bottom: 1px solid #ebeef5;
    }

    thead {
      color: #222;
    }

    .information {
      width: 358px;
      white-space: normal;
    }
  }

  .el-table::before {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 0;
  }
}
</style>
