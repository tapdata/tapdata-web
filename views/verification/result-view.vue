<template>
  <div class="verification-result-view panel-box" v-loading="loading">
    <div class="tip" style="padding-left: 10px">
      {{ $t('dataVerification.verifyDetail') }}
    </div>
    <div class="main">
      <ul class="inspect-result" v-if="statsInfo.status">
        <li>
          <span>
            {{
              $t('dataVerification.sourceTable') +
              ' : ' +
              statsInfo.source.table +
              ' / ' +
              statsInfo.source.connectionName
            }}
          </span>
          <span style="color: #ccc">
            {{ `( Row: ${statsInfo.source_total} )` }}
          </span>
        </li>
        <li>
          <span>
            {{
              $t('dataVerification.targetTable') +
              ' : ' +
              statsInfo.target.table +
              ' / ' +
              statsInfo.target.connectionName
            }}
          </span>
          <span style="color: #ccc">
            {{ `( Row: ${statsInfo.target_total} )` }}
          </span>
        </li>
        <li>
          <span>{{ $t('dataVerification.verifyResult') + ' : ' + statsInfo.result }}</span>
        </li>
        <li v-if="statsInfo.result !== 'passed'">
          <span>{{
            $t('dataVerification.rowConsistent') + ' : ' + Math.abs(statsInfo.target_total - statsInfo.source_total)
          }}</span>
        </li>
        <li v-if="statsInfo.result !== 'passed'">
          <span>{{ $t('dataVerification.contConsistent') + ' : ' }}</span>
          <span>{{ statsInfo.source_only + statsInfo.target_only + statsInfo.row_failed }}</span>
        </li>
      </ul>
      <div class="success-band" v-if="statsInfo.result === 'passed'">
        <img style="height: 30px; margin-right: 5px" src="../../assets/images/zhuhe.png" />
        <span>{{ $t('dataVerification.success') }}</span>
      </div>
      <div class="error-band" v-if="statsInfo.status === 'error'">
        <i class="iconfont icon-warning-circle"></i>
        <span>{{ statsInfo.errorMsg }}</span>
      </div>
      <template v-if="statsInfo.result !== 'passed'">
        <div class="inspect-result-box" v-if="!showAdvancedVerification">
          <div v-for="item in resultList" :key="item.id" class="inspect-details">
            <ul class="father-table">
              <li>{{ $t('dataVerification.inconsistentType') }}</li>
              <li>{{ $t('dataVerification.sourceFieldName') }}</li>
              <li>{{ $t('dataVerification.Value') }}</li>
              <li>{{ $t('dataVerification.targetFieldName') }}</li>
              <li>{{ $t('dataVerification.Value') }}</li>
            </ul>
            <ul class="sub-table" v-for="detail in item.details" :key="detail.id">
              <li>
                {{
                  detail.type === 'uniqueField' ? $t('dataVerification.uniqueField') : $t('dataVerification.otherField')
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
        <div class="inspect-ad-box" v-if="showAdvancedVerification">
          <div class="title-box">
            <div>{{ $t('dataVerification.verifyResult') }}</div>
          </div>
          <div v-for="item in resultList" :key="item.id" class="inspect-details">
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
                <JsonViewer :value="item.target ? item.target.data : ''"></JsonViewer>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </div>
    <el-pagination
      v-if="!showAdvancedVerification"
      class="pagination"
      background
      layout="total,prev, pager, next,sizes"
      :page-sizes="[20, 30, 50, 100]"
      :page-size.sync="page.size"
      :total="page.total"
      :current-page.sync="page.current"
      @current-change="fetch"
      @size-change="fetch(1)"
    >
    </el-pagination>
  </div>
</template>
<style lang="scss" scoped>
$margin: 10px;
.verification-result-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  &.panel-box {
    margin: 20px 20px 20px 0;
    border-left: 1px solid #dedee4;
    border-bottom: 1px solid #dedee4;
    border-right: 1px solid #dedee4;
  }
  .tip {
    height: 30px;
    font-size: 12px;
    background: #f5f5f5;
    border: 1px solid #dedee4;
    border-left: 0;
    border-right: 0;
    line-height: 30px;
  }
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
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
    .inspect-result {
      font-size: 12px;
      margin: $margin;
      li {
        margin-top: 10px;
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
  .pagination {
    border-top: 1px solid #dedee4;
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
</style>
<script>
import JsonViewer from 'vue-json-viewer'
export default {
  components: {
    JsonViewer
  },
  props: {
    remoteMethod: Function
  },
  data() {
    return {
      loading: false,
      page: {
        current: 1,
        size: 20,
        total: 0
      },
      showAdvancedVerification: false,
      statsInfo: {},
      resultList: []
    }
  },
  methods: {
    fetch(current) {
      this.loading = true
      this.remoteMethod({ current, size: this.page.size })
        .then(({ statsInfo, resultList, total, showAdvancedVerification }) => {
          this.statsInfo = statsInfo
          this.resultList = resultList
          this.page.total = total
          this.showAdvancedVerification = showAdvancedVerification
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style></style>
