<template>
  <div class="dataflow-upload">
    <div class="dataflow-head">{{ $t('dataFlow.import') }}</div>
    <div class="dataflow-radio">
      <el-radio v-model="upsert" :label="1">{{ $t('dataFlow.overWrite') }}</el-radio>
      <el-radio v-model="upsert" :label="0">{{ $t('dataFlow.skipData') }}</el-radio>
    </div>
    <!-- <div class="dataflow-radio">
      <el-tag :key="tag" v-for="tag in tagList" :closable="true" @close="handleClose(tag)">
        {{ tag.value }}<span style="cursor: pointer" @click="handleClose(tag)"> X </span>
      </el-tag>
      <span @click="handleClassify" class="classify">{{ $t('dataFlow.taskBulkTag') }}</span>
    </div> -->

    <el-upload
      class="upload-demo"
      ref="upload"
      :action="action"
      :accept="accept"
      :data="{ cover: upsert === 1 }"
      :file-list="fileList"
      :auto-upload="false"
      :on-success="handleSuccess"
      :on-change="handleChange"
    >
      <el-button type="primary" plain slot="trigger" size="small">{{ $t('dataFlow.chooseFile') }}</el-button>
      <el-button
        style="margin-left: 10px"
        size="small"
        :disabled="fileList.length === 0"
        type="success"
        @click="submitUpload"
        >{{ $t('dataFlow.upload') }}</el-button
      >
    </el-upload>
    <SelectClassify ref="classify" :types="[type]" v-on:operationsClassify="handleOperationClassify"></SelectClassify>
    <div v-show="status" class="tooltip">
      {{ $t('dataFlow.uploadOK') }}
    </div>
    <!--		<div v-show="status" class="tooltip">-->
    <!--			{{ $t('dataFlow.uploadOK') }} ,<router-link :to="`/dataFlows?mapping=${mappingTemplate}`"> {{ $t('dataFlow.uploadInfo') }}</router-link>-->
    <!--		</div>-->
  </div>
</template>

<script>
import SelectClassify from '../components/SelectClassify'
import Cookie from '@tap/shared/src/cookie'
// import factory from '@/api/factory';
// const MetadataInstance = factory('MetadataInstances');
export default {
  components: { SelectClassify },
  data() {
    return {
      type: '',
      fileList: [],
      action: '',
      upsert: 1,
      accept: '.gz',
      status: false,
      tagList: [],
      mappingTemplate: 'cluster-clone',
      downType: '',
      accessToken: ''
    }
  },
  created() {
    this.type = this.$route.query && this.$route.query.type ? this.$route.query.type : ''
    if (this.type === 'api') {
      this.downType = 'APIServer'
    } else if (this.type === 'Inspect') {
      this.downType = 'Inspect'
    } else {
      this.downType = 'dataflow'
    }
    this.accessToken = Cookie.get('token')
    // this.handlerUpload();
    // this.action =
    // 	window.location.protocol +
    // 	'//' +
    // 	window.location.hostname +
    // 	':' +
    // 	window.location.port +
    // 	'/api/MetadataInstances/upload?upsert=' +
    // 	this.upsert +
    // 	'&listtags=' +
    // 	JSON.stringify(this.tagList) +
    // 	'&type=' +
    // 	this.downType;
  },

  watch: {
    // upsert: {
    // 	deep: true,
    // 	handler() {
    // 		this.handlerUpload();
    // 		// this.action =
    // 		// 	window.location.protocol +
    // 		// 	'//' +
    // 		// 	window.location.hostname +
    // 		// 	':' +
    // 		// 	window.location.port +
    // 		// 	'/api/MetadataInstances/upload?upsert=' +
    // 		// 	this.upsert +
    // 		// 	'&listtags=' +
    // 		// 	JSON.stringify(this.tagList) +
    // 		// 	'&type=' +
    // 		// 	this.downType;
    // 	}
    // },
    // tagList: {
    // 	deep: true,
    // 	handler() {
    // 		this.handlerUpload();
    // 	}
    // }
  },
  methods: {
    handleClassify() {
      this.$refs.classify.show(this.tagList)
    },

    handleOperationClassify(listtags) {
      this.tagList = listtags
    },
    handleClose(data) {
      this.tagList.map((k, index) => {
        if (k.id === data.id) {
          this.tagList.splice(index, 1)
        }
      })
    },

    handleChange(file) {
      this.fileList = [file]
      this.action =
        window.location.origin + window.location.pathname + 'api/Task/batch/import?access_token=' + this.accessToken
    },

    handleSuccess(response) {
      if (response.code === 'ok') {
        this.status = true
        this.$message.success(this.$t('dataFlow.uploadOK'))
      } else {
        this.status = false
        this.$message.error(response.message || this.$t('dataFlow.uploadError'))
      }
    },

    submitUpload() {
      // this.handlerUpload();
      this.$refs.upload.submit()
    }
  }
}
</script>

<style lang="scss" scoped>
.dataflow-upload {
  width: 600px;
  margin: 0 auto;
}
.dataflow-head {
  width: 140px;
  line-height: 48px;
  font-size: 24px;
  font-weight: 400;
  color: map-get($fontColor, dark);
  margin-bottom: 30px;
  margin-top: 120px;
}
.dataflow-radio {
  margin-top: 50px;
  margin-bottom: 50px;
}
.tooltip {
  height: 20px;
  font-size: 14px;
  color: rgba(102, 102, 102, 1);
  line-height: 43px;
  margin-top: 20px;
  a {
    color: map-get($color, primary);
  }
}
.classify {
  display: inline-block;
  color: map-get($color, primary);
  font-size: 12px;
  cursor: pointer;
}
</style>
<style>
.dataflow-upload .el-upload-list {
  margin-top: 30px;
}
.dataflow-upload .el-icon-close {
  display: none;
}
.dataflow-upload .el-upload-list__item:hover .el-icon-close {
  opacity: 0;
}
</style>
