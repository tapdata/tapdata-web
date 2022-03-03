import { createForm } from '@formily/core'
import { Form, SchemaField } from '@daas/form'
import { observer } from '@formily/reactive-vue'
import { usePrefix, useSelected, useOperation, useCurrentNode, useWorkbench } from '../../hooks'
import { IconWidget, NodePathWidget } from '../../widgets'
import { SettingsFormContext } from '../../context'
import { useLocales } from './useLocales'
import './styles.scss'
import { defineComponent, computed, reactive, toRef, ref, watch, watchEffect } from 'vue-demi'
import { requestIdle, cancelIdle } from '@daas/shared'

const GlobalState = {
  idleRequest: null
}

export const SettingsForm = observer(
  defineComponent({
    props: {
      components: Object
    },
    setup: props => {
      console.log('SettingsForm')
      const workbench = useWorkbench()
      const currentWorkspace = workbench?.activeWorkspace || workbench?.currentWorkspace
      const currentWorkspaceId = currentWorkspace?.id
      const operation = useOperation(currentWorkspaceId)
      const node = useCurrentNode(currentWorkspaceId)
      let selected = useSelected(currentWorkspaceId)
      const prefix = usePrefix('settings-form')
      const schema = node?.designerProps?.propsSchema
      const isEmpty = !(node && node.designerProps?.propsSchema && selected.length === 1)

      currentWorkspace.operation.selection.selected = ['seif']

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

      return () => {
        console.log('currentWorkspace---Form', currentWorkspace)
        return (
          <div class={prefix + '-wrapper'}>
            {!isEmpty && <NodePathWidget workspaceId={currentWorkspaceId} />}
            <div class={prefix + '-content'}>{render()}</div>
          </div>
        )
      }
    }
  }),
  {
    scheduler: update => {
      cancelIdle(GlobalState.idleRequest)
      GlobalState.idleRequest = requestIdle(update, {
        timeout: 500
      })
    }
  }
)
