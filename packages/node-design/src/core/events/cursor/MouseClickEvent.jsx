import { AbstractCursorEvent } from './AbstractCursorEvent'

export class MouseClickEvent extends AbstractCursorEvent {
  type = 'mouse:click'
}

export class MouseDoubleClickEvent extends AbstractCursorEvent {
  type = 'mouse:dblclick'
}
