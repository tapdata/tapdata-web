import { AbstractViewportEvent } from './AbstractViewportEvent'

export class ViewportResizeEvent extends AbstractViewportEvent {
  type = 'viewport:resize'
}
