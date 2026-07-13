import type { GraphNode, NodePositionChange, XYPosition } from '@vue-flow/core'

interface GetHelperLinesResult {
  horizontal?: number
  vertical?: number
  snapPosition: Partial<XYPosition>
}

// 每次调用都返回全新对象，避免 snapPosition 被跨调用复用导致状态污染
function createDefaultResult(): GetHelperLinesResult {
  return {
    horizontal: undefined,
    vertical: undefined,
    snapPosition: { x: undefined, y: undefined },
  }
}

function computeHelperLines(
  nodeABounds: {
    left: number
    right: number
    top: number
    bottom: number
    width: number
    height: number
  },
  nodes: GraphNode[],
  excludeId?: string,
  distance = 5,
): GetHelperLinesResult {
  let horizontalDistance = distance
  let verticalDistance = distance

  return nodes
    .filter((node) => node.id !== excludeId)
    .reduce<GetHelperLinesResult>((result, nodeB) => {
      const nodeBBounds = {
        left: nodeB.position.x,
        right: nodeB.position.x + ((nodeB.dimensions.width as number) ?? 0),
        top: nodeB.position.y,
        bottom: nodeB.position.y + ((nodeB.dimensions.height as number) ?? 0),
        width: nodeB.width ?? 0,
        height: nodeB.height ?? 0,
      }

      //  |‾‾‾‾‾‾‾‾‾‾‾|
      //  |     A     |
      //  |___________|
      //  |
      //  |
      //  |‾‾‾‾‾‾‾‾‾‾‾|
      //  |     B     |
      //  |___________|
      const distanceLeftLeft = Math.abs(nodeABounds.left - nodeBBounds.left)

      if (distanceLeftLeft < verticalDistance) {
        result.snapPosition.x = nodeBBounds.left
        result.vertical = nodeBBounds.left
        verticalDistance = distanceLeftLeft
      }

      //  |‾‾‾‾‾‾‾‾‾‾‾|
      //  |     A     |
      //  |___________|
      //              |
      //              |
      //  |‾‾‾‾‾‾‾‾‾‾‾|
      //  |     B     |
      //  |___________|
      const distanceRightRight = Math.abs(nodeABounds.right - nodeBBounds.right)

      if (distanceRightRight < verticalDistance) {
        result.snapPosition.x = nodeBBounds.right - nodeABounds.width
        result.vertical = nodeBBounds.right
        verticalDistance = distanceRightRight
      }

      //              |‾‾‾‾‾‾‾‾‾‾‾|
      //              |     A     |
      //              |___________|
      //              |
      //              |
      //  |‾‾‾‾‾‾‾‾‾‾‾|
      //  |     B     |
      //  |___________|
      const distanceLeftRight = Math.abs(nodeABounds.left - nodeBBounds.right)

      if (distanceLeftRight < verticalDistance) {
        result.snapPosition.x = nodeBBounds.right
        result.vertical = nodeBBounds.right
        verticalDistance = distanceLeftRight
      }

      //  |‾‾‾‾‾‾‾‾‾‾‾|
      //  |     A     |
      //  |___________|
      //              |
      //              |
      //              |‾‾‾‾‾‾‾‾‾‾‾|
      //              |     B     |
      //              |___________|
      const distanceRightLeft = Math.abs(nodeABounds.right - nodeBBounds.left)

      if (distanceRightLeft < verticalDistance) {
        result.snapPosition.x = nodeBBounds.left - nodeABounds.width
        result.vertical = nodeBBounds.left
        verticalDistance = distanceRightLeft
      }

      //  |‾‾‾‾‾‾‾‾‾‾‾|‾‾‾‾‾|‾‾‾‾‾‾‾‾‾‾‾|
      //  |     A     |     |     B     |
      //  |___________|     |___________|
      const distanceTopTop = Math.abs(nodeABounds.top - nodeBBounds.top)

      if (distanceTopTop < horizontalDistance) {
        result.snapPosition.y = nodeBBounds.top
        result.horizontal = nodeBBounds.top
        horizontalDistance = distanceTopTop
      }

      //  |‾‾‾‾‾‾‾‾‾‾‾|
      //  |     A     |
      //  |___________|_________________
      //                    |           |
      //                    |     B     |
      //                    |___________|
      const distanceBottomTop = Math.abs(nodeABounds.bottom - nodeBBounds.top)

      if (distanceBottomTop < horizontalDistance) {
        result.snapPosition.y = nodeBBounds.top - nodeABounds.height
        result.horizontal = nodeBBounds.top
        horizontalDistance = distanceBottomTop
      }

      //  |‾‾‾‾‾‾‾‾‾‾‾|     |‾‾‾‾‾‾‾‾‾‾‾|
      //  |     A     |     |     B     |
      //  |___________|_____|___________|
      const distanceBottomBottom = Math.abs(
        nodeABounds.bottom - nodeBBounds.bottom,
      )

      if (distanceBottomBottom < horizontalDistance) {
        result.snapPosition.y = nodeBBounds.bottom - nodeABounds.height
        result.horizontal = nodeBBounds.bottom
        horizontalDistance = distanceBottomBottom
      }

      //                    |‾‾‾‾‾‾‾‾‾‾‾|
      //                    |     B     |
      //                    |           |
      //  |‾‾‾‾‾‾‾‾‾‾‾|‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
      //  |     A     |
      //  |___________|
      const distanceTopBottom = Math.abs(nodeABounds.top - nodeBBounds.bottom)

      if (distanceTopBottom < horizontalDistance) {
        result.snapPosition.y = nodeBBounds.bottom
        result.horizontal = nodeBBounds.bottom
        horizontalDistance = distanceTopBottom
      }

      return result
    }, createDefaultResult())
}

// this utility function can be called with a position change (inside onNodesChange)
// it checks all other nodes and calculated the helper line positions and the position where the current node should snap to
export function getHelperLines(
  change: NodePositionChange,
  nodes: GraphNode[],
  distance = 5,
): GetHelperLinesResult {
  const nodeA = nodes.find((node) => node.id === change.id)

  if (!nodeA || !change.position) {
    return createDefaultResult()
  }

  const nodeABounds = {
    left: change.position.x,
    right: change.position.x + ((nodeA.dimensions.width as number) ?? 0),
    top: change.position.y,
    bottom: change.position.y + ((nodeA.dimensions.height as number) ?? 0),
    width: (nodeA.dimensions.width as number) ?? 0,
    height: (nodeA.dimensions.height as number) ?? 0,
  }

  return computeHelperLines(nodeABounds, nodes, nodeA.id, distance)
}

/**
 * Compute helper lines for a virtual node (e.g. one being dragged from the NodesPanel)
 * that does not yet exist in the VueFlow graph.
 */
export function getHelperLinesForPosition(
  position: XYPosition,
  dimensions: { width: number; height: number },
  nodes: GraphNode[],
  distance = 5,
): GetHelperLinesResult {
  const nodeABounds = {
    left: position.x,
    right: position.x + dimensions.width,
    top: position.y,
    bottom: position.y + dimensions.height,
    width: dimensions.width,
    height: dimensions.height,
  }

  return computeHelperLines(nodeABounds, nodes, undefined, distance)
}
