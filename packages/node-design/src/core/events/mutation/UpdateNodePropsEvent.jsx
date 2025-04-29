import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class UpdateNodePropsEvent extends AbstractMutationNodeEvent {
  type = 'update:node:props'
}
