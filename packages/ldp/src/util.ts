import { makeStatusAndDisabled } from '@tap/business/src/shared'

export const mapEdge = (edge: any, index: number) => {
  const tasks: Task[] = edge.attrs.tasks
    ? Object.values(edge.attrs.tasks)
        .map((task: any) => {
          task = makeStatusAndDisabled(task)

          if (task.status === 'running') {
            taskMap.value[task.id as string] = {
              taskRecordId: task.taskRecordId,
              startAt: new Date(task.startTime).getTime(),
            }
          }

          return task
        })
        .sort((a: any, b: any) => {
          // 'running' comes first, then others
          if (a.status === 'running' && b.status !== 'running') return -1
          if (a.status !== 'running' && b.status === 'running') return 1
          return 0
        })
    : []

  return {
    id: index,
    source: edge.source,
    target: edge.target,
    type: 'table',
    animated: tasks[0]?.status === 'running',
    data: {
      tasks,
    },
  }
}
