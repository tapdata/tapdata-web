<template>
  <section class="verify-details section-wrap setting-warp">
    <div class="verify-details__wrap flex font-color-light flex-fill">
      <div class="verify-list flex flex-column p-6">
        <div class="verify-list__header flex justify-content-between">
          <ElInput
            class="search-input ml-4"
            v-model="keyword"
            prefix-icon="el-icon-search"
            placeholder="请输入日志内容…"
            size="mini"
            clearable
            style="width: 240px"
            @input="searchFnc(800)"
          ></ElInput>
          <ElButton type="primary">校验</ElButton>
        </div>
        <VTable
          :remoteMethod="remoteMethod"
          :columns="columns"
          ref="table"
          class="table-list"
          hide-on-single-page
          @row-click="rowClick"
        >
          <template slot="diff" slot-scope="scope">
            {{ scope.row.diff > 50 ? '校验中' : scope.row.diff }}
          </template>
        </VTable>
      </div>
      <div class="verify-result flex flex-column flex-fit border-start">
        <div class="verify-result__title pt-6 px-4 fs-7 fw-bold font-color-dark">校验结果</div>
        <div class="px-4 pb-4 border-bottom">
          <div class="verify-result__line mt-2">
            <span class="line__label">源表：</span>
            <span class="font-color-dark">CAR_CLAIM / auto_tes</span>
          </div>
          <div class="verify-result__line mt-2">
            <span class="line__label">目标表：</span>
            <span class="font-color-dark">CAR_CLAIM / auto_tes</span>
          </div>
          <div class="verify-result__line mt-2">
            <span class="line__label">校验结果：</span>
            <span class="font-color-dark">passed</span>
          </div>
        </div>
        <div class="flex justify-content-between pt-4 px-4">
          <ElRadioGroup v-model="radio">
            <ElRadio label="diff">仅显示差异字段</ElRadio>
            <ElRadio label="all">显示完整字段</ElRadio>
          </ElRadioGroup>
          <ElButton type="primary">导出</ElButton>
        </div>
        <div class="verify-result__list flex-fill flex flex-column px-4 pb-6">
          <div class="table__header">
            <ElRow
              class="table__header flex align-items-center p-4"
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
          <div class="table__body flex-fill">
            <ElRow v-for="(item, index) in resultList" :key="index" class="table__row py-2 px-4 border-top">
              <ElCol :span="12">
                <span>ID：</span>
                <span>{{ item.sourceId }}</span>
              </ElCol>
              <ElCol :span="12">
                <span>ID：</span>
                <span>{{ item.targetId }}</span>
              </ElCol>
            </ElRow>
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
import { delayTrigger } from '@tap/shared'
import { VTable } from '@tap/component'

export default {
  name: 'VerifyDetails',

  components: { VTable },

  data() {
    return {
      keyword: '',
      columns: [
        {
          label: '源表名',
          prop: 'sourceTable'
        },
        {
          label: '目标表名',
          prop: 'targetTable'
        },
        {
          label: '异常数据',
          prop: 'diff',
          slotName: 'diff'
        }
      ],
      radio: 'diff',
      resultList: [],
      page: {
        current: 1,
        size: 20,
        total: 0
      },
      showAdvancedVerification: false
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    init() {
      this.rowClick()
    },

    searchFnc(debounce) {
      delayTrigger(() => {
        console.log('searchFnc')
      }, debounce)
    },

    remoteMethod({ page }) {
      console.log('remoteMethod')
      let { current, size } = page
      let arr = Array(10)
        .fill()
        .map((t, index) => {
          return {
            sourceTable: 'source_table' + index,
            targetTable: 'target_table' + index,
            diff: Math.ceil(Math.random() * 100)
          }
        })
      return new Promise((resolve, reject) => {
        resolve({
          total: 100,
          data: arr
        })
      })
    },

    rowClick() {
      console.log('rowClick')
      this.fetch()
    },

    fetch() {
      this.resultList = Array(10)
        .fill()
        .map((t, index) => {
          return {
            sourceId: 'PC_0000000372' + index,
            targetId: 'PC_0000000372' + index,
            sourceSigninTime: '2022-06-10 18:00:11',
            targetSigninTime: '2022-06-10 18:00:11'
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.verify-details__wrap {
  border-radius: 4px;
  background-color: #fff;
  box-sizing: border-box;
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
</style>
