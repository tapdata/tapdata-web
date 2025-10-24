import { GlobalRegistry } from '../core'
import global from './global'
import icons from './icons'
import operations from './operations'
import panels from './panels'
import settingsForm from './settingsForm'

GlobalRegistry.registerDesignerLocales(
  icons,
  panels,
  global,
  operations,
  settingsForm,
)
