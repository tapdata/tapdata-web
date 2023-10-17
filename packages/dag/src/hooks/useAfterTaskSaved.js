import i18n from '@tap/i18n'
import { onBeforeUnmount, watch } from '@vue/composition-api'
import { observe, reaction } from '@formily/reactive'

/**
 * 场景：源节点发生变化，需要任务保存后调用
 * use callback after task saved when source change
 * @param root
 * @param obs
 * @param callback
 */
export const useAfterTaskSaved = (root, obs, callback) => {
  const dispose = observe(obs, (...args) => {
    let unwatchSaving = watch(
      () => root.$store.state.dataflow.taskSaving,
      (v) => {
        if (!v) {
          callback()
        }
        unwatchSaving()
      }
    )
  })

  // 模型生成状态变化
  const unWatch = watch(
    () => root.$store.state.dataflow.transformLoading,
    (v) => {
      if (!v) {
        console.debug(
          i18n.t('packages_dag_hooks_useaftertasksaved_moxingyishengcheng')
        )
        callback()
      }
    }
  )

  onBeforeUnmount(() => {
    dispose()
    unWatch()
  })
}

export const useSchemaEffect = (root, tracker, callback) => {
  const dispose = reaction(tracker, (...args) => {
    console.log('args', args) // eslint-disable-line
    let unwatchSaving = watch(
      () => root.$store.state.dataflow.taskSaving,
      (v) => {
        if (!v) {
          callback()
        }
        unwatchSaving()
      }
    )
  })

  // 模型生成状态变化
  const unWatch = watch(
    () => root.$store.state.dataflow.transformLoading,
    (v) => {
      if (!v) {
        console.debug(
          i18n.t('packages_dag_hooks_useaftertasksaved_moxingyishengcheng')
        )
        callback()
      }
    }
  )

  onBeforeUnmount(() => {
    dispose()
    unWatch()
  })
}
