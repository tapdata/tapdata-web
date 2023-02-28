<script>
import * as Vue from 'vue'

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

<style lang="scss">
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
.v-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 1em;
  height: 1em;
  font-feature-settings: 'liga';
  font-size: 1em;
  justify-content: center;
  letter-spacing: normal;
  line-height: 1;
  text-indent: 0;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1), visibility 0s;
  vertical-align: middle;
  user-select: none;

  &__svg {
    fill: currentColor;
    width: 1em;
    height: 1em;
  }
}
.v-icon--link {
  cursor: pointer;
}
.v-icon--disabled {
  pointer-events: none;
}
</style>
