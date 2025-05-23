import i18n from '@tap/i18n'
import { onBeforeUnmount, watch, type InjectionKey, type Ref, } from 'vue'
import { observe, reaction } from '@formily/reactive'
import { useStore } from 'vuex'

export const TaskSavingSymbol: InjectionKey<Ref<boolean>> = Symbol('taskSaving')
export const TransformLoadingSymbol: InjectionKey<Ref<boolean>> =
  Symbol('transformLoading')

/**
 * 场景：源节点发生变化，需要任务保存后调用
 * use callback after task saved when source change
 * @param obs
 * @param callback
 */
export const useAfterTaskSaved = (obs, callback) => {
  const store = useStore()

  const dispose = observe(obs, (...args) => {
    let unwatchSaving = watch(
      () => store.state.dataflow.taskSaving,
      (v) => {
        if (!v) {
          callback()
        }
        unwatchSaving()
      },
    )
  })

  // 模型生成状态变化
  const unWatch = watch(
    () => store.state.dataflow.transformLoading,
    (v) => {
      if (!v) {
        console.debug(i18n.t('packages_dag_hooks_useaftertasksaved_moxingyishengcheng'))
        callback()
      }
    },
  )

  onBeforeUnmount(() => {
    dispose()
    unWatch()
  })
}

export const useSchemaEffect = (tracker, callback) => {
  const store = useStore()
  const dispose = reaction(tracker, (...args) => {
    let unwatchSaving = watch(
      () => store.state.dataflow.taskSaving,
      (v) => {
        if (!v) {
          callback()
        }
        unwatchSaving()
      },
    )
  })

  // 模型生成状态变化
  const unWatch = watch(
    () => store.state.dataflow.transformLoading,
    (v) => {
      if (!v) {
        callback()
      }
    },
  )

  onBeforeUnmount(() => {
    dispose()
    unWatch()
  })
}
