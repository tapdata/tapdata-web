import { clone, toArr } from '@tap/shared'
import { observer } from '@formily/reactive-vue'
import { usePrefix } from '../../../hooks'
import { TextWidget, IconWidget } from '../../widgets'
import { traverseTree } from './shared'
import './styles.scss'
import { defineComponent } from 'vue-demi'

export const Title = observer(
  defineComponent({
    props: ['treeDataSource', 'map'],
    setup: props => {
      const prefix = usePrefix('data-source-setter-node-title')
      const getTitleValue = dataSource => {
        const optionalKeys = ['label', 'title', 'header']
        let nodeTitle
        optionalKeys.some(key => {
          const title = toArr(dataSource).find(item => item.label === key)?.value
          if (title !== undefined) {
            nodeTitle = title
            return true
          }
          return false
        })
        if (nodeTitle === undefined) {
          toArr(dataSource || []).some(item => {
            if (item.value && typeof item.value === 'string') {
              nodeTitle = item.value
              return true
            }
            return false
          })
        }
        return nodeTitle
      }

      const renderTitle = dataSource => {
        const nodeTitle = getTitleValue(dataSource)
        if (nodeTitle === undefined) return <TextWidget token="SettingComponents.DataSourceSetter.defaultTitle" />
        else return nodeTitle + ''
      }

      return () => (
        <div class={prefix}>
          <span style={{ marginRight: '5px' }}>{renderTitle(props?.map || [])}</span>
          <IconWidget
            class={prefix + '-icon'}
            infer="Remove"
            onClick={() => {
              const newDataSource = clone(props?.treeDataSource?.dataSource)
              traverseTree(newDataSource || [], (dataItem, i, data) => {
                if (data[i].key === props.duplicateKey) toArr(data).splice(i, 1)
              })
              props.treeDataSource.dataSource = newDataSource
            }}
          />
        </div>
      )
    }
  })
)
