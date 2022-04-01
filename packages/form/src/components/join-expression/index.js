import VIcon from 'web-core/components/VIcon'
import OverflowTooltip from 'web-core/components/overflow-tooltip'
import { h as createElement, connect, mapProps, useForm, useField, useFieldSchema, RecursionField } from '@formily/vue'
import { defineComponent } from '@vue/composition-api/dist/vue-composition-api'
import { observer } from '@formily/reactive-vue'
import { FormBaseItem as FormItem, FormLayout } from '@formily/element'
import { computed, watch } from 'vue-demi'
import './style.scss'

export const JoinExpression = connect(
  observer(
    defineComponent({
      name: 'JoinExpression',

      props: ['fields', 'value'],

      /*data() {
        return {
          fieldArr: this.value
        }
      },*/

      /*computed: {
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
      },*/

      /*watch: {
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
            state.dataSource = this.rightFields
          })
        }
      },*/

      setup(props, { emit }) {
        const formRef = useForm()
        const fieldRef = useField()
        const schemaRef = useFieldSchema()
        const decoratorProps = {
          'x-decorator-props': {
            labelStyle: {
              opacity: 0,
              width: '0px'
            }
          }
        }
        const leftFields = computed(() => {
          const id = formRef.value.values.leftNodeId
          if (id && props.fields?.[id]) {
            return props.fields[id].map(item => item.field_name)
          }
          return []
        })
        const rightFields = computed(() => {
          const id = formRef.value.values.rightNodeId
          if (id && props.fields?.[id]) {
            return props.fields[id].map(item => item.field_name)
          }
          return []
        })

        watch(leftFields, val => {
          console.log('getFieldState', val)
          formRef.value.setFieldState(`${fieldRef.value.address}.*.left`, state => {
            state.dataSource = val
          })
        })

        watch(rightFields, val => {
          formRef.value.setFieldState(`${fieldRef.value.address}.*.right`, state => {
            state.dataSource = val
          })
        })

        watch(
          () => props.value,
          () => {
            emit('change', v)
          },
          {
            deep: true
          }
        )

        /*const leftSchema = {
          type: 'object',
          properties: {
            left: Object.assign({}, decoratorProps, schema.left)
          }
        }

        const rightSchema = {
          type: 'object',
          properties: {
            right: Object.assign({}, decoratorProps, schema.right)
          }
        }*/

        return () => {
          const form = formRef.value
          const schema = schemaRef.value
          const sourceNode = form.values.sourceNode || []
          const fieldArr = props.value
          const leftTitle = form.getFieldState(`${fieldRef.value.address}.*.left`)?.title
          const rightTitle = form.getFieldState(`${fieldRef.value.address}.*.right`)?.title

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

          console.log('sourceNode', form.getFieldState(`sourceNode`))

          console.log('fieldRef', fieldRef.value)

          console.log('LeftfieldRef', form.getFieldState(`${fieldRef.value.address}.*.left`))

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
                  {leftTitle}：
                  <OverflowTooltip class="ml-1" placement="top" text={sourceNode[0]?.label}></OverflowTooltip>
                </div>
                <div class="join-name flex text-nowrap">
                  {rightTitle}：
                  <OverflowTooltip class="ml-1" placement="top" text={sourceNode[1]?.label}></OverflowTooltip>
                </div>
              </div>
              {renderItems()}
            </div>
          )
        }

        /*return {
          form: formRef,
          formValue: formRef.value.values,
          address: field.value.address,
          leftSchema,
          rightSchema
        }*/
      },

      /*render() {
        const sourceNode = this.formValue.sourceNode || []
        return (
          <div class="join-expression">
            <div class="join-name-wrap flex align-center">
              <div class="join-name flex text-nowrap">
                {this.leftSchema.properties.left.title}
                <OverflowTooltip class="ml-1" placement="top" text={sourceNode[0]?.label}></OverflowTooltip>
              </div>
              <div class="join-name flex text-nowrap">
                {this.rightSchema.properties.right.title}
                <OverflowTooltip class="ml-1" placement="top" text={sourceNode[1]?.label}></OverflowTooltip>
              </div>
            </div>
            {this.fieldArr.map((item, i) => (
              <div class="flex join-expression-row" key={i}>
                <div class="join-field">
                  {createElement(
                    RecursionField,
                    {
                      props: {
                        name: i,
                        schema: this.leftSchema
                      }
                    },
                    {}
                  )}
                </div>
                <FormItem class="join-operator">=</FormItem>
                <div class="join-field">
                  {createElement(
                    RecursionField,
                    {
                      props: {
                        name: i,
                        schema: this.rightSchema
                      }
                    },
                    {}
                  )}
                </div>
                <FormItem>
                  <ElButton class="ml-3 align-middle" size="mini" type="text" onClick={() => this.handleAdd()}>
                    <VIcon size={16}>plus</VIcon>
                  </ElButton>
                  <ElButton
                    class="ml-3 align-middle"
                    size="mini"
                    type="text"
                    disabled={this.fieldArr.length < 2}
                    onClick={() => this.handleRemove(i)}
                  >
                    <VIcon size={16}>delete</VIcon>
                  </ElButton>
                </FormItem>
              </div>
            ))}
            {/!*<FormLayout class="mb-n2" shallow={false} feedbackLayout="terse">
              {this.fieldArr.map((item, i) => (
                <div class="flex join-expression-row" key={i}>
                  <div class="join-field">
                    {createElement(
                      RecursionField,
                      {
                        props: {
                          name: i,
                          schema: this.leftSchema
                        }
                      },
                      {}
                    )}
                  </div>
                  <FormItem class="join-operator">=</FormItem>
                  <div class="join-field">
                    {createElement(
                      RecursionField,
                      {
                        props: {
                          name: i,
                          schema: this.rightSchema
                        }
                      },
                      {}
                    )}
                  </div>
                  <FormItem>
                    <ElButton class="ml-3 align-middle" size="mini" type="text" onClick={() => this.handleAdd()}>
                      <VIcon size={16}>plus</VIcon>
                    </ElButton>
                    <ElButton
                      class="ml-3 align-middle"
                      size="mini"
                      type="text"
                      disabled={this.fieldArr.length < 2}
                      onClick={() => this.handleRemove(i)}
                    >
                      <VIcon size={16}>delete</VIcon>
                    </ElButton>
                  </FormItem>
                </div>
              ))}
            </FormLayout>*!/}
          </div>
        )
      },*/

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
