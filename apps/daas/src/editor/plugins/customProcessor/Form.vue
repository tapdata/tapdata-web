<template>
  <section class="custom_processor-wrap">
    <main>
      <form-builder ref="form" v-model="model.formData" :config="formConfig"></form-builder>
      <ElLink v-show="!isShowPreview" type="primary" @click="isShowPreview = true">预览</ElLink>
      <ElLink v-show="isShowPreview" type="primary" @click="isShowPreview = false">收起预览</ElLink>
      <pre v-show="isShowPreview" class="code-pre">{{ this.model.script }}</pre>
      <pre class="node-desc" v-html="nodeDesc"></pre>
    </main>
  </section>
</template>
<script>
import { mergeJoinTablesToTargetSchema, removeDeleted } from '../../util/Schema'
export default {
  name: 'CustomProcessor',
  data() {
    return {
      isShowPreview: false,
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
      nodeDesc: '',
      scriptTemplate: '',
      ifFields: []
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
    setData(data, cell) {
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
      let descStr = config.nodeConfig?.desc
      if (descStr) {
        descStr = descStr.replaceAll('$pre(', '<pre class="code-pre">')
        descStr = descStr.replaceAll('$pre)', '</pre>')
        this.nodeDesc = descStr
      }
      let checkField = it => {
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
        if (it.type === 'array') {
          checkField(it.itemConfig)
        }
        if (it.type === 'group') {
          it.items.map(d => {
            checkField(d)
          })
        }
      }
      if (formConfig && formConfig.items) {
        let items = formConfig.items || []
        let formData = this.model.formData
        let ifFields = []
        items.forEach((it, index) => {
          if (it.type === 'if') {
            let field = it.field
            it = {
              field,
              type: 'nest',
              label: '判断条件',
              limit: 3, //最多能设置几层， 不设默认3层
              items: [
                {
                  type: 'select',
                  defaultValue: '&&',
                  options: [
                    { label: '&&', value: '&&' },
                    { label: '||', value: '||' },
                    { label: '&', value: '&' },
                    { label: '|', value: '|' }
                  ]
                },
                {
                  type: 'array',
                  itemConfig: {
                    type: 'group',
                    items: [
                      { type: 'input', placeholder: '选择字段' },
                      {
                        type: 'select',
                        defaultValue: '==',
                        options: [
                          { label: '=', value: '==' },
                          { label: '!=', value: '!=' },
                          { label: '>', value: '>' },
                          { label: '<', value: '<' },
                          { label: '>=', value: '>=' },
                          { label: '<=', value: '<=' }
                        ]
                      },
                      { type: 'input', placeholder: '值' }
                    ]
                  }
                }
              ]
            }
            ifFields.push(field)
            formConfig.items[index] = it
          }
          let value = formData[it.field]
          if (!value && value !== 0) {
            value = ''
          }
          this.$set(this.model.formData, it.field, value)
          checkField(it)
        })
        this.ifFields = ifFields
      }
      this.formConfig = Object.assign({}, this.formConfig, formConfig)
      this.scriptTemplate = config.scriptTemplate
    },
    getIfValue(value) {
      let values = JSON.parse(JSON.stringify(value)) || ''
      let result = ''
      if (values) {
        let opr = values.splice(0, 1)[0]
        let items = values.splice(0, 1)
        result = items[0]
          .map(it => {
            it[0] = `record.${it[0]}`
            it[2] = this.getFormatValue(it[2])
            return it.join(' ')
          })
          .join(` ${opr} `)
        let nestItems = values
        if (nestItems?.length) {
          result += ` ${opr} (`
          result += nestItems.map(it => {
            return this.getIfValue(it)
          })
          result += ') '
        }
      }
      return result
    },
    getScript() {
      let { formData } = this.model
      let script = this.scriptTemplate
      for (let key in formData) {
        let value = this.ifFields.includes(key) ? this.getIfValue(formData[key]) : this.getFormatValue(formData[key])

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
      return JSON.parse(JSON.stringify(this.model))
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
  padding-bottom: 50px;
  main {
    height: 100%;
    box-sizing: border-box;
    .code-pre {
      margin: 10px 0;
      padding: 15px;
      background: #fff;
      overflow: auto;
      font-size: 12px;
      color: #333;
    }
    .node-desc {
      font-size: 12px;
    }
  }
}
</style>
<style lang="scss">
.custom_processor-wrap {
  .code-pre {
    margin: 10px 0;
    padding: 15px;
    background: #fff;
    overflow: auto;
    font-size: 12px;
    color: #333;
  }
}
</style>
