import { requestIdle } from '@tap/shared'
import { Path } from '@formily/path'
import { MouseDoubleClickEvent, MouseClickEvent } from '../events'

function getAllRanges(sel) {
  const ranges = []
  for (let i = 0; i < sel.rangeCount; i++) {
    const range = sel.getRangeAt(i)
    ranges[i] = {
      collapsed: range.collapsed,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
    }
  }
  return ranges
}

function setEndOfContenteditable(contentEditableElement) {
  const range = document.createRange()
  range.selectNodeContents(contentEditableElement)
  range.collapse(false)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
}

function createCaretCache(el) {
  const currentSelection = window.getSelection()
  if (currentSelection.containsNode(el)) return
  const ranges = getAllRanges(currentSelection)
  return () => {
    const sel = window.getSelection()
    const firstNode = el.childNodes[0]
    if (!firstNode) return
    sel.removeAllRanges()
    ranges.forEach((item) => {
      const range = document.createRange()
      range.collapse(item.collapsed)
      range.setStart(firstNode, item.startOffset)
      range.setEnd(firstNode, item.endOffset)
      sel.addRange(range)
    })
  }
}

export const useContentEditableEffect = (engine) => {
  const globalState = {
    activeElements: new Map(),
    queue: [],
    requestTimer: null,
    isComposition: false,
  }

  function onKeyDownHandler(event) {
    if (event.key === 'Enter') {
      event.stopPropagation()
      event.preventDefault()
    }
  }

  function onInputHandler(event) {
    const node = globalState.activeElements.get(this)
    event.stopPropagation()
    event.preventDefault()
    if (node) {
      const target = event.target
      const handler = () => {
        globalState.queue.length = 0
        if (globalState.isComposition) return
        const restore = createCaretCache(target)
        Path.setIn(
          node.props,
          this.getAttribute(engine.props.contentEditableAttrName),
          target?.textContent
        )
        requestIdle(() => {
          node.takeSnapshot('update:node:props')
          restore()
        })
      }
      globalState.queue.push(handler)
      clearTimeout(globalState.requestTimer)
      globalState.requestTimer = setTimeout(handler, 600)
    }
  }

  function onSelectionChangeHandler() {
    clearTimeout(globalState.requestTimer)
    globalState.requestTimer = setTimeout(
      globalState.queue[globalState.queue.length - 1],
      600
    )
  }

  function onCompositionHandler(event) {
    if (event.type === 'compositionend') {
      globalState.isComposition = false
      onInputHandler(event)
    } else {
      clearTimeout(globalState.requestTimer)
      globalState.isComposition = true
    }
  }

  function onPastHandler(event) {
    event.preventDefault()
    const text = event.clipboardData.getData('text')
    this.textContent = text
  }

  function findTargetNodeId(element) {
    if (!element) return
    const nodeId = element.getAttribute(
      engine.props.contentEditableNodeIdAttrName
    )
    if (nodeId) return nodeId
    const parent = element.closest(`*[${engine.props.nodeIdAttrName}]`)
    if (parent) return parent.getAttribute(engine.props.nodeIdAttrName)
  }

  engine.subscribeTo(MouseClickEvent, (event) => {
    const target = event.data.target
    const editableElement = target?.closest?.(
      `*[${engine.props.contentEditableAttrName}]`
    )
    if (
      editableElement &&
      editableElement.getAttribute('contenteditable') === 'true'
    )
      return
    globalState.activeElements.forEach((node, element) => {
      globalState.activeElements.delete(element)
      element.removeAttribute('contenteditable')
      element.removeAttribute('spellcheck')
      element.removeEventListener('input', onInputHandler)
      element.removeEventListener('compositionstart', onCompositionHandler)
      element.removeEventListener('compositionupdate', onCompositionHandler)
      element.removeEventListener('compositionend', onCompositionHandler)
      element.removeEventListener('past', onPastHandler)
      document.removeEventListener('selectionchange', onSelectionChangeHandler)
    })
  })

  engine.subscribeTo(MouseDoubleClickEvent, (event) => {
    const target = event.data.target
    const editableElement = target?.closest?.(
      `*[${engine.props.contentEditableAttrName}]`
    )
    const workspace = engine.workbench.activeWorkspace
    const tree = workspace.operation.tree
    if (editableElement) {
      const editable = editableElement.getAttribute('contenteditable')
      if (editable === 'false' || !editable) {
        const nodeId = findTargetNodeId(editableElement)
        if (nodeId) {
          const targetNode = tree.findById(nodeId)
          if (targetNode) {
            globalState.activeElements.set(editableElement, targetNode)
            editableElement.setAttribute('spellcheck', 'false')
            editableElement.setAttribute('contenteditable', 'true')
            editableElement.focus()
            editableElement.addEventListener('input', onInputHandler)
            editableElement.addEventListener(
              'compositionstart',
              onCompositionHandler
            )
            editableElement.addEventListener(
              'compositionupdate',
              onCompositionHandler
            )
            editableElement.addEventListener(
              'compositionend',
              onCompositionHandler
            )
            editableElement.addEventListener('keydown', onKeyDownHandler)
            editableElement.addEventListener('paste', onPastHandler)
            document.addEventListener(
              'selectionchange',
              onSelectionChangeHandler
            )
            setEndOfContenteditable(editableElement)
          }
        }
      }
    }
  })
}
