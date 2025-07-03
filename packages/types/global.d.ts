import type { RouteMeta as IRouteMeta } from './src/router'

import '../../apps/daas/src/auto-imports.d.ts'
import '../../apps/daas/src/components.d.ts'
import '../../apps/cloud/src/auto-imports.d.ts'
import '../../apps/cloud/src/components.d.ts'

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta extends IRouteMeta {}
}

declare global {
  interface Window {}
}
