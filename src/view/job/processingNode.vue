<template>
  <div class="processingNode">
    <div class="processingHead">
      <div class="image">

      </div>
      <div class="databaseInfo">
        <div class="databaseName">TargetMongoDBSTOCKTAKE (invalid)</div>
        <span class="ipAddr">100.100.0.1:3300</span>
      </div>
    </div>
    <div class="processingBody">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="待复制队列 (12)" name="first">
          <el-card class="box-card">
            <div v-for="item in list" :key="item.id" class="text item">
              <el-checkbox v-model="checked">备选项</el-checkbox>
              <div><i></i>{{item.name}}</div>
              <div>
                <el-button type="text">改名</el-button>
                <el-button type="text">移除</el-button>
              </div>
            </div>
          </el-card>
        </el-tab-pane>
        <el-tab-pane label="待复制队列 (12)" name="second">配置管理</el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ProcessingNode',
  data() {
    return {
      list: []
    }
  }
}
</script>
