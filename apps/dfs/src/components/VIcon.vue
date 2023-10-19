<script lang="jsx">
import { defineComponent, ref, Fragment } from 'vue'

function convertToUnit(str, unit = 'px') {
  if (str == null || str === '') {
    return undefined
  } else if (isNaN(+str)) {
    return String(str)
  } else {
    return `${Number(str)}${unit}`
  }
}

function flattenFragments(nodes) {
  return nodes
    .map(node => {
      if (node.type === Fragment) {
        return flattenFragments(node.children)
      } else {
        return node
      }
    })
    .flat()
}

export default defineComponent({
  name: 'VIcon',

  props: {
    disabled: Boolean,
    size: [Number, String],
    color: String,
    large: Boolean,
    small: Boolean,
    xLarge: Boolean,
    xSmall: Boolean,
    tag: {
      type: String,
      required: false,
      default: 'svg'
    }
  },

  setup(props, { attrs, slots }) {
    const slotIcon = ref()

    return () => {
      const slotValue = slots.default?.()
      if (slotValue) {
        slotIcon.value = flattenFragments(slotValue).filter(
          node => node.type === Text && node.children && typeof node.children === 'string'
        )[0]?.children
      }

      return (
        <svg
          {...{
            staticClass: 'iconfont',
            class: {
              'v-icon--disabled': props.disabled,
              'v-icon--link': !!attrs.onClick,
              'v-icon--dense': props.dense
            },
            style: props.size
              ? {
                  fontSize: props.size,
                  height: props.size,
                  width: props.size,
                  color: props.color
                }
              : { color: props.color }
          }}
          disabled={!!attrs.onClick && props.disabled}
          role={attrs.onClick ? 'button' : undefined}
          aria-hidden={!attrs.onClick}
        >
          <use xlink:href={`#icon-${slotIcon.value}`}></use>
        </svg>
      )
    }
  }
})

/*import * as Vue from 'vue'

const SIZE_MAP = {
  xSmall: '12px',
  small: '16px',
  default: '24px',
  medium: '28px',
  large: '36px',
  xLarge: '40px'
}

function convertToUnit(str, unit = 'px') {
  if (str == null || str === '') {
    return undefined
  } else if (isNaN(+str)) {
    return String(str)
  } else {
    return `${Number(str)}${unit}`
  }
}

const VIcon = function render(_props, _context) {
  const context = {
    ..._context,
    props: _props,
    data: _context.attr,
    children: _context.slots
  }
  const icon = this.getIcon()
  if (this.tag === 'svg') {
    return this.renderSvgIcon(icon, Vue.h)
  }
  const data = this.getDefaultData()
  data.class[icon] = true
  const fontSize = this.getSize()
  if (fontSize) data.style = { fontSize, color: this.color }
  return Vue.h(this.tag, data)
}

export default function render(_props, { attrs, slots }) {
  console.log('slots', slots.default())

  const context = {
    ..._context,
    props: _props,
    data: _context.attr,
    children: _context.slots
  }
  const { data, children } = context
  let iconName = ''

  // 支持 v-text 和 v-html
  if (data.domProps) {
    iconName = data.domProps.textContent || data.domProps.innerHTML || iconName
    delete data.domProps.textContent
    delete data.domProps.innerHTML
  }

  return Vue.h(VIcon, data, iconName ? [iconName] : children)
}*/
</script>

<style scoped>
.iconfont {
  font-family: 'iconfont', sans-serif;
  font-size: 16px;
  font-style: normal;
  line-height: 1em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

svg.iconfont {
  width: 1em !important;
  height: 1em !important;
  vertical-align: -0.15em !important;
  fill: currentColor;
  overflow: hidden;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1), visibility 0s;
}

.v-icon--link {
  cursor: pointer;
}

.v-icon--disabled {
  pointer-events: none;
}
</style>
