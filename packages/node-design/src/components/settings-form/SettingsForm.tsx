import { createForm } from '@formily/core'
import { observe } from '@formily/reactive'
import { Form, FormLayout, SchemaField } from '@tap/form'
import { cancelIdle, requestIdle } from '@tap/shared'
import { ElConfigProvider, ElEmpty as Empty } from 'element-plus'
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  provide,
  reactive,
  ref,
  shallowRef,
  watch,
} from 'vue'
import {
  useEffect,
  useOperation,
  usePrefix,
  useSelected,
  useSelectedNode,
  useWorkbench,
} from '../../hooks'
import { SettingsFormSymbol } from '../../shared/context'
import { IconWidget, NodePathWidget } from '../widgets'
import { useLocales } from './useLocales'
import './styles.scss'

// eslint-disable-next-line
const GlobalState = {
  idleRequest: null,
}
// className?: string
// style?: CSSProperties
// uploadAction?: string
// components?: Record<string, VueComponent<any>>
// effects?: (form: Form) => void
// scope?: any
function useKeyUp() {
  const keyboardRef = ref(false)

  const listener = () => {
    keyboardRef.value = true
  }
  window.addEventListener('keyup', listener)

  onBeforeUnmount(() => {
    window.removeEventListener('keyup', listener)
  })

  return keyboardRef
}
export const SettingsForm = defineComponent({
  name: 'DnSettingsForm',
  props: ['uploadAction', 'components', 'effects', 'scope', 'headers'],
  inheritAttrs: false,
  setup(props, { attrs }) {
    const workbenchRef = useWorkbench()
    const prefixRef = usePrefix('settings-form')

    const currentWorkspace =
      workbenchRef.value?.activeWorkspace ||
      workbenchRef.value?.currentWorkspace
    const currentWorkspaceId = currentWorkspace?.id

    const operationRef = useOperation(currentWorkspaceId)
    const nodeRef = useSelectedNode(currentWorkspaceId)
    const selectedRef = useSelected(currentWorkspaceId)
    const keyupRef = useKeyUp()
    const idleTaskRef = ref<number>()

    // [node, node?.props, schema, operation, isEmpty]
    const formRef = shallowRef()
    const sourceRef = shallowRef()

    useEffect(() => {
      idleTaskRef.value && cancelIdle(idleTaskRef.value)
      idleTaskRef.value = requestIdle(() => {
        sourceRef.value = {
          key: nodeRef.value.id,
          schema: nodeRef.value?.designerProps?.propsSchema,
          isEmpty:
            !nodeRef.value ||
            !nodeRef.value.designerProps?.propsSchema ||
            selectedRef.value.length !== 1,
        }
        formRef.value = createForm({
          initialValues: nodeRef.value?.designerProps?.defaultProps,
          values: nodeRef.value?.props,
          effects(form) {
            useLocales(nodeRef.value)
            props.effects?.(form)
          },
        })
      })
    }, [nodeRef, () => nodeRef.value?.props, operationRef])

    provide(
      SettingsFormSymbol,
      computed(() => props),
    )

    return () => {
      const node = nodeRef.value
      const prefix = prefixRef.value
      const source = sourceRef.value
      const render = () => {
        if (!source?.isEmpty && formRef.value) {
          return (
            <div class={[prefix]} key={source.key}>
              <Form key={formRef.value.id} form={formRef.value}>
                <FormLayout
                  labelCol={9}
                  wrapperCol={24}
                  colon={false}
                  // labelWidth='110px'
                  labelAlign="left"
                  wrapperAlign="right"
                  feedbackLayout="none"
                  tooltipLayout="text"
                >
                  <SchemaField
                    schema={source.schema}
                    components={props.components}
                    scope={{ $node: node, ...props.scope }}
                  />
                </FormLayout>
              </Form>
            </div>
          )
        }
        return (
          <div class={`${prefix}-empty`}>
            <Empty />
          </div>
        )
      }

      return (
        <IconWidget.Provider {...{ tooltip: true }}>
          <div class={`${prefix}-wrapper`} {...attrs}>
            {!source?.isEmpty && (
              <NodePathWidget workspaceId={currentWorkspaceId} />
            )}
            <div class={`${prefix}-content`}>{render()}</div>
          </div>
        </IconWidget.Provider>
      )
    }
  },
})
