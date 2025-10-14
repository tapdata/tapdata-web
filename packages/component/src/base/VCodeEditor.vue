<script setup lang="ts">
import { useDark } from '@vueuse/core'
import ace from 'ace-builds'
import workerJavascriptUrl from 'ace-builds/src-noconflict/worker-javascript?url'
import workerJsonUrl from 'ace-builds/src-noconflict/worker-json?url'
import { onMounted, ref, useTemplateRef, watch, watchEffect } from 'vue'
import 'ace-builds/src-noconflict/ext-searchbox'
import 'ace-builds/src-noconflict/mode-java'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/mode-sql'
import 'ace-builds/src-noconflict/snippets/javascript'
import 'ace-builds/src-noconflict/snippets/json'
import 'ace-builds/src-noconflict/snippets/python'
import 'ace-builds/src-noconflict/snippets/sql'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/theme-one_dark'
import 'ace-builds/src-noconflict/theme-chrome'
import 'ace-builds/src-noconflict/theme-sqlserver'
import 'ace-builds/src-noconflict/ext-beautify'

const WORKER = {
  javascript: workerJavascriptUrl,
  json: workerJsonUrl,
} as const

const ACTION_EVENTS = [
  'change',
  'blur',
  'focus',
  'copy',
  'paste',
  'input',
] as const

interface Props {
  value: any
  lang?: string
  theme?: string
  height?: string | number
  width?: string | number
  options?: any
  autoDark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'one_dark',
})

const emit = defineEmits<{
  init: [editor: any, tools: any, beautify: any]
  initOptions: [editor: any, tools: any, beautify: any]
  'update:value': [value: string]
  change: [value: string, event: any, editor: any]
  blur: [value: string, event: any, editor: any]
  focus: [value: string, event: any, editor: any]
  copy: [value: string, event: any, editor: any]
  paste: [value: string, event: any, editor: any]
  input: [value: string, event: any, editor: any]
}>()

const editor = ref<any>(null)
const contentBackup = ref('')
const isDark = useDark()
const editorElementRef = useTemplateRef<HTMLElement>('editorElement')

watch(
  () => props.value,
  (val) => {
    if (typeof val === 'object') {
      val = JSON.stringify(val)
    }
    if (contentBackup.value !== val && editor.value) {
      editor.value.setValue(val, 1)
    }
  },
)

watchEffect(() => {
  const theme = props.autoDark
    ? isDark.value
      ? 'one_dark'
      : 'chrome'
    : props.theme
  if (editor.value) {
    editor.value.setTheme(`ace/theme/${theme}`)
  }
})

const px = (n: string | number): string => {
  if (/^\d*$/.test(String(n))) {
    return `${n}px`
  }
  return String(n)
}

onMounted(() => {
  const lang = props.lang || 'text'
  let theme = props.theme
  if (props.autoDark && isDark.value) {
    theme = 'one_dark'
  }
  const aceEditor = ace.edit(editorElementRef.value)
  editor.value = aceEditor

  // ace.config.setModuleUrl('ace/ext/searchbox', extSearchboxUrl)
  // ace.config.setModuleUrl(`ace/mode/${lang}`, MAP[lang]?.[0])
  // ace.config.setModuleUrl(`ace/snippets/${lang}`, MAP[lang]?.[1])
  WORKER[lang as keyof typeof WORKER] &&
    ace.config.setModuleUrl(
      `ace/mode/${lang}_worker`,
      WORKER[lang as keyof typeof WORKER],
    )

  const reqHandler = ace.require
  const tools = reqHandler('ace/ext/language_tools')
  const beautify = reqHandler('ace/ext/beautify') // get reference to extension

  emit('init', aceEditor, tools, beautify)

  // @ts-ignore - $blockScrolling is a legacy property
  aceEditor.$blockScrolling = Infinity
  const session = aceEditor.getSession()
  theme && aceEditor.setTheme(`ace/theme/${theme}`)
  session.setMode(`ace/mode/${lang}`)
  session.setTabSize(2)

  const val =
    typeof props.value === 'object'
      ? JSON.stringify(props.value, null, 2)
      : props.value

  aceEditor.setValue(val || '', 1)

  if (props.options) {
    session.setUseWrapMode(props.options.useWrapMode) // 自动换行
    aceEditor.setOptions(props.options)
    emit('initOptions', aceEditor, tools, beautify)
  }

  aceEditor.on('change', () => {
    const content = aceEditor.getValue()
    emit('update:value', content)
    contentBackup.value = content
  })

  ACTION_EVENTS.forEach((ev) => {
    aceEditor.on(ev, (event: any) => {
      emit(ev as any, aceEditor.getValue(), event, aceEditor)
    })
  })
})
</script>

<template>
  <div
    :style="{
      height: height ? px(height) : '100%',
      width: width ? px(width) : '100%',
      padding: '12px 0',
      overflow: 'hidden',
      background: '#282c34',
    }"
  >
    <div
      ref="editorElement"
      :style="{
        height: '100%',
        width: '100%',
      }"
    />
  </div>
</template>
