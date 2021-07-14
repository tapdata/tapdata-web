<template>
  <div>
    <div v-if="loading">
      <div v-loading="loading" style="margin-top: 100px; padding-bottom: 100px"></div>
      <div
        v-if="validateStatus == 'waiting' || validateStatus == 'draft' || validateStatus == 'interrupted'"
        class="verifyLog"
      >
        <span>{{ verifylog[validateStatus] }}</span>
        <span @click="GoBack" class="verify-backBtn">{{ $t('dataVerify.back') }}</span>
        <span>{{ $t('dataVerify.verifyRunningInfo') }}</span>
      </div>
      <div v-if="validateStatus === 'validating'" class="verifyLog">
        <span>{{ verifylog[validateStatus] }}</span>
        <span class="verify-backBtn" @click="GoBack">
          {{ $t('dataVerify.back') }}
        </span>
        <span>{{ $t('dataVerify.verifyRunningInfo') }}</span>
        <span>{{ $t('dataVerify.or') }}</span>
        <span class="verify-backBtn" @click="handleVerifyCancel">{{ $t('dataVerify.verifyStatusStop') }}</span>
      </div>
      <div v-if="validateStatus == 'error' || validateStatus == 'completed'" class="verifyLog">
        <span>{{ verifylog[validateStatus] }}</span>
      </div>
    </div>
    <div class="back-btn-box" v-if="!loading">
      <el-button class="back-btn-icon-box" @click="GoBack"><i class="iconfont icon-you2 back-btn-icon"></i></el-button>
      <span class="back-btn-text">{{ $t('dataVerify.dataVerify') }}</span>
    </div>
    <div class="data-contPreView" v-if="!loading">
      <div class="dv-pre-btn">
        <el-button size="mini" type="primary" @click="handleAddList"> {{ $t('dataVerify.again') }}</el-button>
      </div>
      <div class="clear"></div>
      <el-alert
        v-if="validateFailedMSG && validateFailedMSG !== ''"
        :title="validateFailedMSG"
        :closable="false"
        type="error"
        class="el-alert"
      >
      </el-alert>
      <div class="dv-contrast-table">
        <div class="dv-pre-label">
          {{ $t('dataVerify.overView') }}
          <div class="dv-pre-right">
            <span>{{ $t('dataVerify.time') }}: {{ overview.createTime }} </span>
            <span>{{ $t('dataVerify.duration') }}: {{ overview.costTime }}</span>
          </div>
        </div>
        <el-table border :data="validateStats" height="250" style="width: 100%">
          <el-table-column prop="sourceTableName" :label="$t('dataVerify.source')" width="180">
            <template slot-scope="scope">
              <el-tooltip
                class="item"
                effect="dark"
                :content="scope.row.sourceDatabaseName + ' / ' + scope.row.sourceTableName"
                placement="top-end"
              >
                <div>
                  <div>{{ `[S] ${scope.row.sourceDatabaseName}` }}</div>
                  <div>{{ scope.row.sourceTableName }}</div>
                  <div style="color: #bbb">
                    {{ `[T] ${scope.row.targetDatabaseName}` }}
                  </div>
                  <div style="color: #bbb">{{ scope.row.targetTableName }}</div>
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="validateType" :label="$t('dataVerify.dataWay')" width="95">
            <template slot-scope="scope">
              <span>
                {{ $t('dataVerify.' + scope.row.validateType) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="rows" :label="$t('dataVerify.range')"> </el-table-column>
          <el-table-column prop="rowsDiffer" :label="$t('dataVerify.result')">
            <template slot-scope="scope">
              <span
                :class="{
                  error: scope.row.rowsDiffer !== 0 || scope.row.rowsMismatch !== 0
                }"
              >
                {{ scope.row.validateType == 'row' ? scope.row.rowsDiffer : scope.row.rowsMismatch }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="consistencyRate" :label="$t('dataVerify.accuracyRate')" width="80">
            <template slot-scope="scope">
              <span :class="{ error: scope.row.consistencyRate != 100 }">
                {{ scope.row.consistencyRate }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div>
        <div class="dv-contrast-box">
          <div class="dv-contrast-header">
            <div class="dv-pre-right">
              <span :class="{ error: count > 0 }"> error : {{ count }}</span>
              <el-pagination
                class="dv-result-pagination"
                :pager-count="0"
                layout="prev, next"
                :total="count"
                :page-size="pageSize"
                @current-change="handleCurrentChange"
              >
              </el-pagination>
            </div>
            {{ $t('dataVerify.errorComparison') }}
            <el-select size="mini" v-model="source.tableName" class="dv-pre-right" @change="handleSearch" clearable>
              <el-option
                v-for="item in validateStats"
                :key="item.sourceTableName"
                :label="item.sourceTableName"
                :value="item.sourceTableName"
              >
              </el-option>
            </el-select>
          </div>
          <el-table border :data="failedRow" class="dv-result-fail-table" style="width: 100%" :loading="failRowLoading">
            <el-table-column prop="sourceTableData" :label="$t('dataVerify.source')">
              <template slot-scope="scope">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="scope.row.sourceStage.databaseName + ' / ' + scope.row.sourceStage.tableName"
                  placement="top-end"
                >
                  <div>
                    <div style="color: #bbb">
                      {{ scope.row.sourceStage.databaseName }}
                    </div>
                    <div style="color: #bbb">
                      {{ scope.row.sourceStage.tableName }}
                    </div>
                    <div>
                      {{ scope.row.sourceTableData }}
                    </div>
                  </div>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="targetTableData" :label="$t('dataVerify.target')">
              <template slot-scope="scope">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="scope.row.targetStage.databaseName + ' / ' + scope.row.targetStage.tableName"
                  placement="top-end"
                >
                  <div>
                    <div style="color: #bbb">
                      {{ scope.row.targetStage.databaseName }}
                    </div>
                    <div style="color: #bbb">
                      {{ scope.row.targetStage.tableName }}
                    </div>
                    <div>
                      {{ scope.row.targetTableData }}
                    </div>
                  </div>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="Message"> </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import factory from '../../../api/factory'
import log from '../../../log'
import getUrlSearch from './getUrlSearch'
const dataFlows = factory('DataFlows')
const ValidationResults = factory('validationResults')
import * as moment from 'moment'

export default {
  data() {
    return {
      loading: true,
      failRowLoading: false,
      overview: {},
      failedRow: [],
      validateStats: [],
      count: '',
      source: {
        tableName: ''
      },
      colorMap: {
        row: '#409EFF',
        hash: '#62A569',
        advance: '#9889D8'
      },
      timer: '',
      validateFailedMSG: '',
      currentPage: 1,
      pageSize: 10,
      validateBatchId: '',
      validateStatus: '',
      verifylog: {
        waiting: this.$t('dataVerify.verifyStatusWaiting'),
        draft: this.$t('dataVerify.verifyStatusDraft'),
        validating: this.$t('dataVerify.verifyStatusValidating'),
        completed: this.$t('dataVerify.verifyStatusCompleted'),
        error: this.$t('dataVerify.verifyStatusCompleted'),
        interrupted: this.$t('dataVerify.verifyStatusInterrupted')
      }
    }
  },
  created() {
    this.id = getUrlSearch.getUrlSearch('id')
    this.getValidateBatchId()
    this.timer = setInterval(() => {
      this.getValidateBatchId()
    }, 2000)
  },
  destroyed() {
    // 清除定时器
    clearInterval(this.timer)
    this.timer = null
  },
  methods: {
    handleAddList() {
      this.editor.showDataVerify(true)
    },
    getValidateBatchId() {
      dataFlows
        .get([this.id], {
          fields: ['validateBatchId', 'validateStatus', 'validateFailedMSG']
        })
        .then(res => {
          if (res.statusText === 'OK' || res.status === 200) {
            this.validateStatus = res.data.validateStatus
            if (res.data.validateStatus === 'completed' || res.data.validateStatus === 'error') {
              this.validateBatchId = res.data.validateBatchId ? res.data.validateBatchId.toString() : ''
              this.validateFailedMSG = res.data.validateFailedMSG
              // 清除定时器
              clearInterval(this.timer)
              this.timer = null
              this.getData()
              this.getFailedRow()
            }
          }
        })
    },
    getData() {
      let where = {
        filter: {
          where: {
            validateBatchId: this.validateBatchId,
            dataFlowId: {
              regexp: `^${this.id}$`
            },
            type: {
              inq: ['tableOverview', 'overview']
            }
          }
        }
      }
      ValidationResults.get(where).then(res => {
        if (res.statusText === 'OK' || res.status === 200) {
          if (res.data) {
            this.loading = false
            if (res.data[1]) {
              this.overview = res.data[1].type === 'overview' ? res.data[1] : res.data[0]
              this.overview.createTime = this.overview.createTime
                ? moment(this.overview.createTime).format('YYYY-MM-DD HH:mm:ss')
                : ''
              this.overview.costTime = this.overview.costTime ? this.overview.costTime / 1000 + ' s' : ''
            }
            if (res.data[0]) {
              this.validateStats =
                res.data[0].type === 'tableOverview' ? res.data[0].validateStats : res.data[1].validateStats
            }
            log('dataVerify.result', this.validateStats)
          }
        } else {
          this.loading = false
        }
      })
      this.getCount()
    },
    handleCurrentChange(cpage) {
      this.currentPage = cpage
      this.getFailedRow()
    },
    handleSearch() {
      this.getFailedRow(this.validateBatchId)
      this.getCount()
    },
    getFailedRow() {
      let whereFailedRow = {
        filter: {
          where: {
            validateBatchId: this.validateBatchId,
            dataFlowId: {
              regexp: `^${this.id}$`
            },
            type: {
              inq: ['failedRow']
            }
          },
          limit: this.pageSize,
          skip: (this.currentPage - 1) * this.pageSize
        }
      }
      if (this.source.tableName && this.source.tableName !== '') {
        whereFailedRow.filter.where['sourceStage.tableName'] = this.source.tableName
      }
      this.failRowLoading = true
      ValidationResults.get(whereFailedRow).then(res => {
        if (res.statusText === 'OK' || res.status === 200) {
          this.failRowLoading = false
          if (res.data) {
            this.failedRow = res.data
            log('dataVerify.error', res.data)
          }
        } else {
          this.failRowLoading = false
        }
      })
    },
    getCount() {
      let whereCount = {
        where: {
          validateBatchId: this.validateBatchId,
          dataFlowId: {
            regexp: `^${this.id}$`
          },
          type: {
            inq: ['failedRow']
          }
        },
        limit: this.pageSize,
        skip: (this.currentPage - 1) * this.pageSize
      }
      if (this.source.tableName && this.source.tableName !== '') {
        whereCount.where['sourceStage.tableName'] = this.source.tableName
      }
      ValidationResults.count(whereCount).then(res => {
        if (res.statusText === 'OK' || res.status === 200) {
          if (res.data) {
            this.count = res.data.count
            log('dataVerify.count', res.data.count)
          }
        }
      })
    },
    handleVerifyCancel() {
      let self = this
      // 状态修改为 interrupted 停止校验
      let data = {
        validateStatus: 'interrupted'
      }
      dataFlows.patchId(this.id, data).then(res => {
        if (res.statusText === 'OK' || res.status === 200) {
          self.editor.showMonitor()
        }
      })
    },
    GoBack() {
      this.editor.showMonitor()
    }
  }
}
</script>
<style lang="scss" scoped>
.data-contPreView {
  margin-left: 20px;
  margin-right: 20px;
}
.dv-pre-rowCheck p {
  font-size: 14px;
  font-weight: 400;
  color: rgba(153, 153, 153, 1);
  line-height: 58px;
}
.dv-pre-label {
  height: 39px;
  line-height: 39px;
  padding-left: 10px;
  background: rgba(250, 250, 250, 1);
  border-bottom: 1px solid rgba(220, 223, 230, 1);
}
.dv-pre-right {
  float: right;
  margin-right: 10px;
  color: #999;
}
.dv-pre-rowTotal {
  float: left;
  width: 24%;
  font-size: 12px;
  line-height: 40px;
  height: auto;
  margin-top: 10px;
  margin-left: 10px;
  border-right: 1px solid rgba(220, 223, 230, 1);
}
.dv-pre-dataBox {
  float: left;
  width: 72%;
  display: flex;
  margin-left: 10px;
  justify-content: space-around;
}
.dv-pre-dataBox-item {
  font-size: 50px;
  font-weight: 400;
  color: rgba(72, 182, 226, 1);
  line-height: 56px;
  text-align: center;
}
.dv-contrast-table {
  margin-bottom: 10px;
  box-shadow: 2px 2px 7px 0px rgba(0, 0, 0, 0.1);
  min-height: 300px;
  margin-top: 10px;
  font-size: 12px;
  border: 1px solid rgba(220, 223, 230, 1);
  background: rgba(255, 255, 255, 1);
}
.dv-contrast-box {
  width: 100%;
  margin-top: 10px;
  background: rgba(255, 255, 255, 1);
  //border:1px solid rgba(220, 223, 230, 1);
  box-shadow: 2px 2px 7px 0px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
.dv-contrast-header {
  height: 39px;
  line-height: 39px;
  font-size: 14px;
  padding-left: 10px;
  background: rgba(250, 250, 250, 1);
  border-top: 1px solid rgba(220, 223, 230, 1);
  border-left: 1px solid rgba(220, 223, 230, 1);
  border-right: 1px solid rgba(220, 223, 230, 1);
}
.dv-contrast-content {
  display: flex;
  justify-content: space-around;
}
.dv-contrast-content-item-tip {
  height: 39px;
  line-height: 39px;
  padding-left: 10px;
  background: rgba(250, 250, 250, 1);
  border-bottom: 1px solid rgba(220, 223, 230, 1);
  color: #666;
}
.dv-contrast-content-item-text {
  padding: 10px;
  color: #666;
}
.dv-contrast-content :first-child {
  border-left: none;
}
.dv-contrast-content-item {
  width: 33%;
  font-size: 12px;
  border-left: 1px solid #dedee4;
}
.dv-pre-btn {
  margin-top: 10px;
  float: right;
}
.clear {
  clear: both;
}
.el-alert {
  margin-top: 10px;
}
.btn-box {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
.back-btn-box {
  width: 100%;
  height: 29px;
  background: #f5f5f5;
  border-bottom: 1px solid #dedee4;
}
.back-btn-text {
  font-size: 12px;
}
.back-btn-icon-box {
  width: 30px;
  height: 30px;
  display: inline-block;
  border-radius: 0;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #409eff;
  border: 0;
  color: red;
  -webkit-appearance: none;
  text-align: center;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  outline: 0;
  margin: 0;
  -webkit-transition: 0.1s;
  transition: 0.1s;
  font-weight: normal;
  padding: 0;
  font-size: 14px;
}
.back-btn-icon-box:hover {
  background: #6dc5e8;
}
.back-btn-icon {
  color: #fff;
}
.dv-pre-rowText {
  display: inline-block;
  padding-left: 20px;
}
.verifyLog {
  text-align: center;
  color: #999;
  font-size: 12px;
}
.verify-backBtn {
  cursor: pointer;
  color: #5fa9ee;
}
.error {
  color: orangered;
}
</style>
<style lang="scss">
.dv-pre-right .el-pagination {
  white-space: nowrap;
  padding: 0;
  font-weight: 700;
  display: inline-block;
  background: #fafafa;
  height: 16px;
}
.dv-pre-right .el-pagination button:disabled {
  background-color: #fafafa;
}
.dv-pre-right .el-pagination button:disabled {
  background-color: #fafafa;
}
.dv-pre-right .el-pagination .btn-next {
  padding-left: 0;
}
.dv-pre-right .el-pagination .btn-next,
.el-pagination .btn-prev {
  background-color: #fafafa;
}
.el-pagination button,
.el-pagination span:not([class*='suffix']) {
  height: 39px;
}
.dv-result-fail-table td .cell,
.el-table th .cell {
  white-space: normal;
}
</style>
