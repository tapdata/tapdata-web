<script setup lang="ts">
import { getPdkDoc } from '@tap/api/src/core/pdk'
import GitBook from '@tap/component/src/GitBook.vue'
import { useI18n } from '@tap/i18n'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

interface Props {
  pdkId?: string
  pdkHash?: string
}

const props = defineProps<Props>()

const { locale } = useI18n()
const store = useStore()
const isDaas = ref(import.meta.env.VUE_APP_PLATFORM === 'DAAS')
const doc = ref('')
const iframe = ref<HTMLIFrameElement>()
const navJson = ref({})
const showIframe = ref(true)

const docUrl = computed(() => {
  return navJson.value[props.pdkId]
})

const domain = computed(() => {
  if (isDaas.value) {
    return locale.value === 'en' ? '/docs/en/' : '/docs/'
  }
  return !store.getters.isDomesticStation || locale.value === 'en'
    ? 'https://docs.tapdata.io/'
    : 'https://docs.tapdata.net/'
})

const src = computed(() => {
  return `${domain.value + docUrl.value}?from=cloud`
})

const getPdkDocFn = () => {
  if (!props.pdkHash) return
  getPdkDoc(props.pdkHash).then((res) => {
    doc.value = res?.data
  })
}

const fetchNavJson = async () => {
  try {
    const response = await fetch(`${domain.value}nav_for_docs.json`)
    const result = await response.json()

    navJson.value = result
  } catch (error) {
    console.error('error', error)
  }

  showIframe.value = !!docUrl.value

  if (!showIframe.value) {
    getPdkDocFn()
  }
}

fetchNavJson()
</script>

<template>
  <div class="h-100">
    <GitBook v-if="!showIframe" class="bg-white border-0 p-4" :value="doc" />
    <iframe
      v-else-if="docUrl"
      ref="iframe"
      :src="src"
      class="w-100 h-100 block"
    />
  </div>
</template>
