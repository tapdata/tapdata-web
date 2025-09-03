import type { TreeNode } from './core/models'
import type { Form } from '@formily/core'
import type { VueComponent } from '@formily/vue'
import type { CSSProperties } from 'vue'

export interface ITreeNode {
  componentName?: string
  sourceName?: string
  operation?: Operation
  hidden?: boolean
  isSourceNode?: boolean
  id?: string
  props?: Record<string | number | symbol, any>
  children?: ITreeNode[]
}

export interface ISettingFormProps {
  className?: string
  style?: CSSProperties
  uploadAction?: string
  components?: Record<string, VueComponent>
  effects?: (form: Form) => void
  scope?: any
  headers?: Record<string, string>
}

export interface IDesignerMiniLocales {
  [ISOCode: string]: string
}
export interface IBehavior {
  name: string
  extends?: string[]
  selector: (node: TreeNode) => boolean
  designerProps?: IDesignerControllerProps
  designerLocales?: IDesignerLocales
}

export declare type IBehaviorLike = IBehavior[] | IBehaviorHost
export interface IResource {
  title?: string | IDesignerMiniLocales
  description?: string | IDesignerMiniLocales
  icon?: any
  thumb?: string
  span?: number
  node?: TreeNode
}

export interface IDesignerLayoutProps {
  prefixCls?: string
  theme?: 'dark' | 'light' | (string & {})
  variables?: Record<string, string>
  position?: 'fixed' | 'absolute' | 'relative'
}
export interface IDesignerProps extends IDesignerLayoutProps {
  engine: Engine
}

export interface IDesignerComponents {
  [key: string]: DnFC<any>
}

export interface IDesignerLayoutContext {
  theme?: 'dark' | 'light' | (string & {})
  prefixCls: string
  position: 'fixed' | 'absolute' | 'relative'
}

export interface IWorkspaceContext {
  id: string
  title?: string
  description?: string
}

export type DnFC<P = {}> = Vue.Component<any, any, any, P> & {
  Resource?: IResource[]
  Behavior?: IBehavior[]
}

export type DnComponent<P = {}> = Vue.Component<any, any, any, P> & {
  Resource?: IResource[]
  Behavior?: IBehavior[]
}
