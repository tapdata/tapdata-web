<script lang="jsx">
import { defineComponent, Fragment, ref, Text } from 'vue'

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
  return nodes.flatMap((node) => {
    if (node.type === Fragment) {
      return flattenFragments(node.children)
    } else {
      return node
    }
  })
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
      default: 'svg',
    },
  },

  setup(props, { attrs, slots }) {
    const slotIcon = ref()

    return () => {
      const slotValue = slots.default?.()
      const size = convertToUnit(props.size)

      if (slotValue) {
        slotIcon.value = flattenFragments(slotValue)
          .find(
            (node) =>
              node.type === Text &&
              node.children &&
              typeof node.children === 'string',
          )
          ?.children?.trim()
      }

      const sizeData = size
        ? {
            fontSize: size,
            height: size,
            width: size,
          }
        : {}

      return (
        <span
          {...{
            class: [
              'v-icon',
              {
                'v-icon--disabled': props.disabled,
                'v-icon--link': !!attrs.onClick,
                'v-icon--dense': props.dense,
              },
            ],
            style: {
              ...sizeData,
              color: props.color,
              'caret-color': props.color,
            },
          }}
          disabled={!!attrs.onClick && props.disabled}
          role={attrs.onClick ? 'button' : undefined}
          aria-hidden={!attrs.onClick}
        >
          <svg
            {...{
              class: 'v-icon__svg',
              style: { ...sizeData },
              xmlns: 'http://www.w3.org/2000/svg',
              viewBox: '0 0 24 24',
              role: 'img',
              'aria-hidden': true,
            }}
          >
            <use xlink:href={`#icon-${slotIcon.value}`}></use>
          </svg>
        </span>
      )
    }
  },
})
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
  transition:
    0.3s cubic-bezier(0.25, 0.8, 0.5, 1),
    visibility 0s;
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
  transition:
    0.3s cubic-bezier(0.25, 0.8, 0.5, 1),
    visibility 0s;
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
