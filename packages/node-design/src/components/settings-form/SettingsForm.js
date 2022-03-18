import { createForm } from '@formily/core'
import { Form, SchemaField } from '@daas/form'
import { observe } from '@formily/reactive'
import { NodePathWidget } from '../widgets'
import { SettingsFormContext, IconContext } from '../../context'
import { usePrefix, useSelected, useCurrentNode, useWorkbench } from '../../hooks'
import { useLocales } from './useLocales'
import { Empty } from 'element-ui'
import './styles.scss'
import { defineComponent, nextTick, reactive, ref, watch } from 'vue-demi'
import { requestIdle, cancelIdle, uid } from '@daas/shared'

export const SettingsForm = defineComponent({
  props: ['uploadAction', 'components', 'effects', 'scope', 'headers'],
  setup(props) {
    const workbenchRef = useWorkbench()
    const prefixRef = usePrefix('settings-form')

    const currentWorkspace = workbenchRef.value?.activeWorkspace || workbenchRef.value?.currentWorkspace
    const currentWorkspaceId = currentWorkspace?.id

    const nodeRef = useCurrentNode(currentWorkspaceId)
    const selectedRef = useSelected(currentWorkspaceId)
    const idleTaskRef = ref(null)

    const sources = reactive({
      key: nodeRef.value.id,
      schema: nodeRef.value?.designerProps?.propsSchema,
      isEmpty: !(nodeRef.value && nodeRef.value.designerProps?.propsSchema && selectedRef.value.length === 1)
    })

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

    observe(nodeRef.value, () => {
      nextTick(() => {
        requestIdleTask()
      })
    })

    watch(selectedRef, () => {
      nextTick(() => {
        requestIdleTask()
      })
    })

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
