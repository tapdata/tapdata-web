<template>
  <section class="verify-details">
    <div class="verify-details__wrap flex font-color-light h-100">
      <div class="verify-list flex flex-column p-6" :class="{ 'w-100': !row }">
        <div class="verify-list__header flex justify-content-between mb-2">
          <ElInput
            class="search-input"
            v-model="keyword"
            prefix-icon="el-icon-search"
            placeholder="请输入表名…"
            size="mini"
            clearable
            style="width: 240px"
            @input="searchFnc(800)"
          ></ElInput>
          <ElButton type="primary" size="mini" :disabled="disableAgainVerify" @click="handleAgainCheck">校验</ElButton>
        </div>
        <VTable
          v-model="selection"
          :remoteMethod="remoteMethod"
          :columns="columns"
          :pageOptions="{
            layout: 'total, prev, pager, next, sizes'
          }"
          ref="table"
          class="table-list"
          hide-on-single-page
          highlight-current-row
          @row-click="handleRow"
          @selection-change="handleSelectionChange"
        >
          <template slot="counts" slot-scope="scope">
            {{ scope.row.toBeCompared > 0 ? '校验中' : scope.row.counts }}
          </template>
        </VTable>
      </div>
      <div v-if="row" class="verify-result flex flex-column flex-fit border-start">
        <div class="verify-result__title pt-6 px-4 fs-7 fw-bold font-color-dark">校验结果</div>
        <div class="px-4 pb-4 border-bottom">
          <div class="verify-result__line mt-2">
            <span class="line__label">源表：</span>
            <span class="font-color-dark">{{
              (row.originalTableName || '-') + '/' + (row.sourceConnName || '-')
            }}</span>
          </div>
          <div class="verify-result__line mt-2">
            <span class="line__label">目标表：</span>
            <span class="font-color-dark">{{ (row.targetTableName || '-') + '/' + (row.targetConnName || '-') }}</span>
          </div>
          <div class="verify-result__line mt-2">
            <span class="line__label">异常数据（行）：</span>
            <span class="font-color-dark">{{ row.counts || 0 }}</span>
          </div>
        </div>
        <div class="flex justify-content-between pt-4 px-4">
          <ElRadioGroup v-model="showType" :disabled="detailLoading" @change="fetch(page.current)">
            <ElRadio label="diff">仅显示差异字段</ElRadio>
            <ElRadio label="all">显示完整字段</ElRadio>
          </ElRadioGroup>
          <!--<ElButton type="primary">导出</ElButton>-->
        </div>
        <div v-loading="detailLoading" class="verify-result__list flex-fill flex flex-column pr-4 pb-6">
          <div class="table__header">
            <ElRow
              class="table__header flex align-items-center p-4 font-color-normal fw-bold"
              style="height: 54px; background: #fafafa; border-radius: 4px 4px 0 0"
            >
              <ElCol :span="12">
                <span>源表字段：值</span>
              </ElCol>
              <ElCol :span="12">
                <span>目标表字段：值</span>
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
                  <span class="row__label">{{ pKey + ':' }}</span>
                  <span class="row__value ml-4">{{ pValue }}</span>
                </div>
                <div v-for="(sItem, sIndex) in item.sourceData" :key="sIndex" class="mt-2">
                  <span class="row__label">{{ sItem.label }}:</span>
                  <span class="row__value ml-4 font-color-dark" :class="{ 'color-danger': sItem.isDiff }">{{
                    sItem.value
                  }}</span>
                </div>
              </ElCol>
              <ElCol :span="12">
                <div
                  v-for="(pValue, pKey, pIndex) in item.originalKeymap"
                  :key="pKey"
                  class="disable-color"
                  :class="{ 'mt-2': pIndex !== 0 }"
                >
                  <span class="row__label">{{ pKey + ':' }}</span>
                  <span class="row__value ml-4">{{ pValue }}</span>
                </div>
                <div v-for="(sItem, sIndex) in item.targetData" :key="sIndex" class="mt-2">
                  <span class="row__label">{{ sItem.label }}:</span>
                  <span class="row__value ml-4 font-color-dark" :class="{ 'color-danger': sItem.isDiff }">{{
                    sItem.value
                  }}</span>
                </div>
              </ElCol>
            </ElRow>
          </div>
          <div v-else class="table__body flex-fill flex flex-column justify-content-center text-center">
            <img :src="detailSvg" width="160" class="mx-auto" />
            <span class="mt-4">恭喜~校验结果源表与目标表内容完全一致，没有错误记录</span>
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
      </div>
    </div>
  </section>
