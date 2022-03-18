import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class SelectNodeEvent extends AbstractMutationNodeEvent {
  type = 'select:node'
}
