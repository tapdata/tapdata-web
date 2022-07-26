import { VIcon } from '@tap/component'
import OverflowTooltip from 'web-core/components/overflow-tooltip'
import { h as createElement, useForm, useField, useFieldSchema, RecursionField } from '@formily/vue'
import { defineComponent } from '@vue/composition-api/dist/vue-composition-api'
import { observer } from '@formily/reactive-vue'
import { FormBaseItem as FormItem } from '@formily/element'
import { watch } from 'vue-demi'
import './style.scss'
import { action } from '@formily/reactive'

export const JoinExpression = observer(
  defineComponent({
    name: 'JoinExpression',

    props: ['fields', 'value', 'findNodeById', 'loadNodeFieldNamesById', 'leftNodeId', 'rightNodeId'],

    setup(props) {
      const formRef = useForm()
      const fieldRef = useField()
      const schemaRef = useFieldSchema()

      const loadFieldNames = async (id, target) => {
        let fieldNames = []

        if (id) {
          formRef.value.setFieldState(`${fieldRef.value.address}.*.${target}`, state => {
            state.loading = true
          })

          fieldNames = await props.loadNodeFieldNamesById(id)
        }

        formRef.value.setFieldState(`${fieldRef.value.address}.*.${target}`, state => {
          state.dataSource = fieldNames
          state.loading = false
        })
      }

      watch(
        () => props.leftNodeId,
        async val => {
          await loadFieldNames(val, 'left')
        },
        { immediate: true }
      )

      watch(
        () => props.rightNodeId,
        async val => {
          await loadFieldNames(val, 'right')
        },
        { immediate: true }
      )

      /*watch(
          () => props.value,
          () => {
            emit('change', v)
          },
          {
            deep: true
          }
        )*/

      return () => {
        const form = formRef.value
        const schema = schemaRef.value
        const fieldArr = props.value
        const leftTitle = form.getFieldState(`${fieldRef.value.address}.*.left`)?.title
        const rightTitle = form.getFieldState(`${fieldRef.value.address}.*.right`)?.title
        const { leftNodeId, rightNodeId } = props
        const leftNodeName = props.findNodeById(leftNodeId)?.name
        const rightNodeName = props.findNodeById(rightNodeId)?.name

        const handleAdd = () => {
          fieldArr.push({
            left: '',
            right: '',
            expression: '='
          })
        }

        const handleRemove = index => {
          fieldArr.splice(index, 1)
        }

        const doExchange = action.bound(() => {
          form.setValuesIn('leftNodeId', rightNodeId)
          form.setValuesIn('rightNodeId', leftNodeId)
        })

        const handleExchange = () => {
          doExchange()
          props.value.forEach(item => {
            const { left, right } = item
            item.left = right
            item.right = left
          })
          fieldRef.value.validate()
        }

        const renderItems = () => {
          return fieldArr.map((item, i) => {
            const left = createElement(
              RecursionField,
              {
                props: {
                  name: i,
                  schema: schema.items,
                  filterProperties: schema => schema.name === 'left',
                  onlyRenderProperties: true
                }
              },
              {}
            )
            const right = createElement(
              RecursionField,
              {
                props: {
                  name: i,
                  schema: schema.items,
                  filterProperties: schema => schema.name === 'right',
                  onlyRenderProperties: true
                }
              },
              {}
            )
            return (
              <div class="flex join-expression-row" key={i}>
                <div class="join-field">{left}</div>
                <FormItem class="join-operator">=</FormItem>
                <div class="join-field">{right}</div>
                <FormItem>
                  <ElButton class="ml-3 align-middle" size="mini" type="text" onClick={() => handleAdd()}>
                    <VIcon size={16}>plus</VIcon>
                  </ElButton>
                  <ElButton
                    class="ml-3 align-middle"
                    size="mini"
                    type="text"
                    disabled={fieldArr.length < 2}
                    onClick={() => handleRemove(i)}
                  >
                    <VIcon size={16}>delete</VIcon>
                  </ElButton>
                </FormItem>
              </div>
            )
          })
        }

        return (
          <div class="join-expression">
            <div class="join-name-wrap flex align-center">
              <div class="join-name flex text-nowrap">
                {leftTitle}：<OverflowTooltip class="ml-1" placement="top" text={leftNodeName}></OverflowTooltip>
              </div>
              <div class="join-exchange">
                <VIcon onClick={handleExchange} size={16}>
                  exchange
                </VIcon>
              </div>
              <div class="join-name flex text-nowrap">
                {rightTitle}：<OverflowTooltip class="ml-1" placement="top" text={rightNodeName}></OverflowTooltip>
              </div>
            </div>
            {renderItems()}
          </div>
        )
      }
    }
  })
)

export default JoinExpression
