import { isValid } from '@tap/shared'
import { IconWidget, TextWidget } from '../widgets'
import { usePrefix } from '../../hooks'
import { defineComponent, ref, getCurrentInstance, watch } from 'vue-demi'
import { FragmentComponent } from '@formily/vue'

const parseItems = children => {
  const items = []
  children.forEach((child, index) => {
    items.push({
      key: child['key'] ?? index,
      ...child.componentOptions?.propsData,
      ...child.data.attrs,
      children: child.children || child.componentOptions?.children
    })
  })
  return items
}

const findItem = (items, key) => {
  for (let index = 0; index < items.length; index++) {
    const item = items[index]
    if (key === index) return item
    if (key === item.key) return item
  }
}

const getDefaultKey = children => {
  const items = parseItems(children)
  return items?.[0].key
}

export const CompositePanel = defineComponent({
  props: {
    activeKey: [Number, String],
    defaultActiveKey: Number,
    defaultPinning: Boolean,
    showNavTitle: Boolean,
    defaultOpen: { type: Boolean, default: true },
    direction: String,
    onChange: Function
  },
  setup(props, { emit }) {
    const { slots } = getCurrentInstance()
    const prefix = usePrefix('composite-panel')
    const activeKeyRef = ref(props.defaultActiveKey ?? getDefaultKey(slots.default))
    const pinningRef = ref(props.defaultPinning ?? false)
    const visibleRef = ref(props.defaultOpen ?? true)

    const items = parseItems(slots.default)
    const currentItem = findItem(items, activeKeyRef.value)
    const content = currentItem?.children

    watch(
      () => props.activeKey,
      () => {
        if (isValid(props.activeKey) && activeKeyRef.value !== props.activeKey) {
          activeKeyRef.value = props.activeKey
        }
      }
    )

    /*useEffect(() => {
      if (isValid(props.activeKey)) {
        if (props.activeKey !== activeKeyRef.current) {
          setActiveKey(props.activeKey)
        }
      }
    }, [props.activeKey])*/

    const renderContent = () => {
      if (!content || !visibleRef.value) return
      return (
        <div
          class={[
            prefix + '-tabs-content',
            {
              pinning: pinningRef.value
            }
          ]}
        >
          <div class={prefix + '-tabs-header'}>
            <div class={prefix + '-tabs-header-title'}>
              <TextWidget>{currentItem.title}</TextWidget>
            </div>
            <div class={prefix + '-tabs-header-actions'}>
              <div class={prefix + '-tabs-header-extra'}>{currentItem.extra}</div>
              <IconWidget
                infer="Close"
                class={prefix + '-tabs-header-close'}
                onClick={() => {
                  visibleRef.value = false
                }}
              />
            </div>
          </div>
          <div class={prefix + '-tabs-body'}>{content}</div>
        </div>
      )
    }

    return () => {
      return (
        <div
          class={[
            prefix,
            {
              [`direction-${props.direction}`]: !!props.direction
            }
          ]}
        >
          <div class={prefix + '-tabs'}>
            {items.map((item, index) => {
              const takeTab = () => {
                if (item.href) {
                  return <a href={item.href}>{item.icon}</a>
                }
                return (
                  <IconWidget
                    tooltip={
                      props.showNavTitle
                        ? null
                        : {
                            content: <TextWidget>{item.title}</TextWidget>,
                            placement: props.direction === 'right' ? 'left' : 'right'
                          }
                    }
                    infer={item.icon}
                  />
                )
              }
              const shape = item.shape ?? 'tab'
              const Comp = shape === 'link' ? 'a' : 'div'
              return (
                <Comp
                  class={[
                    prefix + '-tabs-pane',
                    {
                      active: activeKeyRef.value === item.key
                    }
                  ]}
                  key={index}
                  href={item.href}
                  onClick={e => {
                    if (shape === 'tab') {
                      if (activeKeyRef.value === item.key) {
                        visibleRef.value = !visibleRef.value
                      } else {
                        visibleRef.value = true
                      }
                      if (!props?.activeKey || !props?.onChange) activeKeyRef.value = item.key
                    }
                    item.onClick?.(e)
                    emit.change?.(item.key)
                  }}
                >
                  {takeTab()}
                  {props.showNavTitle && item.title ? (
                    <div class={prefix + '-tabs-pane-title'}>
                      <TextWidget>{item.title}</TextWidget>
                    </div>
                  ) : null}
                </Comp>
              )
            })}
          </div>
          {renderContent()}
        </div>
      )
    }
  }
})

CompositePanel.Item = defineComponent({
  setup(props, { slots }) {
    return () => <FragmentComponent>{slots.default?.()}</FragmentComponent>
  }
})
