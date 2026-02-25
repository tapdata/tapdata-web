import {
  getRectOfNodes,
  getTransformForBounds,
  Position,
  useVueFlow,
  type Edge,
  type Node,
} from '@vue-flow/core'
import dagre from 'dagre'
import { ref, type Ref } from 'vue'

export type LayoutDirection = 'LR' | 'TB' | 'RL' | 'BT'

export interface FitViewWithOffsetOptions {
  duration?: number
  minZoom?: number
  maxZoom?: number
  padding?: number
}

/**
 * Composable to run the layout algorithm on the graph.
 * It uses the `dagre` library to calculate the layout of the nodes and edges.
 */
export function useLayout(options?: {
  nodesPanelExpanded?: Ref<boolean>
  nodesPanelWidth?: number
  canvasSelector?: string
}) {
  const { findNode, fitView, setViewport, getNodes } = useVueFlow()

  const nodesPanelExpanded = options?.nodesPanelExpanded
  const nodesPanelWidth = options?.nodesPanelWidth ?? 260
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
    dagreGraph.setGraph({ nodesep: 100, ranksep: 150, rankdir: direction })

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
   * Fit view with panel offset - avoids left NodesPanel overlap
   */
  function fitViewWithOffset(opts: FitViewWithOffsetOptions = {}) {
    const { duration = 200, minZoom = 0.1, maxZoom = 10, padding = 0.1 } = opts

    // Get canvas container dimensions
    const container = document.querySelector(canvasSelector)
    if (!container) {
      fitView({ duration, padding })
      return
    }

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Calculate offset for left panel
    const leftOffset = nodesPanelExpanded?.value ? nodesPanelWidth : 0

    // Get bounds of all nodes using VueFlow's internal GraphNodes
    const graphNodes = getNodes.value
    if (graphNodes.length === 0) {
      fitView({ duration, padding })
      return
    }

    // Calculate viewport for the adjusted container area
    // Subtract left panel width from available width
    const availableWidth = containerWidth - leftOffset

    // Use VueFlow's utility functions
    const bounds = getRectOfNodes(graphNodes)
    const newViewport = getTransformForBounds(
      bounds,
      availableWidth,
      containerHeight,
      minZoom,
      maxZoom,
      padding,
    )

    // Offset the x position to account for the left panel
    setViewport(
      {
        x: newViewport.x + leftOffset,
        y: newViewport.y,
        zoom: newViewport.zoom,
      },
      { duration },
    )
  }

  return { graph, layout, previousDirection, fitViewWithOffset }
}
