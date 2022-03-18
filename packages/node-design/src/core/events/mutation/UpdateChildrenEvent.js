import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class UpdateChildrenEvent extends AbstractMutationNodeEvent {
  type = 'update:children'
}
