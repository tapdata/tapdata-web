<script setup lang="ts">
import CharacterCount from '@tiptap/extension-character-count'
import TiptapPlaceholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { onBeforeUnmount, ref, watch } from 'vue'
import Toolbar from './components/Toolbar.vue'

import type { Extension } from '@tiptap/core'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  enableCharCount?: boolean
  charCountMax?: number
  editorClass?: string | string[] | Record<string, boolean>
  editorContentClass?: string | string[] | Record<string, boolean>
  extensions?: Extension[]
}>()
const emit = defineEmits(['update:modelValue'])

const extensions = props.extensions
  .concat([
    StarterKit.configure({
      paragraph: false,
      codeBlock: false,
    }),
    TiptapPlaceholder.configure({
      emptyEditorClass: 'tiptap-editor--empty',
      emptyNodeClass: 'tiptap-editor__placeholder',
      showOnlyCurrent: false,
      placeholder: () => {
        return props.placeholder
      },
    }),
    props.enableCharCount
      ? CharacterCount.configure({
          limit: props.charCountMax,
        })
      : null,
  ])
  .filter(Boolean)

const editor = useEditor({
  content: props.modelValue,
  extensions,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  onCreate: ({ editor }) => {
    const plugin = editor.state.plugins.find((p) =>
      p.key.startsWith('systemVariableAutoReplace'),
    )
    const tr = plugin.spec.appendTransaction(
      [
        {
          docChanged: true,
        },
      ],
      editor.state,
      editor.state,
    )
    if (tr && tr.docChanged) {
      editor.view.dispatch(tr)
    }
  },
})

const insertVariable = (variableName) => {
  if (editor.value) {
    editor.value.chain().focus().insertSystemVariable(variableName).run()
  }
}

watch(
  () => props.modelValue,
  (val) => {
    const isSame = editor.value?.getHTML() === val
    if (!isSame) {
      editor.value?.commands.setContent(val)
    }
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

defineExpose({
  insertVariable,
})
</script>

<template>
  <div v-if="editor" class="tiptap-editor border rounded-xl">
    <Toolbar :editor="editor" />
    <EditorContent
      :editor="editor"
      class="tiptap-editor__content p-4"
      :class="editorContentClass"
    />
  </div>
</template>

<style lang="scss">
.tiptap-editor {
  line-height: 1.6;
  &__toolbar {
    --btn-space: 0;
    .el-button {
      --icon-color: var(--icon-n1);
    }
  }

  .tiptap,
  .ProseMirror {
    outline: 0;
  }

  .tiptap {
    :first-child {
      margin-top: 0;
    }

    /* List styles */
    ul,
    ol {
      padding: 0 1rem;
      margin: 1.25rem 1rem 1.25rem 0.4rem;

      li p {
        margin-top: 0.25em;
        margin-bottom: 0.25em;
      }
    }

    /* Heading styles */
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      line-height: 1.1;
      margin-top: 2.5rem;
      text-wrap: pretty;
    }

    h1,
    h2 {
      margin-top: 3.5rem;
      margin-bottom: 1.5rem;
    }

    h1 {
      font-size: 1.4rem;
    }

    h2 {
      font-size: 1.2rem;
    }

    h3 {
      font-size: 1.1rem;
    }

    h4,
    h5,
    h6 {
      font-size: 1rem;
    }

    blockquote {
      border-left: 3px solid var(--gray-3);
      margin: 1.5rem 0;
      padding-left: 1rem;
    }

    hr {
      border: none;
      border-top: 1px solid var(--gray-2);
      margin: 2rem 0;
    }

    .ace-line {
      margin: 4px 0;
    }

    *[data-indent='1'] {
      margin-left: 24px !important;
    }

    *[data-indent='2'] {
      margin-left: 48px !important;
    }

    *[data-indent='3'] {
      margin-left: 72px !important;
    }

    *[data-indent='4'] {
      margin-left: 96px !important;
    }

    *[data-indent='5'] {
      margin-left: 120px !important;
    }

    *[data-indent='6'] {
      margin-left: 144px !important;
    }

    *[data-indent='7'] {
      margin-left: 168px !important;
    }
  }

  /* 系统变量高亮样式 */
  .system-variable {
    display: inline-flex;
    align-items: center;
    background-color: rgba(37, 136, 50, 0.12);
    color: rgb(4, 67, 12);
    height: 24px;
    padding: 0px 6px;
    border-radius: 12px;
    font-size: 14px;
    border: 1px solid rgba(31, 35, 41, 0.15);
    position: relative;
  }

  .ProseMirror-selectednode.system-variable {
    background-color: rgb(26, 117, 38);
    border: 1px solid rgb(26, 117, 38);
    color: #fff;
  }
}
</style>
