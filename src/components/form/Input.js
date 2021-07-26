import { connect, mapProps } from '@formily/vue'

const ElInput = {
  functional: true,
  render(h, context) {
    const data = context.data
    const append = data.attrs?.append
    data.on.input = context.listeners.change
    if (append) {
      context.children.push(h('template', { slot: 'append' }, append))
      delete data.attrs.append
    }
    return h('el-input', data, context.children)
    // return <ElInput scopedSlots={{ append: () => <div>xsss</div> }}></ElInput>
    /*return (
      <ElInput>
        <template slot="append">xxx</template>
      </ElInput>
    )*/
  }
}

export const Input = connect(ElInput, mapProps({ readOnly: 'readonly' }))
