import { createForm } from '@formily/core'
import { Form, SchemaField } from '@daas/form'
import { observer } from '@formily/reactive-vue'
import { usePrefix, useSelected, useOperation, useCurrentNode, useWorkbench } from '../../hooks'
import { IconWidget, NodePathWidget } from '../../widgets'
import { SettingsFormContext } from '../../context'
import { useLocales } from './useLocales'
import './styles.scss'
import { defineComponent, computed } from 'vue-demi'

export const SettingsForm = observer(
  defineComponent({
    setup: props => {
      const workbench = useWorkbench()
      const currentWorkspace = workbench?.activeWorkspace || workbench?.currentWorkspace
      const currentWorkspaceId = currentWorkspace?.id
      const operation = useOperation(currentWorkspaceId)
      const node = useCurrentNode(currentWorkspaceId)
      const selected = useSelected(currentWorkspaceId)
      const prefix = usePrefix('settings-form')
      const schema = node?.designerProps?.propsSchema
      const isEmpty = !(node && node.designerProps?.propsSchema && selected.length === 1)
      const form = computed(() => {
        return createForm({
          initialValues: node?.designerProps?.defaultProps,
          values: node?.props,
          effects(form) {
            useLocales(node)
            props.effects?.(form)
          }
        })
      })
      // }, [node, node?.props, schema, operation, isEmpty])

      const render = () => {
        if (!isEmpty) {
          return (
            <div class={prefix} key={node.id}>
              <SettingsFormContext.Provider value={props}>
                <Form
                  form={form}
                  colon={false}
                  labelWidth={120}
                  labelAlign="left"
                  wrapperAlign="right"
                  feedbackLayout="none"
                  tooltipLayout="text"
                >
                  <SchemaField schema={schema} components={props.components} scope={{ $node: node, ...props.scope }} />
                </Form>
              </SettingsFormContext.Provider>
            </div>
          )
        }
        return <div class={prefix + '-empty'}>空空如也</div>
      }

      return () => (
        // <IconWidget.Provider tooltip>
        <div class={prefix + '-wrapper'}>
          {!isEmpty && <NodePathWidget workspaceId={currentWorkspaceId} />}
          <div class={prefix + '-content'}>{render()}</div>
        </div>
        // </IconWidget.Provider>
      )
    }
  }) /*,
  {
    scheduler: update => {
      cancelIdle(GlobalState.idleRequest)
      GlobalState.idleRequest = requestIdle(update, {
        timeout: 500
      })
    }
  }*/
)
