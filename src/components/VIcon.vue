<script>
import bindsAttrs from '@/mixins/bindsAttrs'

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

const VIcon = {
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

  mixins: [bindsAttrs],

  computed: {
    hasClickListener() {
      return Boolean(this.listeners$.click || this.listeners$['!click'])
    }
  },

  methods: {
    getIcon() {
      let iconName = ''
      if (this.$slots.default) iconName = this.$slots.default[0].text.trim()

      return `icon-${iconName}`
    },

    getSize() {
      const sizes = {
        xSmall: this.xSmall,
        small: this.small,
        medium: this.medium,
        large: this.large,
        xLarge: this.xLarge
      }

      const explicitSize = Object.keys(sizes).find(key => sizes[key])

      return (explicitSize && SIZE_MAP[explicitSize]) || convertToUnit(this.size)
    },

    getDefaultData() {
      return {
        staticClass: 'iconfont',
        class: {
          'v-icon--disabled': this.disabled,
          'v-icon--link': this.hasClickListener,
          'v-icon--dense': this.dense
        },
        attrs: {
          'aria-hidden': !this.hasClickListener,
          disabled: this.hasClickListener && this.disabled,
          type: this.hasClickListener ? 'button' : undefined,
          ...this.attrs$
        },
        on: this.listeners$
      }
    },

    getSvgWrapperData() {
      const fontSize = this.getSize()
      const wrapperData = {
        ...this.getDefaultData(),
        style: fontSize
          ? {
              fontSize,
              height: fontSize,
              width: fontSize,
              color: this.color
            }
          : { color: this.color }
      }

      return wrapperData
    },

    renderSvgIcon(icon, h) {
      return h('svg', this.getSvgWrapperData(), [
        h('use', {
          attrs: {
            'xlink:href': `#${icon}`
          }
        })
      ])
    }
  },

  render(h) {
    const icon = this.getIcon()
    if (this.tag === 'svg') {
      return this.renderSvgIcon(icon, h)
    }
    const data = this.getDefaultData()
    data.class[icon] = true
    const fontSize = this.getSize()
    if (fontSize) data.style = { fontSize, color: this.color }
    return h(this.tag, data)
  }
}

export default {
  name: 'VIcon',

  functional: true,

  render(h, { data, children }) {
    let iconName = ''

    // 支持 v-text 和 v-html
    if (data.domProps) {
      iconName = data.domProps.textContent || data.domProps.innerHTML || iconName
      delete data.domProps.textContent
      delete data.domProps.innerHTML
    }

    return h(VIcon, data, iconName ? [iconName] : children)
  }
}
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
