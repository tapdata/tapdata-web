<template>
  <FormRender :form="form" :schema="schema" :scope="scope" v-bind="$attrs" />
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { createForm, onFormInputChange, onFormValuesChange, onFieldReact, isVoidField } from '@formily/core'
import { Path } from '@formily/path'

import i18n from '@tap/i18n'
import { validateBySchema } from '@tap/form/src/shared/validate'

import FormRender from './FormRender'
import { getSchema } from '../util'

const mapEnum = dataSource => (item, index) => {
  const label = dataSource[index] || dataSource[item.value] || item.label
  return {
    ...item,
    value: item?.value ?? null,
    label: label?.label ?? label
  }
}

export default {
  name: 'FormPanel',

  props: {
    scope: {}
  },

  components: { FormRender },

  data() {
    return {
      form: createForm(),

      formProps: {
        colon: false,
        shallow: false,
        labelAlign: 'left',
        // labelWidth: '120',
        layout: 'vertical',
        // layout: 'horizontal',
        feedbackLayout: 'terse'
      },

      schema: null
    }
  },

  computed: {
    ...mapState('dataflow', ['activeNodeId', 'transformStatus']),

    ...mapGetters('dataflow', [
      'activeNode',
      'nodeById',
      'activeConnection',
      'activeType',
      'hasNodeError',
      'allEdges',
      'stateIsReadonly',
      'getMessage'
    ]),

    node() {
      return this.activeNode
    },

    ins() {
      return this.node?.__Ctor
    }
  },

  watch: {
    stateIsReadonly(v) {
      this.form.setState({ disabled: v })
    },

    async activeNodeId(n, o) {
      const formSchema = this.$store.getters['dataflow/formSchema'] || {}
      if (!this.ins) {
        // 节点不存在，比如删掉了，清除表单
        this.schema = null
        return
      }
      await this.setSchema(this.ins.formSchema || formSchema.node)

      // 如果节点存在错误状态，走一遍校验，可以让用户看到错误信息
      // 脏代码。节点错误原先是布尔值，又增加字符串类型
      // 布尔值代表表单校验，字符串目前仅是任务增量、全量校验
      if (this.hasNodeError(n) && typeof this.hasNodeError(n) !== 'string') {
        await this.validate()
      }

      // 校验上一个节点配置
      if (o && !this.stateIsReadonly) {
        const node = this.nodeById(o)
        try {
          if (node) {
            const schema = getSchema(node.__Ctor.formSchema, node, this.$store.state.dataflow.pdkPropertiesMap)
            await validateBySchema(schema, node, this.scope)
          }

          if (this.hasNodeError(o) && typeof this.hasNodeError(o) !== 'string') {
            this.clearNodeError(o)
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e)
          if (node.type === 'table_rename_processor') {
            // 节点的特殊处理，直接拿表单校验结果设置错误信息
            this.setNodeErrorMsg({
              id: node.id,
              msg: e[0].messages[0]
            })
          } else {
            this.setNodeError(node.id)
          }
        }
      }

      this.setNodeInputsWatcher(
        this.$watch('node.$inputs', v => {
          if (!this.node || !v) return
          const $inputs = this.form.getFieldState('$inputs')
          if ($inputs && $inputs.value.join(',') !== v.join(',')) {
            this.form.setValuesIn('$inputs', [...v])
            this.$emit('update:InputsOrOutputs')
          }
        })
      )
      this.setNodeOutputsWatcher(
        this.$watch('node.$outputs', v => {
          if (!this.node || !v) return
          const $outputs = this.form.getFieldState('$outputs')
          if ($outputs && $outputs.value.join(',') !== v.join(',')) {
            this.form.setValuesIn('$outputs', [...v])
            this.$emit('update:InputsOrOutputs')
          }
        })
      )
    }
  },

  beforeDestroy() {
    this.form.onUnmount()
  },

  methods: {
    ...mapMutations('dataflow', [
      'setNodeValue',
      'updateNodeProperties',
      'setNodeError',
      'setNodeErrorMsg',
      'clearNodeError',
      'setNodeInputsWatcher',
      'setNodeOutputsWatcher'
    ]),

    ...mapActions('dataflow', ['updateDag']),

    /**
     * 校验表单
     * @returns {Promise<void>}
     */
    async validate() {
      const id = this.activeNodeId
      if (!id) return
      try {
        await this.form.validate()
        this.clearNodeError(id)
      } catch (e) {
        this.setNodeError(id)
      }
    },

    // 设置schema
    async setSchema(schema, values = this.node) {
      this.schema = null

      await this.$nextTick()

      this.form = createForm({
        disabled: this.stateIsReadonly,
        values,
        effects: this.useEffects
      })

      this.schema = getSchema(schema, values, this.$store.state.dataflow.pdkPropertiesMap)

      this.$emit('setSchema')
    },

    updateNodePropsDebounce(form) {
      clearTimeout(this.updateTimer)
      this.updateTimer = setTimeout(() => {
        const node = this.nodeById(form.values.id)
        if (node && JSON.stringify(form.values) !== JSON.stringify(node)) {
          this.updateNodeProps(form)
        }
      }, 60)
    },

    // 更新节点属性
    updateNodeProps(form) {
      clearTimeout(this.updateTimer)
      const formValues = JSON.parse(JSON.stringify(form.values))
      const filterProps = ['id', 'isSource', 'isTarget', 'attrs.position', 'sourceNode', '$inputs', '$outputs'] // 排除属性的更新

      filterProps.forEach(path => {
        Path.setIn(formValues, path, undefined)
      })
      this.updateNodeProperties({
        id: form.values.id,
        properties: JSON.parse(JSON.stringify(formValues))
      })
      this.updateDag()
      clearTimeout(this.confirmTimer)
      this.confirmTimer = setTimeout(() => this.confirmNodeHasError(), 10)
    },

    // 绑定表单事件
    useEffects() {
      onFormValuesChange(form => {
        if (this.stateIsReadonly) return
        // eslint-disable-next-line no-console
        console.log(`🚗onFormValuesChange`, JSON.parse(JSON.stringify(form.values)))
        this.updateNodePropsDebounce(form)
      })

      onFormInputChange(form => {
        if (this.stateIsReadonly) return
        // eslint-disable-next-line no-console
        console.log('🚄onFormInputChange', JSON.parse(JSON.stringify(form.values)))
        this.updateNodeProps(form)
      })
      onFieldReact('*', field => {
        const path = field.path.toString().replace(/\.[\d+]/g, '')
        const takeMessage = prop => {
          const token = `${path}${prop ? `.${prop}` : ''}`
          return this.getMessage(token, this.ins.locales)
        }
        const title = takeMessage('title') || takeMessage()
        const description = takeMessage('description')
        const tooltip = takeMessage('tooltip')
        const dataSource = takeMessage('dataSource')
        const placeholder = takeMessage('placeholder')

        if (title) {
          field.title = title
        }
        if (description) {
          field.description = description
        }
        if (tooltip) {
          field.decorator[1] = field.decorator[1] || []
          field.decorator[1].tooltip = tooltip
        }
        if (placeholder) {
          field.component[1] = field.component[1] || []
          field.component[1].placeholder = placeholder
        }
        if (dataSource?.length && !isVoidField(field)) {
          if (field.dataSource?.length) {
            field.dataSource = field.dataSource.map(mapEnum(dataSource))
          } else {
            field.dataSource = dataSource.slice()
          }
        }
        /*if (!isVoidField(field)) {
          if (dataSource?.length && !isVoidField(field)) {
            if (field.dataSource?.length) {
              field.dataSource = field.dataSource.map(mapEnum(dataSource))
            } else {
              field.dataSource = dataSource.slice()
            }
          } else {
            field.dataSource = field.dataSource?.filter?.(Boolean)
          }
        }*/
      })
    },

    confirmNodeHasError() {
      // 节点已经没有错误，清除节点的告警图标
      const res = this.hasNodeError(this.activeNodeId)
      if (res && typeof res === 'boolean' && !this.form.errors.length) {
        this.clearNodeError(this.activeNodeId)
      }
    }
  }
}
</script>
