<script>
import { checkEllipsisActive } from '@tap/shared'
import JsonViewer from 'vue-json-viewer'
import { ErrorMessage } from '../../components/error-message'
export default {
  components: {
    JsonViewer,
  },
  props: {
    remoteMethod: Function,
    showType: String,
  },
  data() {
    return {
      loading: false,
      page: {
        current: 1,
        size: 20,
        total: 0,
      },
      showAdvancedVerification: false,
      statsInfo: {},
      resultList: [],
      sourceSortColumn: [], // 源索引字段
      targetSortColumn: [], // 目标索引字段
      inspectMethod: '',
      expandErrorMessage: false,
      hasMoreErrorMsg: false,
      filterOptions: [
        {
          label: this.$t(
            'packages_business_verification_details_jinxianshichayi',
          ),
          value: 'diff',
        },
        {
          label: this.$t(
            'packages_business_verification_details_xianshiwanzhengzi',
          ),
          value: 'all',
        },
      ],
    }
  },
  computed: {
    filterResultList() {
      return this.resultList?.filter((t) => !!t.details) || []
    },
    errorMsg() {
      let stack = this.statsInfo?.errorMsg || ''

      if (import.meta.env.VUE_APP_KEYWORD) {
        stack = stack.replaceAll(
          /tapdata\s?/gi,
          import.meta.env.VUE_APP_KEYWORD,
        )
      }

      return stack
    },
    errorSummary() {
      if (this.errorMsg) {
        return this.errorMsg.split('\n').shift()
      }
    },
  },
  methods: {
    ErrorMessage,
    fetch(current) {
      // this.loading = true
      this.remoteMethod({ current, size: this.page.size })
        .then(
          ({
            statsInfo = {},
            resultList,
            total,
            showAdvancedVerification,
            sourceSortColumn,
            targetSortColumn,
            inspectMethod,
          }) => {
            if (statsInfo?.result === 'failed') {
              let countResultText = ''
              let contentResultText = ''
              const diffCount = statsInfo.target_total - statsInfo.source_total
              const diffCountNum = Math.abs(diffCount)
              if (diffCount > 0) {
                countResultText = this.$t(
                  'packages_business_verification_result_count_more',
                  [diffCountNum],
                )
              }
              if (diffCount < 0) {
                countResultText = this.$t(
                  'packages_business_verification_result_count_less',
                  [diffCountNum],
                )
              }
              if (this.type !== 'row_count' && this.type !== 'hash') {
                const diffContentNum =
                  statsInfo.source_only +
                  statsInfo.target_only +
                  statsInfo.row_failed
                if (diffContentNum !== 0) {
                  contentResultText = this.$t(
                    'packages_business_verification_result_content_diff',
                    [diffContentNum],
                  )
                }
              }
              statsInfo.countResultText = countResultText
              statsInfo.contentResultText = contentResultText
            }
            this.statsInfo = statsInfo
            this.resultList = resultList
            this.page.total = total
            this.showAdvancedVerification = showAdvancedVerification
            this.sourceSortColumn = sourceSortColumn
            this.targetSortColumn = targetSortColumn
            this.inspectMethod = inspectMethod

            this.checkErrorMsg()
          },
        )
        .finally(() => {
          this.loading = false
        })
    },

    getDetailsList(data = []) {
      data.forEach((el) => {
        if (this.sourceSortColumn.includes(el.source.key)) {
          el.source.isSortColumn = true
        }
        if (this.targetSortColumn.includes(el.target.key)) {
          el.target.isSortColumn = true
        }
      })
      if (this.showType === 'all') return data
      return data.filter((t) => !!t.red)
    },

    checkErrorMsg() {
      this.$nextTick(() => {
        const dom = this.$refs.errorSummary
        this.hasMoreErrorMsg = dom
          ? this.errorMsg.split('\n').length > 1 || checkEllipsisActive(dom)
          : false
      })
    },
  },
}
</script>

