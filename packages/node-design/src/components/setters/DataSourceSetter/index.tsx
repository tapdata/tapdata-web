import { observable } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import { ElButton as Button, ElSpace, ElDialog as Modal } from 'element-plus'
import { defineComponent, markRaw, ref, watch, type PropType } from 'vue'
import { usePrefix, useTheme } from '../../../hooks'
import { TextWidget } from '../../widgets'
import { DataSettingPanel } from './DataSettingPanel'
import { transformDataToValue, transformValueToData } from './shared'
import { TreePanel } from './TreePanel'
import type { IDataSourceItem, ITreeDataSource } from './types'
import type { Form } from '@formily/core'

import './styles.scss'

export interface IDataSourceSetterProps {
  onChange: (dataSource: IDataSourceItem[]) => void
  value: IDataSourceItem[]
  allowTree?: boolean
  allowExtendOption?: boolean
  defaultOptionValue?: {
    label: string
    value: any
  }[]
  effects?: (form: Form<any>) => void
}
export const DataSourceSetter = observer(
  defineComponent({
    props: {
      value: {
        type: Array as PropType<IDataSourceSetterProps['value']>,
        default: () => [],
      },
      allowTree: {
        type: Boolean as PropType<IDataSourceSetterProps['allowTree']>,
        default: true,
      },
      allowExtendOption: {
        type: Boolean as PropType<IDataSourceSetterProps['allowExtendOption']>,
        default: true,
      },
      defaultOptionValue: {
        type: Array as PropType<IDataSourceSetterProps['defaultOptionValue']>,
      },
      effects: {
        type: Function as PropType<IDataSourceSetterProps['effects']>,
      },
      onChange: {
        type: Function as PropType<IDataSourceSetterProps['onChange']>,
      },
    },
    inheritAttrs: false,
    emits: ['change'],
    setup(props, { emit }) {
      const theme = useTheme()
      const prefixRef = usePrefix('data-source-setter')
      const modalVisibleRef = ref(false)
      const treeDataSourceRef = ref()
      watch(
        [() => props.value, modalVisibleRef],
        () => {
          treeDataSourceRef.value = markRaw(
            observable({
              dataSource: transformValueToData(props.value),
              selectedKey: '',
            }),
          )

          if (treeDataSourceRef.value.dataSource.length > 0) {
            treeDataSourceRef.value.selectedKey =
              treeDataSourceRef.value.dataSource[0].key
          }
        },
        { immediate: true },
      )

      const openModal = () => {
        modalVisibleRef.value = true
      }
      const closeModal = () => (modalVisibleRef.value = false)
      return () => {
        const modalVisible = modalVisibleRef.value
        const treeDataSource = treeDataSourceRef.value
        const prefix = prefixRef.value
        return (
          <>
            <Button onClick={openModal}>
              <TextWidget token="SettingComponents.DataSourceSetter.configureDataSource" />
            </Button>
            <Modal
              appendToBody
              {...{ onClosed: closeModal }}
              v-slots={{
                header: ({ titleClass }: { titleClass: string }) => (
                  <div class={titleClass}>
                    <TextWidget token="SettingComponents.DataSourceSetter.configureDataSource" />
                  </div>
                ),
                footer: () => (
                  <div>
                    <Button onClick={closeModal}>Cancel</Button>
                    <Button
                      onClick={() => {
                        props.onChange?.(
                          transformDataToValue(treeDataSource.dataSource),
                        )
                        closeModal()
                      }}
                      type="primary"
                    >
                      OK
                    </Button>
                  </div>
                ),
              }}
              modelValue={modalVisible}
              width="65%"
              destroyOnClose
            >
              <div
                class={`${prefix} ${`${prefix}-${theme}`} ${`${prefix}-layout`}`}
              >
                <div class={`${prefix}-layout-item left`}>
                  <TreePanel
                    defaultOptionValue={props.defaultOptionValue}
                    allowTree={props.allowTree}
                    treeDataSource={treeDataSource}
                  ></TreePanel>
                </div>
                <div class={`${prefix}-layout-item right`}>
                  <DataSettingPanel
                    allowExtendOption={props.allowExtendOption}
                    treeDataSource={treeDataSource}
                    effects={props.effects}
                  ></DataSettingPanel>
                </div>
              </div>
            </Modal>
          </>
        )
      }
    },
  }),
)
