import { DragDropDriver, MouseClickDriver, MouseMoveDriver } from './drivers'
import {
  useAutoScrollEffect,
  useContentEditableEffect,
  useCursorEffect,
  useDragDropEffect,
  useSelectionEffect,
  useWorkspaceEffect,
} from './effects'

export const DEFAULT_EFFECTS = [
  useCursorEffect,
  useSelectionEffect,
  useAutoScrollEffect,
  useContentEditableEffect,
  useWorkspaceEffect,
  useDragDropEffect,
]

export const DEFAULT_DRIVERS = [
  MouseClickDriver,
  DragDropDriver,
  MouseMoveDriver,
]
