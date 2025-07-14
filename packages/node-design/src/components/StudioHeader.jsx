import { useCustomNode, useDesigner, useWorkbench } from '../hooks'
import { defineComponent, watch, ref } from 'vue'
import { VIcon } from '@tap/component'
import focusSelect from '@tap/component/src/directives/focusSelect'
import { transformToTreeNode } from '../core'
import { fetchCustomNodes, checkCustomNodeUsed } from '@tap/api'
import { IconWidget } from './widgets'
import { observer } from '@formily/reactive-vue'
import { TextEditable } from '@tap/component'
import { useRouter } from 'vue-router'
import { useI18n } from '@tap/i18n'

export const StudioHeader = observer(
  defineComponent({
    directives: { focusSelect },
    setup: () => {
      const workbenchRef = useWorkbench()
      const designerRef = useDesigner()
      const customNodeRef = useCustomNode()
      const saving = ref(false)
      const router = useRouter()
      const { t } = useI18n()
      
      watch(
        router.currentRoute,
        async (route) => {
          if (route.params?.id) {
            if (route.params.action === 'nodeSave') return
            const data = await fetchCustomNodes([route.params?.id])
            designerRef.value.setCurrentTree(transformToTreeNode(data.formSchema))
            customNodeRef.value.from(data)

            checkCustomNodeUsed(route.params.id)
          } else {
            customNodeRef.value.from({})
          }
        },
        { immediate: true },
      )

      const save = async () => {
        const customNode = customNodeRef.value
        if (!customNode.name) {
          ElMessage.warning(t('packages_nodeDesign_custom_node_name_required'))
          return
        }
        saving.value = true
        try {
          const data = await customNode.save(designerRef.value.getCurrentTree())

          if (!customNode.id) {
            customNode.id = data.id
            router.replace({
              name: 'NodeEditor',
              params: { id: data.id, action: 'nodeSave' },
            })
          }
          ElMessage.success(t('public_message_save_ok'))
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('CustomNode save error', e)
        }
        saving.value = false
      }

      return () => (
        <div class="panel-header flex align-center border-bottom">
          <div class="panel-header-nav text-center">
            <button
              onClick={() => {
                router.push({
                  name: 'customNodeList',
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
              placeholder={t('packages_nodeDesign_custom_node_name_required')}
              value={customNodeRef.value.name}
              onChange={(val) => {
                customNodeRef.value.name = val
              }}
            />
          </div>
          <div class="panel-header-tools flex align-center">
            <ElTooltip transition="tooltip-fade-in" content={t('public_form_design')}>
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
            <ElTooltip transition="tooltip-fade-in" content={t('public_code_edit')}>
              <button
                class={['icon-btn', { active: workbenchRef.value.type === 'CODE' }]}
                onClick={() => {
                  workbenchRef.value.type = 'CODE'
                }}
              >
                <IconWidget infer="Code" size={20} />
              </button>
            </ElTooltip>
            <ElTooltip transition="tooltip-fade-in" content={t('public_preview_form')}>
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
            <ElButton loading={saving.value} type="primary" onClick={save}>
              {t('public_button_save')}
            </ElButton>
          </div>
        </div>
      )
    },
  }),
)
