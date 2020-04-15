<template>
  <div class="processingNode nodeStye">
    <head>
      <span class="headIcon iconfont icon-you2" type="primary"></span>
      <span class="txt">{{$t("editor.nodeSettings")}}</span>
    </head>
    <div class="nodeBody">
      <el-form label-position="top" :model="model" ref="form">
        <!-- <span class="addTxt">+新建文件</span> -->
        <el-form-item :label="$t('editor.choose') + 'GridFs'" prop="connectionId" :rules="rules" required>
          <el-select filterable v-model="model.connectionId" :placeholder="$t('editor.cell.data_node.gridfs.chooseGridFsName')">
            <el-option
              v-for="(item, idx) in databases"
              :label="`${item.name} (${$t('connection.status.' + item.status) || item.status})`"
              :value="item.id"
              v-bind:key="idx"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
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
