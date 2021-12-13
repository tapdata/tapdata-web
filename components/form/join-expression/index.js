import VIcon from 'web-core/components/VIcon'
import OverflowTooltip from 'web-core/components/overflow-tooltip'
import { h, connect, mapProps, useForm, useField, useFieldSchema, RecursionField } from '@formily/vue'
import { defineComponent } from '@vue/composition-api/dist/vue-composition-api'
import { observer } from '@formily/reactive-vue'
import { FormBaseItem as FormItem, FormLayout } from '@formily/element'
import './style.scss'

export const JoinExpression = connect(
  observer(
    defineComponent({
      name: 'JoinExpression',

      props: ['fields', 'value'],

      data() {
        return {
          fieldArr: this.value
        }
      },

      computed: {
        leftFields() {
          const id = this.formValue?.leftNodeId
          if (id && this.fields?.[id]) {
            return this.fields[id].map(item => item.field_name)
          }
          return []
        },

        rightFields() {
          const id = this.formValue?.rightNodeId
          if (id && this.fields?.[id]) {
            return this.fields[id].map(item => item.field_name)
          }
          return []
        }
      },

      watch: {
        fieldArr: {
          deep: true,
          handler(v) {
            this.$emit('change', v)
          }
        },

        leftFields() {
          this.form.setFieldState(`${this.address}.*.left`, state => {
            state.dataSource = this.leftFields
          })
        },

        rightFields() {
          this.form.setFieldState(`${this.address}.*.right`, state => {
            state.dataSource = this.leftFields
          })
        }
      },

      setup() {
        const formRef = useForm()
        const form = formRef.value
        const field = useField()
        const schemaRef = useFieldSchema()
        const schema = schemaRef.value.items.properties

        const leftSchema = {
          type: 'object',
          properties: {
            left: schema.left
          }
        }

        const rightSchema = {
          type: 'object',
          properties: {
            right: schema.right
          }
        }

        return {
          form,
          formValue: form.values,
          address: field.value.address,
          leftSchema,
          rightSchema
        }
      },

      render() {
        const sourceNode = this.formValue.sourceNode || []

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
            <FormLayout class="mb-n2" shallow={false} feedbackLayout="terse">
              {this.fieldArr.map((item, i) => (
                <div class="flex align-center join-expression-row" key={i}>
                  <div class="join-field">
                    {h(RecursionField, {
                      props: {
                        name: i,
                        schema: this.leftSchema
                      }
                    })}
                  </div>
                  <FormItem class="join-operator">=</FormItem>
                  <div class="join-field">
                    {h(RecursionField, {
                      props: {
                        name: i,
                        schema: this.rightSchema
                      }
                    })}
                  </div>
                  <FormItem>
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
                  </FormItem>
                </div>
              ))}
            </FormLayout>
          </div>
        )
      },

      methods: {
        handleAdd() {
          this.fieldArr.push({
            left: '',
            right: '',
            expression: '='
          })
        },

        handleRemove(index) {
          this.fieldArr.splice(index, 1)
        }
      }
    })
  ),
  mapProps({ dataSource: 'fields' })
)

export default JoinExpression
