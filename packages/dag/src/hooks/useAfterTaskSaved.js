import i18n from '@tap/i18n'
import { onBeforeUnmount, watch } from 'vue'
import { observe } from '@formily/reactive'

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
      v => {
        if (!v) {
          callback()
        }
        unwatchSaving()
      }
    )
  })

  onBeforeUnmount(() => {
    dispose()
  })

  // 模型生成状态变化
  watch(
    () => root.$store.state.dataflow.transformLoading,
    v => {
      if (!v) {
        console.debug(i18n.global.t('packages_dag_hooks_useaftertasksaved_moxingyishengcheng'))
        callback()
      }
    }
  )
}
