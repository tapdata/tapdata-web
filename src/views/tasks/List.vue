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
      <div slot="search">
        <ul class="search-bar">
          <li>
            <el-input
              clearable
              class="input-with-select"
              size="mini"
              v-model="searchParams.keyword"
              :placeholder="$t('dictionary.name')"
              @input="table.fetch(1, 800)"
            >
              <el-select
                style="width: 120px"
                slot="prepend"
                v-model="searchParams.isFuzzy"
                @input="table.fetch(1)"
              >
                <el-option
                  :label="$t('connection.fuzzyQuery')"
                  :value="true"
                ></el-option>
                <el-option
                  :label="$t('connection.PreciseQuery')"
                  :value="false"
                ></el-option>
              </el-select>
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
      <el-table-column
        :label="$t('task.statusText')"
        prop="status"
        sortable="status"
      >
        <template slot-scope="scope">
          {{ $t('task.status.' + scope.row.status) }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('task.last_updated')"
        prop="last_updated"
        sortable="last_updated"
      >
        <template slot-scope="scope">
          {{
            scope.row.last_updated
              ? $moment(scope.row.last_updated).format('YYYY-MM-DD HH:mm:ss')
              : ''
          }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('task.ping_time')"
        prop="ping_time"
        sortable="ping_time"
      >
        <template slot-scope="scope">
          {{
            scope.row.ping_time
              ? $moment(scope.row.ping_time).format('YYYY-MM-DD HH:mm:ss')
              : ''
          }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('message.operator')" width="120">
        <template slot-scope="scope">
          <el-button
            v-readonlybtn="'schedule_jobs_management'"
            v-if="scope.row.status === 'paused'"
            size="mini"
            type="text"
            @click="doUpdate(scope.row, 'waiting')"
            >{{ $t('task.start') }}</el-button
          >
          <el-button
            v-readonlybtn="'schedule_jobs_management'"
            v-else
            size="mini"
            type="text"
            @click="doUpdate(scope.row, 'stopping')"
            >{{ $t('task.paused') }}</el-button
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
        keyword: '',
        isFuzzy: true
      },
      order: 'ping_time DESC',
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
      let { isFuzzy, keyword } = this.searchParams
      let where = {}
      _this.classificationArr = []
      if (keyword && keyword.trim()) {
        let filterObj = isFuzzy
          ? { like: toRegExp(keyword), options: 'i' }
          : keyword
        where.or = [{ name: filterObj }]
      }
      let filter = {
        order: _this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return Promise.all([
        _this.$api('ScheduleTasks').count({ where: where }),
        _this.$api('ScheduleTasks').get({
          filter: JSON.stringify(filter)
        })
      ]).then(([countRes, res]) => {
        return {
          total: countRes.data.count,
          data: res.data
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
          this.$message.success(this.$t('message.saveOK'))
        })
        .catch(() => {
          this.$message.error(this.$t('message.saveFail'))
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
