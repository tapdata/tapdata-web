<template>
  <div class="dataflow-upload">
    <div class="dataflow-head">{{$t('dataFlow.import')}}</div>
    <el-upload
      class="upload-demo"
      :action="action"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :file-list="fileList">
      <el-button size="small" type="text">{{$t('dataFlow.upload')}}</el-button>
    </el-upload>
    <div class="dataflow-radio">
      <el-radio v-model="upsert" :label="1">{{$t('dataFlow.overWrite')}}</el-radio>
      <el-radio v-model="upsert" :label="0">{{$t('dataFlow.skipData')}}</el-radio>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        fileList: [],
        action:'',
        upsert:1,
      };
    },
    created() {
      this.action =  window.location.protocol +'//'+ window.location.hostname +":"+window.location.port +"/api/MetadataInstances/upload?upsert="+this.upsert;
    },
    watch:{
      upsert:{
        deep:true,
        handler(){
          this.action =  window.location.protocol +'//'+ window.location.hostname +":"+window.location.port +"/api/MetadataInstances/upload?upsert="+this.upsert;
        }
      }
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
    width:70px;
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
