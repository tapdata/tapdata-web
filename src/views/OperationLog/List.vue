<template>
  <section class="operation-logs-wrapper main-container" v-loading="loading" v-if="$route.name === 'OperationLog'">
    <div class="main">
      <div class="list-operation">
        <div class="list-operation-left">
          <ul>
            <li>
              <ElSelect v-model="searchParams.operationType" @input="search()">
                <ElOption label="操作类型" value=""></ElOption>
                <ElOption
                  v-for="(item, key) in operationTypeOptions"
                  :key="key"
                  :label="item.label"
                  :value="item.value"
                ></ElOption>
              </ElSelect>
            </li>
            <li class="ml-3">
              <ElInput v-model="searchParams.parameter1" placeholder="操作对象" @input="search()">
                <i slot="prefix" class="iconfont td-icon-sousuo el-input__icon"></i>
              </ElInput>
            </li>
            <li class="ml-3">
              <ElDatePicker
                v-model="searchParams.start"
                type="datetime"
                placeholder="开始时间"
                @change="search"
              ></ElDatePicker>
            </li>
            <li class="ml-3">
              <ElTooltip
                placement="top"
                manual
                content="【结束时间】不能小于【开始时间】"
                popper-class="copy-tooltip"
                :value="checkStartAndEndTime"
              >
                <ElDatePicker
                  v-model="searchParams.end"
                  type="datetime"
                  placeholder="结束时间"
                  @change="search"
                ></ElDatePicker>
              </ElTooltip>
            </li>
            <li class="ml-3">
              <ElInput v-model="searchParams.username" placeholder="用户名" @input="search()">
                <i slot="prefix" class="iconfont td-icon-sousuo el-input__icon"></i>
              </ElInput>
            </li>
            <li class="ml-3">
              <ElButton plain class="btn-refresh" @click="fetch()">
                <i class="iconfont td-icon-shuaxin"></i>
              </ElButton>
            </li>
          </ul>
        </div>
      </div>
      <El-table class="operation-logs-table  table-border mt-3" height="100%" :data="list">
        <ElTableColumn label="用户名" width="200">
          <template slot-scope="scope">
            <div>{{ scope.row.username }}</div>
          </template>
        </ElTableColumn>
        <!--        <ElTableColumn label="用户昵称" width="120">-->
        <!--          <template slot-scope="scope">-->
        <!--            <div>{{ scope.row.username }}</div>-->
        <!--          </template>-->
        <!--        </ElTableColumn>-->
        <ElTableColumn label="操作时间" width="200">
          <template slot-scope="scope">
            <div>{{ $moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn show-overflow-tooltip label="操作对象" width="350">
          <template slot-scope="scope">
            <div class="ellipsis">{{ scope.row.parameter1 }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作类型" width="120">
          <template slot-scope="scope">
            <div>{{ getTypeText(scope.row) }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作描述" min-width="300">
          <template slot-scope="scope">
            <span>{{ getDescFnc(scope.row) }}</span>
            <span v-if="scope.row.parameter1"
              >【
              <ElLink type="primary" @click="toGoList(scope.row)">{{ scope.row.parameter1 }}</ElLink>
              】</span
            >
          </template>
        </ElTableColumn>
      </El-table>
      <ElPagination
        background
        class="mt-3"
        layout="total, sizes, ->, prev, pager, next, jumper"
        :current-page.sync="page.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size.sync="page.size"
        :total="page.total"
        @size-change="changePage"
        @current-change="changePage"
      >
      </ElPagination>
    </div>
  </section>
  <RouterView v-else></RouterView>
</template>

<script>
import { delayTrigger, toRegExp } from '../../util'

export default {
  data() {
    return {
      loading: true,
      searchParams: {
        operationType: '',
        parameter1: '',
        start: '',
        end: '',
        username: ''
      },
      source: [], // 所有数据
      list: [], // 展示的数据
      page: {
        current: 1,
        size: 10,
        total: 0
      },
      order: 'createTime desc',
      VUE_APP_INSTANCE_TEST_BTN: process.env.VUE_APP_INSTANCE_TEST_BTN,
      upgradeDialog: false,
      selectedRow: {},
      agentStatus: 'stop',
      version: '',
      upgradeList: [], // 升级列表
      modularMap: {
        connection: '连接',
        migration: '任务'
      },
      operationMap: {
        create: '创建',
        update: '编辑',
        copy: '复制',
        delete: '删除',
        start: '启动',
        reset: '重置',
        stop: '停止',
        forceStop: '强制停止'
      },
      operationTypeItems: [
        {
          label: '连接',
          value: 'connection',
          items: {
            create: '创建',
            update: '编辑',
            copy: '复制',
            delete: '删除'
          }
        },
        {
          label: '任务',
          value: 'migration',
          items: {
            create: '创建',
            start: '启动',
            update: '编辑',
            copy: '复制',
            reset: '重置',
            delete: '删除',
            stop: '停止',
            forceStop: '强制停止'
          }
        },
        {
          label: '系统',
          value: 'system',
          hiddenSelected: true, // 不显示在选择框中
          items: {
            login: '登录'
          }
        }
      ]
    }
  },
  computed: {
    operationTypeOptions() {
      let result = []
      this.operationTypeItems.forEach(el => {
        if (!el.hiddenSelected) {
          for (let key in el.items) {
            result.push({
              label: el.items[key] + el.label,
              value: key + '_' + el.value
            })
          }
        }
      })
      return result
    },
    allTypeMap() {
      let obj = {}
      this.operationTypeItems.forEach(el => {
        obj[el.value] = el.label
        for (let key in el.items) {
          obj[key] = el.items[key]
        }
      })
      return obj
    },
    // 检查开始时间是否小于结束时间
    checkStartAndEndTime() {
      let flag = false
      let { start, end } = this.searchParams
      if (start && end && this.getTimeStamp(start) > this.getTimeStamp(end)) {
        flag = true
      }
      return flag
    }
  },
  watch: {
    '$route.query'() {
      this.init()
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      let searchParams = this.searchParams
      let { modular, operation, parameter1, start, end, username } = this.$route.query || {}
      if (modular && operation) {
        searchParams.operationType = this.formatOperationType(modular, operation)
      }
      if (parameter1) {
        searchParams.parameter1 = parameter1
      }
      if (start) {
        searchParams.start = this.getDate(start)
      }
      if (end) {
        searchParams.end = this.getDate(end)
      }
      if (username) {
        searchParams.username = username
      }
      this.fetch()
    },
    formatOperationType(modular, operation) {
      return (operation ?? '') + '_' + (modular ?? '')
    },
    getTimeStamp(value) {
      let date = this.getDate(value)
      if (!date) {
        return 0
      }
      return new Date(value).getTime()
    },
    getDate(value) {
      if (!value) {
        return ''
      }
      return new Date(Number(value))
    },
    search() {
      let query = {}
      let { operationType, parameter1, start, end, username } = this.searchParams
      if (operationType) {
        let [operation, modular] = operationType.split('_')
        query.modular = modular
        query.operation = operation
      }
      if (parameter1) {
        query.parameter1 = parameter1
      }
      if (start) {
        query.start = this.getTimeStamp(start)
      }
      if (end) {
        query.end = this.getTimeStamp(end)
      }
      if (username) {
        query.username = username
      }
      this.$router.replace({
        name: 'OperationLog',
        query: query
      })
      // this.fetch()
    },

    fetch(pageNum = 1, debounce, hideLoading) {
      delayTrigger(async () => {
        if (!hideLoading) {
          this.loading = true
        }
        this.page.current = pageNum
        let current = this.page.current
        let { operationType, parameter1, start, end, username } = this.searchParams
        let where = {
          type: 'userOperation' // 默认用户操作
        }
        // 操作类型
        if (operationType) {
          let [operation, modular] = operationType?.split('_')
          where['modular'] = modular
          where['operation'] = operation
        }
        // 操作对象
        if (parameter1) {
          where['parameter1'] = { like: toRegExp(parameter1), options: 'i' }
        }
        if (username) {
          where['username'] = { like: toRegExp(username), options: 'i' }
        }
        // 开始时间
        if (start) {
          where['start'] = this.getTimeStamp(start)
        }
        if (end) {
          where['end'] = this.getTimeStamp(end)
        }
        let filter = {
          where,
          size: this.page.size,
          page: current,
          sort: [this.order]
        }
        this.$axios
          .get('tm/api/UserLogs?filter=' + encodeURIComponent(JSON.stringify(filter)))
          .then(data => {
            this.source = data || []
            this.page.current = 1
            this.page.total = this.source.length
            this.changePage()
          })
          .finally(() => {
            if (!hideLoading) {
              this.loading = false
            }
          })
      }, debounce)
    },
    sortChange({ prop, order }) {
      this.order = `${order ? prop : 'createTime'} ${order === 'ascending' ? 'asc' : 'desc'}`
      this.fetch(1)
    },
    changePage() {
      let size = this.page.size
      let current = this.page.current
      this.list = this.source.slice((current - 1) * size, current * size)
    },
    getTypeText(row) {
      return this.operationTypeOptions.find(item => item.value === this.formatOperationType(row.modular, row.operation))
        ?.label
    },
    getDescFnc(row) {
      let allTypeMap = this.allTypeMap
      let { modular, operation, rename, oldName } = row
      let result
      // 修改连接 -- 更名
      if (modular === 'connection' && operation === 'update' && rename) {
        result = `将连接名称由【${oldName}】修改为`
      } else {
        result = `${allTypeMap[operation]}了${allTypeMap[modular]}`
      }
      return result
    },
    toGoList(row) {
      let { modular, parameter1 } = row
      // 任务
      if (modular === 'migration') {
        this.$router.push({
          name: 'Task',
          query: {
            status: '',
            syncType: '',
            agentId: '',
            keyword: parameter1
          }
        })
      } else if (modular === 'connection') {
        // 连接
        this.$router.push({
          name: 'Connection',
          query: {
            status: '',
            keyword: parameter1
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-logs-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 1260px;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  .pointer {
    cursor: pointer;
  }
  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    font-size: 16px;
  }
  .main {
    padding: 20px;
    background: #fff;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .list-operation {
    display: flex;
    justify-content: space-between;
    .list-operation-left {
      li {
        float: left;
      }
    }
  }
  .operation-logs-table {
    flex: 1;
    overflow: auto;
    border-bottom: none;
  }
}
::v-deep {
  .el-dropdown-menu__item.dropdown-item--disabled {
    color: map-get($color, disable);
    cursor: default;
    &:hover {
      background: unset;
      color: map-get($color, disable);
    }
  }
}
</style>
