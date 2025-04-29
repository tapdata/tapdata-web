import { AbstractViewportEvent } from './AbstractViewportEvent'

export class ViewportScrollEvent extends AbstractViewportEvent {
  type = 'viewport:scroll'
}
