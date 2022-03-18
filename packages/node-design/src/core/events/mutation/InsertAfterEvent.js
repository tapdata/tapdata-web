import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class InsertAfterEvent extends AbstractMutationNodeEvent {
  type = 'insert:after'
}
