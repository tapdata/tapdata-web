import { observer } from '@formily/reactive-vue'
import { clone, toArr } from '@formily/shared'
import { defineComponent, type PropType } from 'vue'
import { usePrefix } from '../../../hooks'
import { IconWidget, TextWidget } from '../../widgets'
import { traverseTree } from './shared'
import type { INodeItem, ITreeDataSource } from './types'
import './styles.scss'

export interface ITitleProps extends INodeItem {
  treeDataSource: ITreeDataSource
}

const titleInner = defineComponent({
  props: {
    key: { type: String as PropType<ITitleProps['key']> },
    duplicateKey: { type: String as PropType<ITitleProps['duplicateKey']> },
    map: { type: Array as PropType<ITitleProps['map']> },
    children: { type: Array as PropType<ITitleProps['children']> },
    treeDataSource: { type: Object as PropType<ITitleProps['treeDataSource']> },
  },
  setup(props) {
    const prefixRef = usePrefix('data-source-setter-node-title')
    const getTitleValue = (dataSource: ITitleProps['map']) => {
      const optionalKeys = ['label', 'title', 'header']
      let nodeTitle: string | undefined
      optionalKeys.some((key) => {
        const title = toArr(dataSource).find(
          (item) => item.label === key,
        )?.value
        if (title !== undefined) {
          nodeTitle = title
          return true
        }
        return false
      })
      if (nodeTitle === undefined) {
        toArr(dataSource || []).some((item) => {
          if (item.value && typeof item.value === 'string') {
            nodeTitle = item.value
            return true
          }
          return false
        })
      }
      return nodeTitle
    }

    const renderTitle = (dataSource: ITitleProps['map']) => {
      const nodeTitle = getTitleValue(dataSource)
      if (nodeTitle === undefined)
        return (
          <TextWidget token="SettingComponents.DataSourceSetter.defaultTitle" />
        )
      else return String(nodeTitle)
    }
    return () => {
      const prefix = prefixRef.value
      return (
        <div
          class={prefix}
          // onClick={(e) => {
          //   e.stopPropagation()
          //   e.preventDefault()
          // }}
        >
          <span>
            {renderTitle(props.map || [])}
          </span>
          <IconWidget
            className={`${prefix}-icon`}
            infer="Remove"
            onClick={(event) => {
              event.stopPropagation()
              const newDataSource = clone(props?.treeDataSource?.dataSource)
              traverseTree(newDataSource || [], (dataItem, i, data) => {
                if (data[i].key === props.duplicateKey) toArr(data).splice(i, 1)
              })
              props.treeDataSource!.dataSource = newDataSource
            }}
          />
        </div>
      )
    }
  },
})

export const Title = observer(titleInner)
