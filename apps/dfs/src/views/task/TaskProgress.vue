<template>
  <div class="task-progress">
    <div class="task-progress-step-box">
      <ElSteps finish-status="process" align-center class="task-progress-step" :active="active">
        <ElStep v-for="(item, index) in stepData" :key="index" :title="item.label" :description="item.time"></ElStep>
      </ElSteps>
    </div>
    <!-- 任务里程碑 -->
    <ElCollapse v-model="activeNames" class="task-progress-collapse">
      <ElCollapseItem title="任务里程碑" name="1">
        <ElTable :data="milestoneList" class="mt-5">
          <ElTableColumn label="里程碑" prop="label"></ElTableColumn>
          <ElTableColumn label="状态" prop="status" width="180">
            <template v-slot="scope">
              <StatusTag type="text" target="task" :status="getMilestoneStatus(scope.row.status)" only-img></StatusTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="时间" prop="fromNow" width="180"></ElTableColumn>
        </ElTable>
      </ElCollapseItem>
    </ElCollapse>
    <!-- 结构迁移概览 -->
    <div class="task-progress-item pt-5">
      <div class="title pb-4">结构迁移概览</div>
      <div class="pl-4 pb-5">
        <div class="pb-1" v-if="task.mappingTemplate === 'custom'">
          <span>计划迁移表数量 100</span>
          <span class="pl-6">已完成迁移表量 100</span>
          <span class="float-end">预计全量完成还需时间：24小时23分1秒</span>
        </div>
        <div v-else>
          <span>已迁移100张表</span>
          <span class="pl-6">共100张表</span>
        </div>
        <ElProgress class="task-progress-line" :percentage="50"></ElProgress>
      </div>
    </div>
    <div class="task-progress-item pt-5">
      <div class="title pb-4">迁移详情</div>
      <div class="pl-4">
        <div class="task-progress-search-bar">
          <ul class="search-bar">
            <li class="item">
              <el-input
                clearable
                class="input-with-select"
                size="mini"
                v-model="searchParams.keyword"
                placeholder="请输入表名称"
              >
              </el-input>
            </li>
            <li class="ml-6">
              状态：
              <!-- @input="table.fetch(1)" -->
              <el-select clearable size="mini" v-model="searchParams.metaType">
                <el-option v-for="opt in typeList" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
              </el-select>
            </li>
          </ul>
        </div>
        <div class="task-progress-table pt-6">
          <ElTable class="progress-info-table" :data="progressInfoData">
            <ElTableColumn label="数据库" prop="name"></ElTableColumn>
            <ElTableColumn label="数据表" prop="name"></ElTableColumn>
            <ElTableColumn label="数据量（行）" prop="name"></ElTableColumn>
            <ElTableColumn label="进度" prop="name"></ElTableColumn>
            <ElTableColumn label="状态" prop="name" width="100"></ElTableColumn>
          </ElTable>
          <ElPagination
            background
            class="mt-3"
            layout="total, sizes, ->, prev, pager, next, jumper"
            :current-page.sync="page.current"
            :page-sizes="[10, 20, 50, 100]"
            :page-size.sync="page.size"
            :total="page.total"
            @size-change="fetch(1)"
            @current-change="fetch"
          >
          </ElPagination>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import StatusTag from '@/components/StatusTag'
export default {
  name: 'TaskPrgress',
  props: {
    task: {
      type: Object,
      default: null
    }
  },
  components: { StatusTag },
  data() {
    return {
      active: 0,
      activeNames: ['1'],
      stepData: [
        { label: '任务初始化', time: '2021-12-12 18:00:00' },
        { label: '结构迁移', time: '2021-12-12 18:00:00' }
      ],
      progressInfoData: [], // 详情数据
      searchParams: {
        keyword: '',
        metaType: ''
      },
      page: {
        current: 1,
        size: 10,
        total: 0
      },
      typeList: [
        { label: this.$t('taskProgress.all'), value: 'all' },
        { label: this.$t('taskProgress.running'), value: 'running' },
        { label: this.$t('taskProgress.waiting'), value: 'waiting' }
      ]
    }
  },
  created() {
    // 任务进度显示
    if (this.task?.setting?.sync_type) {
      let list = []
      switch (this.task.setting.sync_type) {
        case 'initial_sync+cdc':
          list = [
            { label: '全量同步', time: '2021-12-12 18:00:00' },
            { label: '增量同步', time: '2021-12-12 18:00:00' }
          ]
          break
        case 'initial_sync':
          list = [{ label: '全量同步', time: '2021-12-12 18:00:00' }]
          break
        default:
          list = [{ label: '增量同步', time: '2021-12-12 18:00:00' }]
      }
      this.stepData.push(list)
    }
  },
  computed: {
    milestoneList() {
      let list = this.task?.milestones || []
      return list.map(m => {
        let time = m.status === 'running' ? m.start : m.end
        if (time) {
          time = this.$moment(time).format('YYYY-MM-DD HH:mm:ss')
        }
        return {
          label: this.$t(`milestone_label_${m.code.toLowerCase()}`),
          status: m.status,
          fromNow: time || '-',
          errorMessage: m.errorMessage,
          tipDisabled: true
        }
      })
    }
  },
  methods: {
    fetch() {},
    // 里程碑状态
    getMilestoneStatus(status) {
      let result = status
      if (['draft', 'paused', 'error'].includes(this.task?.status) && status === 'running') {
        result = 'paused'
      }
      return result
    }
  }
}
</script>
<style scoped lang="scss">
.task-progress {
  .task-progress-step-box {
    display: flex;
    justify-content: center;
    width: 100%;
    .task-progress-step {
      width: 970px;
      ::v-deep {
        .el-step {
          .el-step__head {
            .el-step__line {
              height: 2px;
            }
            .el-step__icon {
              width: 10px;
              height: 10px;
              border-color: #bfbfbf;
              background-color: #bfbfbf;
              .el-step__icon-inner {
                font-weight: normal;
                color: inherit;
                text-indent: -9999px;
              }
            }
          }
          & > .is-process {
            .el-step__icon {
              border-color: #2c65ff;
              background-color: #2c65ff;
            }
            .el-step__title {
              font-weight: 400;
            }
          }

          .el-step__title {
            font-weight: 500;
          }
          .el-step__description {
            color: rgba(0, 0, 0, 0.45);
          }
        }
      }
    }
  }
  .task-progress-collapse {
    border-top: 0;
    ::v-deep {
      .el-collapse-item__header {
        display: block;
        font-weight: 500;
        font-size: 12px;
        color: #000;
        .el-collapse-item__arrow {
          margin-left: 6px;
        }
      }
    }
  }
  .task-progress-search-bar {
    display: flex;
    .search-bar {
      display: flex;
      flex-direction: row;
      li {
        white-space: nowrap;
      }
    }
    ::v-deep {
      .el-tabs__nav-wrap {
        &::after {
          height: 1px;
        }
      }
    }
  }
}
</style>
