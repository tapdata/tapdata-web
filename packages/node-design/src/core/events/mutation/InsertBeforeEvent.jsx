import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class InsertBeforeEvent extends AbstractMutationNodeEvent {
  type = 'insert:before'
}
