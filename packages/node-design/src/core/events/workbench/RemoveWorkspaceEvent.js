import { AbstractWorkspaceEvent } from './AbstractWorkspaceEvent'

export class RemoveWorkspaceEvent extends AbstractWorkspaceEvent {
  type = 'remove:workspace'
}
