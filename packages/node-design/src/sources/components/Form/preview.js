import { createBehavior, createResource } from '../../../core'
import { createForm } from '@formily/core'
import { observer } from '@formily/reactive-vue'
import { Form as BaseForm } from '@tap/form'
import { usePrefix } from '../../../hooks'
import { AllSchemas } from '../../schemas'
import { AllLocales } from '../../locales'
import { defineComponent, computed } from 'vue'
import './styles.scss'

export const Form = observer(
  defineComponent({
    setup: (props, { attrs, slots }) => {
      const prefix = usePrefix('designable-form')
      const form = computed(() =>
        createForm({
          designable: true,
        })
      )

      return () => (
        <BaseForm {...{ attrs: { ...attrs } }} class={prefix} form={form}>
          {slots.default?.()}
        </BaseForm>
      )
    },
  })
)

Form.Behavior = createBehavior({
  name: 'Form',
  selector: (node) => node.componentName === 'Form',
  designerProps(node) {
    return {
      draggable: !node.isRoot,
      cloneable: !node.isRoot,
      deletable: !node.isRoot,
      droppable: true,
      propsSchema: AllSchemas.Form,
      // propsSchema: {
      //   type: 'object',
      //   properties: {
      //     ...AllSchemas.FormLayout.properties,
      //     style: AllSchemas.CSSStyle
      //   }
      // },
      defaultProps: {
        colon: false,
        shallow: false,
        layout: 'vertical',
        feedbackLayout: 'terse',
        style: {
          padding: '16px',
        },
      },
    }
  },
  designerLocales: AllLocales.Form,
})

Form.Resource = createResource({
  title: { 'zh-CN': '表单', 'en-US': 'Form' },
  icon: 'FormLayoutSource',
  elements: [
    {
      componentName: 'Field',
      props: {
        type: 'object',
        'x-component': 'Form',
      },
    },
  ],
})
