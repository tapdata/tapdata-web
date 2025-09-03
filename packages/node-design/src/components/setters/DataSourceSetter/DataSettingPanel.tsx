import {
  createForm,
  type DataField,
  type Form as FormCore,
} from '@formily/core'
import { observer } from '@formily/reactive-vue'
import { createSchemaField } from '@formily/vue'
import {
  ArrayItems,
  Form,
  FormItem,
  Input,
  watch as ReactiveWatch,
  Space,
} from '@tap/form'
import { ElButton as Button } from 'element-plus'
import { defineComponent, shallowRef, type PropType } from 'vue'
import { GlobalRegistry } from '../../../core'
import { usePrefix } from '../../../hooks'
import { IconWidget, TextWidget } from '../../widgets'
import { Header } from './Header'
import { traverseTree } from './shared'
import type { ITreeDataSource } from './types'

import './styles.scss'

const { SchemaField } = createSchemaField({
  components: {
    FormItem,
    Input,
    ArrayItems,
    Space,
  },
})

export interface IDataSettingPanelProps {
  treeDataSource: ITreeDataSource
  allowExtendOption?: boolean
  effects?: (form: FormCore<any>) => void
}

export const DataSettingPanel = observer(
  defineComponent({
    inheritAttrs: false,
    props: {
      treeDataSource: {
        type: Object as PropType<IDataSettingPanelProps['treeDataSource']>,
      },
      allowExtendOption: {
        type: Boolean as PropType<IDataSettingPanelProps['allowExtendOption']>,
      },
      effects: {
        type: Function as PropType<IDataSettingPanelProps['effects']>,
      },
    },
    setup(props) {
      const prefixRef = usePrefix('data-source-setter')
      const formRef = shallowRef()
      let lastSelectedKey: string | undefined
      let lastDataSourceLength: number | undefined

      ReactiveWatch(
        [
          () => props.treeDataSource?.selectedKey,
          () => props.treeDataSource?.dataSource?.length,
        ],
        () => {
          const currentSelectedKey = props.treeDataSource?.selectedKey
          const currentDataSourceLength =
            props.treeDataSource?.dataSource?.length

          // 防止重复创建：只有当关键依赖真正变化时才重新创建 form
          if (
            currentSelectedKey === lastSelectedKey &&
            currentDataSourceLength === lastDataSourceLength
          ) {
            return
          }

          lastSelectedKey = currentSelectedKey
          lastDataSourceLength = currentDataSourceLength

          let values: any
          if (props.treeDataSource?.dataSource && currentSelectedKey) {
            traverseTree(props.treeDataSource.dataSource, (dataItem) => {
              if (dataItem.key === currentSelectedKey) {
                values = dataItem
              }
            })
          }

          formRef.value = createForm({
            values,
            effects: props.effects,
          })
        },
        { immediate: true },
      )
      return () => {
        const prefix = prefixRef.value
        const form = formRef.value
        const allowExtendOption = props.allowExtendOption

        if (!props.treeDataSource?.selectedKey) {
          return (
            <>
              <Header
                title={
                  <TextWidget token="SettingComponents.DataSourceSetter.nodeProperty" />
                }
                extra={null}
              />
              <div class={`${prefix}-layout-item-content`}>
                <TextWidget token="SettingComponents.DataSourceSetter.pleaseSelectNode" />
              </div>
            </>
          )
        }

        if (!form) {
          return (
            <>
              <Header
                title={
                  <TextWidget token="SettingComponents.DataSourceSetter.nodeProperty" />
                }
                extra={null}
              />
              <div class={`${prefix}-layout-item-content`}>Loading...</div>
            </>
          )
        }

        return (
          <>
            <Header
              title={
                <TextWidget token="SettingComponents.DataSourceSetter.nodeProperty" />
              }
              extra={
                allowExtendOption ? (
                  <Button
                    text={true}
                    onClick={() => {
                      form.setFieldState('map', (state: DataField) => {
                        state.value.push({})
                      })
                    }}
                    icon={<IconWidget infer="Add" />}
                  >
                    <TextWidget token="SettingComponents.DataSourceSetter.addKeyValuePair" />
                  </Button>
                ) : null
              }
            />
            <div class={`${prefix}-layout-item-content`}>
              <Form form={form} labelWidth={60} wrapperWidth={160}>
                <SchemaField
                  schema={{
                    type: 'object',
                    properties: {
                      map: {
                        type: 'array',
                        'x-component': 'ArrayItems',
                        items: {
                          type: 'object',
                          'x-decorator': 'ArrayItems.Item',
                          'x-decorator-props': { type: 'divide' },
                          'x-component': 'Space',
                          properties: {
                            label: {
                              'x-decorator': 'FormItem',
                              title: GlobalRegistry.getDesignerMessage(
                                'SettingComponents.DataSourceSetter.label',
                              ),
                              'x-disabled': !allowExtendOption,
                              name: 'label',
                              'x-component': 'Input',
                            },
                            value: {
                              'x-decorator': 'FormItem',
                              title: GlobalRegistry.getDesignerMessage(
                                'SettingComponents.DataSourceSetter.value',
                              ),
                              'x-disabled': !allowExtendOption,
                              name: 'value',
                              'x-component': 'Input',
                            },
                            remove: {
                              type: 'void',
                              'x-decorator': 'FormItem',
                              'x-decorator-props': {
                                wrapperStyle: {
                                  display: 'flex',
                                  alignItems: 'center',
                                },
                              },
                              'x-component': 'ArrayItems.Remove',
                              'x-visible': allowExtendOption,
                              'x-component-props': {
                                style: {
                                  margin: 5,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  }}
                ></SchemaField>
              </Form>
            </div>
          </>
        )
      }
    },
  }),
)
