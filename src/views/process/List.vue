<template>
  <section class="process-list-wrap">
    <TablePage
      ref="table"
      row-key="id"
      class="process-list"
      :title="$t('app.menu.' + $route.name)"
      :remoteMethod="getData"
      @sort-change="handleSortTable"
    >
      <div slot="search">
        <ul class="search-bar">
          <li>
            <el-select
              v-model="searchParams.state"
              size="mini"
              @input="table.fetch(1, 800)"
              :placeholder="$t('process.state')"
            >
              <el-option :label="$t('process.all')" value="all"></el-option>
              <el-option
                :label="$t('process.online')"
                value="online"
              ></el-option>
            </el-select>
          </li>
          <li>
            <el-input
              clearable
              class="input-with-select"
              size="mini"
              v-model="searchParams.keyword"
              :placeholder="$t('process.name')"
              @input="table.fetch(1, 800)"
            >
            </el-input>
          </li>

          <li v-if="searchParams.keyword">
            <el-button size="mini" type="text" @click="reset()">{{
              $t('button.query')
            }}</el-button>
          </li>

          <li v-if="searchParams.keyword">
            <el-button size="mini" type="text" @click="reset('reset')">{{
              $t('button.reset')
            }}</el-button>
          </li>
        </ul>
      </div>
      <div slot="operation"></div>
      <el-table-column
        :label="$t('process.worker_ip')"
        prop="worker_ip"
        sortable="worker_ip"
      ></el-table-column>
      <el-table-column
        :label="$t('process.version')"
        prop="version"
        sortable="version"
      ></el-table-column>
      <el-table-column
        :label="$t('process.start_time')"
        prop="start_time"
        sortable="start_time"
      >
        <template slot-scope="scope">
          {{ $moment(scope.row.start_time).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('process.ping_time')"
        prop="ping_time"
        sortable="ping_time"
      >
        <template slot-scope="scope">
          {{ $moment(scope.row.ping_time).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('process.worker_type')"
        prop="worker_type"
        sortable="worker_type"
      >
      </el-table-column>
      <el-table-column
        :label="$t('process.running_thread')"
        prop="running_thread"
        sortable="running_thread"
      >
      </el-table-column>
      <el-table-column
        :label="$t('process.total_thread')"
        prop="total_thread"
        sortable="total_thread"
      >
      </el-table-column>
      <el-table-column
        :label="$t('process.job_ids')"
        prop="job_ids"
        width="200"
      >
        <template slot-scope="scope">
          <!-- <div v-for="item in scope.row.job_ids" :key="item"> -->
          <template v-if="scope.row.job_ids">
            <div v-html="scope.row.job_ids"></div>
          </template>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('process.state')"
        prop="state"
        sortable="state"
        width="80"
      >
        <template slot-scope="scope">
          {{ $t('process.' + scope.row.state) }}
        </template>
      </el-table-column>
    </TablePage>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'
import { toRegExp } from '../../utils/util'
const MINUTE = 1 * 60 * 1000
export default {
  components: {
    TablePage
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        state: 'all'
      },
      order: 'start_time DESC',
      list: null
    }
  },
  created() {},
  mounted() {
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  methods: {
    // 重置
    reset(name) {
      if (name === 'reset') {
        this.searchParams = {
          keyword: '',
          state: 'all'
        }
      }
      this.table.fetch(1)
    },
    // 获取数据
    getData({ page }) {
      let { current, size } = page
      let { state, keyword } = this.searchParams
      let where = {
        ping_time: {
          gte: '$serverDate',
          gte_offset: 60000
        }
      }

      if (state !== 'all') {
        where.worker_type = {
          in: ['connector', 'transformer', 'api-server', 'tapdata-manager']
        }
      }
      if (keyword && keyword.trim()) {
        where.worker_type = { like: toRegExp(keyword), options: 'i' }
      }
      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return Promise.all([
        this.$api('Workers').count({ where: where }),
        this.$api('Workers').get({
          filter: JSON.stringify(filter)
        })
      ]).then(([countRes, res]) => {
        res.data.forEach((item) => {
          if (item.job_ids) {
            let job_ids = item.job_ids.map((val) => {
              if (item.jobs) {
                let jobs = item.jobs.filter((v) => v.id === val)
                if (jobs && jobs.length > 0) {
                  // return jobs
                  return `<a href="el/#/job?id=${val}" target="_blank">${jobs[0]['name']}</a></br>`
                }
              }
              // return val
              return `<a href="el/#/job?id=${val}" target="_blank">${val}</a></br>`
            })
            item.job_ids = job_ids.join(' ')
          } else if (item.worker_status) {
            item.job_ids = ''
            if (item.worker_status.status) {
              item.job_ids += `<div>${this.$t(
                'process.processState'
              )}: &nbsp;&nbsp;<span style="">${
                item.worker_status.status
              }</span></div>`
            }

            if (item.worker_status.worker_process_start_time) {
              item.job_ids += `<div>${this.$t(
                'process.start_time'
              )}: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="">${this.$moment(
                item.worker_status.worker_process_start_time
              ).format('YYYY/MM/DD HH:mm:ss')}</span></div>`
            }
          }
          if (item.serverDate - item.ping_time > MINUTE) {
            item.state = 'offline'
          } else {
            item.state = 'online'
          }
        })
        return {
          total: countRes.data.count,
          data: res.data
        }
      })
    },

    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${
        order === 'ascending' ? 'ASC' : 'DESC'
      }`
      this.table.fetch(1)
    }
  }
}
</script>
<style lang="scss" scoped>
.process-list-wrap {
  height: 100%;

  .tapNav {
    height: 28px;
    background-color: rgba(239, 241, 244, 100);
    .mune {
      display: inline-block;
      height: 28px;
      line-height: 25px;
      font-size: 12px;
      border-radius: 0px 3px 0px 0px;
      background-color: rgba(244, 245, 247, 100);
      box-shadow: 0 -1px 10px 0px rgba(0, 0, 0, 0.15);
      li {
        float: left;
        width: 100px;
        height: 28px;
        color: #666;
        cursor: pointer;
        text-align: center;
        border-right: 1px solid #dedee4;

        &:last-child {
          border-right: 0;
        }
      }
      li.active {
        height: 29px;
        border-radius: 3px 3px 0px 0px;
        background-color: #fff;
        border-right: 0;
        border-left: 0;
        // box-shadow: 1px -1px 3px 0px rgba(0, 0, 0, 0.15);
      }
    }
  }
  .process-list {
    background-color: rgba(239, 241, 244, 100);
    .search-bar {
      display: flex;
      li + li {
        margin-left: 10px;
      }
    }
    .btn + .btn {
      margin-left: 5px;
    }
    .btn {
      padding: 7px;
      background: #f5f5f5;
      i.iconfont {
        font-size: 12px;
      }
      &.btn-dropdowm {
        margin-left: 5px;
      }
      &.btn-create {
        margin-left: 5px;
      }
    }
  }
}
</style>
<style lang="scss">
.user-list-wrap {
  .table-page-container {
    .table-page-body {
      box-shadow: 0 7px 15px -10px rgba(0, 0, 0, 0.1);
      .table-page-topbar {
        padding: 10px 10px 0 10px;
        background-color: #fff;
      }
      .el-table {
        padding: 0 10px;
        box-sizing: border-box;
      }
      .table-page-pagination {
        margin-top: 0;
        padding: 5px 20px;
        background-color: #fff;
        box-sizing: border-box;
      }
    }
  }
}
</style>
