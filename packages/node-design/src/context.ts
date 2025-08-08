import { createContext } from '@tap/shared'
import { inject, ref, type InjectionKey, type Ref } from 'vue'

// export const DesignerComponentsContext = createContext({})

// export const DesignerLayoutContext = createContext(null)

// export const DesignerEngineContext = createContext(null)

// export const TreeNodeContext = createContext(null)

// export const WorkspaceContext = createContext(null)

// export const SettingsFormContext = createContext(null)

// export const IconContext = createContext(null)

export * from './types'

export const DesignerComponentsSymbol: InjectionKey<Ref<IDesignerComponents>> =
  Symbol('DesignerComponentsSymbol')

export const DesignerLayoutSymbol: InjectionKey<Ref<IDesignerLayoutContext>> =
  Symbol('DesignerLayoutSymbol')

export const DesignerEngineSymbol: InjectionKey<Ref<Engine>> = Symbol(
  'DesignerEngineSymbol',
)

export const TreeNodeSymbol: InjectionKey<Ref<TreeNode>> =
  Symbol('TreeNodeSymbol')

export const WorkspaceSymbol: InjectionKey<Ref<IWorkspaceContext>> =
  Symbol('WorkspaceSymbol')

export function useContext<T>(key: InjectionKey<Ref<T>>) {
  return inject(key, ref())
}
