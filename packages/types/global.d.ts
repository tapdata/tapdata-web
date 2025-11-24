import type { RouteMeta as IRouteMeta } from './src/router'

import './src/daas-auto-imports.d.ts'
import './src/daas-components.d.ts'
import './src/cloud-auto-imports.d.ts'
import './src/cloud-components.d.ts'

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta extends IRouteMeta {}
}

declare global {
  interface Window {}
}
