import { computed, inject, type Ref } from 'vue'

export function useCanvasMapping(dag: Ref<any>) {
  const dataflow = inject<Ref<any>>('dataflow')!
  const mappedNodes = computed(() => {
    return dag.value.nodes.map((node) => {
      return {
        id: node.id,
        label: node.name,
        type: 'canvas',
        position: {
          x: node.attrs.position[0],
          y: node.attrs.position[1],
        },
        selectable: !node.hiddenMap?.setting,
        data: node,
      }
    })
  })

  const mappedEdges = computed(() => {
    const animated = dataflow.value.status === 'running'
    return dag.value.edges.map((edge) => {
      return {
        ...edge,
        type: 'canvas',
        animated,
        id: `${edge.source}_${edge.target}`,
      }
    })
  })

  return {
    nodes: mappedNodes,
    edges: mappedEdges,
  }
}
