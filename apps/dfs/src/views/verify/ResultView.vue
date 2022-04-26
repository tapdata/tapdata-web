<template>
  <div class="verification-result-view panel-box" v-loading="loading">
    <div class="header">
      {{ $t('dataVerification_verifyDetail') }}
    </div>
    <div class="main">
      <ul class="inspect-result" v-if="statsInfo.status">
        <li>
          <span>
            {{
              $t('dataVerification_sourceTable') +
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
              $t('dataVerification_targetTable') +
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
          <span>{{ $t('dataVerification_verifyResult') + ' : ' + (statsInfo.result || '') }}</span>
        </li>
        <li v-if="statsInfo.result !== 'passed'">
          <span>{{ statsInfo.countResultText }}</span>
        </li>
        <li v-if="statsInfo.result !== 'passed'">
          <span>{{ statsInfo.contentResultText }}</span>
        </li>
      </ul>
      <div class="success-band" v-if="statsInfo.result === 'passed'">
        <img style="height: 30px; margin-right: 5px" src="../../assets/image/zhuhe.png" />
        <span>{{ $t('dataVerification_success') }}</span>
      </div>
      <div class="error-band" v-if="statsInfo.status === 'error'">
        <VIcon size="12">warning-circle</VIcon>
        <span>{{ statsInfo.errorMsg }}</span>
      </div>
      <template v-if="statsInfo.result !== 'passed'">
        <div class="inspect-result-box" v-if="!showAdvancedVerification">
          <div v-for="item in resultList" :key="item.id" class="inspect-details">
            <ul class="father-table">
              <li>{{ $t('dataVerification_inconsistentType') }}</li>
              <li>{{ $t('dataVerification_sourceFieldName') }}</li>
              <li>{{ $t('dataVerification_Value') }}</li>
              <li>{{ $t('dataVerification_targetFieldName') }}</li>
              <li>{{ $t('dataVerification_Value') }}</li>
            </ul>
            <ul class="sub-table" v-for="detail in item.details" :key="detail.id">
              <li>
                {{
                  detail.type === 'uniqueField' ? $t('dataVerification_uniqueField') : $t('dataVerification_otherField')
                }}
              </li>
              <li>{{ detail.source.key }}</li>
              <li :class="{ red: detail.red }">
                {{ detail.source.value }}
              </li>
              <li>{{ detail.target.key }}</li>
              <li :class="{ red: detail.red }">
                {{ detail.target.value }}
              </li>
            </ul>
          </div>
        </div>
        <div class="inspect-ad-box" v-if="showAdvancedVerification">
          <div class="title-box">
            <div>{{ $t('dataVerification_verifyResult') }}</div>
          </div>
          <div v-for="item in resultList" :key="item.id" class="inspect-details">
            <div class="message-box">
              <span>{{ $t('dataVerification_returnMsg') }}</span>
              <div>{{ item.message }}</div>
            </div>
            <ul class="father-table">
              <li>{{ $t('dataVerification_sourceTableData') }}</li>
              <li>{{ $t('dataVerification_returnedData') }}</li>
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
    <ElPagination
      class="result-view-pagination"
      background
      layout="total, ->, prev, pager, next, sizes"
      :page-sizes="!showAdvancedVerification ? [20, 30, 50, 100] : [1]"
      :page-size.sync="page.size"
      :total="page.total"
      :current-page.sync="page.current"
      @current-change="fetch"
      @size-change="fetch(1)"
    >
    </ElPagination>
  </div>
</template>
<style lang="scss" scoped>
$margin: 10px;
.verification-result-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 1px solid #f2f2f2;
  .header {
    padding: 12px 24px;
    font-size: 12px;
    background: #f5f5f5;
    font-size: 14px;
    line-height: 22px;
  }
  .main {
    padding-bottom: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
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
      min-height: 40px;
      box-sizing: border-box;
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
      padding: 16px 24px;
      font-size: 12px;
      li {
        line-height: 22px;
        margin-top: 8px;
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
      }
    }
    .inspect-result-box {
      overflow: auto;
      .red {
        color: #ee5353;
      }
      .inspect-details {
        li {
          padding: 8px;
          min-width: 0;
          font-size: 12px;
          box-sizing: border-box;
          text-overflow: ellipsis;
          vertical-align: middle;
          position: relative;
          text-align: left;
          word-wrap: break-word;
        }
        li + li {
          border-left: 1px solid #f2f2f2;
        }
        .father-table {
          display: flex;
          border-top: 1px solid #f2f2f2;
          li {
            padding-top: 16px;
            padding-bottom: 16px;
            flex: 1;
            &:first-child {
              padding-left: 24px;
            }
          }
        }
        .sub-table {
          display: flex;
          &:nth-child(2n + 1) {
            background: #fafafa;
          }
          li {
            flex: 1;
            &:first-child {
              padding-left: 24px;
            }
          }
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
    }
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
    text-align: center;
    box-sizing: border-box;
    outline: 0;
    margin: 0;
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
<style lang="scss">
.result-view-pagination {
  padding-left: 24px;
  .el-pagination__sizes {
    margin-right: 0;
    .el-select .el-input {
      margin-right: 0;
    }
  }
}
</style>
<script>
import JsonViewer from 'vue-json-viewer'
import VIcon from '@/components/VIcon'
export default {
  components: {
    JsonViewer,
    VIcon
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
        .then(({ statsInfo = {}, resultList, total, showAdvancedVerification }) => {
          if (statsInfo?.result === 'failed') {
            let countResultText = ''
            let contentResultText = ''
            let diffCount = statsInfo.target_total - statsInfo.source_total
            let diffCountNum = Math.abs(diffCount)
            if (diffCount > 0) {
              countResultText = this.$t('verify_result_count_more', [diffCountNum])
            }
            if (diffCount < 0) {
              countResultText = this.$t('verify_result_count_less', [diffCountNum])
            }
            if (this.type !== 'row_count') {
              let diffContentNum = statsInfo.source_only + statsInfo.target_only + statsInfo.row_failed
              if (diffContentNum !== 0) {
                contentResultText = this.$t('verify_result_content_diff', [diffContentNum])
              }
            }
            statsInfo.countResultText = countResultText
            statsInfo.contentResultText = contentResultText
          }
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
