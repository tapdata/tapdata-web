<script setup lang="ts">
import GitBook from '@tap/component/src/GitBook.vue'
import { useI18n } from '@tap/i18n'
import axios from 'axios'
import { ref } from 'vue'

defineOptions({
  name: 'DocsDrawer',
})

const props = defineProps({
  path: {
    type: String,
    default: 'data-inspect',
  },
})

const i18n = useI18n()
const loading = ref(false)
const mdContent = ref('')

const handleOpen = () => {
  loading.value = true
  axios
    .get(
      `static/docs/${props.path || 'data-inspect'}/${i18n.locale?.value?.toLowerCase() || 'en'}.md`.toLowerCase(),
      {
        responseType: 'blob',
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
      },
    )
    .then((res) => {
      mdContent.value = res.data
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <ElDrawer
    append-to-body
    :title="i18n.t('packages_dag_api_docs')"
    :size="680"
    modal-class="bg-transparent"
    @open="handleOpen"
  >
    <div v-loading="loading">
      <GitBook :value="mdContent" class="" />
    </div>
  </ElDrawer>
</template>

<style lang="scss" scoped></style>
