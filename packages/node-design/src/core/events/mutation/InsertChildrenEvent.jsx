import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class InsertChildrenEvent extends AbstractMutationNodeEvent {
  type = 'insert:children'
}
