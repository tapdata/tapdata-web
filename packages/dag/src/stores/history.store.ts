import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useDataflowStore } from './dataflow.store'
import { BulkCommand, type Command, type Undoable } from './history'

const STACK_LIMIT = 100

export const useHistoryStore = defineStore('history', () => {
  const undoStack = ref<Undoable[]>([])
  const redoStack = ref<Undoable[]>([])
  const currentBulkAction = ref<BulkCommand | null>(null)
  const bulkInProgress = ref(false)

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  function popUndoableToUndo(): Undoable | undefined {
    if (undoStack.value.length > 0) {
      return undoStack.value.pop()
    }
    return undefined
  }

  function pushCommandToUndo(undoable: Command, clearRedo = true): void {
    if (!bulkInProgress.value) {
      if (currentBulkAction.value) {
        const alreadyIn = currentBulkAction.value.commands.some((c) =>
          c.isEqualTo(undoable),
        )
        if (!alreadyIn) {
          currentBulkAction.value.commands.push(undoable)
          console.log('pushCommandToUndo (bulk)', undoable)
        } else {
          console.log('pushCommandToUndo SKIPPED (duplicate)', undoable)
        }
      } else {
        undoStack.value.push(undoable)
        console.log('pushCommandToUndo', undoable)
      }
      checkUndoStackLimit()
      if (clearRedo) {
        clearRedoStack()
      }
    }
  }

  function pushBulkCommandToUndo(
    undoable: BulkCommand,
    clearRedo = true,
  ): void {
    undoStack.value.push(undoable)
    checkUndoStackLimit()
    if (clearRedo) {
      clearRedoStack()
    }
  }

  function checkUndoStackLimit() {
    if (undoStack.value.length > STACK_LIMIT) {
      undoStack.value.shift()
    }
  }

  function checkRedoStackLimit() {
    if (redoStack.value.length > STACK_LIMIT) {
      redoStack.value.shift()
    }
  }

  function clearUndoStack() {
    undoStack.value = []
  }

  function clearRedoStack() {
    redoStack.value = []
  }

  function reset() {
    clearRedoStack()
    clearUndoStack()
  }

  function popUndoableToRedo(): Undoable | undefined {
    if (redoStack.value.length > 0) {
      return redoStack.value.pop()
    }
    return undefined
  }

  function pushUndoableToRedo(undoable: Undoable): void {
    redoStack.value.push(undoable)
    checkRedoStackLimit()
  }

  function startRecordingUndo() {
    currentBulkAction.value = new BulkCommand([])
  }

  function stopRecordingUndo() {
    if (
      currentBulkAction.value &&
      currentBulkAction.value.commands.length > 0
    ) {
      undoStack.value.push(currentBulkAction.value)
      checkUndoStackLimit()
    }
    currentBulkAction.value = null
  }

  async function undo() {
    const command = popUndoableToUndo()
    if (!command) return

    const dataflowStore = useDataflowStore()
    bulkInProgress.value = true

    try {
      if (command instanceof BulkCommand) {
        await command.revert(dataflowStore)
        pushUndoableToRedo(command)
      } else {
        const cmd = command as Command
        await cmd.revert(dataflowStore)
        pushUndoableToRedo(cmd)
      }
    } finally {
      bulkInProgress.value = false
    }
  }

  async function redo() {
    const command = popUndoableToRedo()
    if (!command) return

    const dataflowStore = useDataflowStore()
    bulkInProgress.value = true

    try {
      if (command instanceof BulkCommand) {
        // For redo, we need to get reverse commands and execute them in FORWARD order
        // (opposite to undo which executes in reverse order)
        // This re-applies the original operations in the correct sequence
        for (const cmd of command.commands) {
          const reverseCmd = cmd.getReverseCommand(Date.now())
          await reverseCmd.revert(dataflowStore)
        }
        // Push the original command back to undo stack (not clearing redo)
        undoStack.value.push(command)
        checkUndoStackLimit()
      } else {
        const cmd = command as Command
        const reverseCmd = cmd.getReverseCommand(Date.now())
        await reverseCmd.revert(dataflowStore)
        // Push the original command back to undo stack (not clearing redo)
        undoStack.value.push(cmd)
        checkUndoStackLimit()
      }
    } finally {
      bulkInProgress.value = false
    }
  }

  return {
    undoStack,
    redoStack,
    currentBulkAction,
    bulkInProgress,
    canUndo,
    canRedo,
    popUndoableToUndo,
    pushCommandToUndo,
    pushBulkCommandToUndo,
    checkUndoStackLimit,
    checkRedoStackLimit,
    clearUndoStack,
    clearRedoStack,
    reset,
    popUndoableToRedo,
    pushUndoableToRedo,
    startRecordingUndo,
    stopRecordingUndo,
    undo,
    redo,
  }
})