<template>
  <div v-loading="loading" class="verification-result-view panel-box">
    <div class="py-3 pl-3 fs-6 font-color-dark flex align-center">
      <span class="lh-8">
        {{ $t('packages_business_verification_verifyDetail') }}
      </span>

      <el-segmented
        v-if="statsInfo.result !== 'passed' && inspectMethod !== 'jointField'"
        :model-value="showType"
        :options="filterOptions"
        class="ml-auto"
        @update:model-value="$emit('update:showType', $event)"
      />
    </div>
    <div class="main">
      <el-result
        v-if="statsInfo.result === 'passed'"
        icon="success"
        :title="$t('packages_business_verification_success')"
      />

      <el-alert
        v-if="statsInfo.status === 'error'"
        type="error"
        show-icon
        class="fit-content ml-3 mb-3"
        :closable="false"
      >
        <template #title>
          <div class="flex align-center">
            <div class="text-truncate">{{ errorSummary }}</div>
            <el-button
              type="text"
              class="ml-auto"
              @click="ErrorMessage(errorMsg)"
              >{{ $t('public_button_check') }}</el-button
            >
          </div>
        </template>
      </el-alert>

      <template v-if="statsInfo.result !== 'passed'">
        <div
          v-if="!showAdvancedVerification"
          class="flex-fill flex flex-column"
        >
          <div class="table__header">
            <ElRow
              class="table__header-row flex align-items-center fw-bold border-bottom"
            >
              <ElCol :span="12">
                <span class="px-3">{{
                  $t('packages_business_verification_details_yuanbiaoziduanzhi')
                }}</span>
              </ElCol>
              <ElCol :span="12">
                <span class="px-3">{{
                  $t('packages_business_verification_details_mubiaobiaoziduan')
                }}</span>
              </ElCol>
            </ElRow>
          </div>
          <div v-if="filterResultList.length" class="table__body flex-fill">
            <div
              v-for="(item, index) in filterResultList"
              :key="index"
              class="table__row"
              :class="[
                'position-relative border-bottom',
                { 'py-2 px-4': item.details },
              ]"
            >
              <div
                v-for="(sItem, sIndex) in getDetailsList(item.details)"
                :key="sIndex"
                class="flex py-1"
              >
                <div class="w-50 flex align-center">
                  <span
                    :class="[
                      'row__label',
                      sItem.source.isSortColumn
                        ? 'font-color-light fw-bolder'
                        : 'disable-color',
                    ]"
                    >{{ sItem.source.key }}:</span
                  >
                  <span
                    class="row__value ml-4 font-color-dark"
                    :class="{ 'color-danger': sItem.red }"
                    >{{ sItem.source.value }}</span
                  >
                </div>
                <div class="w-50 flex align-center">
                  <span
                    :class="[
                      'row__label',
                      sItem.target.isSortColumn
                        ? 'font-color-light fw-bolder'
                        : 'disable-color',
                    ]"
                    >{{ sItem.target.key }}:</span
                  >
                  <span
                    class="row__value ml-4 font-color-dark"
                    :class="{ 'color-danger': sItem.red }"
                    >{{ sItem.target.value }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="showAdvancedVerification" class="inspect-ad-box">
          <div class="title-box">
            <div>{{ $t('packages_business_verification_result_title') }}</div>
          </div>
          <div
            v-for="item in resultList"
            :key="item.id"
            class="inspect-details"
          >
            <div class="message-box">
              <span>{{ $t('packages_business_verification_returnMsg') }}</span>
              <div>{{ item.message }}</div>
            </div>
            <ul class="father-table">
              <li>
                {{ $t('packages_business_verification_sourceTableData') }}
              </li>
              <li>{{ $t('packages_business_verification_returnedData') }}</li>
            </ul>
            <ul class="sub-table">
              <li><JsonViewer :value="item.source" /></li>
              <li>
                <JsonViewer :value="item.target ? item.target.data : ''" />
              </li>
            </ul>
          </div>
        </div>
      </template>
    </div>
    <ElPagination
      v-model:page-size="page.size"
      v-model:current-page="page.current"
      class="pt-3 pl-3"
      background
      hide-on-single-page
      layout="total, ->, prev, pager, next, sizes"
      :page-sizes="!showAdvancedVerification ? [20, 30, 50, 100] : [1]"
      :total="page.total"
      @current-change="fetch"
      @size-change="fetch(1)"
    />
  </div>
</template>

<style lang="scss" scoped>
$margin: 10px;
.verification-result-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .header {
    line-height: 22px;
  }
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    .error-band {
      background: #fdf6ec;
      border: 1px solid #f8e2c0;
      color: var(--color-warning);
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
      color: var(--text-light);
      margin: 20% auto;
      i {
        font-size: 36px;
        color: var(--color-primary);
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
        color: var(--text-dark);
        background: var(--bg-normal);
        font-size: 12px;
        line-height: 28px;
        padding-left: 10px;
        border-bottom: 1px solid #dedee4;
      }
      .message-box {
        color: var(--text-dark);
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
        color: var(--color-danger);
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
          border-left: 1px solid var(--border-light);
        }
        .father-table {
          display: flex;
          border-top: 1px solid var(--border-light);
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
            background: var(--bg-normal);
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

  .table__header {
    color: var(--el-text-color-caption);

    &-row {
      height: 40px;
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
    background: var(--color-primary);
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
.disable-color {
  color: #86909c;
}
.table__body {
  height: 0;
  overflow-y: auto;
}
.table__row {
  > div:nth-child(2n) {
    background: #fafafa;
  }
}
.row__label {
  display: inline-block;
  width: 160px;
  word-break: break-all;
}
.index-span {
  width: 20px;
  height: 20px;
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
