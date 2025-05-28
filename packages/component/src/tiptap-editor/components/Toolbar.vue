<script setup lang="ts">
import type { Editor } from '@tiptap/core'

const props = defineProps<{
  editor: Editor
}>()

const generateCommandButtonComponentSpecs = () => {
  const extensionManager = props.editor.extensionManager

  console.log('extensionManager', extensionManager)

  return extensionManager.extensions.reduce((acc, extension) => {
    const { button } = extension.options || {}

    if (!button || typeof button !== 'function') return acc

    const menuBtnComponentSpec = button({
      editor: props.editor,
      extension,
    })

    if (Array.isArray(menuBtnComponentSpec)) {
      return [...acc, ...menuBtnComponentSpec]
    }

    return [...acc, menuBtnComponentSpec]
  }, [])
}
</script>

<template>
  <div
    class="tiptap-editor__toolbar px-4 py-2 border-bottom flex align-center gap-2"
  >
    <component
      :is="spec.component"
      v-for="(spec, i) in generateCommandButtonComponentSpecs()"
      v-bind="spec.componentProps"
      :key="i"
      v-on="spec.componentEvents || {}"
    />
  </div>
</template>
