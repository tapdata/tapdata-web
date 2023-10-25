import { ElTree as Tree, ElButton as Button } from 'element-plus'
import { uid } from '@tap/shared'
import { observer } from '@formily/reactive-vue'
import { FragmentComponent } from '@formily/vue'
import { usePrefix } from '../../../hooks'
import { TextWidget } from '../../widgets'
import { Title } from './Title'
import { Header } from './Header'
import { traverseTree } from './shared'
import './styles.scss'
import { GlobalRegistry } from '../../../core'
import { defineComponent } from 'vue'

const limitTreeDrag = ({ dropPosition }) => {
  if (dropPosition === 0) {
    return false
  }
  return true
}

export const TreePanel = observer(
  defineComponent({
    props: ['defaultOptionValue', 'allowTree', 'treeDataSource'],
    setup: props => {
      const prefix = usePrefix('data-source-setter')
      const dropHandler = info => {
        const dropKey = info.node?.key
        const dragKey = info.dragNode?.key
        const dropPos = info.node.pos.split('-')
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
        const data = [...props.treeDataSource.dataSource]
        // Find dragObject
        let dragObj
        traverseTree(data, (item, index, arr) => {
          if (arr[index].key === dragKey) {
            arr.splice(index, 1)
            dragObj = item
          }
        })
        if (!info.dropToGap) {
          traverseTree(data, item => {
            if (item.key === dropKey) {
              item.children = item.children || []
              item.children.unshift(dragObj)
            }
          })
        } else if ((info.node.children || []).length > 0 && info.node.expanded && dropPosition === 1) {
          traverseTree(data, item => {
            if (item.key === dropKey) {
              item.children = item.children || []
              item.children.unshift(dragObj)
            }
          })
        } else {
          let ar
          let i
          traverseTree(data, (item, index, arr) => {
            if (item.key === dropKey) {
              ar = arr
              i = index
            }
          })
          if (dropPosition === -1) {
            ar.splice(i, 0, dragObj)
          } else {
            ar.splice(i + 1, 0, dragObj)
          }
        }
        props.treeDataSource.dataSource = data
      }
      return () => (
        <FragmentComponent>
          <Header>
            <TextWidget slot="title" token="SettingComponents.DataSourceSetter.dataSourceTree" />
            <Button
              slot="extra"
              type="text"
              onClick={() => {
                const uuid = uid()
                const dataSource = props.treeDataSource.dataSource
                const initialKeyValuePairs = props.defaultOptionValue?.map(item => ({ ...item })) || [
                  {
                    label: 'label',
                    value: `${GlobalRegistry.getDesignerMessage(`SettingComponents.DataSourceSetter.item`)} ${
                      dataSource.length + 1
                    }`
                  },
                  { label: 'value', value: uuid }
                ]
                props.treeDataSource.dataSource = dataSource.concat({
                  key: uuid,
                  duplicateKey: uuid,
                  map: initialKeyValuePairs,
                  children: []
                })
                // eslint-disable-next-line
                console.log('dataSource', dataSource)
              }}
              icon="el-icon-plus"
            >
              <TextWidget token="SettingComponents.DataSourceSetter.addNode" />
            </Button>
          </Header>
          <div class={`${prefix + '-layout-item-content'}`}>
            <Tree
              blockNode
              draggable={true}
              allowDrop={props.allowTree ? () => true : limitTreeDrag}
              defaultExpandAll
              defaultExpandParent
              autoExpandParent
              showLine={{ showLeafIcon: false }}
              data={props.treeDataSource.dataSource}
              onDragEnter={() => {}}
              onDrop={dropHandler}
              renderContent={(_h, { node, data, store }) => {
                // eslint-disable-next-line
                console.log('renderContent', node, data, store)
                return <Title props={{ ...data }} treeDataSource={props.treeDataSource}></Title>
              }}
              vOn:node-click={(data, node) => {
                // eslint-disable-next-line
                console.log('selectedKeys, node', data, node)
                if (data) {
                  props.treeDataSource.selectedKey = data.key
                }
              }}
            />
          </div>
        </FragmentComponent>
      )
    }
  })
)
