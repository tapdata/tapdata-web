import { usePrefix, usePosition, useDesigner, useWorkbench } from '../../hooks'
import { Layout } from '../containers'
import { defineComponent } from 'vue-demi'
import VIcon from 'web-core/components/VIcon'
import focusSelect from 'web-core/directives/focusSelect'
import { transformToSchema } from '../../core'
import { CustomNode } from '@daas/api'

const service = new CustomNode()

export const StudioPanel = defineComponent({
  props: ['theme', 'prefixCls', 'position'],
  directives: { focusSelect },
  setup: (props, { slots, refs }) => {
    const prefix = usePrefix('main-panel')
    const position = usePosition()
    const baseCls = ['root', position]
    const designerRef = useDesigner()
    const workbenchRef = useWorkbench()

    const focusNameInput = () => {
      refs.nameInput.focus()
    }

    const save = () => {
      const customNode = {
        name: workbenchRef.value.name,
        formSchema: transformToSchema(designerRef.value.getCurrentTree())
      }

      service.post(customNode)
      console.log('保存', customNode)
    }

    return () => (
      <Layout theme={props.theme} prefixCls={props.prefixCls} position={props.position}>
        <div class={[`${prefix}-container flex flex-1 min-h-0`, ...baseCls]}>
          <div class="panel-header flex align-center border-bottom">
            <div class="panel-header-nav text-center">
              <button class="panel-header-btn inline-flex align-center p-1">
                <VIcon size="20">left</VIcon>
              </button>
            </div>
            <div class="panel-header-logo mx-2">
              <VIcon size="24">component</VIcon>
            </div>
            <div class="panel-header-title">
              <div class="title-input-wrap flex align-center flex-shrink-0 h-100" data-value="hiddenValue">
                <input
                  placeholder="请输入节点名称"
                  value={workbenchRef.value.name}
                  onInput={e => {
                    workbenchRef.value.name = e.target.value
                  }}
                  v-focus-select
                  ref="nameInput"
                  class="title-input"
                />
                <VIcon onClick={focusNameInput} class="title-input-icon" size="14">
                  edit-outline
                </VIcon>
              </div>
            </div>
            <div class="panel-header-actions text-end flex-grow-1 mr-3">
              <ElButton size="small" type="primary" onClick={save}>
                保存
              </ElButton>
            </div>
          </div>
          <div class={prefix}>{slots.default?.()}</div>
        </div>
      </Layout>
    )
  }
})
