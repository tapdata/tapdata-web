import { createForm, Form as FormilyForm } from '@formily/core'
import { Form, SchemaField } from '@daas/form'
import { observer } from '@formily/reactive-vue'
import { reaction, observe, toJS } from '@formily/reactive'
import { IconWidget, NodePathWidget } from '../widgets'
import { SettingsFormContext, IconContext } from '../../context'
import { usePrefix, useSelected, useOperation, useCurrentNode, useWorkbench, useSelection } from '../../hooks'
import { useLocales } from './useLocales'
import { Empty } from 'element-ui'
import './styles.scss'
import {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onUpdated,
  provide,
  reactive,
  ref,
  watch
} from 'vue-demi'
import { requestIdle, cancelIdle, uid } from '@daas/shared'

const GlobalState = {
  idleRequest: null
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
  props: ['uploadAction', 'components', 'effects', 'scope', 'headers'],
  setup(props) {
    const instance = getCurrentInstance()
    const workbenchRef = useWorkbench()
    const prefixRef = usePrefix('settings-form')

    const currentWorkspace = workbenchRef.value?.activeWorkspace || workbenchRef.value?.currentWorkspace
    const currentWorkspaceId = currentWorkspace?.id

    const operationRef = useOperation(currentWorkspaceId)
    const nodeRef = useCurrentNode(currentWorkspaceId)
    const selectedRef = useSelected(currentWorkspaceId)
    const keyupRef = useKeyUp()
    const idleTaskRef = ref(null)

    const sources = reactive({
      key: nodeRef.value.id,
      schema: nodeRef.value?.designerProps?.propsSchema,
      isEmpty: !(nodeRef.value && nodeRef.value.designerProps?.propsSchema && selectedRef.value.length === 1)
    })

    // [node, node?.props, schema, operation, isEmpty]
    const formRef = ref()

    const requestIdleTask = () => {
      cancelIdle(idleTaskRef.value)
      idleTaskRef.value = requestIdle(() => {
        formRef.value = createForm({
          initialValues: nodeRef.value?.designerProps?.defaultProps,
          values: nodeRef.value?.props,
          effects(form) {
            useLocales(nodeRef.value)
            // useSnapshot(operationRef.value, keyupRef)
            props.effects?.(form)
          }
        })
        sources.key = nodeRef.value.id
        sources.schema = nodeRef.value?.designerProps?.propsSchema
        sources.isEmpty = !(nodeRef.value && nodeRef.value.designerProps?.propsSchema && selectedRef.value.length === 1)
      })
    }
    requestIdleTask()

    observe(nodeRef.value, change => {
      nextTick(() => {
        requestIdleTask()
      })
    })

    watch(selectedRef, change => {
      nextTick(() => {
        requestIdleTask()
      })
    })

    /*provide(
      SettingsFormSymbol,
      computed(() => props)
    )*/

    return () => {
      const prefix = prefixRef

      const render = () => {
        if (!sources.isEmpty && formRef.value) {
          return (
            <div class={prefix} key={sources.key}>
              <SettingsFormContext.Provider value={props}>
                <Form
                  key={uid()}
                  form={formRef.value}
                  colon={false}
                  labelWidth={120}
                  labelAlign="left"
                  wrapperAlign="right"
                  feedbackLayout="none"
                  tooltipLayout="text"
                >
                  <SchemaField
                    props={{
                      schema: sources.schema,
                      components: props.components,
                      scope: props.scope
                    }}
                  />
                </Form>
              </SettingsFormContext.Provider>
            </div>
          )
        }
        return (
          <div class={prefix + '-empty'}>
            <Empty />
          </div>
        )
      }

      return (
        <IconContext.Provider value={{ tooltip: true }}>
          <div class={prefix + '-wrapper'}>
            {!sources.isEmpty && <NodePathWidget workspaceId={currentWorkspaceId} />}
            <div class={prefix + '-content'}>{render()}</div>
          </div>
        </IconContext.Provider>
      )
    }
  }
})
