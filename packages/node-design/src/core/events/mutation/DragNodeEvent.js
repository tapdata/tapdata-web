import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class DragNodeEvent extends AbstractMutationNodeEvent {
  type = 'drag:node'
}
