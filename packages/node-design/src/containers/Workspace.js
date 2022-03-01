import { defineComponent, ref, computed, toRefs, provide, inject, watch, onMounted } from 'vue-demi'
import { useDesigner } from '../hooks'
import { WorkspaceContext } from '../context'

export const Workspace = defineComponent({
  props: ['id', 'title', 'description'],
  setup: (props, { slots }) => {
    const { id, title, description } = toRefs(props)
    const oldId = ref()
    const designer = useDesigner()
    const workspace = computed(() => {
      console.log('computed', designer)
      if (!designer.value) return
      if (oldId.value && oldId.value !== id) {
        const old = designer.value.workbench.findWorkspaceById(oldId.value)
        if (old) old.viewport.detachEvents()
      }
      const workspace = {
        id: id || 'index',
        title,
        description
      }
      designer.value.workbench.ensureWorkspace(workspace)
      oldId.value = workspace.id
      console.log('designer.workbench', designer.value.workbench.currentWorkspace)
      return workspace
    })
    console.log('Workspace!!!')
    return () => <WorkspaceContext.Provider value={workspace.value}>{slots.default?.()}</WorkspaceContext.Provider>
  }
})
