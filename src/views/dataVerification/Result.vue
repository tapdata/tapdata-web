<template>
  <section class="data-flow-wrap" v-loading="loading">
    <div class="panel-main">
      <div class="main main-border">
        <div class="title">{{ name }}</div>
        <div class="text" v-if="type === 'row_count'">
          {{ $t('dataVerification.rowVerify') }}
        </div>
        <div class="text" v-if="type === 'field'">
          {{ $t('dataVerification.contentVerify') }}
        </div>
        <div class="text" v-if="type === 'jointField'">
          {{ $t('dataVerification.jointVerify') }}
        </div>
        <div
          class="error-band"
          style="width: 96.5%"
          v-if="errorMsg && type === 'row_count'"
        >
          <i class="iconfont icon-warning-circle"></i>
          <span>{{ errorMsg }}</span>
        </div>
        <el-table
          :element-loading-text="$t('dataFlow.dataLoading')"
          :data="tableData"
          highlight-current-row
          @current-change="handleCurrentChange"
          @row-click="rowClick"
          ref="singleTable"
          height="100%"
          class="dv-table border"
        >
          <ElTableColumn width="45">
            <template slot-scope="scope">
              <ElRadio :value="currentRow" :label="scope.row.taskId">
                <span></span>
              </ElRadio>
            </template>
          </ElTableColumn>
          <el-table-column :label="$t('dataVerification.sourceTable')">
            <template slot-scope="scope">
              <span>{{ scope.row.source ? scope.row.source.table : '' }}</span>
              <div style="color: #ccc">
                {{ scope.row.source ? scope.row.source.connectionName : '' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('dataVerification.targetTable')">
            <template slot-scope="scope">
              <span>{{ scope.row.target ? scope.row.target.table : 0 }}</span>
              <div style="color: #ccc">
                {{ scope.row.target ? scope.row.target.connectionName : 0 }}
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('dataVerification.sourceRows')">
            <template slot-scope="scope">
              <span>{{
                scope.row.source_total ? scope.row.source_total : 0
              }}</span>
              <div>
                {{ scope.row.target_total ? scope.row.target_total : 0 }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="progress"
            :label="$t('dataVerification.verifyProgress')"
            width="80px"
          >
            <template slot-scope="scope">
              <div>
                <span>{{
                  `${
                    Math.round(scope.row.progress * 10000) / 100
                      ? Math.round(scope.row.progress * 10000) / 100
                      : 0
                  }%`
                }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            :label="$t('dataVerification.verifyResult')"
          >
            <template
              slot-scope="scope"
              v-if="['waiting', 'done'].includes(scope.row.status)"
            >
              <div class="inspect-result-status">
                <div v-if="scope.row.result === 'failed'">
                  <span
                    class="error"
                    v-if="scope.row.target_total - scope.row.source_total !== 0"
                  >
                    <i class="el-icon-error"></i>
                    <span>{{
                      $t('dataVerification.rowConsistent') +
                      ' : ' +
                      Math.abs(scope.row.target_total - scope.row.source_total)
                    }}</span>
                  </span>
                </div>
                <div
                  v-if="
                    scope.row.source_only +
                      scope.row.target_only +
                      scope.row.row_failed !==
                      0 &&
                    type !== 'row_count' &&
                    scope.row.result === 'failed'
                  "
                >
                  <span class="error">
                    <i class="el-icon-error"></i>
                    <span>
                      {{ $t('dataVerification.contConsistent') + ' : ' }}
                      {{
                        scope.row.source_only +
                        scope.row.target_only +
                        scope.row.row_failed
                      }}
                    </span>
                  </span>
                </div>
                <span class="success" v-if="scope.row.result === 'passed'">
                  <i class="el-icon-success"></i>
                  <span>{{ $t('dataVerification.consistent') }}</span>
                </span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!--			<el-pagination-->
      <!--				class="pagination"-->
      <!--				background-->
      <!--				layout="total,prev, pager, next,sizes"-->
      <!--				:page-sizes="[20, 30, 50, 100]"-->
      <!--				:page-size.sync="tablePageSize"-->
      <!--				:total="tableTotal"-->
      <!--				:current-page.sync="tableCurrentPage"-->
      <!--				@current-change="getData"-->
      <!--				@size-change="getData(1)"-->
      <!--			>-->
      <!--			</el-pagination>-->
    </div>
    <div
      class="panel-main panel-box"
      v-if="type !== 'row_count'"
      v-loading="detailsLoading"
    >
      <div class="tip" style="padding-left: 10px">
        {{ $t('dataVerification.verifyDetail') }}
      </div>
      <div class="main">
        <ul
          class="inspect-result"
          v-if="resultData && resultData[0] && resultData[0].status"
        >
          <li>
            <span>
              {{
                $t('dataVerification.sourceTable') +
                ' : ' +
                resultData[0].source.table +
                ' / ' +
                resultData[0].source.connectionName
              }}
            </span>
            <span style="color: #ccc">
              {{ `( Row: ${resultData[0].source_total} )` }}
            </span>
          </li>
          <li>
            <span>
              {{
                $t('dataVerification.targetTable') +
                ' : ' +
                resultData[0].target.table +
                ' / ' +
                resultData[0].target.connectionName
              }}
            </span>
            <span style="color: #ccc">
              {{ `( Row: ${resultData[0].target_total} )` }}
            </span>
          </li>
          <li>
            <span>{{
              $t('dataVerification.verifyResult') + ' : ' + resultData[0].result
            }}</span>
          </li>
          <li v-if="resultData[0].result !== 'passed'">
            <span>{{
              $t('dataVerification.rowConsistent') +
              ' : ' +
              Math.abs(resultData[0].target_total - resultData[0].source_total)
            }}</span>
          </li>
          <li v-if="resultData[0].result !== 'passed'">
            <span>{{ $t('dataVerification.contConsistent') + ' : ' }}</span>
            <span>{{
              resultData[0].source_only +
              resultData[0].target_only +
              resultData[0].row_failed
            }}</span>
          </li>
        </ul>
        <div
          class="success-band"
          v-if="
            resultData && resultData[0] && resultData[0].result === 'passed'
          "
        >
          <i class="iconfont icon-zhuhe"></i>
          <span>{{ $t('dataVerification.success') }}</span>
        </div>
        <div
          class="error-band"
          v-if="resultData && resultData[0] && resultData[0].status === 'error'"
        >
          <i class="iconfont icon-warning-circle"></i>
          <span>{{ resultData[0].errorMsg }}</span>
        </div>
        <div
          class="inspect-result-box"
          v-if="
            resultData[0] &&
            resultData[0].result !== 'passed' &&
            !showAdvancedVerification
          "
        >
          <div
            v-for="item in inspectResult"
            :key="item.id"
            class="inspect-details"
          >
            <ul class="father-table">
              <li>{{ $t('dataVerification.inconsistentType') }}</li>
              <li>{{ $t('dataVerification.sourceFieldName') }}</li>
              <li>{{ $t('dataVerification.Value') }}</li>
              <li>{{ $t('dataVerification.targetFieldName') }}</li>
              <li>{{ $t('dataVerification.Value') }}</li>
            </ul>
            <ul
              class="sub-table"
              v-for="detail in item.details"
              :key="detail.id"
            >
              <li>
                {{
                  detail.type === 'uniqueField'
                    ? $t('dataVerification.uniqueField')
                    : $t('dataVerification.otherField')
                }}
              </li>
              <li>{{ detail.source.key }}</li>
              <li :class="{ red: detail.source.value !== detail.target.value }">
                {{ detail.source.value }}
              </li>
              <li>{{ detail.target.key }}</li>
              <li :class="{ red: detail.source.value !== detail.target.value }">
                {{ detail.target.value }}
              </li>
            </ul>
          </div>
        </div>
        <div
          class="inspect-ad-box"
          v-if="
            resultData[0] &&
            resultData[0].result !== 'passed' &&
            showAdvancedVerification
          "
        >
          <div class="title-box">
            <div>{{ $t('dataVerification.verifyResult') }}</div>
          </div>
          <div
            v-for="item in inspectResult"
            :key="item.id"
            class="inspect-details"
          >
            <div class="message-box">
              <span>{{ $t('dataVerification.returnMsg') }}</span>
              <div>{{ item.message }}</div>
            </div>
            <ul class="father-table">
              <li>{{ $t('dataVerification.sourceTableData') }}</li>
              <li>{{ $t('dataVerification.returnedData') }}</li>
            </ul>
            <ul class="sub-table">
              <li><JsonViewer :value="item.source"></JsonViewer></li>
              <li>
                <JsonViewer
                  :value="item.target ? item.target.data : ''"
                ></JsonViewer>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <el-pagination
        v-if="!showAdvancedVerification"
        class="pagination"
        background
        layout="total,prev, pager, next,sizes"
        :page-sizes="[20, 30, 50, 100]"
        :page-size.sync="inspectPageSize"
        :total="inspectTotal"
        :current-page.sync="inspectResultCurrentPage"
        @current-change="changeInspectResult(inspectResultCurrentPage, taskId)"
        @size-change="changeInspectResult(1, taskId)"
      >
      </el-pagination>
    </div>
  </section>
</template>

<script>
import JsonViewer from 'vue-json-viewer'
export default {
  components: { JsonViewer },
  data() {
    return {
      tableData: [],
      id: '',
      taskId: '',
      inspect_id: '',
      type: '',
      name: '',
      inspectResult: [],
      resultData: [],
      tasks: [],
      showAdvancedVerification: false,
      loading: false,
      detailsLoading: false,
      dialogJsonVisible: false,
      advanceVerifyData: {},
      tableCurrentPage: 1,
      inspectResultCurrentPage: 1,
      tableTotal: 1,
      inspectTotal: 1,
      inspectPageSize: 30,
      tablePageSize: 20,
      colorMap: {
        running: '#ee5353'
      },
      currentRow: null,
      errorMsg: ''
    }
  },
  created() {
    this.id = this.$route.query.id
    this.inspect_id = this.$route.query.inspectId
    this.getData(1, this.id, this.inspect_id)
    if (this.showAdvancedVerification) {
      this.inspectPageSize = 1
    }
  },
  watch: {
    tableData: function () {
      if (this.type !== 'row_count') {
        this.$nextTick(function () {
          this.$refs.singleTable.setCurrentRow(this.tableData[0])
        })
      }
    }
  },
  methods: {
    getData(pageNum, id, inspect_id) {
      this.loading = true
      let currentPage = pageNum || this.tableCurrentPage + 1
      let where = {
        where: {
          id: id,
          inspect_id: { regexp: `^${inspect_id}$` }
        },
        order: 'createTime DESC',
        limit: this.tablePageSize,
        skip: (currentPage - 1) * this.tablePageSize
      }
      Promise.all([
        this.$api('InspectResults').count(where),
        this.$api('InspectResults').get({
          filter: JSON.stringify(where)
        })
      ])
        .then(([countRes, res]) => {
          if (res.data) {
            this.loading = false
            this.type = res.data[0].inspect
              ? res.data[0].inspect.inspectMethod
              : ''
            this.name = res.data[0].inspect ? res.data[0].inspect.name : ''
            this.tableData = res.data[0].stats
            this.tasks = res.data[0].inspect ? res.data[0].inspect.tasks : ''
            if (this.tableData.length > 0) {
              this.taskId = this.tableData[0].taskId
              this.errorMsg =
                res.data[0].status === 'error'
                  ? res.data[0].errorMsg
                  : undefined
              this.changeInspectResult(1, this.tableData[0].taskId)
            }
            this.tableCurrentPage = currentPage
            this.tableTotal = countRes.data.count
            this.setCurrent(this.tableData[0] || null)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    setCurrent(row) {
      this.$refs.singleTable.setCurrentRow(row)
    },
    handleCurrentChange(val) {
      this.currentRow = val.taskId
    },
    rowClick(row) {
      this.selectedTask = row.taskId
      this.changeInspectResult(1, row.taskId)
    },
    GoBack() {
      this.$router.push('/dataVerification')
    },
    changeInspectResult(pageNum, taskId) {
      if (!taskId) {
        return
      }
      this.detailsLoading = true
      let findAdVance = this.tasks?.filter(item => item.taskId === taskId) || []
      if (findAdVance.length > 0)
        this.showAdvancedVerification = findAdVance[0].showAdvancedVerification
      this.taskId = taskId
      let currentPage = pageNum || this.inspectResultCurrentPage + 1
      this.resultData = this.tableData.filter(
        item => item.taskId === this.taskId
      )
      let where = {
        where: {
          taskId: this.taskId,
          inspect_id: { regexp: `^${this.inspect_id}$` },
          inspectResultId: { regexp: `^${this.id}$` }
        },
        order: 'createTime DESC',
        limit: this.showAdvancedVerification ? 1 : this.inspectPageSize,
        skip:
          (currentPage - 1) *
          (this.showAdvancedVerification ? 1 : this.inspectPageSize)
      }
      Promise.all([
        this.$api('InspectDetails').count(where),
        this.$api('InspectDetails').get({
          filter: JSON.stringify(where)
        })
      ])
        .then(([countRes, res]) => {
          if (res.data) {
            if (this.showAdvancedVerification) {
              this.inspectResult = res.data || []
            } else {
              this.inspectResult = this.handleOtherVerify(res.data)
            }
            this.inspectResultCurrentPage = currentPage
            this.inspectTotal = countRes.data.count
          }
        })
        .finally(() => {
          this.loading = false
          this.detailsLoading = false
        })
    },
    handleOtherVerify(data) {
      if (data.length === 0) {
        return
      }
      data.map(item => {
        let source = item.source || {}
        let target = item.target || {}
        let sourceKeys = Object.keys(source)
        let targetKeys = Object.keys(target)
        let key = Array.from(new Set([...sourceKeys, ...targetKeys])) //找出所有的key的并集
        key.forEach(i => {
          let sourceValue = ''
          let targetValue = ''
          if (sourceKeys.filter(v => i === v)) {
            sourceValue = source[i]
          } else {
            sourceValue = ''
          }
          if (targetKeys.filter(v => i === v)) {
            targetValue = target[i]
          } else {
            targetValue = ''
          }
          let node = {
            type: item.type,
            source: {
              key: i,
              value: sourceValue
            },
            target: {
              key: i,
              value: targetValue
            }
          }
          item['details'] = item['details'] || []
          item['details'].push(node)
        })
      })
      return data
    },
    preview(data) {
      this.dialogJsonVisible = true
      this.advanceVerifyData = data
    }
  }
}
</script>

<style lang="scss">
$margin: 10px;
.data-flow-wrap {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .panel-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    &.panel-box {
      margin-bottom: 10px;
      border-left: 1px solid #dedee4;
      border-bottom: 1px solid #dedee4;
    }
    .tip {
      height: 30px;
      font-size: 12px;
      background: #f5f5f5;
      border: 1px solid #dedee4;
      border-left: 0;
      line-height: 30px;
    }
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .dv-table {
        margin: $margin;
        width: 97.5%;
      }
      .row-result {
        color: #fff;
        border-radius: 10px;
        background-color: #ee5353;
      }
      .error-band {
        background: #fdf6ec;
        border: 1px solid #f8e2c0;
        color: #e6a23c;
        margin: 10px;
        line-height: 20px;
        max-height: 160px;
        text-overflow: ellipsis;
        overflow-y: auto;
        font-size: 12px;
        padding: 8px;
      }
      .success-band {
        line-height: 20px;
        max-height: 160px;
        text-overflow: ellipsis;
        font-size: 12px;
        padding: 8px;
        color: #666;
        margin: 20% auto;
        i {
          font-size: 36px;
          color: #409eff;
        }
      }
      .title {
        font-weight: bold;
        color: #409eff;
        padding-left: $margin;
        margin: 20px 0 0 0;
      }
      .text {
        color: #666;
        font-size: 12px;
        margin-top: $margin;
        padding-left: $margin;
      }
      .inspect-result {
        font-size: 12px;
        margin: $margin;
        li {
          margin-top: 10px;
        }
      }
      .inspect-result-status {
        .error,
        .success {
          padding: 0 8px 0 5px;
          display: inline-block;
          line-height: 20px;
          color: #fff;
          border-radius: 20px;
        }
        .error {
          background: #f56c6c;
        }
        .success {
          background: #70ae48;
        }
      }
      .inspect-ad-box {
        margin: 0 10px;
        border: 1px solid #dedee4;
        .inspect-details {
          padding: 0 10px 10px 10px;
        }
        .title-box {
          color: #333;
          background: #fafafa;
          font-size: 12px;
          line-height: 28px;
          padding-left: 10px;
          border-bottom: 1px solid #dedee4;
        }
        .message-box {
          color: #333;
          font-size: 12px;
          div {
            padding: 5px 10px;
            margin-top: 5px;
            border: 1px solid #dedee4;
            white-space: pre-wrap;
            word-break: break-word;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          margin-bottom: 10px;
          margin-top: 10px;
        }
        li {
          min-width: 0;
          font-size: 12px;
          box-sizing: border-box;
          text-overflow: ellipsis;
          vertical-align: middle;
          position: relative;
          text-align: left;
          padding: 3px 10px;
          word-wrap: break-word;
        }
        .father-table {
          display: flex;
          margin-bottom: 10px;
          li {
            flex: 1;
          }
        }
        .sub-table {
          display: flex;
          li {
            flex: 1;
            border-left: 1px solid #dedee4;
            border-top: 1px solid #dedee4;
            overflow: auto;
            height: 350px;
          }
          li:last-child {
            border-right: 1px solid #dedee4;
          }
        }
        .sub-table:last-child {
          border-bottom: 1px solid #dedee4;
        }
      }
      .inspect-result-box {
        overflow: auto;
        .red {
          color: #ee5353;
        }
        .inspect-details {
          margin: 0 10px;
          li {
            min-width: 0;
            font-size: 12px;
            box-sizing: border-box;
            text-overflow: ellipsis;
            vertical-align: middle;
            position: relative;
            text-align: left;
            padding: 3px 10px;
            word-wrap: break-word;
          }
          .father-table {
            display: flex;
            li {
              flex: 1;
              background-color: #f5f5f5;
              border-left: 1px solid #dedee4;
              border-top: 1px solid #dedee4;
            }
            li:last-child {
              border-right: 1px solid #dedee4;
            }
          }
          .sub-table {
            display: flex;
            li {
              flex: 1;
              border-left: 1px solid #dedee4;
              border-top: 1px solid #dedee4;
            }
            li:last-child {
              border-right: 1px solid #dedee4;
            }
          }
          .sub-table:last-child {
            border-bottom: 1px solid #dedee4;
          }
          div {
            font-size: 12px;
            box-sizing: border-box;
            text-overflow: ellipsis;
            vertical-align: middle;
            position: relative;
            text-align: left;
            padding: 16px 10px;
            word-wrap: break-word;
            border: 1px solid #dedee4;
          }
        }
        .inspect-details {
          margin-bottom: 10px;
          margin-top: 10px;
        }
      }
    }
    // .main-border {
    //   border-right: 1px solid #dedee4;
    // }
    .pagination {
      border-top: 1px solid #dedee4;
      border-right: 1px solid #dedee4;
      padding: 10px 5px;
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
  }
}
</style>
