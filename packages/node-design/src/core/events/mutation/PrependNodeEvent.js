import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class PrependNodeEvent extends AbstractMutationNodeEvent {
  type = 'prepend:node'
}
