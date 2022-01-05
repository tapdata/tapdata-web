<template>
  <div class="nodeStyle">
    <div class="nodeBody">
      <!-- <div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div> -->
      <el-form class="e-form" label-position="top" label-width="130px" :model="model" :disabled="disabled" ref="form">
        <ElFormItem :required="true" :label="$t('editor.cell.processor.script.form.name.label')" size="mini">
          <el-input
            v-model="model.name"
            class="form-item-width"
            :placeholder="$t('editor.cell.processor.script.form.name.placeholder')"
          ></el-input>
        </ElFormItem>

        <ElFormItem :required="true" label="JS引擎版本：" size="mini">
          <ElSelect v-model="model.jsEngineName">
            <ElOption label="新版" value="graal.js"></ElOption>
            <ElOption label="旧版" value="nashorn"></ElOption>
          </ElSelect>
        </ElFormItem>

        <ElFormItem :required="true" :label="$t('editor.cell.processor.script.form.script.label')" size="mini">
          <el-input
            type="textarea"
            v-model="model.script"
            :autosize="{ minRows: 20 }"
            class="form-item-width"
            v-if="disabled"
          ></el-input>
          <CodeEditor v-if="!disabled" v-model="model.script" :width="width" height="300px"></CodeEditor>
        </ElFormItem>
        <!-- <ElFormItem>
          <el-button class="btn-debug" type="primary" size="mini" :loading="!!sending" @click="showDebug">
            {{ $t('editor.cell.processor.script.debug_button_label') }}
          </el-button>
        </ElFormItem> -->
      </el-form>
    </div>
    <Debug ref="debug"></Debug>
  </div>
</template>

<script>
import CodeEditor from '@/components/CodeEditor'
import log from '../../../log'
import { EditorEventType } from '../../lib/events'
import Debug from './Debug'
import ws, { EventName } from '../../../api/ws'
import _ from 'lodash'
// let editorMonitor = null;

const gData = {}
export default {
  name: 'Script',
  components: {
    CodeEditor,
    Debug
  },
  data() {
    return {
      disabled: false,
      scriptTypes: [
        {
          label: 'JavaScript',
          value: 'js_processor'
        },
        {
          label: 'Java',
          value: 'java_processor'
        }
      ],

      databases: [],
      rules: {
        connectionId: [
          {
            required: true,
            trigger: 'blur',
            message: `Please select ${this.connection_type} database`
          }
        ]
      },
      model: {
        name: 'JavaScript',
        type: 'js_processor',
        jsEngineName: 'graal.js',
        script: 'function process(record){\n\n\t// Enter you code at here\n\treturn record;\n}'
      },
      width: '500px',
      sending: false
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.width = this.$el.clientWidth - 42
    })
    this.$on(EditorEventType.RESIZE, width => {
      this.width = width - 42
    })
  },
  watch: {
    model: {
      deep: true,
      handler() {
        this.$emit('dataChanged', this.getData())
      }
    }
  },
  methods: {
    setData(data, cell) {
      if (data) {
        data.jsEngineName = data.jsEngineName || 'nashorn'
        _.merge(this.model, data)
      }
      gData.stageId = cell.id
      gData.dataFlowId = arguments[3].editor.scope.dataFlowId
    },
    getData() {
      // return JSON.parse(JSON.stringify(this.model));
      return _.cloneDeep(this.model)
    },

    setDisabled(disabled) {
      this.disabled = disabled
    },

    // seeMonitor() {
    // 	editorMonitor.goBackMontior();
    // },

    showDebug() {
      log('Connect to Test Server')
      if (!gData.dataFlowId) {
        this.$message.error(this.$t('editor.cell.processor.script.warning_for_not_save'))
        return
      }
      ws.getAgentId((err, id) => {
        if (!err && id) {
          let params = this.model
          ws.sendPipe(
            {
              type: 'execute_script',
              script: params.script,
              script_type: params.type,
              dataFlowId: gData.dataFlowId,
              stageId: gData.stageId
            },
            id
          )
          this.sending = setTimeout(() => {
            this.sending = null
            this.$refs.debug.logList = []
          }, 60 * 1000)
        } else {
          this.$message.error(this.$t('editor.cell.processor.script.connect_server_fail'))
        }
      })

      this.$refs.debug.show(cb => {
        ws.once(EventName.EXECUTE_SCRIPT_RESULT, msg => {
          clearTimeout(this.sending)
          this.sending = null
          log('Job.ReceiveMessage', msg)
          cb(msg)
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.btn-debug {
  float: right;
}
</style>
