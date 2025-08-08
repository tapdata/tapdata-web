import { observer } from '@formily/reactive-vue'
import { uid } from '@formily/shared'
import { ElButton as Button, ElTree as Tree } from 'element-plus'
import { defineComponent, type PropType } from 'vue'
import { GlobalRegistry } from '../../../core'
import { usePrefix } from '../../../hooks'
import { IconWidget, TextWidget } from '../../widgets'
import { Header } from './Header'
import { traverseTree } from './shared'
import { Title } from './Title'
import type { INodeItem, ITreeDataSource } from './types'

import './styles.scss'

const limitTreeDrag = ({ dropPosition }) => {
  if (dropPosition === 0) {
    return false
  }
  return true
}

export interface ITreePanelProps {
  treeDataSource: ITreeDataSource
  allowTree: boolean
  defaultOptionValue: {
    label: string
    value: any
  }[]
}

export const TreePanel = observer(
  defineComponent({
    props: {
      treeDataSource: {
        type: Object as PropType<ITreePanelProps['treeDataSource']>,
      },
      allowTree: { type: Boolean as PropType<ITreePanelProps['allowTree']> },
      defaultOptionValue: {
        type: Object as PropType<ITreePanelProps['defaultOptionValue']>,
      },
    },
    setup(props) {
      const prefixRef = usePrefix('data-source-setter')
      
      return () => {
        const prefix = prefixRef.value
        return (
          <>
            <Header
              title={
                <TextWidget token="SettingComponents.DataSourceSetter.dataSourceTree" />
              }
              extra={
                <Button
                  text={true}
                  onClick={() => {
                    const uuid = uid()
                    const dataSource = props.treeDataSource!.dataSource
                    const initialKeyValuePairs = props.defaultOptionValue?.map(
                      (item) => ({ ...item }),
                    ) || [
                      {
                        label: 'label',
                        value: `${GlobalRegistry.getDesignerMessage(
                          `SettingComponents.DataSourceSetter.item`,
                        )} ${dataSource.length + 1}`,
                      },
                      { label: 'value', value: uuid },
                    ]
                    props.treeDataSource!.dataSource = dataSource.concat({
                      key: uuid,
                      duplicateKey: uuid,
                      map: initialKeyValuePairs,
                      children: [],
                    })
                  }}
                  icon={<IconWidget infer="Add" />}
                >
                  <TextWidget token="SettingComponents.DataSourceSetter.addNode" />
                </Button>
              }
            />
            <div class={`${prefix}-layout-item-content`}>
              <Tree
                node-key="key"
                draggable={true}
                allowDrop={props.allowTree ? () => true : limitTreeDrag}
                defaultExpandAll
                autoExpandParent
                highlightCurrent
                currentNodeKey={props.treeDataSource!.selectedKey}
                data={props.treeDataSource!.dataSource}
                {...{
                  'onNode-drag-enter': () => {},
                  'onNode-drop': () => {},
                  'onNode-click': (node, treenode, event) => {
                    const { key } = node
                    props.treeDataSource!.selectedKey = key.toString()
                  },
                }}
                // titleRender={(titleProps: INodeItem) => {
                //     return (
                //         <Title
                //             {...titleProps}
                //             treeDataSource={props.treeDataSource}
                //         ></Title>
                //     )
                // }}
                // onSelect={(selectedKeys: string) => {
                //     if (selectedKeys[0]) {
                //         props.treeDataSource!.selectedKey = selectedKeys[0].toString()
                //     }
                // }}
                v-slots={{
                  default: ({ data: titleProps }: { data: INodeItem }) => {
                    return (
                      <Title
                        {...titleProps}
                        treeDataSource={props.treeDataSource}
                      ></Title>
                    )
                  },
                }}
              ></Tree>
            </div>
          </>
        )
      }
    },
  }),
)
