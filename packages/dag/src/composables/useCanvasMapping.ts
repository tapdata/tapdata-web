import { computed } from 'vue'

export function useCanvasMapping(dag) {
  const mappedNodes = computed(() => {
    return dag.value.nodes.map((node) => {
      console.log(node)
      return {
        id: node.id,
        label: node.name,
        type: 'canvas-node',
        position: {
          x: node.attrs.position[0],
          y: node.attrs.position[1],
        },
        data: node,
      }
    })
  })

  const mappedEdges = computed(() => {
    return dag.value.edges.map((edge) => {
      return {
        ...edge,
        type: '',
      }
    })
  })

  return {
    nodes: mappedNodes,
    edges: mappedEdges,
  }
}
