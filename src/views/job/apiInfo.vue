<template>
  <el-container class="api-info">
    <el-row class="e-row">
      <el-col :span="3" class="e-col">
        <apiPath :selectNodeId="classificationId" @backApiData="getCurrentApiData"></apiPath>
      </el-col>
      <el-col :span="18" class="e-col">
        <div class="api-content api-main">
          <el-header class="e-height">
            <h1>{{ apiData.name }}</h1>
            <div class="operating">
              <el-tooltip class="job-head-title" effect="dark" :content="$t('dataFlow.edit')" placement="bottom">
                <i class="iconfont icon-bibianji" @click="handleEdit"></i>
              </el-tooltip>
              <el-tooltip class="job-head-title" effect="dark" :content="$t('apiInfo.apiTest')" placement="bottom">
                <i class="iconfont icon-debug-" @click="hanleTest"></i>
              </el-tooltip>
              <el-tooltip
                class="job-head-title"
                effect="dark"
                :content="$t('dataFlow.button.preview')"
                placement="bottom"
              >
                <i class="iconfont icon-yulan1" @click="handlePreview"></i>
              </el-tooltip>
              <el-switch
                @change="hanleChangeStatus"
                v-model="apiData.status"
                active-value="active"
                inactive-value="pending"
                :active-text="$t('apiInfo.announcing')"
              >
              </el-switch>
            </div>
          </el-header>
          <div class="e-main">
            <div class="api-content basic-attr">
              <h3>{{ $t('apiInfo.basicAttributes') }}</h3>
              <el-row :gutter="20" class="e-row">
                <el-col :span="12">
                  {{ $t('apiInfo.supportFormat') }}: <span>{{ apiData.format }}</span>
                </el-col>
                <el-col :span="12">
                  {{ $t('apiInfo.founder') }}: <span>{{ apiData.createUser }}</span>
                </el-col>
              </el-row>
              <el-row :gutter="20" class="e-row">
                <el-col :span="12">
                  {{ $t('apiInfo.interfaceClassification') }}:
                  <span v-for="item in apiData.listtags" :key="item.id">
                    <span>{{ item.value }}</span>
                  </span>
                </el-col>
                <el-col :span="12">
                  {{ $t('apiInfo.modifyTime') }}:
                  <span>{{ $moment(apiData.last_updated).format('YYYY-MM-DD HH:mm:ss') }}</span>
                </el-col>
              </el-row>
            </div>
            <el-tabs type="border-card">
              <el-tab-pane v-for="(item, index) in apiData.paths" :key="index" :label="item.method">
                <div class="api-path">
                  <span class="methodStyle">{{ item.method }}</span>
                  <span>{{ item.path }}</span>
                </div>

                <div class="api-text">
                  {{ item.description }}
                </div>

                <div class="api-content">
                  <h3>{{ $t('apiInfo.requestParameters') }}</h3>
                  <el-table
                    :data="item.requestFields"
                    style="width: 100%; margin-bottom: 20px"
                    row-key="id"
                    border
                    default-expand-all
                    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
                  >
                    <el-table-column prop="field_name" :label="$t('apiInfo.parameter')" width="180"> </el-table-column>
                    <el-table-column prop="field_type" :label="$t('apiInfo.typesof')" width="180"> </el-table-column>
                    <el-table-column prop="required" :label="$t('apiInfo.is_required')"> </el-table-column>
                    <el-table-column prop="example" :label="$t('apiInfo.examples')"> </el-table-column>
                  </el-table>
                </div>

                <div class="api-content">
                  <h3>{{ $t('apiInfo.responseParameters') }}</h3>
                  <el-table
                    :data="item.requestFields"
                    style="width: 100%; margin-bottom: 20px"
                    border
                    default-expand-all
                    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
                  >
                    <el-table-column prop="field_name" :label="$t('apiInfo.parameter')" width="180"> </el-table-column>
                    <el-table-column prop="field_type" :label="$t('apiInfo.typesof')" width="180"> </el-table-column>
                    <el-table-column prop="required" :label="$t('apiInfo.is_required')"> </el-table-column>
                    <el-table-column prop="example" :label="$t('apiInfo.examples')"> </el-table-column>
                  </el-table>
                </div>

                <div class="api-content">
                  <h3>{{ $t('apiInfo.requestExample') }}（JSON）</h3>
                  <el-input type="textarea" v-model="item.requestExample" class="e-textarea"></el-input>
                </div>

                <div class="api-content">
                  <h3>{{ $t('apiInfo.backExamples') }}（JSON）</h3>
                  <el-input type="textarea" v-model="item.backExamples" class="e-textarea"></el-input>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-col>
    </el-row>
  </el-container>
