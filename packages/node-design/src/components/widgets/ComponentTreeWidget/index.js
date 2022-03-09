import { useTree, usePrefix, useDesigner, useComponents } from '../../../hooks'
import { TreeNodeContext, DesignerComponentsContext } from '../../../context'
import { TreeNode, GlobalRegistry } from '../../../core'
import { observer } from '@formily/reactive-vue'
import { defineComponent, toRefs, watchEffect, h as $h } from 'vue-demi'
// import { h as $h, Fragment } from '@formily/vue'
import './styles.scss'

export const TreeNodeWidget = observer(
  defineComponent({
    props: {
      node: Object
    },
    setup: props => {
      const designer = useDesigner(props.node?.designerProps?.effects)
      const components = useComponents()
      const node = props.node
      const renderChildren = () => {
        if (node?.designerProps?.selfRenderChildren) return []
        const children = node?.children?.map(child => {
          return <TreeNodeWidget key={child.id} node={child} />
        })
        return children
      }
      const renderProps = extendsProps => {
        const attrs = {
          ...node.designerProps?.defaultProps,
          ...extendsProps,
          ...node.props,
          ...node.designerProps?.getComponentProps?.(node)
        }
        if (node.depth === 0) {
          delete attrs.style
        }
        return { attrs }
      }
      const renderComponent = () => {
        const componentName = node.componentName
        const Component = components.value[componentName]
        const dataId = {}
        if (Component) {
          if (designer) {
            dataId[designer.value.props?.nodeIdAttrName] = node.id
          }
          return <Component {...renderProps(dataId)}>{renderChildren()}</Component>
        } else {
          if (node?.children?.length) {
            return renderChildren()
          }
        }
      }

      if (!node) return null
      if (node.hidden) return null
      return () => <TreeNodeContext.Provider value={node}>{renderComponent()}</TreeNodeContext.Provider>
    }
  })
)

export const ComponentTreeWidget = observer(
  defineComponent({
    props: {
      components: Object
    },
    setup: props => {
      const tree = useTree()
      const prefix = usePrefix('component-tree')
      const designer = useDesigner()
      const dataId = {}

      if (designer && tree) {
        dataId[designer.value?.props?.nodeIdAttrName] = tree.id
      }

      watchEffect(() => {
        return GlobalRegistry.registerDesignerBehaviors(props.components)
      })

      return () => (
        <div style={{ ...tree?.props?.style }} class={prefix} attrs={dataId}>
          <DesignerComponentsContext.Provider value={props.components}>
            <TreeNodeWidget node={tree} />
          </DesignerComponentsContext.Provider>
        </div>
      )
    }
  })
)
