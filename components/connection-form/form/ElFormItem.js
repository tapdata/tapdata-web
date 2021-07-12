import { isVoidField } from '@formily/core'
import { connect, createForm, FormProvider, mapProps } from '@formily/vue'
import { getComponentByTag } from './utils/util'

const ElFormItemComponent = getComponentByTag('el-form-item')

export const ElFormItem = connect(
  {
    functional: true,
    render(h, context) {
      const { props } = context
      if ('asterisk' in props) {
        props.required = props.asterisk
      }
      return h(ElFormItemComponent, { props }, context.children)
    }
  },
  mapProps({ title: 'label', required: true }, (props, field) => ({
    error: !isVoidField(field)
      ? field.errors.length
        ? field.errors.join('，')
        : undefined
      : undefined
  }))
)
