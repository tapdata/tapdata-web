import { SchemaExpressionScopeSymbol } from '@formily/vue'
import { fetchMergeTaskCache } from '@tap/api/src/core/task'
import { useRequest } from '@tap/api/src/request'
import CountUp from '@tap/component/src/CountUp.vue'
import { IconButton } from '@tap/component/src/icon-button'
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { useForm } from '@tap/form'
import {
  computed as reactiveComputed,
  watch as reactiveWatch,
} from '@tap/form/src/shared'
import { useI18n } from '@tap/i18n'
import { calcUnit } from '@tap/shared/src/number'
import { isNumber } from 'lodash-es'
import {
  computed,
  defineComponent,
  inject,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue'
import NodeIcon from '../../NodeIcon'

import './style.scss'

export const MergeTableCache = defineComponent({
  props: ['findNodeById'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const treeRef = ref(null)
    const cacheMap = ref<Record<string, any>>({})
    const formRef = useForm()
    const form = formRef.value
    const SchemaExpressionScopeContext = inject(SchemaExpressionScopeSymbol)
    const formTab = SchemaExpressionScopeContext!.value.formTab
    const task = SchemaExpressionScopeContext!.value.$settings
    const taskId = task.id
    const currentNodeId = ref('')
    const currentPath = ref('')
    const enableRebuild = ref(false)
    const disabled = ref(form.disabled)
    const pollingInterval = ref(form.disabled ? 5000 : 0)

    enum RebuildStatus {
      PENDING = 'PENDING', // 待重建
      RUNNING = 'RUNNING', // 运行中
      DONE = 'DONE', // 完成
      ERROR = 'ERROR', // 失败
    }

    const RebuildStatusMap = {
      [RebuildStatus.PENDING]: {
        text: t('packages_dag_cache_pending'),
        type: 'info',
      },
      [RebuildStatus.RUNNING]: {
        text: t('packages_dag_cache_running'),
        type: 'primary',
      },
      [RebuildStatus.DONE]: {
        text: t('packages_dag_cache_done'),
        type: 'success',
      },
      [RebuildStatus.ERROR]: {
        text: t('packages_dag_cache_error'),
        type: 'danger',
      },
    }

    const currentNodeCache = computed(() => {
      if (!currentNodeId.value) return null
      return cacheMap.value[currentNodeId.value]
    })

    const taskStatus = reactiveComputed(() => {
      return task.status
    })

    const initRebuildState = () => {
      const target = form.getValuesIn(`mergeProperties.${currentPath.value}`)
      const status =
        target?.cacheRebuildStatus || currentNodeCache.value?.cacheRebuildStatus

      enableRebuild.value = status === RebuildStatus.PENDING
    }

    const updateRebuildState = (val: boolean) => {
      form.setValuesIn(
        `mergeProperties.${currentPath.value}.cacheRebuildStatus`,
        val ? RebuildStatus.PENDING : null,
      )
    }

    const refreshTreeChildren = (nodes = [], parentPath = ''): any[] => {
      return nodes.map((node: Record<string, any>, index) => {
        const currentPath = parentPath
          ? `${parentPath}.children.${index}`
          : String(index)
        const refreshedChildren = node.children?.length
          ? refreshTreeChildren(node.children, currentPath)
          : []
        return {
          ...node,
          path: currentPath,
          children: refreshedChildren,
        }
      })
    }

    const treeData = reactiveComputed(() => {
      return refreshTreeChildren(form.values.mergeProperties || [])
    })

    const showRebuild = reactiveComputed(() => {
      return (
        (task.type === 'cdc' || !!task.attrs?.syncProgress) && !disabled.value
      )
    })

    const renderNode = (h, { data }) => {
      const dagNode = props.findNodeById(data.id)

      if (!dagNode) return

      const cache = cacheMap.value[data.id]
      const children = []

      if (cache) {
        cache.cacheRebuildStatus &&
          RebuildStatusMap[cache.cacheRebuildStatus] &&
          children.push(
            <ElTag
              size="small"
              class="zoom-xs"
              type={RebuildStatusMap[cache.cacheRebuildStatus].type}
            >
              {RebuildStatusMap[cache.cacheRebuildStatus].text}
            </ElTag>,
          )
        cache.needRebuild &&
          data.cacheRebuildStatus !== RebuildStatus.PENDING &&
          children.push(
            <ElTooltip
              content={t('packages_dag_cache_expired')}
              hideAfter={0}
              enterable={false}
            >
              <ElIcon class="color-warning">
                <IMingcuteWarningFill />
              </ElIcon>
            </ElTooltip>,
          )
      }

      return (
        <div
          class={`flex flex-1 align-center ml-n1 gap-1 pr-2 overflow-hidden merge-table-tree-node cursor-pointer ${
            currentNodeId.value === data.id ? 'is-active' : ''
          }`}
        >
          <NodeIcon size={20} node={dagNode}></NodeIcon>
          <OverflowTooltip
            class="text-truncate lh-1"
            placement="left"
            text={dagNode.name}
            open-delay={300}
          />
          {children}
          <IconButton
            onClick={() => emit('center-node', data.id)}
            class="hover-flex ml-auto"
          >
            location
          </IconButton>
        </div>
      )
    }

    const handleSelectNode = (data) => {
      currentNodeId.value = data.id
      currentPath.value = data.path
      initRebuildState()
    }

    const onNodeClick = (data, node) => {
      if (node.level > 1 && currentNodeId.value !== data.id) {
        handleSelectNode(data)
      }
    }

    const getCache = async () => {
      const res = await fetchMergeTaskCache(
        taskId,
        form.values.id,
        !disabled.value,
      )
      const needRebuildId = res.find(
        (item) => item.needRebuild,
      )?.mergeTablePropertiesId

      cacheMap.value = res.reduce((acc, cur) => {
        cur.cacheStatisticsList.forEach((t) => {
          if (isNumber(t.size)) {
            const sizeTxt = calcUnit(t.size, 'byte')
            const match = sizeTxt.match(/^(\d+(?:\.\d+)?)([A-Z]+)?$/i)
            t.sizeMap = match
              ? {
                  num: match[1],
                  unit: ` ${match[2]}`,
                }
              : null
          }
        })
        acc[cur.mergeTablePropertiesId] = cur
        return acc
      }, {})

      if (!currentNodeId.value) {
        if (needRebuildId) {
          handleSelectNode(treeRef.value.getNode(needRebuildId).data)
        } else if (treeData.value[0].children.length) {
          handleSelectNode(treeData.value[0].children[0])
        }
      }
    }

    const { run: runGetCache, cancel: cancelGetCache } = useRequest(getCache, {
      debounceInterval: 100,
      manual: true,
      pollingInterval,
    })

    let stopWatch

    reactiveWatch(
      () => formTab.activeKey,
      (v) => {
        if (v === 'cacheTab') {
          taskStatus.value === 'running' ? runGetCache() : getCache()
          stopWatch?.()
          stopWatch = watch(
            taskStatus,
            (status, old) => {
              console.log('status', status, old)
              if (status === 'running') {
                runGetCache()
              } else {
                cancelGetCache()
              }
            },
            {
              immediate: true,
            },
          )
        } else {
          cancelGetCache()
        }
      },
      { immediate: true },
    )

    onBeforeUnmount(() => {
      stopWatch?.()
    })

    return () => {
      return (
        <div class="flex h-100">
          <div class="border-end pt-3 pr-3" style="width: 280px;">
            <ElTree
              ref={treeRef}
              class="merge-table-cache-tree"
              data={treeData.value}
              indent={8}
              nodeKey="id"
              defaultExpandAll={true}
              expandOnClickNode={false}
              style="--el-tree-node-content-height: 32px;"
              renderContent={renderNode}
              onNodeClick={onNodeClick}
            ></ElTree>
          </div>
          <div class="p-3 flex-1 flex flex-column gap-4 pr-0 overflow-y-auto">
            {!currentNodeCache.value ? (
              <ElEmpty
                description={t('packages_dag_cache_no_data')}
                image-size={48}
              ></ElEmpty>
            ) : (
              <>
                {currentNodeCache.value.needRebuild && !enableRebuild.value && (
                  <ElAlert
                    closable={false}
                    showIcon
                    type="warning"
                    title={t('packages_dag_cache_expired')}
                  ></ElAlert>
                )}

                {showRebuild.value && (
                  <div class="flex align-center justify-content-between rounded-xl p-3 bg-gray-100">
                    <div class="flex flex-column gap- lh-base">
                      <span class="fw-sub">
                        {t('packages_dag_rebuild_cache')}
                      </span>
                      <span class="text-xs font-color-sslight">
                        {t('packages_dag_rebuild_cache_tips')}
                      </span>
                    </div>
                    <el-switch
                      v-model={enableRebuild.value}
                      onChange={updateRebuildState}
                      disabled={disabled.value}
                    ></el-switch>
                  </div>
                )}
                {currentNodeCache.value.cacheStatisticsList.map((item) => (
                  <div class="bg-gray-100 rounded-xl p-1.5">
                    <div class="flex align-center gap-2 p-2 pt-1">
                      {item.method === 'Local' ? (
                        <i-lucide-hard-drive />
                      ) : (
                        <i-lucide-server />
                      )}
                      <span class="fw-sub">
                        {item.method} {t('public_cache')}
                      </span>
                    </div>
                    <div class="bg-card shadow-xs rounded-xl p-3">
                      <div class="flex align-start gap-4">
                        <div class="flex flex-column flex-1 gap-1">
                          <span class="font-color-light lh-base">
                            {t('packages_dag_cache_count')}
                          </span>
                          <div class="flex align-items-baseline gap-1">
                            <span class="fw-sub text-2xl">
                              <CountUp end-val={item.count} duration={0.5} />
                            </span>
                            {/* {item.countLimit && (
                              <span class="text-xs font-color-sslight">
                                / {item.countLimit.toLocaleString()}
                              </span>
                            )} */}
                          </div>
                          {/* {item.countLimit && (
                            <div class="flex flex-column gap-1">
                              <el-progress show-text={false} percentage={50} />
                            </div>
                          )} */}
                        </div>
                        <div class="flex flex-column flex-1  gap-1">
                          <span class="font-color-light lh-base">
                            {t('packages_dag_cache_space')}
                          </span>
                          <span class="fw-sub text-2xl">
                            {item.sizeMap ? (
                              <CountUp
                                end-val={item.sizeMap.num}
                                suffix={item.sizeMap.unit}
                                decimals={1}
                                duration={0.5}
                              />
                            ) : (
                              '-'
                            )}
                          </span>
                        </div>
                      </div>
                      {item.uri && (
                        <div class="p-3 bg-light rounded-xl mt-3 break-all lh-base">
                          <p class="text-xs font-color-sslight">
                            {t('packages_dag_connection_address')}
                          </p>
                          <p>{item.uri}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )
    }
  },
})
