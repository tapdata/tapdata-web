import { AbstractMutationNodeEvent } from './AbstractMutationNodeEvent'

export class CloneNodeEvent extends AbstractMutationNodeEvent {
  type = 'clone:node'
}
