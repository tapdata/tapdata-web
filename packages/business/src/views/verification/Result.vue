<template>
  <section class="verify-result-wrap section-wrap h-100" v-loading="loading">
    <div class="section-wrap-box">
      <div class="verify-result-header align-center" v-if="inspect">
        <div>
          <span style="font-size: 14px">{{ inspect.name }}</span>
          <span class="font-color-linfo ml-3">{{ typeMap[type] }}</span>
        </div>
        <div class="flex-grow-1"></div>
        <div v-if="inspect.inspectMethod !== 'row_count' && inspect.inspectMethod !== 'hash'">
          <div class="flex align-items-center">
            <div
              v-if="resultInfo.parentId && $route.name === 'VerifyResult'"
              class="color-info flex align-items-center"
              style="font-size: 12px"
            >
              {{ $t('packages_business_verification_last_start_time') }}: {{ inspect.lastStartTimeFmt }}
              <ElLink class="ml-5" type="primary" @click="toDiffHistory">{{
                $t('packages_business_verification_button_diff_task_history')
              }}</ElLink>
            </div>
          </div>
        </div>

        <!--下载详情-->
        <ElButton class="ml-4" type="text" :loading="downloading" @click="downloadDetails">{{
          $t('packages_business_download_details')
        }}</ElButton>
      </div>
      <div v-if="errorMsg && (type === 'row_count' || type === 'hash')" class="error-tips mt-4 px-4">
        <VIcon class="color-danger">error</VIcon>
        <span>
          <ElLink type="danger" @click="showErrorMessage">{{
            this.$t('packages_business_verification_see_details')
          }}</ElLink>
          <VIcon class="ml-2 color-info" size="12">close</VIcon>
        </span>
      </div>
      <div class="result-table mt-4" v-if="inspect && !['running', 'scheduling'].includes(inspect.status)">
        <ResultTable ref="singleTable" :type="type" :data="tableData" @row-click="rowClick"></ResultTable>
        <ResultView
          v-if="type !== 'row_count' && type !== 'hash'"
          ref="resultView"
          :remoteMethod="getResultData"
          :show-type="showType"
          @update:showType="showType = $event"
        ></ResultView>
      </div>
    </div>
  </section>
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
  color: map-get($color, warning);
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
<script>
import ResultTable from './ResultTable'
import ResultView from './ResultView'
import dayjs from 'dayjs'
import { inspectResultsApi } from '@tap/api'
import { inspectMethod as typeMap } from './const'
import mixins from './mixins'

export default {
  components: { ResultTable, ResultView },
  mixins: [mixins],
  data() {
    return {
      loading: false,
      typeMap,
      inspect: {},
      resultInfo: {},
      errorMsg: '',
      taskId: null
    }
  },
  computed: {
    type() {
      return this.inspect?.inspectMethod || ''
    },
    tableData() {
      let list = this.resultInfo.stats || []
      if (this.$route.name === 'VerifyDiffDetails') {
        list = list.filter(item => {
          return item.source_total > 0
        })
      }
      return list
    }
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
              id: this.$route.params.id
            }
          })
        })
        .then(data => {
          let result = data?.items?.[0]
          if (result) {
            this.resultInfo = result
            let stats = result.stats
            let inspect = result.inspect
            inspect.status = result.status
            inspect.lastStartTimeFmt = dayjs(inspect.lastStartTime).format('YYYY-MM-DD HH:mm:ss')
            inspect.id = result.inspect_id
            this.inspect = inspect
            if (stats.length) {
              this.errorMsg = result.status === 'error' ? result.errorMsg : undefined
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
    }
  }
}
</script>
