import { useCustomNode, useDesigner, useWorkbench } from '../hooks'
import { defineComponent, watch, ref } from 'vue-demi'
import VIcon from 'web-core/components/VIcon'
import focusSelect from 'web-core/directives/focusSelect'
import { transformToTreeNode } from '../core'
import { CustomNode } from '@tap/api'
import { IconWidget } from './widgets'
import { observer } from '@formily/reactive-vue'
import { TextEditable } from '@tap/component'

const API = new CustomNode()

export const StudioHeader = observer(
  defineComponent({
    directives: { focusSelect },
    setup: (props, { root }) => {
      const workbenchRef = useWorkbench()
      const designerRef = useDesigner()
      const customNodeRef = useCustomNode()
      const saving = ref(false)

      watch(
        () => root.$route,
        async route => {
          if (route.params?.id) {
            if (route.params.action === 'nodeSave') return
            const data = await API.get([route.params?.id])
            designerRef.value.setCurrentTree(transformToTreeNode(data.formSchema))
            customNodeRef.value.from(data)

            API.checkUsed(route.params.id)
          } else {
            customNodeRef.value.from({})
          }
        },
        { immediate: true }
      )

      const save = async () => {
        const customNode = customNodeRef.value
        if (!customNode.name) {
          root.$message.warning(root.$t('custom_node_name_required'))
          return
        }
        saving.value = true
        try {
          const data = await customNode.save(designerRef.value.getCurrentTree())

          if (!customNode.id) {
            customNode.id = data.id
            root.$router.replace({
              name: 'NodeEditor',
              params: { id: data.id, action: 'nodeSave' }
            })
          }
          root.$message.success(root.$t('message_save_ok'))
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('CustomNode save error', e)
          // root.$message.error(root.$t('message_save_fail'))
        }
        saving.value = false
      }

      return () => (
        <div class="panel-header flex align-center border-bottom">
          <div class="panel-header-nav text-center">
            <button
              onClick={() => {
                root.$router.push({
                  name: 'customNodeList'
                })
              }}
              class="panel-header-btn inline-flex align-center p-1"
            >
              <VIcon size="20">left</VIcon>
            </button>
          </div>
          <div class="panel-header-logo mx-2 flex align-center">
            <IconWidget size="24" infer="CustomNode" />
          </div>
          <div class="panel-header-title">
            <TextEditable
              maxWidth="254"
              placeholder="请输入节点名称"
              value={customNodeRef.value.name}
              onInput={val => {
                customNodeRef.value.name = val
              }}
            />
          </div>
          <div class="panel-header-tools flex align-center">
            <ElTooltip transition="tooltip-fade-in" content="表单设计">
              <button
                class={['icon-btn', { active: workbenchRef.value.type === 'DESIGNABLE' }]}
                onClick={() => {
                  workbenchRef.value.type = 'DESIGNABLE'
                }}
              >
                <IconWidget infer="Design" size={20} />
              </button>
            </ElTooltip>
            <ElTooltip transition="tooltip-fade-in" content="JSON Schema">
              <button
                class={['icon-btn', { active: workbenchRef.value.type === 'JSONTREE' }]}
                onClick={() => {
                  workbenchRef.value.type = 'JSONTREE'
                }}
              >
                <IconWidget infer="JSON" size={20} />
              </button>
            </ElTooltip>
            <ElTooltip transition="tooltip-fade-in" content="代码编辑">
              <button
                class={['icon-btn', { active: workbenchRef.value.type === 'CODE' }]}
                onClick={() => {
                  workbenchRef.value.type = 'CODE'
                }}
              >
                <IconWidget infer="Code" size={20} />
              </button>
            </ElTooltip>
            <ElTooltip transition="tooltip-fade-in" content="预览表单">
              <button
                class={['icon-btn', { active: workbenchRef.value.type === 'PREVIEW' }]}
                onClick={() => {
                  workbenchRef.value.type = 'PREVIEW'
                }}
              >
                <IconWidget infer="Play" size={20} />
              </button>
            </ElTooltip>
          </div>
          <div class="panel-header-actions text-end flex-grow-1 mr-3">
            <ElButton loading={saving.value} size="small" type="primary" onClick={save}>
              保存
            </ElButton>
          </div>
        </div>
      )
    }
  })
)