</template>

<script>
import factory from '../../api/factory'
import apiPath from '../apiPath'
const modules = factory('modules')

export default {
  name: 'ApiInfo',
  components: {
    apiPath
  },
  data() {
    return {
      apiData: {
        name: '',
        format: '',
        createUser: '',
        listtags: '',
        last_updated: '',
        basePath: '',
        apiVersion: '',
        status: 'pending',
        paths: []
      },
      apiId: '',
      classificationId: ''
    }
  },
  mounted() {
    // if (this.$router && this.$router.id) {
    // 	this.apiId = this.$router.id;
    // }
    this.getApiData()
  },

  watch: {
    status(val) {
      if (val === 'active') {
        this.publish()
      } else {
        this.unpublish()
      }
    }
  },

  methods: {
    /**
     * 获取选中分类数据
     */
    getSelsetClassification(data) {
      this.classificationId = data.id
    },

    // 获取点击的api
    getCurrentApiData(data) {
      this.apiId = data.id
      this.getApiData()
    },
    /**
     * 编辑
     */
    handleEdit() {
      top.location.href = '/#/module/' + this.apiId
    },
    /**
     * 测试
     */
    hanleTest() {
      let id = this.apiData.basePath + '_' + this.apiData.apiVersion
      top.location.href = '/#/apiDocAndTest?id=' + id
    },
    /**
     * 预览
     */
    handlePreview() {
      let id = this.apiData.basePath + '_' + this.apiData.apiVersion
      top.location.href = '/#/dataExplorer?id=' + id
    },

    hanleChangeStatus(val) {
      if (val === 'active') {
        this.publish()
      } else {
        this.unpublish()
      }
    },
    /**
     * 发布
     */

    publish() {
      let module = {
        status: 'active',
        id: this.apiId,
        tablename: this.apiData.basePath
      }
      modules['patch'](module).then(() => {
        this.$message.success(this.$t('apiInfo.apiPublishSuccess'))
      })
    },
    async unpublish() {
      let module = {
        status: 'pending',
        id: this.apiId,
        tablename: this.apiData.basePath
      }
      modules['patch'](module).then(() => {
        this.$message.success(this.$t('apiInfo.apiUnpublishSuccess'))
      })
    },
    async getApiData() {
      await modules.getApiDocument(this.apiId).then((res) => {
        if (res.data) {
          this.apiData = res.data
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
.api-info {
  height: 100%;
  overflow: hidden;
  .e-row {
    width: 100%;
    .e-col {
      height: 100%;
    }
  }

  .api-main {
    height: 100%;
    overflow: auto;
  }
  .leftTree {
    display: flex;
    flex-direction: column;
  }
  .e-height {
    line-height: 60px;
    h1 {
      float: left;
      font-size: 18px;
      color: #333;
    }
    .operating {
      float: right;
      i.iconfont {
        padding: 0 5px;
        cursor: pointer;
      }
    }
  }
  .api-content {
    width: 100%;
  }
  .e-main {
    padding: 20px;
    box-sizing: border-box;
    h3 {
      padding-bottom: 20px;
      font-size: 16px;
      color: #333;
    }
    .api-path {
      width: 100%;
      height: 35px;
      line-height: 35px;

      span {
        float: left;
        display: inline-block;
        width: calc(100% - 88px);
        padding-left: 20px;
        color: #62a569;
        box-sizing: border-box;
        border: 1px solid #62a569;
        background-color: #edf6ee;
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
      }
      .methodStyle {
        width: 84px;
        font-size: 14px;
        color: #fff;
        font-weight: bold;
        text-align: center;
        padding: 0;
        background-color: #62a569;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
      }
    }
    .api-text {
      padding: 20px 0 30px;
      text-align: justify;
    }

    .e-row {
      padding-bottom: 10px;
      font-size: 14px;
      font-weight: normal;
      span {
        padding-left: 10px;
      }
    }

    .basic-attr {
      padding-bottom: 20px;
    }
  }
}
</style>
<style lang="less">
.api-info {
  .e-textarea {
    padding-bottom: 30px;
    .el-textarea__inner {
      color: #690;
      min-height: 300px !important;
      background-color: #f7f7f7;
    }
  }
}
</style>
