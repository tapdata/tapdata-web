<template>
  <el-dialog
    :visible.sync="aggregationDialog"
    custom-class="collection-aggregation"
    :close-on-click-modal="false"
    width="70%"
    @close="closeAggregationDialog"
  >
    <div slot="title">
      <span class="text">{{
        $t('editor.cell.data_node.collection.form.aggregation.aggregationText')
      }}</span>
      <span @click="handleLearnMore" class="more">Learn more</span>
    </div>
    <div class="collection-aggregation">
      <div class="pipeline">
        <div class="title">
          Pipeline
          <el-button
            type="primary"
            size="mini"
            class="pipeline-button"
            @click="handlePreview"
          >
            <i class="el-icon-loading" v-if="previewLoading"></i
            >{{
              $t('editor.cell.data_node.collection.form.aggregation.preview')
            }}</el-button
          >
        </div>
        <!-- [ <el-input class="e-textarea" type="textarea" v-model="script"></el-input>] -->
        <JsonEditor
          :code.sync="script"
          ref="jsEditor"
          :width.sync="width"
          v-if="!disabled"
        ></JsonEditor>
      </div>
      <div class="preview">
        <div class="title">
          {{
            $t(
              'editor.cell.data_node.collection.form.aggregation.previewSampleData'
            )
          }}
        </div>
        <div class="preview-box">
          <div class="preview-main" v-if="returnFalg == 'success'">
            <template v-if="previewData.length">
              <div
                class="json-box"
                v-for="(item, index) in previewData"
                :key="index"
              >
                <!-- <pre>{{ JSON.stringify(item, null, 2) }}</pre> -->
                <Jsonviewer :value="item"></Jsonviewer>
              </div>
            </template>
            <template v-else>
              <div class="json-box">[]</div>
            </template>
          </div>

          <div class="return-data" v-else>
            <span class="error" v-if="returnFalg == 'error'">
              <pre>{{ errorMessage }}</pre>
            </span>
            <span class="add" v-if="returnFalg == 'add'">
              <p>
                {{
                  $t(
                    'editor.cell.data_node.collection.form.aggregation.addTextTip'
                  )
                }}
              </p>
              <p>
                {{
                  $t(
                    'editor.cell.data_node.collection.form.aggregation.addTextTip1'
                  )
                }}
              </p>
            </span>
          </div>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        size="mini"
        :disabled="returnFalg == 'error' || !script"
        @click="aggregationSave"
      >
        <i class="el-icon-loading" v-if="saveLoading"></i
        >{{ $t('app.save') }}</el-button
      >
    </span>
  </el-dialog>
