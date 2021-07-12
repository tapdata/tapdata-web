import {
  defineComponent,
  provide,
  ref,
  onMounted,
  onBeforeUnmount,
  inject
} from 'vue-demi'
import { isValid, isNum, isBool, isEqual } from '@formily/shared'
import { h } from '@formily/vue'
import ResizeObserver from 'resize-observer-polyfill'

const stylePrefix = ''
const FormGridSymbol = Symbol('FormGridContext')
const S = 720
const MD = 1280
const LG = 1920

const getStyle = props => {
  const { columnGap, rowGap, layoutParams, ref: $ref } = props
  // const max = layoutParams.maxWidth ? `${layoutParams.maxWidth}px` : '1fr';
  const { clientWidth, minWidth, maxColumns, minColumns } = layoutParams
  const getMinMax = (minWidth, maxWidth) => {
    let minmax
    if (minWidth === Infinity) {
      if (!isValid(maxWidth)) {
        minmax = '1fr'
      } else {
        minmax = `minmax(0px,${maxWidth}px)`
      }
    } else {
      minmax = `minmax(${minWidth}px,${
        isValid(maxWidth) ? `${maxWidth}px` : '1fr'
      })`
    }
    return minmax
  }

  const spans = Array.from($ref.value?.childNodes || []).reduce((buf, cur) => {
    const node = cur
    const dataSpan = node.getAttribute?.('data-span')
    const span =
      typeof maxColumns !== 'undefined'
        ? Math.min((dataSpan && Number(dataSpan)) || 1, maxColumns)
        : (dataSpan && Number(dataSpan)) || 1
    return buf + Number(span)
  }, 0)

  const calc = Math.floor((clientWidth + columnGap) / (minWidth + columnGap))
  let finalColumns
  finalColumns = Math.min(spans, calc)
  if (maxColumns !== undefined) {
    finalColumns = Math.min(spans, calc, maxColumns)
  } else {
    finalColumns = Math.min(spans, calc)
  }

  if (isValid(minColumns)) {
    if (finalColumns < minColumns) {
      finalColumns = minColumns
    }
  }

  const style = {
    gridTemplateColumns: `repeat(${finalColumns}, ${getMinMax(
      layoutParams.minWidth,
      layoutParams.maxWidth
    )})`,
    gridGap: `${rowGap}px ${columnGap}px`
  }
  return style
}

const useLayout = props => {
  const {
    intervals,
    minColumns,
    maxColumns,
    minWidth,
    maxWidth,
    colWrap,
    columnGap,
    rowGap
  } = props
  const $ref = ref()
  const layoutParams = ref({})
  const styles = ref({})

  const calculateSmartColumns = target => {
    const { clientWidth } = target
    const index = intervals.findIndex(interval => {
      const [min, max] = interval
      if (clientWidth >= min && max > clientWidth) {
        return true
      }
    })
    if (!isValid(maxWidth) && !isValid(maxColumns)) {
      return {
        minWidth: isValid(minWidth)
          ? minWidth[index]
          : isValid(maxColumns[index])
          ? Math.floor(
              (clientWidth - (maxColumns[index] - 1) * props.columnGap) /
                maxColumns[index]
            )
          : 0,
        maxWidth: isValid(maxWidth)
          ? maxWidth[index]
          : Infinity ===
            Math.floor(
              (clientWidth - (minColumns[index] - 1) * props.columnGap) /
                minColumns[index]
            )
          ? clientWidth
          : Math.floor(
              (clientWidth - (minColumns[index] - 1) * props.columnGap) /
                minColumns[index]
            ),
        columns: target.childNodes.length,
        colWrap: colWrap[index],
        minColumns: minColumns ? minColumns[index] : 1,
        maxColumns: maxColumns ? maxColumns[index] : undefined,
        clientWidth
      }
    } else {
      // maxWidth 优先级 高于maxColumns
      // const minWidthUnderMinColumns = (clientWidth - (maxColumns[index] - 1) * props.columnGap) / maxColumns[index]
      return {
        maxWidth: isValid(maxWidth)
          ? maxWidth[index]
          : Infinity ===
            Math.floor(
              (clientWidth - (minColumns[index] - 1) * props.columnGap) /
                minColumns[index]
            )
          ? clientWidth
          : Math.floor(
              (clientWidth - (minColumns[index] - 1) * props.columnGap) /
                minColumns[index]
            ),
        minWidth: isValid(minWidth)
          ? minWidth[index]
          : isValid(maxColumns[index])
          ? Math.floor(
              (clientWidth - (maxColumns[index] - 1) * props.columnGap) /
                maxColumns[index]
            )
          : 0,
        minColumns: minColumns ? minColumns[index] : 1,
        maxColumns: maxColumns ? maxColumns[index] : undefined,
        columns: target.childNodes.length,
        colWrap: colWrap[index],
        clientWidth
      }
    }
  }

  onMounted(() => {
    const observer = () => {
      if ($ref.value) {
        const params = calculateSmartColumns($ref.value)
        layoutParams.value = params
        const style = getStyle({
          columnGap,
          rowGap,
          layoutParams: params,
          ref: $ref
        })
        if (!isEqual(style, styles)) {
          styles.value = style
        }
      }
    }
    const resizeObserver = new ResizeObserver(observer)
    const mutationObserver = new MutationObserver(observer)
    if ($ref.value) {
      resizeObserver.observe($ref.value)
      mutationObserver.observe($ref.value, {
        childList: true
      })
    }

    onBeforeUnmount(() => {
      if ($ref.value) {
        resizeObserver.unobserve($ref.value)
      }
      mutationObserver.disconnect()
    })
  })

  return {
    ref: $ref,
    layoutParams: layoutParams,
    styles: styles
  }
}

