import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class AppendNodeEvent extends AbstractMutationNodeEvent {
  type = 'append:node'
}
