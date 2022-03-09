import { createForm } from '@formily/core'
import { Form, SchemaField } from '@daas/form'
import { observe } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import { usePrefix, useSelected, useOperation, useCurrentNode, useWorkbench, useSelection } from '../../hooks'
import { IconWidget, NodePathWidget } from '../widgets'
import { SettingsFormContext } from '../../context'
import { useLocales } from './useLocales'
import './styles.scss'
import { defineComponent, computed, reactive, toRef, ref, watch, watchEffect, nextTick } from 'vue-demi'
import { requestIdle, cancelIdle, uid } from '@daas/shared'
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
      const workbenchRef = useWorkbench()
      const currentWorkspace = workbenchRef.value?.activeWorkspace || workbenchRef.value?.currentWorkspace
      const currentWorkspaceId = currentWorkspace?.id
      const selectionRef = useSelection()
      const selectedRef = useSelected(currentWorkspaceId)
      // const node = useCurrentNode(currentWorkspaceId)
      const nodeRef = useCurrentNode(currentWorkspaceId)
      // const schema = nodeRef.value?.designerProps?.propsSchema
      const isEmpty = computed(
        () => !(nodeRef.value && nodeRef.value.designerProps?.propsSchema && selectedRef.value.length === 1)
      )
      const idleTaskRef = ref(null)

      /*const sources = reactive({
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
          sources.isEmpty = !(
            nodeRef.value &&
            nodeRef.value.designerProps?.propsSchema &&
            selectedRef.value.length === 1
          )
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

      return () => {
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
                      schema={sources.schema}
                      components={props.components}
                      scope={{ $node: nodeRef.value, ...props.scope }}
                    />
                  </Form>
                </SettingsFormContext.Provider>
                {/!*<ElForm
                  key={uid()}
                  form={formRef.value}
                  labelWidth={110}
                  labelAlign="left"
                  wrapperAlign="right"
                  feedbackLayout="none"
                  tooltipLayout="text"
                >
                  <SchemaField
                    props={{
                      schema: sources.schema,
                      components: props.components,
                      scope: props.scope,
                    }}
                  />
                </ElForm>*!/}
              </div>
            )
          }
          return <div class={prefix + '-empty'}>空空如也</div>
        }

        return (
          <IconContext.Provider props={{ tooltip: true }}>
            <div class={prefix + '-wrapper'}>
              {!sources.isEmpty && <NodePathWidget workspaceId={currentWorkspaceId} />}
              <div class={prefix + '-content'}>{render()}</div>
            </div>
          </IconContext.Provider>
        )
      }*/

      const formRef = ref()

      watch(
        [selectedRef, nodeRef],
        () => {
          formRef.value = createForm({
            initialValues: nodeRef.value?.designerProps?.defaultProps,
            values: nodeRef.value?.props,
            effects(form) {
              useLocales(nodeRef.value)
              props.effects?.(form)
            }
          })
        },
        { immediate: true }
      )

      /*const form = computed(() => {
        console.log('computed.form')
        return createForm({
          initialValues: nodeRef.value?.designerProps?.defaultProps,
          values: nodeRef.value?.props,
          effects(form) {
            useLocales(nodeRef.value)
            props.effects?.(form)
          }
        })
      })*/

      const schema = computed(() => {
        return nodeRef.value?.designerProps?.propsSchema
      })

      const render = () => {
        console.log('schema', schema)
        if (!isEmpty.value && formRef.value) {
          return (
            <div class={prefix} key={nodeRef.value.id}>
              <SettingsFormContext.Provider value={props}>
                <Form
                  form={formRef.value}
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
        return (
          <IconContext.Provider value={{ tooltip: true }}>
            <div class={prefix + '-wrapper'}>
              {!isEmpty.value && <NodePathWidget workspaceId={currentWorkspaceId} />}
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

/*export const SettingsForm1 = observer(
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
)*/
