import VIcon from 'web-core/components/VIcon'
import OverflowTooltip from 'web-core/components/overflow-tooltip'
import { connect, mapProps, useForm } from '@formily/vue'
import { defineComponent } from '@vue/composition-api/dist/vue-composition-api'
import './style.scss'

export const JoinExpression = connect(
  defineComponent({
    name: 'JoinExpression',

    props: ['fields', 'value'],

    data() {
      return {
        fieldArr: this.value
      }
    },

    watch: {
      fieldArr: {
        deep: true,
        handler(v) {
          this.$emit('change', v)
        }
      }
    },

    setup() {
      const formRef = useForm()
      const form = formRef.value
      // const sourceNode = form.query('sourceNode').value()
      const sourceNode = form.getFieldState('sourceNode').dataSource
      // console.log('sourceNode', sourceNode)
      // let sourceNodeNameMap = {}

      if (sourceNode?.length) {
        // sourceNodeNameMap = sourceNode.reduce((obj, item) => ((obj[item.id] = item.name), obj), {})
        form.setValuesIn('leftNodeId', sourceNode[0].value)
        form.setValuesIn('rightNodeId', sourceNode[1]?.value)
      } else {
        form.setValuesIn('leftNodeId', null)
        form.setValuesIn('rightNodeId', null)
      }

      // console.log('🚗sourceNode', sourceNode, form.getFieldState('sourceNode'))
      // console.log('🚗form', form.values)

      return {
        sourceNode: sourceNode || [],
        leftNodeId: form.values.leftNodeId,
        rightNodeId: form.values.rightNodeId
      }
    },

    render() {
      let leftFields = []
      let rightFields = []
      if (this.fields) {
        leftFields = this.fields[this.leftNodeId] || []
        rightFields = this.fields[this.rightNodeId] || []
      }
      let { sourceNode } = this
      // console.log('JoinExpression', this.fields, this.sourceNode)
      return (
        <div class="join-expression">
          <div class="join-name-wrap flex align-center">
            <div class="join-name flex text-nowrap">
              左侧: <OverflowTooltip class="ml-1" placement="top" text={sourceNode[0]?.label}></OverflowTooltip>
            </div>
            <div class="join-name flex text-nowrap">
              右侧: <OverflowTooltip class="ml-1" placement="top" text={sourceNode[1]?.label}></OverflowTooltip>
            </div>
          </div>
          {this.fieldArr.map((item, i) => (
            <div class="flex align-center join-expression-row" key={i}>
              <div class="join-field">
                <ElSelect v-model={item.left}>
                  {leftFields.map(item => (
                    <ElOption label={item.field_name} value={item.field_name}></ElOption>
                  ))}
                </ElSelect>
              </div>

              <span class="join-operator">=</span>
              <div class="join-field">
                <ElSelect v-model={item.right}>
                  {rightFields.map(item => (
                    <ElOption label={item.field_name} value={item.field_name}></ElOption>
                  ))}
                </ElSelect>
              </div>
              <ElButton class="ml-3" type="text" onClick={() => this.handleAdd()}>
                <VIcon size={16}>plus</VIcon>
              </ElButton>
              <ElButton
                class="ml-3"
                type="text"
                disabled={this.fieldArr.length < 2}
                onClick={() => this.handleRemove()}
              >
                <VIcon size={16}>delete</VIcon>
              </ElButton>
            </div>
          ))}
        </div>
      )
    },

    methods: {
      handleAdd() {
        this.fieldArr.push({
          left: '',
          right: ''
        })
        // console.log('handleAdd', this.fieldArr)
      },

      handleRemove(index) {
        this.fieldArr.splice(index, 1)
      }
    }
  }),
  mapProps({ dataSource: 'fields' })
)

export default JoinExpression
