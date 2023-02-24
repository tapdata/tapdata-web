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
      <div
        v-if="testData.testLogs && testData.testLogs.length === 0 && wsError === 'ERROR'"
        style="color: #d54e21"
        class="flex align-items-baseline"
      >
        <i class="el-icon-warning" style="color: #d54e21"></i>
        <pre v-if="wsErrorMsg" v-html="wsErrorMsg" class="test-title overflow-auto mt-0"></pre>
        <span v-else>{{ $t('packages_business_dataForm_test_error') }}</span>
      </div>
      <div v-else>
        <div class="test-status" v-if="['invalid', 'ERROR'].includes(status)">
          <VIcon :style="{ color: colorMap[status] }">error</VIcon>
          <span class="test-title">{{ $t('packages_business_dataForm_test_testResultFail') }}</span>
        </div>
        <div class="test-status" v-if="['ready'].includes(status)">
          <i class="el-icon-success" :style="{ color: colorMap[status] }"></i>
          <span class="test-title">{{ $t('packages_business_dataForm_test_testResultSuccess') }}</span>
        </div>
        <div class="test-status" v-if="!['ready', 'invalid', 'ERROR'].includes(status)">
          <el-image
            style="width: 20px; height: 20px; vertical-align: bottom"
            :src="require('@tap/assets/images/loading.gif')"
          ></el-image>
          <span v-if="testData.testLogs.length === 0">{{ $t('packages_business_dataForm_primaryTest') }}</span>
          <span v-else>{{ $t('packages_business_dataForm_testing') }}</span>
        </div>
      </div>
    </div>
    <el-table
      :data="testData.testLogs"
      style="width: 100%"
      max-height="500"
      class="test-block"
      :row-style="rowStyleHandler"
      v-show="testData.testLogs && testData.testLogs.length > 0"
    >
      <el-table-column prop="show_msg" :label="$t('packages_business_dataForm_test_items')">
        <template v-slot="scope">
          <span>{{ scope.row.show_msg }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('packages_business_dataForm_test_result')" width="150">
        <template v-slot="scope">
          <!--当前检查项失败 但是不影响此次测试结果 -->
          <span v-if="scope.row.status === 'failed' && !scope.row.required">
            <VIcon size="16" :style="{ color: colorMap['warning'] }">warning</VIcon>
            <!--<i class="el-icon-warning" :style="{ color: colorMap[status] }"></i>-->
            {{ statusMap[scope.row.status] }}
          </span>
          <span v-else-if="scope.row.status === 'unTest'">
            <el-image
              style="width: 20px; height: 20px; vertical-align: bottom"
              :src="require('@tap/assets/images/loading.gif')"
            ></el-image>
            {{ statusMap[scope.row.status] }}
          </span>
          <span v-else>
            <VIcon size="16" :style="{ color: colorMap[scope.row.status] }">{{ iconMap[scope.row.status] }}</VIcon>
            {{ statusMap[scope.row.status] }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="fail_message"
        :label="$t('packages_business_dataForm_test_information')"
        width="308"
      ></el-table-column>
    </el-table>
    <!--    <span v-show="testData.testLogs && testData.testLogs.length > 0">ERROR: {{ wsErrorMsg }}</span>-->
    <template v-slot:footer>
      <span class="dialog-footer">
        <el-button v-if="isTimeout" size="mini" @click="start()">{{
          $t('packages_business_dataForm_test_retryBtn')
        }}</el-button>
        <el-button size="mini" type="primary" @click="handleClose()">{{
          $t('packages_business_dataForm_close')
        }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../../utils/gogocodeTransfer'
import { VIcon } from '@tap/component'
export default {
  name: 'Test',
  components: { VIcon },
  props: {
    visible: {
      value: Boolean
    },
    formData: {
      value: Object
    }
  },
  data() {
    return {
      progress: 0,
      testData: {
        testLogs: [],
        testResult: '',
        progress: 0
      },
      wsError: '',
      wsErrorMsg: '',
      status: '',
      timer: null,
      isTimeout: true,
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
        ready: 'success',
        invalid: 'error',
        testing: '',
        passed: 'success',
        waiting: 'question-fill',
        failed: 'error',
        unTest: ''
      },
      statusMap: {
        ready: this.$t('packages_business_dataForm_test_success'),
        invalid: this.$t('packages_business_dataForm_test_fail'),
        testing: this.$t('packages_business_dataForm_test_testing'),
        passed: this.$t('packages_business_dataForm_test_success'),
        waiting: this.$t('packages_business_dataForm_test_testing'),
        failed: this.$t('packages_business_dataForm_test_fail'),
        unTest: this.$t('packages_business_dataForm_test_unTest')
      }
    }
  },
  mounted() {
    this.handleWS()
  },
  unmounted() {
    this.clearInterval()
  },
  methods: {
    rowStyleHandler({ row }) {
      return row.status === 'waiting' ? { background: '#fff' } : ''
    },
    handleClose() {
      $emit(this, 'update:visible', false)
      this.clearInterval()
    },
    handleWS() {
      this.$ws.ready(() => {
        //接收数据
        this.$ws.on('testConnectionResult', data => {
          this.isTimeout = false //有回调
          let result = data.result || []
          this.wsError = data.status
          this.wsErrorMsg = data.error
          clearTimeout(this.timer)
          this.timer = null
          let testData = {
            wsError: data.status
          }
          if (result.response_body) {
            let validate_details = result.response_body.validate_details || []
            let details = validate_details.filter(item => item.status !== 'waiting')
            // let unPassedNums = validate_details.filter(item => item.status !== 'passed');
            if (details.length === 0) {
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
            this.wsError = data.status
            //this.wsErrorMsg = data.error
          }
          $emit(this, 'returnTestData', testData)
        })
        //长连接失败
        this.$ws.on('testConnection', data => {
          this.wsError = data.status
          this.wsErrorMsg = data.error
          let testData = {
            wsError: data.status
          }
          $emit(this, 'returnTestData', testData)
        })
        //长连接失败
        this.$ws.on('pipe', data => {
          this.wsError = data.status
          this.wsErrorMsg = data.error
          let testData = {
            wsError: data.status
          }
          $emit(this, 'returnTestData', testData)
        })
      })
    },
    start(updateSchema, editTest) {
      let data = Object.assign({}, this.formData)
      delete data.schema
      delete data.response_body
      this.startByConnection(data, updateSchema, editTest)
    },

    startByConnection(connection, updateSchema, editTest) {
      let msg = {
        type: 'testConnection',
        data: connection
      }
      msg.data['updateSchema'] = false //默认值
      msg.data['editTest'] = false //默认值
      this.wsError = ''
      this.testData.testLogs = []
      if (updateSchema) {
        msg.data['updateSchema'] = updateSchema //是否需要更新Schema
      }
      if (editTest) {
        msg.data['editTest'] = editTest //是否编辑测试
      }
      this.$ws.ready(() => {
        this.$ws.send(msg)
        // 连接测试时出现access_token过期,重发消息
        this.$ws.once('401', () => {
          this.$ws.send(msg)
        })
        this.timer && clearTimeout(this.timer)
        this.timer = null
        this.timer = setTimeout(() => {
          this.isTimeout = true //重置
          this.wsError = 'ERROR'
          this.wsErrorMsg = this.wsErrorMsg ? this.wsErrorMsg : this.$t('packages_business_dataForm_test_retryTest')
          let testData = {
            wsError: 'ERROR'
          }
          $emit(this, 'returnTestData', testData)
        }, 120000)
      })
    },
    clearInterval() {
      // 取消长连接
      this.$ws.off('testConnection')
      this.testData.testLogs = []
      this.status = ''
    }
  },
  emits: ['update:visible', 'returnTestData']
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
      }
    }

    td,
    th.is-leaf {
      border-bottom: 1px solid #ebeef5;
    }

    thead {
      color: map-get($fontColor, dark);
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
