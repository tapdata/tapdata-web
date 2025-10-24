import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class UnSelectNodeEvent extends AbstractMutationNodeEvent {
  type = 'unselect:node'
}
