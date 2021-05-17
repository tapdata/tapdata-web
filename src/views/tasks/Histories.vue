<template>
  <section class="dataRule-list-wrap">
    <TablePage
      ref="table"
      row-key="id"
      class="dataRule-list"
      :title="$t('app.menu.' + $route.name)"
      :remoteMethod="getData"
      @sort-change="handleSortTable"
    >
      <el-table-column
        :label="$t('task.task_name')"
        prop="task_name"
        sortable="task_name"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column
        :label="$t('task.task_result_code')"
        prop="task_result_code"
        sortable="task_result_code"
      ></el-table-column>
      <el-table-column
        :label="$t('task.task_result')"
        prop="task_result"
        sortable="task_result"
      ></el-table-column>
      <el-table-column
        :label="$t('task.task_duration')"
        prop="task_duration"
        sortable="task_duration"
      >
      </el-table-column>
      <el-table-column
        :label="$t('task.task_start_time')"
        prop="task_start_time"
        sortable="task_start_time"
      >
        <template slot-scope="scope">
          {{
            scope.row.task_start_time
              ? $moment(scope.row.task_start_time).format('YYYY-MM-DD HH:mm:ss')
              : ''
          }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('task.agent_id')"
        prop="agent_id"
        sortable="agent_id"
        :show-overflow-tooltip="true"
      >
      </el-table-column>
    </TablePage>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'
export default {
  components: {
    TablePage
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        isFuzzy: true
      },
      order: 'task_start_time DESC',
      list: null,
      createDialogVisible: false,
      createForm: null
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
      let taskId = this.$route.query.taskId || ''
      let where = {
        task_id: { regexp: `^${taskId}$` }
      }

      let filter = {
        order: _this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return Promise.all([
        _this.$api('TaskHistories').count({ where: where }),
        _this.$api('TaskHistories').get({
          filter: JSON.stringify(filter)
        })
      ]).then(([countRes, res]) => {
        return {
          total: countRes.data.count,
          data: res.data
        }
      })
    },
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'task_start_time'} ${
        order === 'ascending' ? 'ASC' : 'DESC'
      }`
      this.table.fetch(1)
    }
  }
}
</script>
<style lang="scss" scoped>
.dataRule-list-wrap {
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
.dataRule-list-wrap {
  .table-page-container {
    .table-page-body {
      box-shadow: 0 7px 15px -10px rgba(0, 0, 0, 0.1);
      .table-page-topbar {
        padding: 10px 10px 0 10px;
        background-color: #fff;
      }
      .el-table {
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
  .el-dialog__wrapper {
    // overflow: hidden;
    .el-dialog__body {
    }
  }
}
</style>
