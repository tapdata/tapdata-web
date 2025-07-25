<script>
import { taskApi } from '@tap/api'
import { VTable } from '@tap/component'
import i18n from '@tap/i18n'
import { delayTrigger } from '@tap/shared'
import Time from '@tap/shared/src/time'
import { uniq } from 'lodash-es'

export default {
  name: 'VerifyDetails',

  components: { VTable },

  data() {
    return {
      keyword: '',
      selection: [],
      columns: [
        {
          type: 'selection',
          reserveSelection: true,
        },
        {
          label: i18n.t('packages_business_verification_details_yuanbiaoming'),
          prop: 'originalTableName',
        },
        {
          label: i18n.t(
            'packages_business_verification_details_mubiaobiaoming',
          ),
          prop: 'targetTableName',
          default: '-',
        },
        {
          label: i18n.t('packages_business_verification_details_yichangshuju'),
          prop: 'counts',
          slotName: 'counts',
        },
      ],
      showType: 'diff',
      resultList: [],
      page: {
        current: 1,
        size: 20,
        total: 0,
      },
      showAdvancedVerification: false,
      row: null,
      detailLoading: false,
      detailSvg: require('@tap/assets/images/detail-info.svg'),
      timeout: null,
      verifyLoading: false,
      checkProgress: '',
    }
  },

  computed: {
    isChecking() {
      return ['Scheduling', 'Running'].includes(this.checkProgress?.status)
    },
  },

  mounted() {
    this.init()
    //轮询结果
    this.timeout = setInterval(() => {
      this.getCheckingStatus((flag) => {
        if (!flag) {
          this.$refs.table.fetch?.(null, 0, true)
        }
      })
    }, 5000)
  },
  unmounted() {
    clearInterval(this.timeout)
  },

  methods: {
    init() {
      const { table } = this.$route.query
      this.keyword = table
    },

    searchFnc(debounce) {
      delayTrigger(() => {
        this.$refs.table.fetch?.()
      }, debounce)
    },
    //再次校验
    handleAgainCheck() {
      if (this.selection?.length === 0) return
      const tables = this.selection.map((row) => row.originalTableName)
      const params = {
        tables,
      }
      taskApi.autoInspectAgain(this.$route.params.id, params).then(() => {
        this.verifyLoading = true // 发起再次校验后 不能再校验
      })
    },

    remoteMethod({ page }) {
      const { current, size } = page
      const filter = {
        id: this.$route.params.id,
        limit: size,
        skip: size * (current - 1),
        filter: this.keyword,
      }
      return taskApi.autoInspectResultsGroupByTable(filter).then((data) => {
        const list =
          data.items?.map((t) => {
            t.counts = t.counts.toLocaleString()
            return t
          }) || []
        if (
          !this.row ||
          !list.find((t) => JSON.stringify(this.row) === JSON.stringify(t))
        ) {
          this.handleRow(list[0])
        }
        //是否可以再次校验
        if (list?.length > 0) {
          const check = list.filter((row) => row?.toBeCompared > 0) || []
          this.verifyLoading = check?.length > 0
        }
        //是否校验异常
        this.checkProgress = data?.progress || ''
        return {
          total: data.total,
          data: list,
        }
      })
    },

    handleRow(row) {
      this.row = row
      this.$refs.table.table?.setCurrentRow?.(row)
      this.fetch()
    },

    handleSelectionChange(val) {
      this.selection = val
    },

    fetch(page = 1) {
      this.page.current = page
      const { size, current } = this.page
      const { originalTableName } = this.row || {}
      const filter = {
        where: {
          originalTableName,
        },
        limit: size,
        skip: size * (current - 1),
      }
      this.detailLoading = true
      const startStamp = Time.now()
      taskApi
        .autoInspectResults(this.$route.params.id, {
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          const result = []
          const items = data.items || []
          this.page.total = data.total || 0
          items.forEach((el) => {
            const { sourceData = {}, targetData = {}, originalKeymap } = el
            const obj = {
              id: el.id,
              originalKeymap,
              sourceData: [],
              targetData: [],
            }
            const notPrimaryKeyFields = uniq([
              ...Object.keys(sourceData || {}),
              ...Object.keys(targetData || {}),
            ]).filter((t) => !Object.keys(originalKeymap).includes(t))
            for (const key of notPrimaryKeyFields) {
              const sVal = sourceData?.[key]
              const tVal = targetData?.[key]
              const isDiff = sVal !== tVal
              if (this.showType === 'diff' && !isDiff) {
                continue
              }
              obj.sourceData.push({
                label: key,
                value: sVal,
                isDiff,
              })
              obj.targetData.push({
                label: key,
                value: tVal,
                isDiff,
              })
            }
            result.push(obj)
          })
          this.resultList = result
        })
        .finally(() => {
          setTimeout(
            () => {
              this.detailLoading = false
            },
            Time.now() - startStamp < 1000 ? 1500 : 0,
          )
        })
    },

    getCheckingStatus(callback) {
      const filter = {
        id: this.$route.params.id,
        limit: 1,
        skip: 0,
        filter: this.keyword,
      }
      taskApi.autoInspectResultsGroupByTable(filter).then((data) => {
        this.checkProgress = data?.progress
        callback?.(
          ['Scheduling', 'Running'].includes(this.checkProgress?.status),
        )
      })
    },
  },
}
</script>

