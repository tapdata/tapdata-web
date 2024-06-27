<template>
  <FormRender :form="form" :schema="schema" :scope="scope" v-bind="$attrs" />
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import {
  createForm,
  onFormValuesChange,
  onFormInputChange,
  onFieldValueChange,
  onFieldInputValueChange
} from '@formily/core'
import { Path } from '@formily/path'

import { alarmApi } from '@tap/api'
import { deepEqual } from '@tap/shared'
import { validateBySchema } from '@tap/form/src/shared/validate'

import FormRender from './FormRender'
import { getSchema } from '../util'
import { debounce } from 'lodash'

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

    activeNodeId: {
      async handler(n, o) {
        const formSchema = this.$store.getters['dataflow/formSchema'] || {}

        // 重置TAB
        this.scope?.formTab?.setActiveKey('tab1')

        if (!this.ins) {
          // 节点不存在，比如删掉了，清除表单
          this.schema = null
          return
        }
        await this.setSchema(this.ins.getSchema() || formSchema.node)

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
      },
      immediate: true
    }
  },

  created() {
    this.lazySaveNodeAlarmConfig = debounce(this.saveNodeAlarmConfig, 100)
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
        if (this.node.type === 'table_rename_processor') {
          // 节点的特殊处理，直接拿表单校验结果设置错误信息
          this.setNodeErrorMsg({
            id: this.node.id,
            msg: e[0].messages[0]
          })
        } else {
          this.setNodeError(id)
        }
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
        if (node && !deepEqual(form.values, node, ['alarmRules.0._ms', 'alarmRules.0._point'])) {
          console.log('还是更新了')
          this.updateNodeProps(form)
        }
      }, 40)
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
        overwrite: !this.stateIsReadonly,
        properties: JSON.parse(JSON.stringify(formValues))
      })
      this.updateDag({ vm: this })
      clearTimeout(this.confirmTimer)
      this.confirmTimer = setTimeout(() => this.confirmNodeHasError(), 10)
    },

    // 绑定表单事件
    useEffects() {
      // FIXME 目前无法区分告警配置的修改，
      // 放弃了onFieldInputValueChange(*)方案，因为有些字段没有主动在schema中定义
      onFormValuesChange(form => {
        if (this.stateIsReadonly) return
        console.log('onFormValuesChange')
        this.updateNodePropsDebounce(form)
      })

      onFormInputChange(form => {
        if (this.stateIsReadonly) return
        console.log('onFormInputChange')
        this.updateNodeProps(form)
      })

      /*onFieldInputValueChange('*(!alarmSettings.*,alarmRules.*)', (field, form) => {
        if (this.stateIsReadonly) return
        this.updateNodeProps(form)
      })
      onFieldValueChange('*(!alarmSettings.*,alarmRules.*)', (field, form) => {
        if (this.stateIsReadonly) return
        this.updateNodePropsDebounce(form)
      })*/

      onFieldValueChange('*(alarmSettings.0.*,alarmRules.0.*(!_point,_ms))', (field, form) => {
        this.lazySaveNodeAlarmConfig()
      })
    },

    confirmNodeHasError() {
      // 节点已经没有错误，清除节点的告警图标
      const res = this.hasNodeError(this.activeNodeId)
      if (res && typeof res === 'boolean' && !this.form.errors.length) {
        this.clearNodeError(this.activeNodeId)
      }
    },

    saveNodeAlarmConfig() {
      const formValues = this.form.values
      this.updateNodeProperties({
        id: formValues.id,
        properties: JSON.parse(JSON.stringify(formValues))
      })

      alarmApi.updateTaskAlarm({
        taskId: this.scope.$settings.id,
        nodeId: formValues.id,
        alarmRules: formValues.alarmRules,
        alarmSettings: formValues.alarmSettings
      })
    }
  }
}
</script>
