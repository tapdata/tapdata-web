import { MouseClickDriver } from './drivers'
import {
  useCursorEffect,
  useSelectionEffect,
  useAutoScrollEffect,
  useContentEditableEffect,
  useWorkspaceEffect
} from './effects'

export const DEFAULT_EFFECTS = [
  useCursorEffect,
  useSelectionEffect,
  useAutoScrollEffect,
  useContentEditableEffect,
  useWorkspaceEffect
]

export const DEFAULT_DRIVERS = [MouseClickDriver]
