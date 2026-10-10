// The server supplies eligibility; missing eligibility fails closed for older servers.
export function canMoveTask(
  task: { movable: boolean; sourceAgentId: string; allowedAgentIds?: string[] },
  agentId: string,
): boolean {
  return (
    task.movable &&
    (agentId === task.sourceAgentId ||
      !!task.allowedAgentIds?.includes(agentId))
  )
}

export function visibleAgentIds(
  agentIds: string[] | undefined,
  agents: { agentId: string; online: boolean }[],
  tasks: { sourceAgentId: string; currentAgentId: string }[],
): string[] {
  return [
    ...new Set(
      [
        ...(agentIds ??
          agents.filter((agent) => agent.online).map((agent) => agent.agentId)),
        ...tasks.flatMap((task) => [task.sourceAgentId, task.currentAgentId]),
      ].filter(Boolean),
    ),
  ]
}
