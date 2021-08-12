<template>
  <section class="data-verify-history-wrap" v-loading="loading">
    <div class="panel-main">
      <el-table :data="page.data" height="100%" class="table-border">
        <el-table-column :label="$t('dataVerification.verifyTime')" prop="start">
          <template slot-scope="scope">
            {{
              scope.row.start
                ? $moment(scope.row.start).format('YYYY-MM-DD HH:mm:ss')
                : $moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')
            }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('dataVerification.completeTime')" prop="end" align="center" width="180">
          <template slot-scope="scope">
            <span>
              {{ scope.row.end ? $moment(scope.row.end).format('YYYY-MM-DD HH:mm:ss') : '' }}
            </span>
          </template>
        </el-table-column>
        <template v-if="$route.name === 'VerifyDiffHistory'">
          <el-table-column :label="$t('verify_history_source_rows')" prop="source_total"></el-table-column>
          <el-table-column :label="$t('verify_history_target_rows')" prop="target_total"></el-table-column>
        </template>
        <template v-else>
          <el-table-column :label="$t('verify_history_source_total_rows')" prop="source_total"></el-table-column>
          <el-table-column :label="$t('verify_history_target_total_rows')" prop="target_total"></el-table-column>
        </template>
        <el-table-column prop="progress" :label="$t('dataVerification.verifyProgress')" width="80px">
          <template slot-scope="scope">
            <div>
              <span>{{
                `${Math.round(scope.row.progress * 10000) / 100 ? Math.round(scope.row.progress * 10000) / 100 : 0}%`
              }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('dataVerification.verifytype')" prop="inspect.inspectMethod">
          <template slot-scope="scope">
            <span>{{ inspectMethod[scope.row.inspect ? scope.row.inspect.inspectMethod : ''] }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('dataVerification.verifyResult')" width="180">
          <template slot-scope="scope" v-if="['waiting', 'done'].includes(scope.row.status)">
            <div class="inspect-result">
              <div v-if="scope.row.target_total !== scope.row.source_total && scope.row.result !== 'passed'">
                <span class="error" v-if="scope.row.target_total - scope.row.source_total !== 0">
                  <i class="data-verify-history__icon el-icon-error"></i>
                  <span>
                    {{ $t('dataVerification.rowConsistent') }}
                    {{ Math.abs(scope.row.target_total - scope.row.source_total) }}
                  </span>
                </span>
              </div>
              <div
                v-if="
                  scope.row.difference_number !== 0 &&
                  scope.row.inspect &&
                  scope.row.result !== 'passed' &&
                  scope.row.inspect.inspectMethod !== 'row_count'
                "
              >
                <span class="error" v-if="scope.row.difference_number">
                  <i class="data-verify-history__icon el-icon-error"></i>
                  <span>
                    {{ $t('dataVerification.contConsistent') }}
                    {{ scope.row.difference_number }}
                  </span>
                </span>
              </div>
              <span class="success" v-if="scope.row.result === 'passed'">
                <i class="data-verify-history__icon el-icon-success"></i>
                <span>{{ $t('dataVerification.consistent') }}</span>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('dataVerification.verifyStatus')" prop="status"></el-table-column>
        <el-table-column :label="$t('dataFlow.operate')" width="60px">
          <template slot-scope="scope">
            <ElLink type="primary" @click="changeInspectResult(scope.row.id)">{{ $t('button.details') }}</ElLink>
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
export default {
  props: {
    remoteMethod: Function
  },
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
        row_count: this.$t('dataVerification.rowVerify'),
        field: this.$t('dataVerification.contentVerify'),
        jointField: this.$t('dataVerification.jointVerify')
      }
    }
  },
  created() {
    this.search(1)
  },
  methods: {
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
      this.remoteMethod(filter, where)
        .then(([countData, data]) => {
          if (data) {
            this.page.data = data
            this.page.current = currentPage
            this.page.total = countData.count
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    rowClick(row) {
      this.changeInspectResult(row.id)
    },
    changeInspectResult(id) {
      this.$emit('row-click', id)
    }
  }
}
</script>

<style lang="scss" scoped>
.data-verify-history-wrap {
  display: flex;
  margin: 20px;
  padding: 20px;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
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
        padding: 0 8px 0 5px;
        display: inline-block;
        line-height: 20px;
        color: #fff;
        border-radius: 20px;
      }
      .error {
        background: #f56c6c;
      }
      .success {
        background: #70ae48;
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
