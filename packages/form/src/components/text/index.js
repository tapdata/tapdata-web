import { defineComponent } from 'vue'

export const Text = defineComponent({
  name: 'FText',
  props: ['content', 'className', 'contentStyle', 'icon', 'iconClass'],
  setup(props) {
    return () => {
      const content = props.content
      const className = props.className
      const icon = props.icon
      const iconClass = props.iconClass || 'color-primary mr-2 fs-7'
      const style = Object.assign(
        {
          'white-space': 'pre',
          color: '#535f72'
        },
        props.contentStyle || {}
      )
      return (
        <div className={className} style={style}>
          {icon && <i class={'el-icon-' + icon + ' ' + iconClass}></i>}
          {content}
        </div>
      )
    }
  }
})

export default Text
