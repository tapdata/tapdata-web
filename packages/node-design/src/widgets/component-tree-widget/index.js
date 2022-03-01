import { useTree, usePrefix, useDesigner, useComponents } from '../../hooks'
import { TreeNodeContext, DesignerComponentsContext } from '../../context'
import { TreeNode, GlobalRegistry } from '../../core'
import { observer } from '@formily/reactive-vue'
import { defineComponent, toRefs, watchEffect } from 'vue-demi'
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
      console.log('node', node)
      const renderChildren = () => {
        if (node?.designerProps?.selfRenderChildren) return []
        return node?.children?.map(child => {
          return <TreeNodeWidget key={child.id} node={child} />
        })
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
        const Component = components[componentName]
        const dataId = {}
        if (Component) {
          if (designer) {
            dataId[designer?.props?.nodeIdAttrName] = node.id
          }
          return h(Component, renderProps(dataId), ...renderChildren())
        } else {
          if (node?.children?.length) {
            return renderChildren()
          }
        }
      }

      if (!node) return null
      if (node.hidden) return null
      return () => h(TreeNodeContext.Provider, { value: node }, renderComponent())
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
      const { components } = toRefs(props)

      if (designer && tree) {
        dataId[designer.value?.props?.nodeIdAttrName] = tree.id
      }

      console.log('tree!!!', tree)

      watchEffect(() => {
        return GlobalRegistry.registerDesignerBehaviors(props.components)
      })

      return () => (
        <div style={{ ...props.style, ...tree?.props?.style }} class={[prefix, props.className]} {...dataId}>
          <DesignerComponentsContext.Provider value={props.components}>
            <TreeNodeWidget node={tree} />
          </DesignerComponentsContext.Provider>
        </div>
      )
    }
  })
)