</template>
<script>
import ws from '@/api/ws'
import JsonEditor from '@/components/jsonEditor'
import Jsonviewer from 'vue-json-viewer'
export default {
  name: 'collectionAggregation',
  components: { JsonEditor, Jsonviewer },
  props: {
    aggregationDialog: {
      type: Boolean
    },
    model: {
      type: Object
    }
  },
  data() {
    return {
      disabled: false,
      width: '500',
      previewData: [],
      errorMessage: '',
      returnFalg: 'add',
      script: '[]',
      clickStatus: '',
      templeSchema: null,
      previewLoading: false,
      saveLoading: false
    }
  },

  created() {
    this.script =
      this.model.collectionAggrPipeline == '[]' ||
      this.model.collectionAggrPipeline == ''
        ? '[]'
        : this.model.collectionAggrPipeline

    let self = this
    ws.on('aggregatePreviewResult', (res) => {
      if (res.status === 'SUCCESS' && !!res.result) {
        if (self.clickStatus === 'preview') {
          if (res.result.previewResult && res.result.previewResult.length) {
            self.previewData = res.result.previewResult
          } else {
            self.previewData = []
          }
        }

        if (res.result.relateDataBaseTable) {
          self.templeSchema = res.result.relateDataBaseTable
        }

        if (self.clickStatus === 'save') {
          self.$emit('backAggregateResult', self.script, self.templeSchema)
        }
        self.returnFalg = 'success'
      } else if (res.status === 'ERROR') {
        self.errorMessage = res.error
        self.returnFalg = 'error'
      }
      this.previewLoading = false
      this.saveLoading = false
    })
  },

  methods: {
    // 点击aggregation弹窗跳转页面
    handleLearnMore() {
      let href =
        'https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/'
      window.open(href)
    },

    // 预览
    handlePreview() {
      let params = {
        type: 'aggregatePreview',
        data: {
          connectionId: this.model.connectionId,
          tableName: this.model.tableName,
          pipeline: this.script || '[]'
        }
      }
      this.clickStatus = 'preview'
      this.previewLoading = true
      if (ws.ws.readyState == 1) ws.send(params)
    },

    // 关闭aggregation弹窗(聚合没有内容关闭设置开关)
    closeAggregationDialog() {
      if (!this.model.collectionAggrPipeline) {
        this.model.collectionAggregate = false
      }
      this.aggregationDialog = false
      this.$emit('closeAggregationDialog')
    },

    // 保存aggregation设置
    aggregationSave() {
      let params = {
        type: 'aggregatePreview',
        data: {
          connectionId: this.model.connectionId,
          tableName: this.model.tableName,
          pipeline: this.script || '[]'
        }
      }
      this.clickStatus = 'save'
      this.saveLoading = true
      if (ws.ws.readyState == 1) ws.send(params)
    }
  }
}
</script>
<style scoped lang="scss">
.collection-aggregation {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  & > div {
    width: 100%;
    color: #333;
    border: 1px solid #dedee4;
    .title {
      width: 100%;
      height: 28px;
      line-height: 27px;
      padding: 0 20px;
      font-size: 12px;
      color: #333;
      box-sizing: border-box;
      background: #f5f5f5;
      border-bottom: 1px solid #dedee4;
    }
  }
  .pipeline {
    width: 400px;
    height: 478px;
    .pipeline-button {
      float: right;
      height: 20px;
      margin-top: 4px;
      padding: 0 10px;
    }
  }
  .preview {
    width: calc(100% - 420px);
    height: 478px;
    margin-left: 20px;
    .preview-box {
      width: 100%;
      height: calc(100% - 28px);
      overflow: hidden;
      // padding: 20px;

      .preview-main {
        display: flex;
        width: 100%;
        height: 100%;
        flex-direction: row;
        padding: 20px;
        box-sizing: border-box;
        overflow: auto;
      }
      .json-box {
        width: 360px;
        height: 100%;
        margin-right: 10px;
        box-sizing: border-box;
        border: 1px solid #dedee4;
      }
      .return-data {
        height: 410px;
        padding: 20px;
        overflow: auto;
        .error {
          display: inline-block;
          height: 100%;
          font-size: 12px;
          color: #f56c6c;
          pre {
            margin: 0;
            box-sizing: border-box;
            white-space: pre-wrap;
          }
        }
        .add {
          font-size: 12px;
          color: #666;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.collection-aggregation {
  .monaco,
  .margin,
  .monaco-editor,
  .monaco-scrollable-element,
  .view-lines {
    width: 100% !important;
    // height: 410px !important;
  }
  .el-dialog__body {
    padding: 20px 30px 10px;
  }
  .el-dialog__footer {
    padding: 10px 30px 20px;
  }
  .text {
    user-select: none;
  }
  .more {
    padding-left: 20px;
    font-size: 12px;
    color: #48b6e2;
    cursor: pointer;
  }
  .monaco {
    border: 0 !important;
    height: 450px !important;
  }
  .monaco-editor {
    width: 100% !important;
    height: 450px !important;
  }
  .el-textarea__inner {
    width: 100%;
    height: 400px;
    border: 0;
    font-size: 12px;
  }
  .jv-container {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    .jv-code {
      width: 360px !important;
      padding: 10px !important;
      overflow: auto;
      box-sizing: border-box;
    }
  }
}
</style>
