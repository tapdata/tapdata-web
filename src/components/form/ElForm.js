import { FormProvider, createForm } from '@formily/vue'
import { getComponentByTag } from './utils/util'

const ElFormComponent = getComponentByTag('el-form')

export const ElForm = {
  functional: true,
  render(h, context) {
    const {
      form = createForm({}),
      component = ElFormComponent,
      onAutoSubmit = context.listeners?.autoSubmit,
      ...props
    } = context.props
    const submitHandler = Array.isArray(onAutoSubmit) ? onAutoSubmit[0] : onAutoSubmit

    return h(FormProvider, { props: { form } }, [
      h(
        component,
        {
          ...context.data,
          props,
          nativeOn: {
            submit: e => {
              e?.stopPropagation?.()
              e?.preventDefault?.()
              form.submit(submitHandler)
            }
          }
        },
        context.children
      )
    ])
  }
}
