import { createForm } from '@formily/core'
import { Form, SchemaField } from '@daas/form'
import { observer } from '@formily/reactive-vue'
import { usePrefix, useSelected, useOperation, useCurrentNode, useWorkbench, useSelection } from '../../hooks'
import { IconWidget, NodePathWidget } from '../widgets'
import { SettingsFormContext } from '../../context'
import { useLocales } from './useLocales'
import './styles.scss'
import { defineComponent, computed, reactive, toRef, ref, watch, watchEffect } from 'vue-demi'
import { requestIdle, cancelIdle } from '@daas/shared'
import { IconContext } from '../../context'

const GlobalState = {
  idleRequest: null
}

export const SettingsForm = observer(
  defineComponent({
    props: {
      effects: {},
      scope: {},
      components: Object
    },
    setup(props) {
      const prefix = usePrefix('settings-form')
      const workbench = useWorkbench()
      const currentWorkspace = workbench?.activeWorkspace || workbench?.currentWorkspace
      const currentWorkspaceId = currentWorkspace?.id
      const selection = useSelection()
      // const node = useCurrentNode(currentWorkspaceId)
      const nodeRef = useCurrentNode(currentWorkspaceId)
      // const schema = nodeRef.value?.designerProps?.propsSchema
      const isEmpty = !(nodeRef.value && nodeRef.value.designerProps?.propsSchema && selection.selected.length === 1)

      const form = computed(() => {
        console.log('computed.form')
        return createForm({
          initialValues: nodeRef.value?.designerProps?.defaultProps,
          values: nodeRef.value?.props,
          effects(form) {
            useLocales(nodeRef.value)
            props.effects?.(form)
          }
        })
      })

      const schema = computed(() => {
        return nodeRef.value?.designerProps?.propsSchema
      })

      const render = () => {
        console.log(';schema', schema, nodeRef.value)
        if (!isEmpty) {
          return (
            <div class={prefix} key={nodeRef.value.id}>
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
                  <SchemaField
                    schema={schema.value}
                    components={props.components}
                    scope={{ $node: nodeRef.value, ...props.scope }}
                  />
                </Form>
              </SettingsFormContext.Provider>
            </div>
          )
        }
        return <div class={prefix + '-empty'}>空空如也</div>
      }

      return () => {
        console.log('SettingsForm.inner')
        return (
          <IconContext.Provider value={{ tooltip: true }}>
            <div class={prefix + '-wrapper'}>
              {!isEmpty && <NodePathWidget workspaceId={currentWorkspaceId} />}
              {<div class={prefix + '-content'}>{render()}</div>}
            </div>
          </IconContext.Provider>
        )
        // return <div>{selection.selected}</div>
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

export const SettingsForm1 = observer(
  defineComponent({
    props: {
      components: Object
    },
    setup(props) {
      console.log('SettingsForm')
      const workbench = useWorkbench()
      const currentWorkspace = workbench?.activeWorkspace || workbench?.currentWorkspace
      const currentWorkspaceId = currentWorkspace?.id
      const operation = useOperation(currentWorkspaceId)
      const node = useCurrentNode(currentWorkspaceId)
      const selected = useSelected(currentWorkspaceId)
      const prefix = usePrefix('settings-form')

      const form = computed(() => {
        return createForm({
          initialValues: nodeRef.value?.designerProps?.defaultProps,
          values: nodeRef.value?.props,
          effects(form) {
            useLocales(node)
            props.effects?.(form)
          }
        })
      })

      return () => {
        console.log('****SettingsForm****', operation, selected)
        const schema = nodeRef.value?.designerProps?.propsSchema
        const isEmpty = !(node && node.designerProps?.propsSchema && selected.length === 1)
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
                    <SchemaField
                      schema={schema}
                      components={props.components}
                      scope={{ $node: node, ...props.scope }}
                    />
                  </Form>
                </SettingsFormContext.Provider>
              </div>
            )
          }
          return <div class={prefix + '-empty'}>空空如也</div>
        }
        console.log('currentWorkspace---Form', currentWorkspace, node)
        return (
          <IconContext.Provider value={{ tooltip: true }}>
            <div class={prefix + '-wrapper'}>
              {!isEmpty && <NodePathWidget workspaceId={currentWorkspaceId} />}
              <div class={prefix + '-content'}>{render()}</div>
            </div>
          </IconContext.Provider>
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