const useGridSpan = gridSpan => {
  const params = inject(FormGridSymbol)
  if (!isValid(params)) {
    return gridSpan
  }
  const {
    colWrap,
    columns = 0,
    clientWidth,
    minWidth,
    columnGap,
    maxColumns
  } = params
  const calc = Math.floor((clientWidth + columnGap) / (minWidth + columnGap)) // 算出实际一行最多能塞进的格子数
  if (colWrap === true) {
    if (Math.min(calc, columns) >= gridSpan) {
      if (maxColumns !== undefined) {
        return Math.min(gridSpan, maxColumns)
      }
      return gridSpan
    } else {
      if (maxColumns !== undefined) {
        return Math.min(calc, columns, maxColumns)
      }
      return Math.min(calc, columns)
    }
  } else {
    if (Math.min(calc, columns) >= gridSpan) {
      if (maxColumns !== undefined) {
        return Math.min(gridSpan, maxColumns)
      }
      return gridSpan
    } else {
      if (maxColumns !== undefined) {
        return Math.min(calc, columns, maxColumns)
      }
      return Math.min(calc, columns)
    }
  }
}

export const FormGrid = defineComponent({
  name: 'FormilyFormGrid',
  props: {
    columnGap: {
      type: Number,
      default: 10
    },
    rowGap: {
      type: Number,
      default: 5
    },
    minColumns: {
      type: [Number, Array],
      default: 0
    },
    minWidth: {
      type: [Number, Array],
      default: 100
    },
    maxColumns: {
      type: [Number, Array]
    },
    maxWidth: {
      type: [Number, Array]
    },
    breakpoints: {
      type: Array,
      default: () => [S, MD, LG]
    },
    colWrap: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const normalizeProps = props => {
      const { breakpoints = [] } = props

      const intervals = breakpoints.reduce((buf, cur, index, array) => {
        if (index === array.length - 1) {
          return [...buf, [array[index], Infinity]]
        }
        if (index === 0) {
          return [...buf, [0, cur], [cur, array[index + 1]]]
        }
        return [...buf, [cur, array[index + 1]]]
      }, [])

      const normalize = prop => {
        if (isNum(prop) || isBool(prop)) {
          return intervals.map(() => prop)
        } else if (Array.isArray(prop)) {
          let lastVal
          return intervals.map((it, idx) => {
            const res = isValid(prop[idx]) ? prop[idx] : lastVal
            lastVal = isValid(prop[idx]) ? prop[idx] : lastVal
            return res
          })
        } else {
          return undefined
        }
      }

      return {
        ...props,
        intervals,
        colWrap: normalize(props.colWrap),
        minWidth: normalize(props.minWidth),
        maxWidth: normalize(props.maxWidth),
        minColumns: normalize(props.minColumns),
        maxColumns: normalize(props.maxColumns)
      }
    }
    const normalizedProps = normalizeProps(props)
    const {
      ref: layoutRef,
      layoutParams,
      styles: styleRef
    } = useLayout(normalizedProps)
    provide(FormGridSymbol, {
      columnGap: props.columnGap,
      ...layoutParams.value
    })

    return {
      layoutRef,
      styleRef
    }
  },
  render() {
    const styleRef = this.styleRef

    return h(
      'div',
      {
        attrs: {
          class: `${stylePrefix}-form-grid`
        },
        style: styleRef,
        ref: 'layoutRef'
      },
      {
        default: () => this.$slots.default
      }
    )
  }
})

export const FormGridColumn = defineComponent({
  props: {
    gridSpan: {
      type: Number,
      default: 1
    }
  },
  render(h) {
    const span = useGridSpan(this.gridSpan)
    console.log('this.$slots', this.$slots)
    return h(
      'div',
      {
        style: { gridColumnStart: `span ${span}` },
        attrs: {
          'data-span': span || 1
        }
      },
      this.$slots
    )
  }
})
