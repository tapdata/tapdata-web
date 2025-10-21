<script lang="ts" setup>
import MarkdownIt from 'markdown-it'
import '@tap/assets/styles/github-markdown.css'
import { ref, watch, onMounted } from 'vue'

defineOptions({
  name: 'GitBook',
})

const props = defineProps<{
  value: string | Blob
}>()

const html = ref('')

watch(() => props.value, (v1, v2) => {
  if (v1 !== v2) {
    init()
  }
})

const init = () => {
  const v = props.value
  const reader = new FileReader()
  const blob = new Blob([v])
  reader.readAsText(blob, 'utf8')
  reader.addEventListener('load', () => {
    // TODO: 代码高亮，复制按钮
    const md = new MarkdownIt({ html: true })
    // a标签，新窗口打开
    html.value = md
      .render(reader.result)
      .replaceAll('<a href=', `<a target="_blank" href=`)
  })
}

onMounted(() => {
  props.value && init()
})
</script>

<template>
  <div class="markdown-body-wrap">
    <div class="markdown-body" v-html="html" />
  </div>
</template>
