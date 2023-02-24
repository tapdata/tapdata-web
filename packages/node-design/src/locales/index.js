import { GlobalRegistry } from '../core'
import icons from './icons'
import panels from './panels'
import global from './global'
import operations from './operations'
import settingsForm from './settingsForm'

GlobalRegistry.registerDesignerLocales(
  icons,
  panels,
  global,
  operations,
  settingsForm
)
