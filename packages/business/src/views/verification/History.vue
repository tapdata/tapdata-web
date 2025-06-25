<script>
import { inspectResultsApi } from '@tap/api'
import { VIcon } from '@tap/component'
import dayjs from 'dayjs'
import PageContainer from '../../components/PageContainer.vue'
import { inspectMethod, statusMap } from './const'

let timeout = null
export default {
  components: { VIcon, PageContainer },
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
        order: '',
      },
      selections: [],
      statusMap,
      inspectMethod,
    }
  },
  created() {
    this.search(1)
    timeout = setInterval(() => {
      this.search(this.page.current, true)
    }, 8000)
  },
  unmounted() {
    clearInterval(timeout)
  },
  methods: {
    formatTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    searchRequest(filter) {
      if (filter?.where?.inspect_id?.regexp) {
        filter.where.inspect_id = filter.where.inspect_id.regexp.replace(
          /^\^(.*)\$$/,
          '$1',
        )
      }
      if (filter?.where?.firstCheckId?.regexp) {
        filter.where.firstCheckId = filter.where.firstCheckId.regexp.replace(
          /^\^(.*)\$$/,
          '$1',
        )
      }
      if (filter?.where?.parentId?.eq === null) {
        delete filter.where.parentId
      }
      return inspectResultsApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          return [{ count: data.total }, data.items]
        })
    },
    search(pageNum, hideLoading = false) {
      if (!hideLoading) {
        this.loading = true
      }
      const { current, size } = this.page
      const currentPage = pageNum || current + 1
      const id = this.$route.params.id
      let where = {
        inspect_id: { regexp: `^${id}$` },
        parentId: { eq: null },
      }
      const filter = {
        order: 'start DESC',
        limit: size,
        skip: (currentPage - 1) * size,
        inspectGroupByFirstCheckId: true,
      }
      if (this.$route.name === 'VerifyDiffHistory') {
        where = {
          inspect_id: { regexp: `^${this.$route.params.inspectId}$` },
          firstCheckId: { regexp: `^${id}$` },
        }
        delete filter.inspectGroupByFirstCheckId
      }
      filter.where = where
      this.searchRequest(filter, where)
        .then(([countData, data]) => {
          if (data) {
            this.page.data = data?.map((item) => {
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
      const id = item.id
      let routeName = 'dataVerifyResult'
      if (this.$route.name === 'VerifyDiffHistory') {
        routeName = 'VerifyDiffDetails'
      }
      this.$router.push({
        name: routeName,
        params: {
          id,
        },
      })
    },
  },
}
</script>

<template>
  <PageContainer>
    <section v-loading="loading" class="flex flex-column h-100">
      <el-table :data="page.data" height="100%">
        <el-table-column
          :label="$t('packages_business_verification_verifyTime')"
          prop="start"
        >
          <template #default="scope">
            {{ scope.row.startTimeFmt }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('packages_business_verification_completeTime')"
          prop="last_updated"
          align="center"
          width="180"
        >
          <template #default="scope">
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
          />
          <el-table-column
            :label="$t('packages_business_verification_targetTotalRows')"
            prop="target_total"
            align="center"
          />
        </template>
        <template v-else>
          <el-table-column
            :label="
              $t('packages_business_verification_history_source_total_rows')
            "
            prop="firstSourceTotal"
            align="center"
          >
            <template #default="{ row }">
              {{
                row.inspect.inspectMethod === 'hash'
                  ? '-'
                  : row.firstSourceTotal
              }}
            </template>
          </el-table-column>
        </template>
        <el-table-column
          prop="progress"
          :label="$t('packages_business_verification_verifyProgress')"
          width="120px"
        >
          <template #default="scope">
            <div>
              <span>{{
                `${Math.round(scope.row.progress * 10000) / 100 ? Math.round(scope.row.progress * 10000) / 100 : 0}%`
              }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('packages_business_verification_verifytype')"
          prop="inspect.inspectMethod"
        >
          <template #default="scope">
            <span>{{
              inspectMethod[
                scope.row.inspect ? scope.row.inspect.inspectMethod : ''
              ]
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('packages_business_verification_result_title')"
          width="180"
        >
          <template #default="scope">
            <div
              v-if="['waiting', 'done'].includes(scope.row.status)"
              class="inspect-result"
            >
              <span v-if="scope.row.result !== 'passed'" class="error">
                <VIcon class="verify-status-icon color-danger mr-1" size="14"
                  >error</VIcon
                >
                <span
                  v-if="
                    (scope.row.inspect &&
                      scope.row.inspect.inspectMethod === 'row_count') ||
                    scope.row.inspect.inspectMethod === 'hash'
                  "
                >
                  {{
                    $t(
                      'packages_business_verification_result_count_inconsistent',
                    )
                  }}
                </span>
                <span
                  v-if="
                    scope.row.inspect &&
                    scope.row.inspect.inspectMethod === 'field'
                  "
                >
                  {{ $t('packages_business_verification_contConsistent')
                  }}{{ scope.row.difference_number }}
                </span>
                <span
                  v-if="
                    scope.row.inspect &&
                    scope.row.inspect.inspectMethod === 'jointField'
                  "
                >
                  {{ $t('packages_business_verification_contConsistent')
                  }}{{ scope.row.difference_number }}
                </span>
                <span
                  v-if="
                    scope.row.inspect &&
                    scope.row.inspect.inspectMethod === 'cdcCount'
                  "
                >
                  {{
                    $t('packages_business_verification_result_content_diff', [
                      scope.row.difference_number,
                    ])
                  }}
                </span>
              </span>
              <span v-if="scope.row.result === 'passed'" class="success">
                <VIcon class="verify-status-icon mr-1" size="14"
                  >success-fill-color</VIcon
                >
                <span>{{
                  $t('packages_business_verification_result_count_consistent')
                }}</span>
              </span>
              <VIcon v-if="scope.row.parentId" class="ml-2" size="14"
                >ercijiaoyan</VIcon
              >
            </div>
            <span v-else />
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('packages_business_verification_verifyStatus')"
          prop="status"
        >
          <template #default="scope">
            <span>{{ statusMap[scope.row.status] }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public_operation')" width="100px">
          <template #default="scope">
            <ElButton text type="primary" @click="rowClick(scope.row)">{{
              $t('public_button_details')
            }}</ElButton>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="page.current"
        v-model:page-size="page.size"
        background
        class="pagination mt-3"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, ->, prev, pager, next, jumper"
        :total="page.total"
        @size-change="search(1)"
        @current-change="search"
      />
    </section>
  </PageContainer>
</template>

<style lang="scss" scoped>
.data-verify-history-wrap {
  height: 100%;
  overflow: hidden;
  .section-wrap-box {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-direction: column;
    flex-direction: column;
    -ms-flex: 1;
    flex: 1;
    overflow: hidden;
  }
  .data-verify-history__icon {
    color: var(--text-white);
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
      background: var(--bg-main);
      border: 1px solid var(--border-light);
      line-height: 30px;
    }
    .title {
      font-weight: bold;
      color: var(--color-primary);
      margin: 10px 0;
    }

    .inspect-result {
      .error,
      .success {
        display: inline-block;
      }
      .error {
        color: var(--color-danger);
      }
      .success {
        color: var(--color-success);
      }
    }
    .pagination {
      white-space: nowrap;
      padding: 2px 5px;
      color: var(--text-dark);
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
      background: var(--color-primary);
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
