<template>
  <section class="custom_processor-wrap">
    <!-- <div class="head-btns">
			<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor()">
				{{ $t('dataFlow.button.viewMonitoring') }}
			</el-button>
		</div> -->
    <main>
      <!-- <div style="text-align: right;">
				<el-button size="mini" type="primary">更新节点配置</el-button>
			</div> -->
      <form-builder ref="form" v-model="model.formData" :config="formConfig"></form-builder>
      <pre class="code-pre">{{ this.model.script }}</pre>
    </main>
  </section>
</template>
<script>
import _ from 'lodash'
import { mergeJoinTablesToTargetSchema, removeDeleted } from '../../util/Schema'
// import log from '../../../log';
// let editorMonitor = null;
export default {
  name: 'CustomProcessor',
  data() {
    return {
      disabled: false,
      model: {
        type: 'template_processor',
        formData: {},
        script: '',
        isFormValid: true
      },
      formConfig: {
        form: {},
        items: []
      },
      scriptTemplate: ''
    }
  },
  created() {},
  watch: {
    model: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.$refs.form.validate(isFormValid => {
            this.model.isFormValid = isFormValid
            this.$emit('dataChanged', this.getData())
          })
        })
      }
    }
  },

  methods: {
    setDisabled(disabled) {
      this.disabled = disabled
      this.formConfig.form.disabled = true
    },
    // seeMonitor() {
    // 	editorMonitor.goBackMontior();
    // },
    setData(data, cell) {
      // editorMonitor = vueAdapter.editor;
      if (data) {
        this.model = Object.assign(this.model, data)
      }

      let schema = mergeJoinTablesToTargetSchema(cell.getSchema(), cell.getInputSchema())
      let fields = schema.fields || []
      if (fields.length) {
        fields = removeDeleted(fields)
      }

      let config = cell.getConfig()
      let formConfig = config.formConfig

      if (formConfig && formConfig.items) {
        let items = formConfig.items || []
        let formData = this.model.formData
        items.forEach(it => {
          let value = formData[it.field]
          if (!value && value !== 0) {
            value = ''
          }
          this.$set(this.model.formData, it.field, value)
          if (it.type === 'field') {
            let options = []
            fields.forEach(f => {
              if (f.field_name) {
                options.push({
                  label: f.field_name,
                  value: f.field_name
                })
              }
            })
            it.options = options
          }
        })
      }
      this.formConfig = Object.assign({}, this.formConfig, formConfig)
      this.scriptTemplate = config.scriptTemplate
    },
    getScript() {
      let { formData } = this.model
      let script = this.scriptTemplate
      for (let key in formData) {
        let value = this.getFormatValue(formData[key])

        script = script.replace('${' + key + '}', value)
      }
      return script
    },
    getFormatValue(value) {
      switch (Object.prototype.toString.call(value)) {
        case '[object String]':
          value = `"${value}"`
          break
        case '[object Array]':
          value = `[${value
            .map(v => {
              return this.getFormatValue(v)
            })
            .toString()}]`
          break
        case '[object Number]':
          value = `${value}`
          break
        default:
          value = `"${value}"`
          break
      }
      return value
    },
    getData() {
      this.model.script = this.getScript()
      return _.cloneDeep(this.model)
    }
  }
}
</script>

<style lang="scss" scoped>
.custom_processor-wrap {
  padding: 20px;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  main {
    height: 100%;
    box-sizing: border-box;
    .code-pre {
      margin: 20px 0;
      padding: 15px;
      background: #fff;
      overflow: auto;
      font-size: 12px;
      color: #333;
    }
  }
}
</style>
