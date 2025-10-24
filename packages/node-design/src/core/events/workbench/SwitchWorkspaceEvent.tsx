import { AbstractWorkspaceEvent } from './AbstractWorkspaceEvent'

export class SwitchWorkspaceEvent extends AbstractWorkspaceEvent {
  type = 'switch:workspace'
}
