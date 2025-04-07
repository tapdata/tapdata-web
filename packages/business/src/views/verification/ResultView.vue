<script>
import { VIcon } from '@tap/component'
import { checkEllipsisActive } from '@tap/shared'
import JsonViewer from 'vue-json-viewer'
export default {
  components: {
    JsonViewer,
    VIcon,
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
    <div class="header">
      {{ $t('packages_business_verification_verifyDetail') }}
    </div>
    <div class="main">
      <ul v-if="statsInfo.status" class="inspect-result">
        <li>
          <span>
            {{
              `${$t('packages_business_verification_sourceTable')} : ${
                statsInfo.source.table
              } / ${statsInfo.source.connectionName}`
            }}
          </span>
          <span class="font-color-slight">
            {{ `( Row: ${statsInfo.source_total} )` }}
          </span>
        </li>
        <li>
          <span>
            {{
              `${$t('packages_business_verification_targetTable')} : ${
                statsInfo.target.table
              } / ${statsInfo.target.connectionName}`
            }}
          </span>
          <span class="font-color-slight">
            {{ `( Row: ${statsInfo.target_total} )` }}
          </span>
        </li>
        <li>
          <span>{{
            `${$t('packages_business_verification_result_title')} : ${
              statsInfo.result || '-'
            }`
          }}</span>
        </li>
        <template v-if="statsInfo.result !== 'passed'">
          <li>
            <span>{{ statsInfo.countResultText }}</span>
          </li>
          <li>
            <span>{{ statsInfo.contentResultText }}</span>
          </li>
        </template>
      </ul>
      <el-result
        v-if="statsInfo.result === 'passed'"
        icon="success"
        :title="$t('packages_business_verification_success')"
      />

      <div
        v-if="statsInfo.status === 'error'"
        class="error-tips mt-0 ml-4 pl-4 pr-0 rounded-lg"
        :style="!filterResultList.length ? 'max-height: unset' : ''"
      >
        <VIcon size="16" class="color-danger mt-0.5">error</VIcon>
        <span
          ref="errorSummary"
          class="mx-2 flex-1"
          :class="{
            ellipsis: !expandErrorMessage,
            'text-pre': expandErrorMessage,
          }"
          >{{ expandErrorMessage ? errorMsg : errorSummary }}</span
        >
        <span
          class="sticky-top-0 end-0 px-2 flex-shrink-0 align-self-start"
          style="background: inherit"
        >
          <ElLink
            v-if="hasMoreErrorMsg"
            class="align-middle"
            type="danger"
            @click="expandErrorMessage = !expandErrorMessage"
            >{{
              expandErrorMessage
                ? $t('packages_business_verification_details_shouqi')
                : $t('public_button_expand')
            }}</ElLink
          >
        </span>
      </div>

      <template v-if="statsInfo.result !== 'passed'">
        <div
          v-if="inspectMethod !== 'jointField'"
          class="flex justify-content-between p-4"
        >
          <ElRadioGroup
            :model-value="showType"
            @update:model-value="$emit('update:showType', $event)"
          >
            <ElRadio label="diff">{{
              $t('packages_business_verification_details_jinxianshichayi')
            }}</ElRadio>
            <ElRadio label="all">{{
              $t('packages_business_verification_details_xianshiwanzhengzi')
            }}</ElRadio>
          </ElRadioGroup>
        </div>
        <div
          v-if="!showAdvancedVerification"
          class="flex-fill flex flex-column"
        >
          <div class="table__header">
            <ElRow
              class="table__header flex align-items-center p-4 font-color-normal fw-bold border-bottom"
              style="
                height: 54px;
                background: #fafafa;
                border-radius: 4px 4px 0 0;
              "
            >
              <ElCol :span="12">
                <span>{{
                  $t('packages_business_verification_details_yuanbiaoziduanzhi')
                }}</span>
              </ElCol>
              <ElCol :span="12">
                <span>{{
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
      class="result-view-pagination"
      background
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
  border-left: 1px solid map.get($borderColor, light);
  .header {
    padding: 12px 24px;
    font-size: 12px;
    background: map.get($bgColor, main);
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
      color: map.get($color, warning);
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
      color: map.get($fontColor, light);
      margin: 20% auto;
      i {
        font-size: 36px;
        color: map.get($color, primary);
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
        color: map.get($fontColor, dark);
        background: map.get($bgColor, normal);
        font-size: 12px;
        line-height: 28px;
        padding-left: 10px;
        border-bottom: 1px solid #dedee4;
      }
      .message-box {
        color: map.get($fontColor, dark);
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
        color: map.get($color, danger);
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
          border-left: 1px solid map.get($borderColor, light);
        }
        .father-table {
          display: flex;
          border-top: 1px solid map.get($borderColor, light);
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
            background: map.get($bgColor, normal);
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
    background: map.get($color, primary);
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
