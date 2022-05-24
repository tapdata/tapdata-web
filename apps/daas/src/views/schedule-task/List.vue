<template>
  <section class="dataRule-list-wrap section-wrap">
    <TablePage ref="table" row-key="id" class="dataRule-list" :remoteMethod="getData" @sort-change="handleSortTable">
      <div slot="search">
        <ul class="search-bar flex">
          <li>
            <el-input
              clearable
              class="input-with-select"
              size="small"
              v-model="searchParams.keyword"
              :placeholder="$t('dictionary.name')"
              @input="table.fetch(1, 800)"
            >
            </el-input>
          </li>
          <li>
            <ElButton class="btn-refresh" size="small" @click="table.fetch()">
              <i class="el-icon-refresh"></i>
            </ElButton>
          </li>
        </ul>
      </div>

      <el-table-column
        :label="$t('task.task_name')"
        prop="task_name"
        sortable="task_name"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column
        :label="$t('task.task_type')"
        prop="task_type"
        sortable="task_type"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column
        :label="$t('task.agent_id')"
        prop="agent_id"
        sortable="agent_id"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column :label="$t('task.statusText')" prop="status" sortable="status">
        <template slot-scope="scope">
          {{ $t('task.status.' + scope.row.status) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('task.last_updated')" prop="last_updated" sortable="last_updated">
        <template slot-scope="scope">
          {{ scope.row.last_updated ? $moment(scope.row.last_updated).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('task.ping_time')" prop="ping_time" sortable="ping_time">
        <template slot-scope="scope">
          {{ scope.row.ping_time ? $moment(scope.row.ping_time).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('column_operation')" width="180">
        <template slot-scope="scope">
          <el-button
            v-readonlybtn="'schedule_jobs_management'"
            v-if="scope.row.status === 'paused'"
            size="mini"
            type="text"
            @click="doUpdate(scope.row, 'stopping')"
            >{{ $t('task.paused') }}</el-button
          >
          <el-button
            v-readonlybtn="'schedule_jobs_management'"
            v-else
            size="mini"
            type="text"
            @click="doUpdate(scope.row, 'waiting')"
            >{{ $t('task.start') }}</el-button
          >

          <el-button
            size="mini"
            type="text"
            @click="
              $router.push({
                name: 'taskHistories',
                query: {
                  taskId: scope.row.id,
                  task_name: scope.row.task_name
                }
              })
            "
            >{{ $t('task.ahistory') }}</el-button
          >
        </template>
      </el-table-column>
    </TablePage>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'
import { toRegExp } from '../../utils/util'
export default {
  components: {
    TablePage
  },
  data() {
    return {
      searchParams: {
        keyword: ''
      },
      order: 'ping_time DESC',
      list: null,
      createDialogVisible: false,
      createForm: null
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  // watch: {
  //   'createForm.dataType'() {
  //     this.$nextTick(() => {
  //       this.$refs.form.clearValidate()
  //     })
  //   }
  // },
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
      let _this = this
      let { current, size } = page
      let { keyword } = this.searchParams
      let where = {}
      _this.classificationArr = []
      if (keyword && keyword.trim()) {
        where.or = [{ task_name: { like: toRegExp(keyword), options: 'i' } }]
      }
      let filter = {
        order: _this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return _this
        .$api('ScheduleTasks')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          return {
            total: res.data?.total || 0,
            data: res.data?.items || []
          }
        })
    },

    // 启动 暂停
    doUpdate(item, status) {
      let parmas = {
        status: status,
        id: item.id,
        task_name: item.task_name
      }
      this.$api('ScheduleTasks')
        .patch(parmas)
        .then(() => {
          this.table.fetch()
          this.$message.success(this.$t('message_save_ok'))
        })
        .catch(() => {
          this.$message.error(this.$t('message_save_fail'))
        })
    },

    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    }
  }
}
</script>
<style lang="scss" scoped>
.dataRule-list-wrap {
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
  .dataRule-list {
    background-color: map-get($bgColor, normal);
    .search-bar {
      display: flex;
      li + li {
        margin-left: 10px;
      }
      .btn-refresh {
        padding: 0;
        height: 32px;
        line-height: 32px;
        width: 32px;
        font-size: 16px;
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
  }
}
</style>