</template>

<script>
import { delayTrigger, uniqueArr } from '@tap/shared'
import { VTable } from '@tap/component'
import { taskApi } from '@tap/api'

export default {
  name: 'VerifyDetails',

  components: { VTable },

  data() {
    return {
      keyword: '',
      selection: [],
      columns: [
        {
          type: 'selection'
        },
        {
          label: '源表名',
          prop: 'originalTableName'
        },
        {
          label: '目标表名',
          prop: 'targetTableName',
          default: '-'
        },
        {
          label: '异常数据',
          prop: 'counts',
          slotName: 'counts'
        }
      ],
      showType: 'diff',
      resultList: [],
      page: {
        current: 1,
        size: 20,
        total: 0
      },
      showAdvancedVerification: false,
      row: null,
      detailLoading: false,
      detailSvg: require('@tap/assets/images/detail-info.svg'),
      timeout: null,
      disableAgainVerify: false
    }
  },

  mounted() {
    this.init()
    //轮询结果
    this.timeout = setInterval(() => {
      this.$refs.table.fetch?.(null, 0, true)
    }, 30000)
  },
  destroyed() {
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
      let tables = this.selection.map(row => row.originalTableName)
      let params = {
        tables: tables
      }
      taskApi.autoInspectAgain(this.$route.params.id, params).then(() => {
        this.disableAgainVerify = true // 发起再次校验后 不能再校验
      })
    },

    remoteMethod({ page }) {
      let { current, size } = page
      let filter = {
        id: this.$route.params.id,
        limit: size,
        skip: size * (current - 1),
        filter: this.keyword
      }
      return taskApi.autoInspectResultsGroupByTable(filter).then(data => {
        const list = data.items.map(t => {
          t.counts = t.counts.toLocaleString()
          return t
        })
        if (!this.row || !list.find(t => JSON.stringify(this.row) === JSON.stringify(t))) {
          this.handleRow(list[0])
        }
        //是否可以再次校验
        if (list?.length > 0) {
          let check = list.filter(row => row?.toBeCompared > 0) || []
          this.disableAgainVerify = check?.length > 0
        }
        return {
          total: data.total,
          data: list
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
      const { originalTableName } = this.row
      let filter = {
        where: {
          originalTableName
        },
        limit: size,
        skip: size * (current - 1)
      }
      this.detailLoading = true
      const startStamp = Date.now()
      taskApi
        .autoInspectResults(this.$route.params.id, {
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let result = []
          let items = data.items || []
          this.page.total = data.total || 0
          items.forEach(el => {
            const { sourceData = {}, targetData = {}, originalKeymap } = el
            let obj = {
              id: el.id,
              originalKeymap,
              sourceData: [],
              targetData: []
            }
            const notPrimaryKeyFields = uniqueArr([
              ...Object.keys(sourceData || {}),
              ...Object.keys(targetData || {})
            ]).filter(t => !Object.keys(originalKeymap).includes(t))
            for (let i = 0; i < notPrimaryKeyFields.length; i++) {
              const key = notPrimaryKeyFields[i]
              const sVal = sourceData?.[key]
              const tVal = targetData?.[key]
              const isDiff = sVal !== tVal
              if (this.showType === 'diff' && !isDiff) {
                continue
              }
              obj.sourceData.push({
                label: key,
                value: sVal,
                isDiff
              })
              obj.targetData.push({
                label: key,
                value: tVal,
                isDiff
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
            Date.now() - startStamp < 1000 ? 1500 : 0
          )
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.verify-details {
  height: 100%;
}
.verify-details__wrap {
  border-radius: 4px;
  background-color: #fff;
  box-sizing: border-box;
  ::v-deep {
    .border-top {
      border-top: 1px solid #f2f2f2 !important;
    }
    .border-bottom {
      border-bottom: 1px solid #f2f2f2 !important;
    }
    .border-start {
      border-left: 1px solid #f2f2f2 !important;
    }
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
