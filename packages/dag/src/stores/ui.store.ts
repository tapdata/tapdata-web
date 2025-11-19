import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const zoom = ref(1)

  return {
    zoom,
  }
})
