import { useVueFlow } from '@vue-flow/core'
import { watch } from 'vue'
import { useDataflowStore } from '../stores/dataflow.store'

/**
 * 提供 focusNode 方法：选中指定节点并确保其在视口中可见。
 *
 * 内部会等待 VueFlow 完成节点 DOM 渲染和尺寸测量后，
 * 再执行选中 + fitView，避免 nextTick / setTimeout 的时序问题。
 */
export function useNodeFocus() {
  const {
    findNode,
    addSelectedNodes,
    removeSelectedNodes,
    getNodes,
    fitView,
    viewport,
  } = useVueFlow()

  const dataflowStore = useDataflowStore()

  /**
   * 选中节点并平移视口使其可见
   * @param nodeId 要聚焦的节点 ID
   */
  function focusNode(nodeId: string) {
    // store 级别选中（打开右侧设置面板），不依赖尺寸，立即执行
    dataflowStore.selectNodeById(nodeId)

    const graphNode = findNode(nodeId)

    // 如果节点已经在 VueFlow 中且尺寸已测量完毕，直接执行
    if (graphNode && graphNode.dimensions?.width > 0) {
      removeSelectedNodes(getNodes.value)
      addSelectedNodes([graphNode])
      fitView({
        nodes: [nodeId],
        duration: 200,
        maxZoom: viewport.value.zoom,
        padding: 0.2,
      })
      return
    }

    // 否则等待 VueFlow 测量完节点尺寸后再执行
    const stop = watch(
      () => findNode(nodeId)?.dimensions?.width,
      (width) => {
        if (width && width > 0) {
          stop()
          const node = findNode(nodeId)
          if (node) {
            removeSelectedNodes(getNodes.value)
            addSelectedNodes([node])
          }
          fitView({
            nodes: [nodeId],
            duration: 200,
            maxZoom: viewport.value.zoom,
            padding: 0.2,
          })
        }
      },
      { flush: 'post' },
    )
  }

  return { focusNode }
}

