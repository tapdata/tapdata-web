<script>
import { inspectResultsApi } from '@tap/api'
import dayjs from 'dayjs'
import PageContainer from '../../components/PageContainer.vue'
import { inspectMethod as typeMap } from './const'
import mixins from './mixins'
import ResultTable from './ResultTable'
import ResultView from './ResultView'

export default {
  components: { ResultTable, ResultView, PageContainer },
  mixins: [mixins],
  data() {
    return {
      loading: false,
      typeMap,
      inspect: {},
      resultInfo: {},
      errorMsg: '',
      taskId: null,
    }
  },
  computed: {
    type() {
      return this.inspect?.inspectMethod || ''
    },
    tableData() {
      let list = this.resultInfo.stats || []
      if (this.$route.name === 'VerifyDiffDetails') {
        list = list.filter((item) => {
          return item.source_total > 0
        })
      }
      return list
    },
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.loading = true
      inspectResultsApi
        .get({
          filter: JSON.stringify({
            where: {
              id: this.$route.params.id,
            },
          }),
        })
        .then((data) => {
          const result = data?.items?.[0]
          if (result) {
            this.resultInfo = result
            const stats = result.stats
            const inspect = result.inspect
            inspect.status = result.status
            inspect.lastStartTimeFmt = dayjs(inspect.lastStartTime).format(
              'YYYY-MM-DD HH:mm:ss',
            )
            inspect.id = result.inspect_id
            this.inspect = inspect
            if (stats.length) {
              this.errorMsg =
                result.status === 'error' ? result.errorMsg : undefined

              if (import.meta.env.VUE_APP_KEYWORD && this.errorMsg) {
                this.errorMsg = this.errorMsg.replaceAll(
                  /tapdata\s?/gi,
                  import.meta.env.VUE_APP_KEYWORD,
                )
              }

              this.taskId = stats[0].taskId
              this.$refs.resultView?.fetch(1)
              if (this.type !== 'row_count' && this.type !== 'hash') {
                this.$nextTick(() => {
                  this.$refs.singleTable?.setCurrentRow(stats[0])
                })
              }
            }
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    showErrorMessage() {
      this.$alert(this.errorMsg)
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #title>
      <span class="fs-5 font-color-dark">{{ inspect.name }}</span>
      <ElTag type="info" class="ml-3">{{ typeMap[type] }}</ElTag>
    </template>

    <template #actions>
      <div
        v-if="
          inspect.inspectMethod !== 'row_count' &&
          inspect.inspectMethod !== 'hash'
        "
      >
        <div class="flex align-items-center">
          <div
            v-if="resultInfo.parentId && $route.name === 'VerifyResult'"
            class="color-info flex align-items-center"
            style="font-size: 12px"
          >
            {{ $t('packages_business_verification_last_start_time') }}:
            {{ inspect.lastStartTimeFmt }}
            <ElLink class="ml-5" type="primary" @click="toDiffHistory">{{
              $t('packages_business_verification_button_diff_task_history')
            }}</ElLink>
          </div>
        </div>
      </div>

      <!--下载详情-->
      <ElButton
        class="ml-4"
        text
        type="primary"
        :loading="downloading"
        @click="downloadDetails"
        >{{ $t('packages_business_download_details') }}</ElButton
      >
    </template>

    <section v-loading="loading" class="flex flex-column h-100 gap-4">
      <div
        v-if="errorMsg && (type === 'row_count' || type === 'hash')"
        class="error-tips px-4"
      >
        <VIcon class="color-danger">error</VIcon>
        <span>
          <ElLink type="danger" @click="showErrorMessage">{{
            $t('packages_business_verification_see_details')
          }}</ElLink>
          <VIcon class="ml-2 color-info" size="12">close</VIcon>
        </span>
      </div>
      <div
        v-if="inspect && !['running', 'scheduling'].includes(inspect.status)"
        class="result-table"
      >
        <ResultTable
          ref="singleTable"
          :type="type"
          :data="tableData"
          @row-click="rowClick"
        />
        <ResultView
          v-if="type !== 'row_count' && type !== 'hash'"
          ref="resultView"
          :remote-method="getResultData"
          :show-type="showType"
          @update:show-type="showType = $event"
        />
      </div>
    </section>
  </PageContainer>
</template>

<style lang="scss">
.verify-result-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .section-wrap-box {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-direction: column;
    flex-direction: column;
    -ms-flex: 1;
    flex: 1;
    padding: 20px;
    border-radius: 4px;
    background-color: #fff;
    box-sizing: border-box;
    overflow: hidden;
  }
}
.verify-result-header {
  display: flex;
}
.error-tips {
  background: #fdf6ec;
  border: 1px solid #f8e2c0;
  color: map.get($color, warning);
  line-height: 20px;
  max-height: 160px;
  text-overflow: ellipsis;
  overflow-y: auto;
  font-size: 12px;
  padding: 8px;
}
.result-table {
  flex: 1;
  display: flex;
  overflow: auto;
}
</style>

<style lang="scss">
.verify-result-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 24px 24px 24px;
  .section-wrap-box {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-direction: column;
    flex-direction: column;
    -ms-flex: 1;
    flex: 1;
    padding: 20px;
    border-radius: 4px;
    background-color: #fff;
    box-sizing: border-box;
    overflow: hidden;
  }
}
.verify-result-header {
  display: flex;
  justify-content: space-between;
}
.error-tips {
  background: #fdf6ec;
  border: 1px solid #f8e2c0;
  color: map.get($color, warning);
  line-height: 20px;
  max-height: 160px;
  text-overflow: ellipsis;
  overflow-y: auto;
  font-size: 12px;
  padding: 8px;
}
.result-table {
  flex: 1;
  display: flex;
  overflow: auto;
}
</style>
