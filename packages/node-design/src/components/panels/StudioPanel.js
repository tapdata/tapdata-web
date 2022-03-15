import { usePrefix, usePosition, useDesigner, useWorkbench } from '../../hooks'
import { Layout } from '../containers'
import { defineComponent, watch, reactive, ref } from 'vue-demi'
import VIcon from 'web-core/components/VIcon'
import focusSelect from 'web-core/directives/focusSelect'
import { transformToSchema, transformToTreeNode } from '../../core'
import { CustomNode } from '@daas/api'
import { IconWidget } from '../widgets'

const API = new CustomNode()

export const StudioPanel = defineComponent({
  props: ['theme', 'prefixCls', 'position'],
  directives: { focusSelect },
  setup: (props, { slots, refs, root }) => {
    const workbenchRef = useWorkbench()
    const prefix = usePrefix('main-panel')
    const position = usePosition()
    const baseCls = ['root', position]
    const designerRef = useDesigner()
    const saving = ref(false)

    const customNode = reactive({
      id: '',
      name: '',
      desc: '',
      template: '',
      icon: '',
      formSchema: {}
    })

    const focusNameInput = () => {
      refs.nameInput.focus()
    }

    watch(
      () => root.$route,
      async route => {
        if (route.params?.id) {
          const data = await API.get([route.params?.id])
          designerRef.value.setCurrentTree(transformToTreeNode(data.formSchema))
          customNode.id = data.id
          customNode.name = data.name
        } else {
          customNode.id = ''
        }
      },
      { immediate: true }
    )

    const save = async () => {
      customNode.formSchema = transformToSchema(designerRef.value.getCurrentTree())
      saving.value = true

      try {
        await API[customNode.id ? 'patch' : 'post'](customNode)
        root.$message.success(root.$t('message.saveOK'))
      } catch (e) {
        root.$message.success(root.$t('message.saveFail'))
      }
      saving.value = false
    }

    return () => (
      <Layout theme={props.theme} prefixCls={props.prefixCls} position={props.position}>
        <div class={[`${prefix}-container flex flex-1 min-h-0`, ...baseCls]}>
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
              <div class="title-input-wrap flex align-center flex-shrink-0 h-100" data-value="hiddenValue">
                <input
                  placeholder="请输入节点名称"
                  value={customNode.name}
                  onInput={e => {
                    customNode.name = e.target.value
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
          <div class={prefix}>{slots.default?.()}</div>
        </div>
      </Layout>
    )
  }
})
