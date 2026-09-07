import { useNamespace } from 'element-plus'
import { addClass, removeClass } from 'element-plus/es/utils/index.mjs'
import { provide, ref, type InjectionKey } from 'vue'
import type { NodeDropType, TreeNode } from '../types'

interface DragTreeNode {
  node: TreeNode
  $el?: HTMLElement | null
}

interface DragOptions {
  event: DragEvent
  treeNode: DragTreeNode
}

interface DragState {
  showDropIndicator: boolean
  draggingNode: DragTreeNode | null
  dropNode: DragTreeNode | null
  allowDrop: boolean
  dropType: NodeDropType
}

interface DragContext {
  emit: (event: string, ...args: any[]) => void
  slots: Record<string, any>
}

export interface DragEvents {
  treeNodeDragStart: (options: DragOptions) => void
  treeNodeDragOver: (options: DragOptions) => void
  treeNodeDrop: (options: DragOptions) => void
  treeNodeDragEnd: (event: DragEvent) => void
}

export const dragEventsKey: InjectionKey<DragEvents> = Symbol('dragEvents')

function isDescendant(parent: TreeNode, node: TreeNode) {
  let current = node.parent
  while (current) {
    if (current.key === parent.key) return true
    current = current.parent
  }
  return false
}

export function useDragNodeHandler({
  props,
  ctx,
  el$,
  dropIndicator$,
}: {
  props: any
  ctx: DragContext
  el$: { value: HTMLElement | null }
  dropIndicator$: { value: HTMLElement | null }
}) {
  const ns = useNamespace('tree')
  const dragState = ref<DragState>({
    showDropIndicator: false,
    draggingNode: null,
    dropNode: null,
    allowDrop: true,
    dropType: 'none',
  })

  const clearDropState = () => {
    const dropNode = dragState.value.dropNode
    if (dropNode?.$el) removeClass(dropNode.$el, ns.is('drop-inner'))
    dragState.value.showDropIndicator = false
    dragState.value.draggingNode = null
    dragState.value.dropNode = null
    dragState.value.allowDrop = true
    dragState.value.dropType = 'none'
  }

  const treeNodeDragStart = ({ event, treeNode }: DragOptions) => {
    if (
      typeof props.allowDrag === 'function' &&
      !props.allowDrag(treeNode.node)
    ) {
      event.preventDefault()
      return
    }

    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
    try {
      event.dataTransfer?.setData('text/plain', '')
    } catch {
      // Firefox requires drag data for draggable elements.
    }

    dragState.value.draggingNode = treeNode
    ctx.emit('node-drag-start', treeNode.node, event)
  }

  const treeNodeDragOver = ({ event, treeNode }: DragOptions) => {
    const draggingNode = dragState.value.draggingNode
    if (!draggingNode) return

    const oldDropNode = dragState.value.dropNode
    if (oldDropNode?.node.key !== treeNode.node.key && oldDropNode?.$el) {
      removeClass(oldDropNode.$el, ns.is('drop-inner'))
      ctx.emit('node-drag-leave', draggingNode.node, oldDropNode.node, event)
    }

    let dropPrev = true
    let dropInner = true
    let dropNext = true
    if (typeof props.allowDrop === 'function') {
      dropPrev = props.allowDrop(draggingNode.node, treeNode.node, 'prev')
      dropInner = props.allowDrop(draggingNode.node, treeNode.node, 'inner')
      dropNext = props.allowDrop(draggingNode.node, treeNode.node, 'next')
    }

    if (
      draggingNode.node.key === treeNode.node.key ||
      isDescendant(draggingNode.node, treeNode.node)
    ) {
      dropPrev = false
      dropInner = false
      dropNext = false
    }

    const target = treeNode.$el?.querySelector(
      `.${ns.be('node', 'content')}`,
    ) as HTMLElement | null
    const treeElement = el$.value
    if (!target || !treeElement) return

    const targetPosition = target.getBoundingClientRect()
    const treePosition = treeElement.getBoundingClientRect()
    const distance = event.clientY - targetPosition.top
    const prevPercent = dropPrev ? (dropInner ? 0.25 : dropNext ? 0.45 : 1) : -1
    const nextPercent = dropNext ? (dropInner ? 0.75 : dropPrev ? 0.55 : 0) : 1

    let dropType: NodeDropType = 'none'
    if (distance < targetPosition.height * prevPercent) {
      dropType = 'before'
    } else if (distance > targetPosition.height * nextPercent) {
      dropType = 'after'
    } else if (dropInner) {
      dropType = 'inner'
    }

    const icon = treeNode.$el?.querySelector(
      `.${ns.be('node', 'expand-icon')}`,
    ) as HTMLElement | null
    if (icon && dropIndicator$.value) {
      let indicatorTop = -9999
      if (dropType === 'before') {
        indicatorTop = icon.getBoundingClientRect().top - treePosition.top
      } else if (dropType === 'after') {
        indicatorTop = icon.getBoundingClientRect().bottom - treePosition.top
      }
      const iconPosition = icon.getBoundingClientRect()
      dropIndicator$.value.style.top = `${indicatorTop}px`
      dropIndicator$.value.style.left = `${iconPosition.right - treePosition.left}px`
    }

    if (dropType === 'inner' && treeNode.$el) {
      addClass(treeNode.$el, ns.is('drop-inner'))
    } else if (treeNode.$el) {
      removeClass(treeNode.$el, ns.is('drop-inner'))
    }

    const canDrop = dropType !== 'none'
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = canDrop ? 'move' : 'none'
    }
    dragState.value.dropNode = canDrop ? treeNode : null
    dragState.value.allowDrop = canDrop
    dragState.value.dropType = dropType
    dragState.value.showDropIndicator =
      dropType === 'before' || dropType === 'after'

    if (oldDropNode?.node.key !== treeNode.node.key && canDrop) {
      ctx.emit('node-drag-enter', draggingNode.node, treeNode.node, event)
    }
    ctx.emit('node-drag-over', draggingNode.node, treeNode.node, event)
  }

  const treeNodeDrop = ({ event }: DragOptions) => {
    event.preventDefault()
    if (!dragState.value.allowDrop || !event.dataTransfer) return
    event.dataTransfer.dropEffect = 'move'
  }

  const treeNodeDragEnd = (event: DragEvent) => {
    const { draggingNode, dropNode, dropType, allowDrop } = dragState.value
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'

    if (draggingNode) {
      ctx.emit(
        'node-drag-end',
        draggingNode.node,
        dropNode?.node || null,
        dropType,
        event,
      )
      if (dropNode && allowDrop && dropType !== 'none') {
        ctx.emit('node-drop', draggingNode.node, dropNode.node, dropType, event)
      }
    }

    clearDropState()
  }

  provide(dragEventsKey, {
    treeNodeDragStart,
    treeNodeDragOver,
    treeNodeDrop,
    treeNodeDragEnd,
  })

  return {
    dragState,
  }
}
