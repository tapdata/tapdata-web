<template>
  <section class="schedule-list-wrap section-wrap">
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
        :label="$t('task.task_result_code')"
        prop="task_result_code"
        sortable="task_result_code"
      ></el-table-column>
      <el-table-column :label="$t('task.task_result')" prop="task_result" sortable="task_result"></el-table-column>
      <el-table-column :label="$t('task.task_duration')" prop="task_duration" sortable="task_duration">
      </el-table-column>
      <el-table-column :label="$t('task.task_start_time')" prop="task_start_time" sortable="task_start_time">
        <template slot-scope="scope">
          {{ scope.row.task_start_time ? $moment(scope.row.task_start_time).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('task.agent_id')" prop="agent_id" sortable="agent_id" :show-overflow-tooltip="true">
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
      order: 'task_start_time DESC',
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
      let { keyword } = this.searchParams
      let { current, size } = page
      let taskId = this.$route.query.taskId || ''
      let where = {
        task_id: { regexp: `^${taskId}$` }
      }
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
        .$api('TaskHistories')
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
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'task_start_time'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    }
  }
}
</script>
<style lang="scss" scoped>
.schedule-list-wrap {
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
}
</style>
<style lang="scss">
.dataRule-list-wrap {
  .table-page-container {
    .table-page-body {
      box-shadow: 0 7px 15px -10px rgba(0, 0, 0, 0.1);
      .table-page-topbar {
        padding: 10px 10px 0 10px;
        background-color: map-get($bgColor, white);
      }
      .el-table {
        box-sizing: border-box;
      }
      .table-page-pagination {
        margin-top: 0;
        padding: 5px 20px;
        background-color: map-get($bgColor, white);
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
