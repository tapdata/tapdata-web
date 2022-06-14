<template>
  <section class="data-verify-history-wrap g-panel-container" v-loading="loading">
    <div class="panel-main">
      <ElTable :data="page.data" height="100%">
        <ElTableColumn :label="$t('dataVerification_verifyTime')" prop="start">
          <template slot-scope="scope">
            {{ scope.row.start ? formatTime(scope.row.start) : formatTime(scope.row.createTime) }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('dataVerification_completeTime')" prop="last_updated" align="center" width="180">
          <template slot-scope="scope">
            <span>
              {{ formatTime(scope.row.last_updated) }}
            </span>
          </template>
        </ElTableColumn>
        <template v-if="$route.name === 'VerifyDiffHistory'">
          <ElTableColumn :label="$t('verify_history_source_rows')" prop="source_total"></ElTableColumn>
          <ElTableColumn :label="$t('verify_history_target_rows')" prop="target_total"></ElTableColumn>
        </template>
        <template v-else>
          <ElTableColumn :label="$t('verify_history_source_total_rows')" prop="firstSourceTotal"></ElTableColumn>
          <!--          <ElTableColumn :label="$t('verify_history_target_total_rows')" prop="firstTargetTotal"></ElTableColumn>-->
        </template>
        <ElTableColumn prop="progress" :label="$t('dataVerification_verifyProgress')" width="120px">
          <template slot-scope="scope">
            <div>
              <span>{{
                `${Math.round(scope.row.progress * 10000) / 100 ? Math.round(scope.row.progress * 10000) / 100 : 0}%`
              }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('dataVerification_verifytype')" prop="inspect.inspectMethod">
          <template slot-scope="scope">
            <span>{{ inspectMethod[scope.row.inspect ? scope.row.inspect.inspectMethod : ''] }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('dataVerification_verifyResult')" width="180">
          <template slot-scope="scope" v-if="['waiting', 'done'].includes(scope.row.status)">
            <div class="inspect-result">
              <span v-if="scope.row.result !== 'passed'" class="error">
                <VIcon class="verify-status-icon color-danger mr-1" size="14">error</VIcon>
                <span v-if="scope.row.inspect && scope.row.inspect.inspectMethod === 'row_count'">
                  {{ $t('verify_result_count_inconsistent') }}
                </span>
                <span v-else>{{ $t('verify_result_content_diff', [scope.row.difference_number]) }}</span>
              </span>
              <span class="success" v-if="scope.row.result === 'passed'">
                <VIcon class="verify-status-icon mr-1" size="14">success-fill-color</VIcon>
                <span>{{ $t('verify_result_count_consistent') }}</span>
              </span>
              <VIcon v-if="scope.row.parentId" class="ml-2" size="14">ercijiaoyan</VIcon>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('dataVerification_verifyStatus')" prop="status"></ElTableColumn>
        <ElTableColumn :label="$t('list_operation')" width="90px">
          <template slot-scope="scope">
            <ElLink type="primary" @click="rowClick(scope.row)">{{ $t('button_details') }}</ElLink>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination
        background
        class="pagination mt-3"
        :current-page.sync="page.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size.sync="page.size"
        layout="total, sizes, ->, prev, pager, next, jumper"
        :total="page.total"
        @size-change="search(1)"
        @current-change="search"
      >
      </ElPagination>
    </div>
  </section>
</template>

<script>
import VIcon from '@/components/VIcon'
import timeFunction from '@/mixins/timeFunction'

export default {
  components: { VIcon },
  mixins: [timeFunction],
  data() {
    return {
      loading: true,
      type: '',
      name: '',
      page: {
        data: null,
        current: 1,
        size: 10,
        total: 0,
        sortBy: '',
        order: ''
      },
      selections: [],
      inspectMethod: {
        row_count: this.$t('dataVerification_rowVerify'),
        field: this.$t('dataVerification_contentVerify'),
        jointField: this.$t('dataVerification_jointVerify')
      }
    }
  },
  created() {
    this.search(1)
  },
  methods: {
    searchRequest(filter) {
      if (filter?.where?.inspect_id?.regexp) {
        filter.where.inspect_id = filter.where.inspect_id.regexp.replace(/^\^(.*)\$$/, '$1')
      }
      if (filter?.where?.firstCheckId?.regexp) {
        filter.where.firstCheckId = filter.where.firstCheckId.regexp.replace(/^\^(.*)\$$/, '$1')
      }
      if (filter?.where?.parentId?.eq === null) {
        delete filter.where.parentId
      }
      return this.$axios
        .get('tm/api/InspectResults?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(data => {
          return [{ count: data.total }, data.items]
        })
    },
    search(pageNum) {
      this.loading = true
      let { current, size } = this.page
      let currentPage = pageNum || current + 1
      let id = this.$route.params.id
      let where = {
        inspect_id: { regexp: `^${id}$` },
        parentId: { eq: null }
      }
      let filter = {
        order: 'start DESC',
        limit: size,
        skip: (currentPage - 1) * size,
        inspectGroupByFirstCheckId: true
      }
      if (this.$route.name === 'VerifyDiffHistory') {
        where = {
          firstCheckId: { regexp: `^${id}$` }
        }
        delete filter.inspectGroupByFirstCheckId
      }
      filter.where = where
      this.searchRequest(filter, where)
        .then(([countData, data]) => {
          if (data) {
            this.page.data = data || []
            this.page.current = currentPage
            this.page.total = countData.count
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    rowClick(item) {
      let url = ''
      let id = item.id
      let routeName = 'VerifyResult'
      if (this.$route.name === 'VerifyDiffHistory') {
        routeName = 'VerifyDiffDetails'
      }
      let route = this.$router.resolve({
        name: routeName,
        params: {
          id
        }
      })
      url = route.href
      window.open(url, '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>
.data-verify-history-wrap {
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  .data-verify-history__icon {
    color: #fff;
  }
  .panel-slider {
    width: 200px;
    height: 100%;
    box-sizing: border-box;
  }
  .panel-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .tip {
      height: 30px;
      font-size: 12px;
      background: #f5f5f5;
      border: 1px solid #dedee4;
      line-height: 30px;
    }
    .title {
      font-weight: bold;
      color: #409eff;
      margin: 10px 0;
    }

    .inspect-result {
      .error,
      .success {
        display: inline-block;
      }
      .error {
        color: map-get($color, danger);
      }
      .success {
        color: map-get($color, success);
      }
    }
    .pagination {
      white-space: nowrap;
      padding: 2px 5px;
      color: #303133;
      font-weight: 700;
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
