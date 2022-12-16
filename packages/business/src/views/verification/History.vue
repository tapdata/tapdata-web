<template>
  <section class="data-verify-history-wrap section-wrap" v-loading="loading">
    <div class="panel-main section-wrap-box">
      <el-table :data="page.data" height="100%">
        <el-table-column :label="$t('packages_business_verification_verifyTime')" prop="start">
          <template slot-scope="scope">
            {{ scope.row.startTimeFmt }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('packages_business_verification_completeTime')"
          prop="last_updated"
          align="center"
          width="180"
        >
          <template slot-scope="scope">
            <span>
              {{ formatTime(scope.row.last_updated) }}
            </span>
          </template>
        </el-table-column>
        <template v-if="$route.name === 'VerifyDiffHistory'">
          <el-table-column
            :label="$t('packages_business_verification_sourceTotalRows')"
            prop="source_total"
            align="center"
          ></el-table-column>
          <el-table-column
            :label="$t('packages_business_verification_targetTotalRows')"
            prop="target_total"
            align="center"
          ></el-table-column>
        </template>
        <template v-else>
          <el-table-column
            :label="$t('packages_business_verification_history_source_total_rows')"
            prop="firstSourceTotal"
            align="center"
          ></el-table-column>
        </template>
        <el-table-column prop="progress" :label="$t('packages_business_verification_verifyProgress')" width="120px">
          <template slot-scope="scope">
            <div>
              <span>{{
                `${Math.round(scope.row.progress * 10000) / 100 ? Math.round(scope.row.progress * 10000) / 100 : 0}%`
              }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('packages_business_verification_verifytype')" prop="inspect.inspectMethod">
          <template slot-scope="scope">
            <span>{{ inspectMethod[scope.row.inspect ? scope.row.inspect.inspectMethod : ''] }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('packages_business_verification_result_title')" width="180">
          <template slot-scope="scope" v-if="['waiting', 'done'].includes(scope.row.status)">
            <div class="inspect-result">
              <span v-if="scope.row.result !== 'passed'" class="error">
                <VIcon class="verify-status-icon color-danger mr-1" size="14">error</VIcon>
                <span v-if="scope.row.inspect && scope.row.inspect.inspectMethod === 'row_count'">
                  {{ $t('packages_business_verification_result_count_inconsistent') }}
                </span>
                <span v-else>{{
                  $t('packages_business_verification_result_content_diff', [scope.row.difference_number])
                }}</span>
              </span>
              <span class="success" v-if="scope.row.result === 'passed'">
                <VIcon class="verify-status-icon mr-1" size="14">success-fill-color</VIcon>
                <span>{{ $t('packages_business_verification_result_count_consistent') }}</span>
              </span>
              <VIcon v-if="scope.row.parentId" class="ml-2" size="14">ercijiaoyan</VIcon>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('packages_business_verification_verifyStatus')" prop="status"></el-table-column>
        <el-table-column :label="$t('packages_business_verification_operation')" width="60px">
          <template slot-scope="scope">
            <ElLink type="primary" @click="rowClick(scope.row)">{{ $t('packages_business_button_details') }}</ElLink>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
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
      </el-pagination>
    </div>
  </section>
</template>

<script>
import { VIcon } from '@tap/component'
import dayjs from 'dayjs'
import { inspectResultsApi } from '@tap/api'

export default {
  components: { VIcon },
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
        row_count: this.$t('packages_business_verification_rowVerify'),
        field: this.$t('packages_business_verification_contentVerify'),
        jointField: this.$t('packages_business_verification_jointVerify')
      }
    }
  },
  created() {
    this.search(1)
  },
  methods: {
    formatTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
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
      return inspectResultsApi
        .get({
          filter: JSON.stringify(filter)
        })
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
            this.page.data = data?.map(item => {
              item.startTimeFmt = this.formatTime(item.start || item.createTime)
              return item
            })
            this.page.current = currentPage
            this.page.total = countData.count
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    rowClick(item) {
      let id = item.id
      let routeName = 'dataVerifyResult'
      if (this.$route.name === 'VerifyDiffHistory') {
        routeName = 'VerifyDiffDetails'
      }
      this.$router.push({
        name: routeName,
        params: {
          id
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.data-verify-history-wrap {
  height: 100%;
  .data-verify-history__icon {
    color: map-get($fontColor, white);
  }
  .panel-slider {
    width: 200px;
    height: 100%;
    box-sizing: border-box;
  }
  .panel-main {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .tip {
      height: 30px;
      font-size: 12px;
      background: map-get($bgColor, main);
      border: 1px solid map-get($borderColor, light);
      line-height: 30px;
    }
    .title {
      font-weight: bold;
      color: map-get($color, primary);
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
      color: map-get($fontColor, dark);
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
      background: map-get($color, primary);
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
