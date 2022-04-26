import { useTree, usePrefix, useDesigner, useComponents } from '../../../hooks'
import { TreeNodeContext, DesignerComponentsContext } from '../../../context'
import { GlobalRegistry } from '../../../core'
import { observer } from '@formily/reactive-vue'
import { defineComponent, watchEffect } from 'vue-demi'
import './styles.scss'

export const TreeNodeWidget = observer(
  defineComponent({
    props: {
      node: Object
    },
    setup: props => {
      const designerRef = useDesigner(props.node?.designerProps?.effects)
      const componentsRef = useComponents()

      return () => {
        if (!props.node) return null
        if (props.node.hidden) return null

        const node = props.node
        const renderChildren = () => {
          if (node?.designerProps?.selfRenderChildren) return []
          const children = node?.children?.map(child => {
            return <TreeNodeWidget key={child.id} node={child} />
          })
          return children
        }
        const renderProps = extendsProps => {
          const props = {
            ...node.designerProps?.defaultProps,
            ...extendsProps,
            ...node.props,
            ...node.designerProps?.getComponentProps?.(node)
          }
          if (node.depth === 0) {
            delete props.style
          }
          return props
        }
        const renderComponent = () => {
          const componentName = node.componentName
          const Com = componentsRef.value[componentName]
          const dataId = {}
          if (Com) {
            if (designerRef.value) {
              dataId[designerRef.value.props?.nodeIdAttrName] = node.id
            }
            const { style, ...attrs } = renderProps(dataId)
            // eslint-disable-next-line
            console.log('renderComponent', style, attrs)
            return (
              <Com attrs={attrs} style={style} key={node.id}>
                {renderChildren()}
              </Com>
            )
          } else {
            if (node?.children?.length) {
              return renderChildren()
            }
          }
        }

        return <TreeNodeContext.Provider value={node}>{renderComponent()}</TreeNodeContext.Provider>
      }
    }
  })
)

export const ComponentTreeWidget = observer(
  defineComponent({
    props: {
      components: Object
    },
    setup: props => {
      const treeRef = useTree()
      const prefix = usePrefix('component-tree')
      const designer = useDesigner()
      const dataId = {}

      if (designer && treeRef.value) {
        dataId[designer.value?.props?.nodeIdAttrName] = treeRef.value.id
      }

      watchEffect(() => {
        return GlobalRegistry.registerDesignerBehaviors(props.components)
      })

      return () => (
        <div style={{ ...treeRef.value?.props?.style }} class={prefix} attrs={dataId}>
          <DesignerComponentsContext.Provider value={props.components}>
            <TreeNodeWidget node={treeRef.value} />
          </DesignerComponentsContext.Provider>
        </div>
      )
    }
  })
)
