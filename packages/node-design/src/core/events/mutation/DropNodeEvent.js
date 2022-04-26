import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class DropNodeEvent extends AbstractMutationNodeEvent {
  type = 'drop:node'
}
