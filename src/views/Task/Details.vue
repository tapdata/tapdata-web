<template>
  <section class="migration-details main-container" v-if="$route.name === 'DataflowDetails'">
    <div class="main">
      <div class="task-info flex">
        <div class="inline-flex align-items-center justify-content-center">
          <div class="task-info__img flex align-items-center justify-content-center">
            <img src="../../../public/images/task/console.png" alt="" />
          </div>
        </div>
        <div class="ml-10">
          <div class="mb-2 fs-6 text-black-85">任务名称：{{ dataflow.name }}</div>
          <div class="mb-4 text-black-65">
            <span>创建人：123</span>
            <span class="ml-10">修改时间：123</span>
            <span class="ml-10">任务类型：123</span>
          </div>
          <div>
            <el-button size="mini">编辑流程</el-button>
            <el-button type="primary" size="mini">立即执行</el-button>
            <el-button size="mini">暂停</el-button>
            <el-button size="mini">停止</el-button>
          </div>
        </div>
      </div>
      <div class="task-connect text-black-65">
        <el-tabs v-model="active">
          <el-tab-pane label="概述" name="overview">
            <div class="mb-4">描述</div>
            <div>无可用描述</div>
            <el-table></el-table>
          </el-tab-pane>
          <el-tab-pane label="连接" name="connect">连接</el-tab-pane>
          <el-tab-pane label="历史运行记录" name="history">历史运行记录</el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </section>
  <router-view v-else></router-view>
</template>

<script>
export default {
  name: 'Detail',
  data() {
    return {
      dataflow: {},
      active: 'overview'
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.loadData()
    },
    loadData() {
      let id = this.$route.params?.id
      this.$axios.get('tm/api/DataFlows/' + id).then(data => {
        this.dataflow = data
        console.log('this.dataflow', this.dataflow)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.task-info {
  padding: 24px;
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  border-radius: 3px;
}
.task-info__img {
  border-radius: 50%;
  width: 55px;
  height: 55px;
  background: rgba(44, 101, 255, 0.08);
  img {
    width: 30px;
  }
}
.task-connect {
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  border-radius: 3px;
}
</style>
