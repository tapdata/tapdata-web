import { onKeyStroke, useMagicKeys } from '@vueuse/core'
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useHistoryStore } from '../stores/history.store'

export function useHistory() {
  const historyStore = useHistoryStore()

  const canUndo = computed(() => historyStore.canUndo)
  const canRedo = computed(() => historyStore.canRedo)

  const handleUndo = async () => {
    if (canUndo.value) {
      await historyStore.undo()
    }
  }

  const handleRedo = async () => {
    if (canRedo.value) {
      await historyStore.redo()
    }
  }

  // Keyboard shortcuts
  const handleKeyDown = (event: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().includes('MAC')
    const modifierKey = isMac ? event.metaKey : event.ctrlKey

    if (modifierKey && event.key.toLowerCase() === 'z') {
      event.preventDefault()
      if (event.shiftKey) {
        handleRedo()
      } else {
        handleUndo()
      }
    }

    // Alternative: Ctrl+Y for redo on Windows/Linux
    if (!isMac && event.ctrlKey && event.key.toLowerCase() === 'y') {
      event.preventDefault()
      handleRedo()
    }
  }

  const setupKeyboardShortcuts = () => {
    window.addEventListener('keydown', handleKeyDown)
  }

  const cleanupKeyboardShortcuts = () => {
    window.removeEventListener('keydown', handleKeyDown)
  }

  return {
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    setupKeyboardShortcuts,
    cleanupKeyboardShortcuts,
    reset: historyStore.reset,
    pushCommandToUndo: historyStore.pushCommandToUndo,
    startRecordingUndo: historyStore.startRecordingUndo,
    stopRecordingUndo: historyStore.stopRecordingUndo,
  }
}

