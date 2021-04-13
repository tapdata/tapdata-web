.
<template>
  <div class="data-map-container">
    <div class="data-map-header">
      <div class="tool-bar">
        <i class="iconfont icon-plus-circle" @click="zoomIn"></i>
        <i class="iconfont icon-minus-circle" @click="zoomOut"></i>
        <i v-if="level === 'field'" class="iconfont icon-shangyibu" @click="getData"></i>
        <i class="iconfont icon-shuaxin1" @click="refreshData"></i>
      </div>
      <span class="refreshS" :class="{ errorClass: !rClass, actProgress: !refreshing }" @click="checkError"
        >{{ $t('relations.refreshStatus') }}: {{ $moment(refreshResult.finish_date).format('YYYY-MM-DD HH:mm:ss') }}--{{
          refreshResult.status
        }}
        <el-progress
          class="tool-bar-progress"
          v-if="refreshing"
          :percentage="Math.trunc((refreshResult.currProgress / refreshResult.allProgress) * 100)"
        ></el-progress>
      </span>
    </div>
    <div id="navigator-container" class="navigator-container"></div>
    <div class="data-map-main">
      <div id="paper" class="data-map"></div>
    </div>
    <el-dialog :title="$t('message.preview')" :visible.sync="errorVisible" width="650px">
      <span class="value align-center"> {{ refreshResult.message }}</span>
      <pre class="align-center pre"> {{ refreshResult.stack }}</pre>
    </el-dialog>
    <Info ref="Info" :model="model" v-on:previewVisible="handlePreviewVisible" v-on:handleFields="changeLevel"></Info>
  </div>
</template>

<script>
import graph from './graph'
import factory from '../../api/factory'
import Info from './Info'
const LineageGraphsAPI = factory('LineageGraphs')

export default {
  name: 'DataRelations',
  components: { Info },
  props: {
    tableId: {
      required: true,
      value: String
    }
  },
  data() {
    return {
      rClass: true,
      form: {},
      level: 'table',
      model: {
        level: 'table',
        connectionId: '',
        tableId: '',
        previewVisible: false,
        dataFlows: [],
        sourceName: '',
        targetName: ''
      },
      refreshResult: {},
      dialogFormVisible: false,
      errorVisible: false,
      flowList: [],
      refreshing: false
    }
  },
  mounted() {
    this.graph = graph()
    this.getData()
    LineageGraphsAPI.get({ filter: '{"where":{"type":"tableLineageProcessor"}}' }).then((res) => {
      if (res.data) {
        this.refreshResult = res.data[0]
        if (this.refreshResult.status === 'error') this.rClass = false
        else this.rClass = true
      }
    })
  },
  methods: {
    getData() {
      this.level = 'table'
      this.model.level = 'table'
      let params = {
        level: this.level,
        qualifiedName: this.tableId
      }
      LineageGraphsAPI.graphData(params).then((res) => {
        if (res.data) {
          this.graph.draw(res.data.items, res.data.links, this)
        }
      })
    },
    refreshData() {
      LineageGraphsAPI.refreshGraphData()
        .then((res) => {
          if (res.data) {
            this.refreshResult.allProgress = 10
            this.refreshResult.currProgress = 0
            this.refreshing = true
            let self = this
            this.inter = setInterval(() => {
              LineageGraphsAPI.get({ filter: '{"where":{"type":"tableLineageProcessor"}}' }).then((res) => {
                if (res.data) {
                  self.refreshResult = res.data[0]
                  if (self.refreshResult.sync_data) {
                    this.$message.error('正在同步图形数据，图形可能缺失，请稍后刷新重试')
                  }
                  if (self.refreshResult.status == 'finish') {
                    this.getData()
                    //this.graph = graph();
                    clearInterval(self.inter)
                    setTimeout(() => {
                      self.refreshing = false
                    }, 3000)
                  } else if (self.refreshResult.status == 'error') {
                    this.rClass = false
                    this.errorVisible = true
                    clearInterval(self.inter)
                  }
                }
              })
            }, 2000)
          } else
            LineageGraphsAPI.get({ filter: '{"where":{"type":"tableLineageProcessor"}}' }).then((res) => {
              if (res.data) {
                this.refreshResult = res.data[0]
                if (this.refreshResult.status === 'error') {
                  this.rClass = false
                  this.errorVisible = true
                  this.refreshing = false
                }
              }
            })
        })
        .finally(() => {
          this.apiLoading = false
        })
    },
    handlePreviewVisible() {
      this.model.previewVisible = false
    },
    checkError() {
      if (this.refreshResult.status === 'error') this.errorVisible = true
    },
    zoomIn() {
      window.paperScroller.zoom(0.2, { max: 4 })
    },
    zoomOut() {
      window.paperScroller.zoom(-0.2, { min: 0.2 })
    },
    changeLevel(qualifiedName, fields) {
      this.level = 'field'
      let params = {
        level: this.level,
        qualifiedName: qualifiedName,
        fields: fields
      }
      this.$api('LineageGraphs')
        .graphData(params)
        .then((res) => {
          this.graph.draw(res.data.items, res.data.links, this)
        })
    }
  }
}
</script>
<style lang="less">
@import '../../editor/lib/rappid/rappid.css';
@import '../../editor/lib/rappid/themes/style.default.css';
.data-map-container {
  .navigator-container {
    position: absolute;
    left: 20px;
    bottom: 20px;
    width: 150px;
    height: 150px;
    z-index: 100;
    background: #fff;
  }
  .joint-paper.joint-theme-default {
    background: none;
  }
}
</style>
<style scoped lang="less">
.refreshS {
  margin-left: 10px;
  margin-top: 3px;
  color: #67c23a;
  font-size: 12px;
}
.actProgress {
  line-height: 24px;
}
.errorClass {
  font-size: 12px;
  margin-left: 10px;
  margin-top: 3px;
  color: red;
}
.data-map-container {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
  background: #fafafa;
  min-width: 720px;
  .tool-bar {
    i {
      display: inline-block;
      border: 1px solid #dedee4;
      padding: 5px;
      cursor: pointer;
    }
    .tool-bar-progress {
      width: 250px;
    }
  }
  .data-map-header {
    padding-bottom: 10px;
    background: #ffffff;
    overflow: hidden;
    border-bottom: 1px solid #dedee4;
    -webkit-box-shadow: 0px 0px 4px 0px rgb(0 0 0 / 10%);
    box-shadow: 0px 0px 4px 0px rgb(0 0 0 / 10%);
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
  }
  .data-map-title {
    font-size: 16px;
    color: #333;
    font-weight: 600;
  }
  .data-map-main {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    padding: 10px;
    display: -webkit-box;
    display: -ms-flexbox;
    width: 100%;
    position: relative;
    overflow: auto;
    #paper {
      position: relative;
      width: 100%;
      height: 100%;
      /*border: 1px solid red;*/
    }
  }
  .data-map-info {
    width: 244px;
    border: 1px solid #dedede;
  }
  .data-map {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
  }
  .info-list {
    overflow-y: auto;
    max-height: 690px;
    margin: 0 auto;
    margin-left: 56px;
    width: 100%;
    li {
      margin-bottom: 20px;
    }
  }
  .label {
    color: #999;
    font-size: 12px;
    display: inline-block;
    width: 110px;
    margin-right: 15px;
    text-align: right;
  }
  .value {
    width: 62%;
    color: #666;
    font-size: 12px;
    display: inline-block;
    word-break: break-all;
  }
  .pre {
    color: #666;
    white-space: pre-wrap; /* css3.0 */
    word-wrap: break-word; /* Internet Explorer 5.5+ */
  }
}
</style>
