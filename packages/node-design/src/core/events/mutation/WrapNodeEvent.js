import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class WrapNodeEvent extends AbstractMutationNodeEvent {
  type = 'wrap:node'
}
