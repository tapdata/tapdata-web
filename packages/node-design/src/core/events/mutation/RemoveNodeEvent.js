import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class RemoveNodeEvent extends AbstractMutationNodeEvent {
  type = 'remove:node'
}
