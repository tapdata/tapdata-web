import type { RouteMeta as IRouteMeta } from './src/router'

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta extends IRouteMeta {}
}

declare global {
  interface Window {}
}
