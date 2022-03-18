import { MouseClickDriver, DragDropDriver, MouseMoveDriver } from './drivers'
import {
  useCursorEffect,
  useSelectionEffect,
  useAutoScrollEffect,
  useContentEditableEffect,
  useWorkspaceEffect,
  useDragDropEffect
} from './effects'

export const DEFAULT_EFFECTS = [
  useCursorEffect,
  useSelectionEffect,
  useAutoScrollEffect,
  useContentEditableEffect,
  useWorkspaceEffect,
  useDragDropEffect
]

export const DEFAULT_DRIVERS = [MouseClickDriver, DragDropDriver, MouseMoveDriver]
