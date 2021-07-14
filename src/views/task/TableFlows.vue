<template>
  <div style="height: 100%" class="table-flows">
    <el-container class="table-flows-wrap">
      <div class="panel-left" v-if="formData.panelFlag">
        <Classification ref="classification" :types="['dataflow']" @nodeChecked="nodeChecked"></Classification>
      </div>
      <el-container class="table-flows-main">
        <el-tabs v-model="activeName" type="card" class="tab-card" @tab-click="handleTabClick">
          <el-tab-pane :label="$t('tableFlow.task_view')" name="dataFlow"></el-tab-pane>
          <el-tab-pane :label="$t('tableFlow.table_view')" name="tableFlow"></el-tab-pane>
        </el-tabs>
        <el-header height="auto">
          <el-form class="search-bar" size="mini" :inline="true">
            <el-form-item>
              <div :class="[{ panelOpen: formData.panelFlag }, 'item', 'panelBtn']" @click="handlePanelFlag">
                <i class="iconfont icon-xiangshangzhanhang"></i>
                <span>{{ formData.panelFlag ? $t('dataFlow.closeSetting') : $t('dataFlow.openPanel') }}</span>
              </div>
            </el-form-item>
            <el-form-item>
              <el-input
                clearable
                style="width: 300px"
                v-model="formData.keyword"
                :placeholder="$t('dataFlow.searchPlaceholder')"
                @change="screenFn"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-select
                v-model="formData.status"
                size="mini"
                clearable
                :placeholder="$t('dataFlow.taskStatusPlaceholder')"
                style="width: 160px"
                @change="screenFn"
              >
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select
                v-model="formData.way"
                size="mini"
                clearable
                :placeholder="$t('dataFlow.taskSettingPlaceholder')"
                style="width: 160px"
                @change="screenFn"
              >
                <el-option
                  v-for="item in optionsKey"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select
                v-model="formData.executionStatus"
                size="mini"
                clearable
                :placeholder="$t('dataFlow.executionStatus')"
                style="width: 160px"
                @change="screenFn"
              >
                <el-option
                  v-for="opt in ['initializing', 'cdc', 'initialized']"
                  :key="opt"
                  :label="$t('dataFlow.status.' + opt)"
                  :value="opt"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button style="padding: 7px" icon="el-icon-refresh-right" @click="reset()"></el-button>
            </el-form-item>
            <el-form-item style="margin-right: 0; flex: 1; text-align: right">
              <el-button @click="rowCheckAll">
                <i class="iconfont icon-jiekoufuwu"></i>
                <span>{{ $t('tableFlow.batch_verification') }}</span>
              </el-button>
            </el-form-item>
          </el-form>
        </el-header>
        <el-main class="main">
          <div class="table">
            <el-table
              :data="page.data"
              height="100%"
              style="width: 100%"
              v-loading="loading"
              class="tableFlows-table"
              :row-class-name="rowClassHandler"
              @sort-change="sortHandler"
              @selection-change="selectHandler"
            >
              <el-table-column type="selection" width="44" align="center"></el-table-column>
              <el-table-column sortable="custom" :label="$t('tableFlow.source_target_table')" prop="stages.name">
                <template slot-scope="scope">
                  <div class="table-item">
                    <div class="table-source">[S] {{ scope.row.stages.name }}</div>
                    <div class="from-db">{{ scope.row.databaseName }}</div>
                    <div v-for="item in scope.row.outf" :key="item.name">
                      <div class="table-target">[T] {{ item.name }}</div>
                      <div class="from-db">{{ item.databaseName }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                sortable="custom"
                prop="name"
                :label="$t('tableFlow.task_execution_time')"
                width="250"
                align="center"
              >
                <template slot-scope="scope">
                  <div class="table-item">
                    <div>{{ scope.row.name }}</div>
                    <div class="dark-color">{{ scope.row.startTime }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column sortable="custom" prop="status" :label="$t('tableFlow.status_text')" width="120">
                <template slot-scope="scope">
                  <img
                    v-if="scope.row.status == 'running'"
                    style="width: 12px; height: 15px; vertical-align: middle"
                    src="static/editor/running-blue.svg"
                  />
                  <span
                    class="primary-color"
                    :style="`color: ${colorMap[scope.row.status]};`"
                    v-show="scope.row.name"
                    >{{ scope.row.statusLabel }}</span
                  >
                </template>
              </el-table-column>
              <el-table-column :label="$t('tableFlow.stage')" width="120">
                <template slot-scope="scope">
                  <span>
                    {{ scope.row.cdcStatusStr }} (<span class="dark-color">{{ scope.row.ratio }}%</span>)
                  </span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('tableFlow.output_input')" width="120">
                <template slot-scope="scope">
                  <div class="table-item">
                    <div>
                      <span class="dark-color">[{{ $t('tableFlow.output') }}]</span>&nbsp;
                      <span>{{ scope.row.output }}</span>
                    </div>
                    <div>
                      <span class="dark-color">[{{ $t('tableFlow.input') }}]</span>&nbsp;
                      <span>{{ scope.row.input }}</span>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('tableFlow.speed')" width="120" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.speed }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('tableFlow.rows')" width="150" align="center">
                <template slot-scope="scope">
                  <i class="el-icon-loading" v-show="scope.row.noshow"></i>
                  <div v-show="!scope.row.noshow">
                    <div class="table-target">[S] {{ scope.row.output }}</div>
                    <div v-show="!scope.row.noshow" v-for="item in scope.row.outf" :key="item.name">
                      <div :class="{ red: scope.row.red }">[T] {{ item.input.rows }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column width="120" align="center" :label="$t('tableFlow.opear')">
                <template slot-scope="scope">
                  <el-link size="mini" type="primary" @click="rowCheck(scope.row)">{{
                    $t('tableFlow.row_count_check')
                  }}</el-link
                  ><br />
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-pagination
            background
            class="pagination"
            :current-page.sync="page.current"
            :page-sizes="[10, 20, 50, 100]"
            :page-size.sync="page.size"
            layout="prev, pager, next,sizes"
            :total="page.total"
            @size-change="getData(1)"
            @current-change="getData"
          >
          </el-pagination>
        </el-main>
      </el-container>
      <SelectClassify
        ref="classify"
        :types="['dataflow']"
        v-on:operationsClassify="handleOperationClassify"
      ></SelectClassify>
    </el-container>
  </div>
</template>

<script>
import factory from '../../api/factory'
import Classification from '@/components/Classification'
import SelectClassify from '../../components/SelectClassify'

const dataFlows = factory('DataFlows')

export default {
  name: 'TableFlows',
  components: { Classification, SelectClassify },
  data() {
    return {
      loading: true,
      checkedTags: [],
      activeName: 'tableFlow',
      searchParams: this.$store.state.tableFlows,
      page: {
        data: null,
        current: 1,
        size: 10,
        total: 0,
        sortBy: 'name',
        order: 'ASC'
      },
      colorMap: {
        running: '#67C23A',
        paused: '#F19149',
        draft: '#F56C6C',
        scheduled: '#cccccc',
        stopping: '#F19149',
        error: '#f53724'
      },
      statusOptions: ['running', 'paused', 'error', 'draft', 'scheduled', 'stopping', 'force_stopping'],
      syncOtions: [
        {
          label: this.$t('dataFlow.initial_sync'),
          value: 'initial_sync'
        },
        {
          label: this.$t('dataFlow.cdc'),
          value: 'cdc'
        },
        {
          label: this.$t('dataFlow.initial_sync') + this.$t('dataFlow.cdc'),
          value: 'initial_sync+cdc'
        }
      ],
      selections: [],
      formData: {
        keyword: '',
        status: '',
        person: '',
        way: '',
        executionStatus: '',
        classification: [],
        panelFlag: true
      },
      optionsKey: [
        {
          label: this.$t('dataFlow.initial_sync'),
          value: 'initial_sync'
        },
        {
          label: this.$t('dataFlow.cdc'),
          value: 'cdc'
        },
        {
          label: this.$t('dataFlow.initial_sync') + this.$t('dataFlow.cdc'),
          value: 'initial_sync+cdc'
        }
      ],
      options: [
        {
          label: this.$t('dataFlow.status.running'),
          value: 'running'
        },
        {
          label: this.$t('dataFlow.status.paused'),
          value: 'paused'
        },
        {
          label: this.$t('dataFlow.status.error'),
          value: 'error'
        },
        {
          label: this.$t('dataFlow.status.draft'),
          value: 'draft'
        },
        {
          label: this.$t('dataFlow.status.scheduled'),
          value: 'scheduled'
        },
        {
          label: this.$t('dataFlow.status.stopping'),
          value: 'stopping'
        },
        {
          label: this.$t('dataFlow.status.force_stopping'),
          value: 'force stopping'
        }
      ]
    }
  },
  created() {
    this.getFlowOptions()
    this.getData()
    let self = this
    this.setInterval(() => {
      self.getData()
    }, 3000)
  },
  methods: {
    handlePanelFlag() {
      this.formData.panelFlag = !this.formData.panelFlag
    },
    handleClassify() {
      if (this.multipleSelection.length === 0) {
        this.$message.info('please select row data')
        return
      }
      let tagList = this.handleSelectTag()
      this.$refs.classify.show(tagList)
    },
    handlerAddTag(id, listTags) {
      this.dataFlowId = id
      this.tagList = listTags || []
      this.$refs.classify.show(listTags || [])
    },
    handleSelectTag() {
      let tagList = {}
      this.multipleSelection.forEach(row => {
        if (row.listtags && row.listtags.length > 0) {
          tagList[row.listtags[0].id] = {
            value: row.listtags[0].value
          }
        }
      })
      return tagList
    },
    handleOperationClassify(listtags) {
      let attributes = []
      if (this.dataFlowId) {
        let node = {
          id: this.dataFlowId,
          listtags: listtags
        }
        attributes.push(node)
      } else {
        this.multipleSelection.forEach(row => {
          row.listtags = row.listtags || []
          let node = {
            id: row.id,
            listtags: listtags
          }
          attributes.push(node)
        })
      }
      dataFlows.patchAll({ attrs: attributes }).then(() => {
        this.dataFlowId = ''
        this.getData()
      })
    },
    rowClassHandler({ rowIndex }) {
      return `table-row-${rowIndex}`
    },
    selectHandler(val) {
      this.selections = val
    },
    sortHandler({ prop, order }) {
      this.page.sortBy = prop
      this.page.order = order
      this.getData(1)
    },
    getFlowOptions() {
      setTimeout(() => {
        let list = []
        for (let i = 0; i < 10; i++) {
          list.push({
            name: 'flow_' + i,
            id: 'ID_' + i
          })
        }
        this.flowOptions = list
      }, 2000)
    },
    reset() {
      this.formData.keyword = ''
      this.formData.status = ''
      this.formData.person = ''
      this.formData.way = ''
      this.formData.executionStatus = ''
      this.$refs.classification.clear()
      this.checkedTags = []
      this.getData(1)
    },
    searchParamsChange() {
      this.$store.commit('tableFlows', this.searchParams)
    },
    nodeChecked(checkedTags) {
      this.checkedTags = checkedTags
      this.getData()
    },
    screenFn() {
      this.page.current = 1
      this.getData()
    },
    keyupEnter() {
      document.onkeydown = e => {
        if (e.keyCode === 13) {
          this.getData()
        }
      }
    },
    rowCheck(item) {
      this.$set(item, 'noshow', true)
      if (item.input != item.output) {
        this.$set(item, 'red', true)
      }
      let that = this
      setTimeout(() => that.$set(item, 'noshow', false), 1500)
    },
    rowCheckAll() {
      this.page.data.forEach(it => this.rowCheck(it))
    },
    async getData(pageNum) {
      this.loading = true
      this.$store.commit('tableFlows', this.formData)
      let { current, size, sortBy, order } = this.page
      let currentPage = pageNum || current
      let where = {}

      if (this.formData) {
        if (this.formData.status && this.formData.status !== '') where.status = this.formData.status
        if (this.formData.way && this.formData.way !== '') where['setting.sync_type'] = this.formData.way
        if (this.formData.keyword && this.formData.keyword !== '') where.name = this.formData.keyword
        if (this.formData.executionStatus) where['cdcStatus'] = this.formData.executionStatus
      }
      if (this.checkedTags && this.checkedTags.length) {
        where['listtags.id'] = {
          in: this.checkedTags
        }
      }
      let _params = Object.assign({}, where, {
        order: order === 'descending' ? 'DESC' : 'ASC',
        orderBy: sortBy,
        limit: size,
        skip: (currentPage - 1) * size
      })
      await dataFlows
        .tableFlow(_params)
        .then(res => {
          if (res.data) {
            this.handleData(res.data.datas)
            this.page.data = res.data.datas
            this.page.total = res.data.count
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleData(data) {
      if (!data) return
      data.forEach(item => {
        this.cookRecord(item)
      })
    },
    cookRecord(item) {
      if (item.startTime) item.startTime = this.$moment(item.startTime).format('YYYY-MM-DD HH:mm:ss')
      item.statusLabel = this.$t('dataFlow.status.' + item.status.replace(/ /g, '_'))
      if (item.stages.statsStatus) item.cdcStatusStr = this.$t('dataFlow.status.' + item.stages.statsStatus)
      if (item.stages.output) item.output = item.stages.output.rows
      else item.output = '0'
      if (item.outf && item.outf.length) {
        item.input = 0
        item.outf.forEach(it => {
          if (!it.input) it.input = { rows: 0 }
          item.input += it.input.rows
          if (item.stages.transmissionTime == 0 && it.transmissionTime > 0)
            item.stages.transmissionTime = it.transmissionTime
        })
      } else item.input = '0'
      if (typeof item.output == 'number' && item.stages.transmissionTime > 0)
        item.speed = ((item.output * 1000) / item.stages.transmissionTime).toFixed(0)
      else item.speed = '0'
      if (item.totalCount) {
        if (item.totalCount.findWhere({ stageId: item.stages.stageId }))
          item.ratio = (
            (item.output / item.totalCount.findWhere({ stageId: item.stages.stageId }).dataCount) *
            100
          ).toFixed(0)
      }
      return item
    },
    handleTabClick(val) {
      if (val.name === 'dataFlow') {
        this.$router.push({
          name: 'dataFlows'
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
$primaryColor: #409eff;
$darkColor: #aaaaaa;
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.table-flows {
  .panel-left {
    width: 250px;
  }
  .table-flows-wrap {
    height: 100%;
    overflow: hidden;
    .iconfont {
      font-size: 14px;
    }
    .search-bar {
      height: 100%;
      display: flex;
      align-items: center;
      .panelBtn {
        padding: 0 12px;
        color: #666;
        cursor: pointer;
        font-size: 12px;
        border: 1px solid #dcdfe6;
        border-radius: 3px;
        .iconfont {
          display: inline-block;
          font-size: 12px;
          transform: rotate(00deg);
        }
      }
      .panelOpen {
        .iconfont {
          transform: rotate(180deg) !important;
        }
      }
      .panelBtn:hover {
        color: #409eff;
      }
      .el-form-item {
        margin-bottom: 0;
      }
    }
    .main {
      display: flex;
      flex-direction: column;
      padding-bottom: 0;
      .table {
        flex: 1;
        overflow: hidden;
        .table-item {
          line-height: 18px;
          @extend .ellipsis;
          div {
            @extend .ellipsis;
          }
          .table-source {
            color: $primaryColor;
          }
          .from-db {
            padding-left: 20px;
            color: $darkColor;
          }
        }
        .dark-color {
          color: $darkColor;
        }
        .primary-color {
          color: $primaryColor;
        }
        .el-button {
          padding: 5px;
          cursor: pointer;
          &:hover {
            color: #409eff;
          }
        }
        .el-button + .el-button {
          margin-left: 5px;
        }
      }
      .pagination {
        padding: 20px 0;
        text-align: right;
      }
    }
  }
}
</style>
<style lang="scss">
.table-flows {
  // .el-tabs__item {
  // 	height: 29px;
  // 	line-height: 25px;
  // 	font-size: 12px;
  // }
  .red {
    color: red;
  }
  .table-flows-main {
    .tableFlows-table {
      border: 1px solid #dedee4;
      thead {
        color: #333;
        th {
          padding: 5px 0;
          background: #fafafa;
        }
      }
    }
  }
}
</style>
