<script lang="tsx">
import { getNodeIconSrc } from '@tap/business/src/shared/task'

export default function render(_props, { attrs }) {
  const props = {
    ..._props,
    ...attrs,
    src: getNodeIconSrc(_props.node),
  }

  if (props.size) {
    props.style = {
      width: `${props.size}px`,
      height: `${props.size}px`,
    }
  }

  return props.src ? (
    <ElImage {...props}></ElImage>
  ) : (
    <div class="inline-block" {...props}></div>
  )
}
</script>
