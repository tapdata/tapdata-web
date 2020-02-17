<template>
  <div class="tapHeader">
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="1">服务集群管理</el-menu-item>
      <!-- <el-menu-item index="2">状态日志</el-menu-item> -->
    </el-menu>
    <div class="main">
      <router-view/>

      <!-- <el-row class="fun_area">
        <el-col :span="8">
          <div class="demo-input-suffix">
            <span>名称搜索</span>
            <el-input
              placeholder="请输入内容"
              prefix-icon="el-icon-search"
              clearable
              v-model="sourch">
            </el-input>
          </div>
        </el-col>
      </el-row> -->
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      activeIndex:"1"
    }
  },

  methods: {
    handleSelect (key, keyPath) {
      if (key == '1') {
        this.$router.push({name: 'clusterManagement'})
      } else if (key == '2') {
        this.$router.push({name: 'dailyRecord'})
      }
    }
  }
}
</script>
<style lang="less">
.tapHeader {
  .el-menu-demo {
    height: 40px;
    border-bottom: 0;
    background: #f9f9f9;
    .el-menu-item {
      height: 40px;
      line-height: 40px;
      border-bottom: 0;
      border-top:  2px solid transparent;
    }
    .is-active {
      background-color: #fff;
      border-top: 2px solid #409eff;
      border-bottom: 0!important;
    }
  }
  .main {
    height: 500px;
    // height: calc(100% - 60px);
  }
}
</style>
