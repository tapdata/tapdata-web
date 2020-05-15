<template>
  <div class="dataflow-upload">
    <div class="dataflow-head">任务导入</div>
    <el-upload
      class="upload-demo"
      :action="action"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :file-list="fileList">
      <el-button size="small" type="text">点击上传</el-button>
    </el-upload>
    <div class="dataflow-radio">
      <el-radio v-model="upsert" :label="1">覆盖已有数据</el-radio>
      <el-radio v-model="upsert" :label="0">跳过已有数据</el-radio>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        fileList: [],
        action:'https://jsonplaceholder.typicode.com/posts/',
        upsert:1,
      };
    },
    created() {
      this.action= 'https://jsonplaceholder.typicode.com/posts?upsert='+this.upsert;
      //this.action = window.location.hostname +":"+window.location.port +"/api/MetadataInstances/upload?upsert="+this.upsert;
    },
    methods: {
      handleRemove(file, fileList) {
        console.log(file, fileList);
      },
      handlePreview(file) {
        console.log(file);
      }
    }
  }
</script>

<style>
  .dataflow-upload{
    width: 600px;
    margin: 0 auto;
  }
  .dataflow-head{
    width:48px;
    line-height: 48px;
    font-size:12px;
    font-weight:400;
    color:rgba(0,0,0,1);
    margin-bottom: 30px;
    margin-top: 100px;
  }
  .dataflow-radio{
    margin-top: 100px;
  }
</style>
