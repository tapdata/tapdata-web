<template>
  <div class="dataflow-upload">
    <div class="dataflow-head">{{$t('dataFlow.import')}}</div>
    <div class="dataflow-radio">
      <el-radio v-model="upsert" :label="1">{{$t('dataFlow.overWrite')}}</el-radio>
      <el-radio v-model="upsert" :label="0">{{$t('dataFlow.skipData')}}</el-radio>
    </div>
    <el-upload
      class="upload-demo"
      :action="action"
      :accept="accept"
      :on-success ="handleSuccess"
      :before-remove ='handleRemove'
      :file-list="fileList">
      <el-button type="primary" plain size="small" >{{$t('dataFlow.upload')}}</el-button>
    </el-upload>
    <div v-show="status" class="tooltip">
      {{$t('dataFlow.uploadOK')}} ,<router-link  to="/dataFlows"> {{$t('dataFlow.uploadInfo')}}</router-link>
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
        accept:'.gz',
        status:false,
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
      handleSuccess(){
        this.status = true;
      },
      handleRemove(){
        return false;
      }
    }
  };
</script>

<style lang="less" scoped>
  .dataflow-upload{
    width: 600px;
    margin: 0 auto;
  }
  .dataflow-head{
    width:140px;
    line-height: 48px;
    font-size:24px;
    font-weight:400;
    color:rgba(0,0,0,1);
    margin-bottom: 30px;
    margin-top: 120px;
  }
  .dataflow-radio{
    margin-top: 50px;
    margin-bottom: 50px;
  }
  .tooltip{
    height:20px;
    font-size:14px;
    color:rgba(102,102,102,1);
    line-height:43px;
    margin-top: 20px;
    a{
      color:#48B6E2;
    }
  }
</style>
<style>
  .dataflow-upload .el-upload-list{
    margin-top: 30px;
  }
  .dataflow-upload .el-icon-close{
    display: none;
  }
  .dataflow-upload .el-upload-list__item:hover .el-icon-close{
    opacity: 0;
  }
</style>
