import { computed, defineComponent, inject, ref, toRaw, unref, watch } from 'vue'
import { get } from 'lodash-es'
import { isObject, isUndefined } from 'element-plus/es/utils/index.mjs'
import { DynamicSizeList, FixedSizeList } from 'element-plus/es/components/virtual-list/index.mjs'
import { useNamespace, EVENT_CODE } from 'element-plus'
import GroupItem from 'element-plus/es/components/select-v2/src/group-item.mjs'
import OptionItem from 'element-plus/es/components/select-v2/src/option-item.mjs'
import { useProps } from 'element-plus/es/components/select-v2/src/useProps'

import { selectV2InjectionKey } from 'element-plus/es/components/select-v2/src/token'

import type { ItemProps } from 'element-plus/es/components/virtual-list'
import type { Option, OptionItemProps } from 'element-plus/es/components/select-v2/src/select.types'

export default defineComponent({
  name: 'ElSelectDropdown',

  props: {
    data: {
      type: Array,
      required: true,
    },
    hoveringIndex: Number,
    width: Number,
  },
  setup(props, { slots, expose }) {
    const select = inject(selectV2InjectionKey)!
    const ns = useNamespace('select')
    const { getLabel, getValue, getDisabled } = useProps(select.props)

    const cachedHeights = ref<Array<number>>([])

    const listRef = ref()

    const size = computed(() => props.data.length)
    watch(
      () => size.value,
      () => {
        select.popper.value.updatePopper?.()
      },
    )

    const isSized = computed(() => isUndefined(select.props.estimatedOptionHeight))
    const listProps = computed(() => {
      if (isSized.value) {
        return {
          itemSize: select.props.itemHeight,
        }
      }

      return {
        estimatedSize: select.props.estimatedOptionHeight,
        itemSize: (idx: number) => cachedHeights.value[idx],
      }
    })

    const contains = (arr: Array<any> = [], target: any) => {
      const {
        props: { valueKey },
      } = select

      if (!isObject(target)) {
        return arr.includes(target)
      }

      return (
        arr &&
        arr.some((item) => {
          return toRaw(get(item, valueKey)) === get(target, valueKey)
        })
      )
    }
    const isEqual = (selected: unknown, target: unknown) => {
      if (!isObject(target)) {
        return selected === target
      } else {
        const { valueKey } = select.props
        return get(selected, valueKey) === get(target, valueKey)
      }
    }

    const isItemSelected = (modelValue: any[] | any, target: Option) => {
      if (select.props.multiple) {
        return contains(modelValue, getValue(target))
      }
      return isEqual(modelValue, getValue(target))
    }

    const isItemDisabled = (modelValue: any[] | any, selected: boolean) => {
      const { disabled, multiple, multipleLimit } = select.props
      return disabled || (!selected && (multiple ? multipleLimit > 0 && modelValue.length >= multipleLimit : false))
    }

    const isItemHovering = (target: number) => props.hoveringIndex === target

    const scrollToItem = (index: number) => {
      const list = listRef.value as any
      if (list) {
        list.scrollToItem(index)
      }
    }

    const resetScrollTop = () => {
      const list = listRef.value as any
      if (list) {
        list.resetScrollTop()
      }
    }

    expose({
      listRef,
      isSized,

      isItemDisabled,
      isItemHovering,
      isItemSelected,
      scrollToItem,
      resetScrollTop,
    })

    const Item = (itemProps: ItemProps<any>) => {
      const { index, data, style } = itemProps
      const sized = unref(isSized)
      const { itemSize, estimatedSize } = unref(listProps)
      const { modelValue } = select.props
      const { onSelect, onHover } = select
      const item = data[index]
      if (item.type === 'Group') {
        return <GroupItem item={item} style={style} height={(sized ? itemSize : estimatedSize) as number} />
      }

      const isSelected = isItemSelected(modelValue, item)
      const isDisabled = isItemDisabled(modelValue, isSelected)
      const isHovering = isItemHovering(index)
      return (
        <OptionItem
          {...itemProps}
          selected={isSelected}
          disabled={getDisabled(item) || isDisabled}
          created={!!item.created}
          hovering={isHovering}
          item={item}
          onSelect={onSelect}
          onHover={onHover}
        >
          {{
            default: (props: OptionItemProps) => slots.default?.(props) || <span>{getLabel(item)}</span>,
          }}
        </OptionItem>
      )
    }

    // computed
    const { onKeyboardNavigate, onKeyboardSelect } = select

    const onForward = () => {
      onKeyboardNavigate('forward')
    }

    const onBackward = () => {
      onKeyboardNavigate('backward')
    }

    const onEscOrTab = () => {
      select.expanded = false
    }

    const onKeydown = (e: KeyboardEvent) => {
      const { code } = e
      const { tab, esc, down, up, enter } = EVENT_CODE
      if (code !== tab) {
        e.preventDefault()
        e.stopPropagation()
      }

      switch (code) {
        case tab:
        case esc: {
          onEscOrTab()
          break
        }
        case down: {
          onForward()
          break
        }
        case up: {
          onBackward()
          break
        }
        case enter: {
          onKeyboardSelect()
          break
        }
      }
    }

    return () => {
      const { data, width } = props
      const { height, multiple, scrollbarAlwaysOn } = select.props

      if (data.length === 0) {
        return select.props.filterable ? (
          <div class={[ns.b('dropdown'), ns.is('multiple', multiple)]}>
            {slots.header?.()}
            {slots.empty?.()}
          </div>
        ) : (
          <div
            class={ns.b('dropdown')}
            style={{
              width: `${width}px`,
            }}
          >
            {slots.empty?.()}
          </div>
        )
      }

      const List = unref(isSized) ? FixedSizeList : DynamicSizeList

      return (
        <div class={[ns.b('dropdown'), ns.is('multiple', multiple)]}>
          {slots.header?.()}
          <List
            ref={listRef}
            {...unref(listProps)}
            className={ns.be('dropdown', 'list')}
            scrollbarAlwaysOn={scrollbarAlwaysOn}
            data={data}
            height={height}
            width={width}
            total={data.length}
            // @ts-ignore - dts problem
            onKeydown={onKeydown}
          >
            {{
              default: (props: ItemProps<any>) => <Item {...props} />,
            }}
          </List>
          {slots.footer?.()}
        </div>
      )
    }
  },
})
