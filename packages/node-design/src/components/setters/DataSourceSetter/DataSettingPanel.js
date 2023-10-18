import { ElButton as Button } from 'element-plus'
import { ArrayItems, Form, Input, FormItem } from '@tap/form'
import { createForm } from '@formily/core'
import { observer } from '@formily/reactive-vue'
import { createSchemaField, FragmentComponent } from '@formily/vue'
import { ValueInput } from '../../settings-form'
import { usePrefix } from '../../../hooks'
import { TextWidget } from '../../widgets'
import { Header } from './Header'
import { traverseTree } from './shared'
import './styles.scss'
import { defineComponent, ref } from 'vue'
import { GlobalRegistry } from '../../../core'
import { cancelIdle, requestIdle, uid } from '@tap/shared'
// import { useLocales } from '../../settings-form/useLocales'
import { observe } from '@formily/reactive'

const { SchemaField, SchemaVoidField, SchemaStringField, SchemaArrayField, SchemaObjectField } = createSchemaField({
  components: {
    FormItem,
    Input,
    ArrayItems,
    ValueInput
  }
})

export const DataSettingPanel = observer(
  defineComponent({
    props: ['treeDataSource', 'allowExtendOption', 'effects'],
    setup: props => {
      const { allowExtendOption, effects } = props
      const prefix = usePrefix('data-source-setter')

      const formRef = ref()
      const idleTaskRef = ref(null)
      const requestIdleTask = () => {
        cancelIdle(idleTaskRef.value)
        idleTaskRef.value = requestIdle(() => {
          let values
          traverseTree(props.treeDataSource.dataSource, dataItem => {
            if (dataItem.key === props.treeDataSource.selectedKey) {
              values = dataItem
            }
          })
          formRef.value = createForm({
            values,
            effects: effects
          })
        })
      }

      requestIdleTask()

      observe(props.treeDataSource, () => {
        // requestIdleTask()
        let values
        traverseTree(props.treeDataSource.dataSource, dataItem => {
          if (dataItem.key === props.treeDataSource.selectedKey) {
            values = dataItem
          }
        })
        formRef.value.setValues(values)
      })

      return () => {
        if (!props.treeDataSource.selectedKey)
          return (
            <FragmentComponent>
              <Header title={<TextWidget token="SettingComponents.DataSourceSetter.nodeProperty" />} extra={null} />
              <div class={`${prefix + '-layout-item-content'}`}>
                <TextWidget token="SettingComponents.DataSourceSetter.pleaseSelectNode" />
              </div>
            </FragmentComponent>
          )
        return (
          <FragmentComponent>
            <Header>
              <TextWidget slot="title" token="SettingComponents.DataSourceSetter.nodeProperty" />
              {allowExtendOption ? (
                <Button
                  slot="extra"
                  type="text"
                  onClick={() => {
                    formRef.value.setFieldState('map', state => {
                      state.value.push({})
                    })
                  }}
                >
                  <TextWidget token="SettingComponents.DataSourceSetter.addKeyValuePair" />
                </Button>
              ) : null}
            </Header>
            <div class={`${prefix + '-layout-item-content'}`}>
              <Form key={uid()} form={formRef.value} labelWidth={60} wrapperWidth={160}>
                <SchemaField>
                  <SchemaArrayField name="map" x-component="ArrayItems">
                    <SchemaObjectField x-decorator="ArrayItems.Item" x-decorator-props={{ type: 'divide' }}>
                      <SchemaStringField
                        title={GlobalRegistry.getDesignerMessage('SettingComponents.DataSourceSetter.label')}
                        x-decorator="FormItem"
                        x-disabled={!allowExtendOption}
                        name="label"
                        x-component="Input"
                      />
                      <SchemaStringField
                        title={GlobalRegistry.getDesignerMessage('SettingComponents.DataSourceSetter.value')}
                        x-decorator="FormItem"
                        name="value"
                        x-component="ValueInput"
                      />
                      <SchemaVoidField
                        x-component="ArrayItems.Remove"
                        x-visible={allowExtendOption}
                        x-component-props={{
                          style: {
                            margin: 5,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }
                        }}
                      />
                    </SchemaObjectField>
                  </SchemaArrayField>
                </SchemaField>
              </Form>
            </div>
          </FragmentComponent>
        )
      }
    }
  })
)
