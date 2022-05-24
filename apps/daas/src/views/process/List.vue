<template>
  <section class="process-list-wrap section-wrap">
    <TablePage ref="table" row-key="id" class="process-list" :remoteMethod="getData" @sort-change="handleSortTable">
      <div slot="search" class="search-bar">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </div>
      <el-table-column :label="$t('process_worker_ip')" prop="worker_ip" sortable="worker_ip"></el-table-column>
      <el-table-column :label="$t('process_version')" prop="version" sortable="version"></el-table-column>
      <el-table-column :label="$t('process_start_time')" prop="start_time" sortable="start_time">
        <template slot-scope="scope">
          {{ $moment(scope.row.start_time).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('process_ping_time')" prop="ping_time" sortable="ping_time">
        <template slot-scope="scope">
          {{ $moment(scope.row.ping_time).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('process_worker_type')" prop="worker_type" sortable="worker_type"> </el-table-column>
      <el-table-column :label="$t('process_running_thread')" prop="running_thread" sortable="running_thread">
      </el-table-column>
      <el-table-column :label="$t('process_total_thread')" prop="total_thread" sortable="total_thread">
      </el-table-column>
      <el-table-column :label="$t('process_job_ids')" prop="job_ids" width="200">
        <template slot-scope="scope">
          <!-- <div v-for="item in scope.row.job_ids" :key="item"> -->
          <template v-if="scope.row.job_ids">
            <div v-html="scope.row.job_ids"></div>
          </template>
        </template>
      </el-table-column>
      <el-table-column :label="$t('process_state')" prop="state" sortable="state" width="80">
        <template slot-scope="scope">
          <span :class="[scope.row.state, 'status']">
            {{ $t('process_' + scope.row.state) }}
          </span>
        </template>
      </el-table-column>
    </TablePage>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'
import { toRegExp } from '../../utils/util'
import FilterBar from '@/components/filter-bar'
const MINUTE = 1 * 60 * 1000
export default {
  components: {
    TablePage,
    FilterBar
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        state: 'all'
      },
      statusList: [
        { label: this.$t('process_all'), value: 'all' },
        { label: this.$t('process_online'), value: 'online' }
      ],
      order: 'start_time DESC',
      list: null
    }
  },
  created() {
    this.getFilterItems()
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
          $gte: Date.now() - 60000
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
      return this.$api('Workers')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          res.data.items.forEach(item => {
            if (item.job_ids) {
              let job_ids = item.job_ids.map(val => {
                if (item.jobs) {
                  let jobs = item.jobs.filter(v => v.id === val)
                  if (jobs && jobs.length > 0) {
                    // return jobs
                    return `<a href="/#/job?id=${val}" class="database-link" target="_blank">${jobs[0]['name']}</a></br>`
                  }
                }
                // return val
                return `<a href="/#/job?id=${val}" class="database-link" target="_blank">${val}</a></br>`
              })
              item.job_ids = job_ids.join(' ')
            } else if (item.worker_status) {
              item.job_ids = ''
              if (item.worker_status.status) {
                item.job_ids += `<div>${this.$t('process_process_state')}: &nbsp;&nbsp;<span style="">${
                  item.worker_status.status
                }</span></div>`
              }

              if (item.worker_status.worker_process_start_time) {
                item.job_ids += `<div>${this.$t(
                  'process_start_time'
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
            total: res.data.total,
            data: res.data.items
          }
        })
    },

    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('process_state'),
          key: 'state',
          type: 'select-inner',
          items: this.statusList,
          selectedWidth: '200px'
        },
        {
          placeholder: this.$t('process_name'),
          key: 'keyword',
          type: 'input'
        }
      ]
    }
  }
}
</script>
<style lang="scss" scoped>
.process-list-wrap {
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
        color: map-get($fontColor, light);
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
        background-color: map-get($bgColor, white);
        border-right: 0;
        border-left: 0;
        // box-shadow: 1px -1px 3px 0px rgba(0, 0, 0, 0.15);
      }
    }
  }
  .process-list {
    background-color: map-get($bgColor, normal);
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
      background: map-get($bgColor, main);
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
    ::v-deep {
      .el-table__body {
        .el-table__cell {
          &:last-child {
            .cell {
              padding-right: 0;
            }
          }
        }
      }
    }
    .status {
      display: inline-block;
      min-width: 62px;
      padding: 3px 0;
      text-align: center;
      font-weight: 500;
      border-radius: 2px;
    }
    .online {
      color: #178061;
      background-color: #c4f3cb;
    }
    .offline {
      color: #d44d4d;
      background-color: #ffecec;
    }
  }
}
</style>