<template>
  <section class="verify-details">
    <div class="verify-details__wrap flex font-color-light h-100">
      <div class="verify-list flex flex-column p-6">
        <div class="verify-list__header flex justify-content-between mb-2">
          <ElInput
            v-model="keyword"
            class="search-input"
            :placeholder="
              $t('packages_business_verification_details_qingshurubiaoming')
            "
            clearable
            style="width: 240px"
            @input="searchFnc(800)"
          >
            <template #prefix>
              <ElIcon>
                <ElIconSearch />
              </ElIcon>
            </template>
          </ElInput>
          <div>
            <el-tooltip
              v-if="checkProgress"
              class="item"
              effect="dark"
              :content="checkProgress.msg || 'Timeout'"
              placement="top"
            >
              <VIcon
                v-if="
                  checkProgress.status &&
                  ['Timeout', 'Failed'].includes(checkProgress.status)
                "
                class="mr-2 iconfont icon"
              >
                info
              </VIcon>
            </el-tooltip>
            <ElButton
              type="primary"
              :disabled="!selection.length || verifyLoading"
              :loading="verifyLoading || isChecking"
              @click="handleAgainCheck"
              >{{
                isChecking
                  ? $t('packages_business_verification_details_jiaoyanzhong')
                  : $t('packages_business_verification_details_jiaoyan')
              }}
            </ElButton>
          </div>
        </div>
        <VTable
          ref="table"
          v-model:value="selection"
          :remote-method="remoteMethod"
          :columns="columns"
          :page-options="{
            layout: 'total, prev, pager, next, sizes',
          }"
          class="table-list"
          hide-on-single-page
          highlight-current-row
          row-key="originalTableName"
          @row-click="handleRow"
          @selection-change="handleSelectionChange"
        >
          <template #counts="scope">
            {{
              scope.row.toBeCompared > 0
                ? $t('packages_business_verification_details_jiaoyanzhong')
                : scope.row.counts
            }}
          </template>
        </VTable>
      </div>
      <div class="verify-result flex flex-column flex-fit border-start">
        <div
          class="verify-result__title pt-6 px-4 fs-7 fw-bold font-color-dark"
        >
          {{ $t('packages_business_verification_details_jiaoyanjieguo') }}
        </div>
        <div class="px-4 pb-4 border-bottom">
          <div class="verify-result__line mt-2">
            <span class="line__label">{{
              $t('packages_business_verification_details_yuanbiao')
            }}</span>
            <span v-if="row" class="font-color-dark">{{
              `${row.originalTableName || '-'}/${row.sourceConnName || '-'}`
            }}</span>
            <span v-else>-</span>
          </div>
          <div class="verify-result__line mt-2">
            <span class="line__label">{{
              $t('packages_business_verification_details_mubiaobiao')
            }}</span>
            <span v-if="row" class="font-color-dark">{{
              `${row.targetTableName || '-'}/${row.targetConnName || '-'}`
            }}</span>
            <span v-else>-</span>
          </div>
          <div class="verify-result__line mt-2">
            <span class="line__label">{{
              $t('packages_business_verification_details_yichangshujuhang')
            }}</span>
            <span v-if="row" class="font-color-dark">{{
              row.counts || 0
            }}</span>
            <span v-else>-</span>
          </div>
        </div>
        <div class="flex justify-content-between pt-4 px-4">
          <ElRadioGroup
            v-model="showType"
            :disabled="detailLoading"
            @change="fetch(page.current)"
          >
            <ElRadio label="diff">{{
              $t('packages_business_verification_details_jinxianshichayi')
            }}</ElRadio>
            <ElRadio label="all">{{
              $t('packages_business_verification_details_xianshiwanzhengzi')
            }}</ElRadio>
          </ElRadioGroup>
          <!--<ElButton type="primary">导出</ElButton>-->
        </div>
        <div
          v-loading="detailLoading"
          class="verify-result__list flex-fill flex flex-column pr-4 pb-6"
        >
          <div class="table__header">
            <ElRow
              class="table__header flex align-items-center p-4 font-color-normal fw-bold"
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
          <div v-if="resultList.length" class="table__body flex-fill">
            <ElRow
              v-for="(item, index) in resultList"
              :key="index"
              class="table__row py-2 px-4"
              :class="{ 'border-top': index !== 0 }"
            >
              <ElCol :span="12">
                <div
                  v-for="(pValue, pKey, pIndex) in item.originalKeymap"
                  :key="pKey"
                  class="disable-color"
                  :class="{ 'mt-2': pIndex !== 0 }"
                >
                  <span class="row__label">{{ `${pKey}:` }}</span>
                  <span class="row__value ml-4">{{ pValue }}</span>
                </div>
                <div
                  v-for="(sItem, sIndex) in item.sourceData"
                  :key="sIndex"
                  class="mt-2"
                >
                  <span class="row__label">{{ sItem.label }}:</span>
                  <span
                    class="row__value ml-4 font-color-dark"
                    :class="{ 'color-danger': sItem.isDiff }"
                    >{{ sItem.value }}</span
                  >
                </div>
              </ElCol>
              <ElCol :span="12">
                <div
                  v-for="(pValue, pKey, pIndex) in item.originalKeymap"
                  :key="pKey"
                  class="disable-color"
                  :class="{ 'mt-2': pIndex !== 0 }"
                >
                  <span class="row__label">{{ `${pKey}:` }}</span>
                  <span class="row__value ml-4">{{ pValue }}</span>
                </div>
                <div
                  v-for="(sItem, sIndex) in item.targetData"
                  :key="sIndex"
                  class="mt-2"
                >
                  <span class="row__label">{{ sItem.label }}:</span>
                  <span
                    class="row__value ml-4 font-color-dark"
                    :class="{ 'color-danger': sItem.isDiff }"
                    >{{ sItem.value }}</span
                  >
                </div>
              </ElCol>
            </ElRow>
          </div>
          <div
            v-else
            class="table__body flex-fill flex flex-column justify-content-center text-center"
          >
            <img :src="detailSvg" width="160" class="mx-auto" />
            <span class="mt-4">{{
              $t('packages_business_verification_details_gongxijiaoyanjie')
            }}</span>
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
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.verify-details {
  height: 100%;
}

.verify-details__wrap {
  border-radius: 4px;
  background-color: #fff;
  box-sizing: border-box;

  .icon {
    color: var(--color-danger);
    font-size: 16px;
  }
}

.verify-list {
  width: 534px;
}

.verify-result {
}

.line__label {
  display: inline-block;
  width: 100px;
}

.disable-color {
  color: #86909c;
}

.table__body {
  height: 0;
  overflow-y: auto;
}
</style>
