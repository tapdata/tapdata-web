import {
  getRectOfNodes,
  getTransformForBounds,
  Position,
  useVueFlow,
  type Edge,
  type FitViewParams,
  type Node,
} from '@vue-flow/core'
import dagre from 'dagre'
import { ref, unref, type Ref } from 'vue'

export type LayoutDirection = 'LR' | 'TB' | 'RL' | 'BT'

// Same shape as FitViewParams – re-exported for callers that want explicit typing
export type FitViewWithOffsetOptions = FitViewParams

type PaddingScalar = string | number | undefined

/** Parse a single padding value to pixels. Numbers are treated as px; '48px' → 48; '10%' is not supported here. */
function parsePaddingPx(val: PaddingScalar): number {
  if (val === undefined) return 0
  if (typeof val === 'number') return val
  if (val.endsWith('px')) return Number.parseFloat(val)
  return 0
}

/**
 * Resolve FitViewParams['padding'] into:
 *  - `ratio`  – fractional padding passed to getTransformForBounds (when padding is a plain number / %-string)
 *  - pixel insets for each side (when padding is an object or px-string)
 */
function resolvePadding(padding: FitViewParams['padding']): {
  ratio: number
  top: number
  right: number
  bottom: number
  left: number
} {
  if (padding === undefined) {
    return { ratio: 0.1, top: 0, right: 0, bottom: 0, left: 0 }
  }
  if (typeof padding === 'number') {
    return { ratio: padding, top: 0, right: 0, bottom: 0, left: 0 }
  }
  if (typeof padding === 'string') {
    if (padding.endsWith('%')) {
      return {
        ratio: Number.parseFloat(padding) / 100,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }
    }
    // px string – apply uniformly as pixel insets
    const px = parsePaddingPx(padding)
    return { ratio: 0, top: px, right: px, bottom: px, left: px }
  }
  // Object form: { top?, right?, bottom?, left?, x?, y? }
  const xPx = parsePaddingPx((padding as any).x)
  const yPx = parsePaddingPx((padding as any).y)
  return {
    ratio: 0,
    top: parsePaddingPx((padding as any).top) || yPx,
    right: parsePaddingPx((padding as any).right) || xPx,
    bottom: parsePaddingPx((padding as any).bottom) || yPx,
    left: parsePaddingPx((padding as any).left) || xPx,
  }
}

/**
 * Composable to run the layout algorithm on the graph.
 * It uses the `dagre` library to calculate the layout of the nodes and edges.
 */
export function useLayout(options?: {
  nodesPanelExpanded?: Ref<boolean>
  nodesPanelWidth?: Ref<number> | number
  rightPanelExpanded?: Ref<boolean>
  rightPanelWidth?: Ref<number> | number
  bottomPanelHeight?: Ref<number> | number
  canvasSelector?: string
}) {
  const { findNode, fitView, setViewport, getNodes } = useVueFlow()

  const nodesPanelExpanded = options?.nodesPanelExpanded
  const nodesPanelWidth = options?.nodesPanelWidth ?? 260
  const rightPanelExpanded = options?.rightPanelExpanded
  const rightPanelWidth = options?.rightPanelWidth ?? 0
  const bottomPanelHeight = options?.bottomPanelHeight ?? 0
  const canvasSelector = options?.canvasSelector ?? '#node-canvas'

  const graph = ref(new dagre.graphlib.Graph())

  const previousDirection = ref<LayoutDirection>('LR')

  function layout(
    nodes: Node[],
    edges: Edge[],
    direction: LayoutDirection = 'LR',
  ) {
    // we create a new graph instance, in case some nodes/edges were removed, otherwise dagre would act as if they were still there
    const dagreGraph = new dagre.graphlib.Graph()

    graph.value = dagreGraph

    dagreGraph.setDefaultEdgeLabel(() => ({}))

    const isHorizontal = direction === 'LR' || direction === 'RL'
    dagreGraph.setGraph({
      nodesep: 48,
      ranksep: 120,
      rankdir: direction,
    })

    previousDirection.value = direction

    for (const node of nodes) {
      // if you need width+height of nodes for your layout, you can use the dimensions property of the internal node (`GraphNode` type)
      const graphNode = findNode(node.id)

      dagreGraph.setNode(node.id, {
        width: graphNode?.dimensions?.width || 150,
        height: graphNode?.dimensions?.height || 50,
      })
    }

    for (const edge of edges) {
      dagreGraph.setEdge(edge.source, edge.target)
    }

    dagre.layout(dagreGraph)

    // set nodes with updated positions
    return nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id)

      return {
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
      }
    })
  }

  /**
   * Fit view with panel offset - avoids left/right panel overlap.
   * Supports the same options as VueFlow's fitView: nodes, includeHiddenNodes, padding, minZoom, maxZoom, duration.
   */
  function fitViewWithOffset(opts: FitViewParams = {}) {
    const {
      duration = 200,
      minZoom = 0.1,
      maxZoom = 10,
      nodes: nodeIds,
      includeHiddenNodes = false,
    } = opts

    // Get canvas container dimensions
    const container = document.querySelector(canvasSelector)
    if (!container) {
      fitView(opts)
      return
    }

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Calculate panel offsets
    const leftOffset = nodesPanelExpanded?.value ? unref(nodesPanelWidth) : 0
    const rightOffset = rightPanelExpanded.value ? unref(rightPanelWidth) : 0
    const bottomOffset = unref(bottomPanelHeight) - 44 // 减去 toolbar 的高度

    // Resolve padding into ratio + per-side pixel insets
    const {
      ratio,
      top: padTop,
      right: padRight,
      bottom: padBottom,
      left: padLeft,
    } = resolvePadding(opts.padding)

    // Filter nodes: optionally by ID list and visibility
    let graphNodes = getNodes.value
    if (nodeIds?.length) {
      const idSet = new Set(nodeIds)
      graphNodes = graphNodes.filter((n) => idSet.has(n.id))
    }
    if (!includeHiddenNodes) {
      graphNodes = graphNodes.filter((n) => !n.hidden)
    }

    if (graphNodes.length === 0) {
      fitView(opts)
      return
    }

    // Available viewport area after subtracting panels and pixel padding
    const availableWidth =
      containerWidth - leftOffset - rightOffset - padLeft - padRight
    const availableHeight = containerHeight - bottomOffset - padTop - padBottom

    const bounds = getRectOfNodes(graphNodes)
    const newViewport = getTransformForBounds(
      bounds,
      availableWidth,
      availableHeight,
      minZoom,
      maxZoom,
      ratio,
    )

    // Shift origin to account for left panel + left pixel padding (and top pixel padding)
    setViewport(
      {
        x: newViewport.x + leftOffset + padLeft,
        y: newViewport.y + padTop,
        zoom: newViewport.zoom,
      },
      { duration },
    )
  }

  return { graph, layout, previousDirection, fitViewWithOffset }
}
