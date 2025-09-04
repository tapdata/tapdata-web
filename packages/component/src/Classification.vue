<script setup lang="ts">
import { metadataDefinitionsApi, userGroupsApi } from '@tap/api'
import { useI18n } from '@tap/i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import VIcon from './base/VIcon.vue'

// Types
interface TreeNode {
  id: string
  value: string
  name?: string
  gid?: string
  parent_id?: string
  last_updated?: string
  user_id?: string
  children?: TreeNode[]
  readOnly?: boolean
}

interface DialogConfig {
  type: 'add' | 'edit'
  id: string
  gid: string
  label: string
  title: string
  visible: boolean
  itemType?: string[]
  priority?: number
}

interface DragState {
  isDragging: boolean
  draggingObjects: any[]
}

interface Props {
  visible: boolean
  types: string[]
  authority?: string
  title?: string
  viewPage?: string
  dragState?: DragState
  treeProps?: any
}

// Props
const props = withDefaults(defineProps<Props>(), {
  types: () => [],
  authority: '',
  title: '',
  viewPage: '',
  dragState: () => ({ isDragging: false, draggingObjects: [] }),
  treeProps: () => ({}),
})

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  nodeChecked: [checkedNodes: string[]]
  dropInTag: []
}>()

// Store
const store = useStore()

// I18n
const { t: $t } = useI18n()

// Refs
const tree = ref()
const searchInput = ref()

// Reactive data
const filterText = ref('')
const treeData = ref<TreeNode[]>([])
const showSearch = ref(false)

const dialogConfig = ref<DialogConfig>({
  type: 'add',
  id: '',
  gid: '',
  label: '',
  title: '',
  visible: false,
})

const priorityOptions = [
  {
    value: 1,
    label: $t('public_priority_highest'),
    color: 'red',
  },
  {
    value: 2,
    label: $t('public_priority_high'),
    color: 'orange',
  },
  {
    value: 3,
    label: $t('public_priority_medium_high'),
    color: 'yellow',
  },
  {
    value: 4,
    label: $t('public_priority_medium'),
    color: 'blue',
  },
  {
    value: 5,
    label: $t('public_priority_low'),
    color: 'green',
  },
  {
    value: 6,
    label: $t('public_priority_lowest'),
    color: 'purple',
  },
]

// Tree props
const treeProps = {
  key: 'id',
  label: 'value',
}

// Computed
const connections = computed(() => store.state.classification?.connections)
const migrate = computed(() => store.state.classification?.migrate)
const sync = computed(() => store.state.classification?.sync)
const inspect = computed(() => store.state.classification?.inspect)

const type = computed(() => props.types[0])

const comTitle = computed(() => {
  return (
    props.title ||
    (type.value === 'user'
      ? $t('packages_component_classification_userTitle')
      : $t('public_tags'))
  )
})

const isExpand = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    emit('update:visible', value)
  },
})

// Methods
const setTag = (payload: { value: string[]; type: string }) => {
  store.commit('classification/setTag', payload)
}

const setPanelFlag = (payload: { panelFlag: boolean; type: string }) => {
  store.commit('classification/setPanelFlag', payload)
}

const toggle = () => {
  const _isExpand = !isExpand.value
  isExpand.value = _isExpand
  setPanelFlag({
    panelFlag: _isExpand,
    type: props.viewPage || '',
  })
}

const clear = () => {
  tree.value && tree.value.setCheckedNodes([])
}

const checkHandler = (
  data: TreeNode,
  { checkedKeys }: { checkedKeys: string[] },
) => {
  const checked = checkedKeys.includes(data.id)
  const setChecked = (arr: TreeNode[]) => {
    if (arr && arr.length) {
      arr.forEach((node) => {
        tree.value.setChecked(node, checked, true)
        setChecked(node.children || [])
      })
    }
  }
  setChecked(data.children || [])
  emitCheckedNodes()
}

const nodeClickHandler = (data: TreeNode) => {
  const checkedNodes = tree.value.getCheckedKeys() || []

  if (checkedNodes.includes(data.id)) {
    tree.value?.setChecked(data.id, false)
  } else {
    tree.value?.setCheckedKeys([data.id], true)
  }

  emitCheckedNodes()
}

const emitCheckedNodes = () => {
  const checkedNodes = tree.value.getCheckedKeys() || []
  emit('nodeChecked', checkedNodes)
  setTag({
    value: checkedNodes,
    type: props.viewPage || '',
  })
}

const getData = (cb?: (data: TreeNode[]) => void) => {
  const type = props.types[0]
  if (type === 'user') {
    userGroupsApi
      .get({
        filter: JSON.stringify({
          limit: 999,
        }),
      })
      .then((data: any) => {
        let localTreeData: TreeNode[] = []
        const items = data?.items || []
        if (items.length) {
          localTreeData = items.map((item: any) => ({
            value: item.name,
            name: item.name,
            id: item.id,
            gid: item.gid,
            parent_id: item.parent_id,
            last_updated: item.last_updated,
            user_id: item.user_id,
          }))
        }
        treeData.value = formatData(localTreeData)

        cb && cb(localTreeData)
      })
  } else {
    metadataDefinitionsApi.getTags(type || props.viewPage).then((data: any) => {
      const items = data?.items || []
      treeData.value = formatData(items)
      cb && cb(items)
    })
  }
}

const getDataAll = (cb: (data: TreeNode[]) => void) => {
  if (props.types[0] === 'user') {
    userGroupsApi
      .get({
        filter: JSON.stringify({
          limit: 999,
        }),
      })
      .then((data: any) => {
        const items = data?.items || []
        let localTreeData: TreeNode[] = []
        if (items?.length) {
          localTreeData = items.map((item: any) => ({
            value: item.name,
            id: item.id,
            gid: item.gid,
            parent_id: item.parent_id,
            last_updated: item.last_updated,
            user_id: item.user_id,
          }))
        }
        cb(localTreeData)
      })
  } else {
    metadataDefinitionsApi.childAccount().then((data: any) => {
      cb(data?.items || [])
    })
  }
}

// 格式化分类数据
const formatData = (items: TreeNode[]): TreeNode[] => {
  if (items && items.length) {
    const map: Record<string, TreeNode[]> = {}
    const nodes: TreeNode[] = []
    // 遍历第一次，先把所有子类按照id分成若干数组
    items.forEach((it) => {
      if (it.parent_id) {
        const children = map[it.parent_id] || []
        children.push(it)
        map[it.parent_id] = children
      } else {
        nodes.push(it)
      }
    })
    // 接着从没有子类的数据开始递归，将之前分好的数组分配给每一个类目
    const checkChildren = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((it) => {
        const children = map[it.id]
        if (children) {
          it.children = checkChildren(children)
        }
        return it
      })
    }
    return checkChildren(nodes)
  }
  return []
}

const filterNode = (value: string, data: TreeNode) => {
  if (!value) return true
  return data.value.includes(value)
}

const handleDefault_expanded = () => {
  const treeList = treeData.value
  for (const node of treeList) {
    tree.value.store.nodesMap[node.id].expanded = false
  }
}

const handleRowCommand = (command: string, node: any) => {
  switch (command) {
    case 'add':
    case 'edit':
      showDialog(node, command)
      break
    case 'delete':
      deleteNode(node.key)
  }
}

const showDialog = (node?: any, dialogType?: string) => {
  const type = (dialogType || 'add') as 'add' | 'edit'
  let itemType = props.types
  if (node && node.data && node.data.item_type) {
    itemType = node.data.item_type
  }
  dialogConfig.value = {
    itemType,
    visible: true,
    type,
    id: node ? node.key : '',
    gid: node?.data?.gid || '',
    label: type === 'edit' ? node.label : '',
    title:
      type === 'add'
        ? node
          ? $t('packages_component_classification_addChildernNode')
          : $t('packages_component_classification_addNode')
        : $t('public_button_edit'),
    priority: node?.data?.priority,
  }
}

const hideDialog = () => {
  dialogConfig.value = {
    type: 'add',
    id: '',
    gid: '',
    label: '',
    title: '',
    visible: false,
  }
}

const dialogSubmit = async () => {
  const config = dialogConfig.value
  const value = config.label
  const priority = config.priority
  const id = config.id
  const gid = config.gid
  const itemType = config.itemType
  let method = 'post'

  if (!value || value.trim() === '') {
    ElMessage.error($t('packages_component_classification_nodeName'))
    return
  }

  if (props.types[0] === 'user') {
    const nameExist = await checkName(value)
    if (nameExist) {
      return ElMessage.error($t('packages_component_classification_nameExist'))
    }
    const params: any = {
      name: value,
    }
    if (config.type === 'edit') {
      method = 'patch'
      params.id = id
    } else if (id) {
      params.parent_id = id
      params.parent_gid = gid
    }
    ;(userGroupsApi as any)[method](params).then(() => {
      getData(() => {
        nextTick(() => {
          emitCheckedNodes()
        })
      })
      hideDialog()
    })
  } else {
    const params: any = {
      item_type: itemType,
      value,
      priority,
    }
    if (config.type === 'edit') {
      method = 'changeById'
      params.id = id
    } else if (id) {
      params.parent_id = id
    }
    metadataDefinitionsApi[method](params).then(() => {
      getData(() => {
        nextTick(() => {
          emitCheckedNodes()
        })
      })
      hideDialog()
    })
  }
}

const deleteNode = (id: string) => {
  ElMessageBox.confirm($t('packages_component_classification_deteleMessage'), {
    confirmButtonText: $t('public_button_delete'),
  }).then((resFlag) => {
    if (!resFlag) {
      return
    }
    if (props.types[0] === 'user') {
      const params = {
        id,
        headers: {
          gid: id,
        },
      }
      userGroupsApi.delete(params).then(() => {
        getData()
      })
    } else {
      metadataDefinitionsApi.delete(id).then(() => {
        getData()
      })
    }
  })
}

const checkName = (value: string): Promise<any> => {
  return new Promise((resolve) => {
    if (props.types[0] === 'user') {
      getDataAll((items) => {
        resolve(items.find((it) => it.name === value))
      })
    } else {
      getDataAll((items) => {
        resolve(items.find((it) => it.value === value))
      })
    }
  })
}

const findParentNodeByClassName = (
  el: Element,
  cls: string,
): Element | null => {
  let parent = el.parentNode as Element
  while (parent && !parent.classList.contains(cls)) {
    parent = parent.parentNode as Element
  }
  return parent
}

const handleTreeDragEnter = (ev: DragEvent, data: TreeNode) => {
  ev.preventDefault()

  if (data.readOnly || !props.dragState?.isDragging) return

  const dropNode = findParentNodeByClassName(
    ev.currentTarget as Element,
    'el-tree-node',
  )
  dropNode?.classList.add('is-drop-inner')
}

const handleTreeDragOver = (ev: DragEvent) => {
  ev.preventDefault()
}

const handleTreeDragLeave = (ev: DragEvent, data: TreeNode) => {
  ev.preventDefault()

  if (data.readOnly) return

  if (!(ev.currentTarget as Element).contains(ev.relatedTarget as Element)) {
    const dropNode = findParentNodeByClassName(
      ev.currentTarget as Element,
      'el-tree-node',
    )
    dropNode?.classList.remove('is-drop-inner')
  }
}

const handleTreeDrop = async (ev: DragEvent, data: TreeNode) => {
  const { draggingObjects } = props.dragState || { draggingObjects: [] }
  const dropNode = findParentNodeByClassName(
    ev.currentTarget as Element,
    'el-tree-node',
  )

  if (!draggingObjects?.length || !dropNode) return
  dropNode.classList.remove('is-drop-inner')

  const id = draggingObjects
    .filter((item) => {
      return item.listtags?.length
        ? item.listtags.every((tag: any) => tag.id !== data.id)
        : true
    })
    .map((item) => item.id)

  let tableName
  switch (props.viewPage) {
    case 'connections':
      tableName = 'Connections'
      break
    case 'migrate':
    case 'sync':
      tableName = 'Task'
      break
    case 'inspect':
      tableName = 'Inspect'
      break
  }

  if (!tableName) {
    console.warn('tableName not found')
    return
  }

  if (id.length) {
    await metadataDefinitionsApi.batchPushListtags(tableName, {
      id,
      listtags: [
        {
          id: data.id,
          value: data.value,
        },
      ],
    })
    ElMessage.success($t('public_message_operation_success'))
    emit('dropInTag')
  } else {
    ElMessage.info($t('packages_component_data_already_exists'))
  }
}

const openSearch = () => {
  showSearch.value = !showSearch.value
  filterText.value = ''

  if (showSearch.value) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

// Watchers
watch(
  () => props.types,
  (newVal, oldVal) => {
    if (newVal.toString() !== oldVal.toString()) {
      clear()
      getData()
    }
  },
)

watch(filterText, (val) => {
  tree.value?.filter(val)
})

// Lifecycle
onMounted(() => {
  getData()
  // 是否默认打开/是否有选择tag
  switch (props.viewPage) {
    case 'connections':
      isExpand.value = connections.value?.panelFlag
      break
    case 'migrate':
      isExpand.value = migrate.value?.panelFlag
      break
    case 'sync':
      isExpand.value = sync.value?.panelFlag
      break
    case 'inspect':
      isExpand.value = inspect.value?.panelFlag
      break
  }
})

// Expose methods
defineExpose({
  clear,
  getData,
  toggle,
  emitCheckedNodes,
  handleDefault_expanded,
})
</script>

<template>
  <div v-show="props.visible" class="classification bg-light rounded-xl">
    <div class="classification-header">
      <div class="h-8 flex align-center my-2 p-2 gap-1" style="--btn-space: 0">
        <el-button text @click="toggle">
          <template #icon>
            <VIcon class="rotate-180">expand-list</VIcon>
          </template>
        </el-button>
        <div class="fs-6 flex-1">
          <span>{{ comTitle }}</span>
        </div>
        <el-button
          text
          :class="{ 'is-active': showSearch }"
          @click="openSearch"
        >
          <template #icon>
            <VIcon size="18">magnify</VIcon>
          </template>
        </el-button>
        <el-button v-readonlybtn="props.authority" text @click="showDialog()">
          <template #icon>
            <VIcon>add</VIcon>
          </template>
        </el-button>
      </div>
      <div v-if="showSearch" class="mb-2 px-2">
        <ElInput ref="searchInput" v-model="filterText" clearable>
          <template #prefix>
            <VIcon size="14">magnify</VIcon>
          </template>
        </ElInput>
      </div>
    </div>

    <div v-if="props.visible" class="overflow-auto px-2 pb-2">
      <ElTree
        v-if="treeData && treeData.length > 0"
        ref="tree"
        check-strictly
        class="classification-tree bg-transparent"
        node-key="id"
        highlight-current
        v-bind="props.treeProps"
        :props="treeProps"
        :expand-on-click-node="false"
        :data="treeData"
        :filter-node-method="filterNode"
        :render-after-expand="false"
        :indent="8"
        :check-on-click-node="false"
        :check-on-click-leaf="false"
        @node-click="nodeClickHandler"
        @check="checkHandler"
      >
        <template #default="{ node, data }">
          <slot name="node" :node="node" :data="data">
            <span
              class="custom-tree-node position-relative gap-2"
              @dragenter.stop="handleTreeDragEnter($event, data)"
              @dragover.stop="handleTreeDragOver($event)"
              @dragleave.stop="handleTreeDragLeave($event, data)"
              @drop.stop="handleTreeDrop($event, data)"
            >
              <VIcon v-if="types[0] === 'user'" class="color-primary"
                >folder-close</VIcon
              >
              <el-icon v-else class="color-primary"><i-lucide:tag /></el-icon>
              <span class="table-label" :title="data.value">{{
                data.value
              }}</span>

              <el-tooltip
                v-if="data.priority && priorityOptions[data.priority - 1]"
                placement="top"
                :show-after="350"
                :hide-after="0"
                :content="
                  $t('public_tag_priority_tip', {
                    val: priorityOptions[data.priority - 1].label,
                  })
                "
              >
                <span
                  class="inline-flex align-center justify-center rounded-lg flex-shrink-0 text-xs fw-sub px-2 py-1 tag-red zoom-xs"
                  :class="`tag-${priorityOptions[data.priority - 1].color}`"
                  >P{{ data.priority }}</span
                >
              </el-tooltip>

              <ElDropdown
                v-readonlybtn="props.authority"
                class="btn-menu ml-auto"
                @command="handleRowCommand($event, node)"
              >
                <el-button text size="small" @click.stop>
                  <template #icon>
                    <VIcon>more</VIcon>
                  </template>
                </el-button>
                <template #dropdown>
                  <ElDropdownMenu>
                    <ElDropdownItem command="add">
                      {{
                        $t('packages_component_classification_addChildernNode')
                      }}
                    </ElDropdownItem>
                    <ElDropdownItem command="edit">{{
                      $t('public_button_edit')
                    }}</ElDropdownItem>
                    <ElDropdownItem command="delete">{{
                      $t('public_button_delete')
                    }}</ElDropdownItem>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
            </span>
          </slot>
        </template>
      </ElTree>
    </div>

    <div
      v-if="treeData && treeData.length === 0 && props.visible"
      class="text-center flex-1 flex align-center justify-center"
    >
      <ElButton
        v-readonlybtn="props.authority"
        class="create"
        @click="showDialog()"
      >
        <template #icon>
          <i-mingcute:add-line />
        </template>
        {{
          $t('packages_component_src_classification_chuangjianfenlei')
        }}</ElButton
      >
    </div>

    <ElDialog
      v-model="dialogConfig.visible"
      width="30%"
      :close-on-click-modal="false"
    >
      <template #header="{ titleClass }">
        <span :class="titleClass">{{ dialogConfig.title }}</span>
      </template>

      <el-form label-position="top">
        <el-form-item :label="$t('public_tag_name')">
          <ElInput
            v-model="dialogConfig.label"
            :placeholder="$t('packages_component_classification_nodeName')"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item v-if="type === 'dataflow'">
          <template #label>
            <div>{{ $t('public_tag_priority') }}</div>
            <div class="fs-8 text-caption lh-sm">
              {{ $t('public_tag_priority_desc') }}
            </div>
          </template>

          <div class="grid grid-cols-3 gap-4 w-100">
            <button
              v-for="item in priorityOptions"
              :key="item.value"
              type="button"
              class="p-3 rounded-xl bg-transparent border border-2 border-gray-200 transition-all text-center cursor-pointer hover:bg-light"
              :class="{
                'bg-color-primary-light-9 border-primary':
                  dialogConfig.priority === item.value,
              }"
              @click="dialogConfig.priority = item.value"
            >
              <span
                data-slot="badge"
                class="inline-flex align-center justify-center rounded-lg flex-shrink-0 text-xs fw-sub px-2 py-1 mb-2"
                :class="`tag-${item.color}`"
                >P{{ item.value }}</span
              >
              <div class="text-xs text-gray-600">{{ item.label }}</div>
            </button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="hideDialog()">{{
            $t('public_button_cancel')
          }}</ElButton>
          <ElButton type="primary" @click="dialogSubmit()">
            {{ $t('public_button_confirm') }}
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.classification {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 213px;
  user-select: none;
  box-sizing: border-box;
  border-top: none;
  background: var(--color-white);
  .btn-expand {
    // padding: 2px 3px;
    // color: var(--text-light);
    transform: rotate(0);
    box-sizing: border-box;
    // background: #eff1f4;
    border: 0;
  }
  .no-expand {
    position: absolute;
    left: 4px;
    top: 4px;
  }
  .toggle {
    margin-top: 18px;
    // color: var(--color-lprimary);
    z-index: 2;
  }
  &.expand {
    height: 100%;
    //width: 100%;
    padding: 20px 0;
    // border-right: 1px solid var(--border-light);
    width: 214px;
    .btn-expand {
      position: absolute;
      top: 0;
      left: 19px;
      transform: rotate(180deg);
      .icon {
        font-size: 16px;
      }
    }

    .btn-addIcon {
      position: absolute;
      right: 12px;
      font-size: var(--font-base-title);
      .iconfont.icon-jia {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        color: var(--text-light);
        font-size: 16px;
        // background-color: var(--color-white);
        // border: 1px solid #dedee4;
        height: 66%;
        // padding: 0 4px;
        // padding-right: 6px;
        // padding-left: 5px;
        margin-top: 0px;
        border-top-width: 1px;
        border-radius: 3px;
        cursor: pointer;
        &:hover {
          color: var(--color-primary);
        }
      }
    }
    .btn-query {
      position: absolute;
      right: 54px;
      .icon-fangdajing {
        font-size: 16px;
        color: var(--text-light);
        &:hover {
          color: var(--color-primary);
        }
      }
    }
  }

  /*头部样式*/
  .classification-header {
    position: relative;
    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px 0 46px;
      color: var(--text-light);
      // background-color: #eff1f4;
    }
  }
  .tree-block {
    position: relative;
    width: 100%;
    flex: 1;
    padding: 0 10px;
    overflow: auto;
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    font-size: var(--font-base-title);
    padding-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 26px;
    .icon-folder {
      margin-right: 5px;
      font-size: 12px;
      color: var(--color-primary);
      // color: var(--color-lprimary);
    }
    .table-label {
      flex: 1;
      font-size: var(--font-base-title);
      vertical-align: middle;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 120px;
    }

    .btn-menu {
      opacity: 0;
      pointer-events: none;
      position: absolute;
      right: 8px;
      top: 8px;
    }
    .btn-menu:has(button[aria-expanded='true']) {
      opacity: 1;
      pointer-events: auto;
      position: static;
    }
    &:hover {
      .btn-menu {
        opacity: 1;
        pointer-events: auto;
        position: static;
      }
    }
    // .btn-menu button:not([aria-expanded='true']) {
    //   visibility: hidden;
    // }
    // &:hover .btn-menu button {
    //   visibility: visible;
    // }
  }
  .create {
    padding: 5px 10px;
    font-size: var(--font-base-title);
    // color: var(--color-primary);
    cursor: pointer;
  }

  :deep(.classification-tree) {
    --el-tree-node-hover-bg-color: var(--fill-hover);
    .el-tree-node__content {
      height: 32px;
      overflow: hidden;
    }
  }

  .tag-red {
    background-color: oklch(0.936 0.032 17.717);
    border: 1px solid oklch(0.885 0.062 18.334);
    color: oklch(0.505 0.213 27.518);
  }

  .tag-orange {
    background-color: oklch(0.954 0.038 75.164);
    border: 1px solid oklch(0.901 0.076 70.697);
    color: oklch(0.553 0.195 38.402);
  }

  .tag-yellow {
    background-color: oklch(0.973 0.071 103.193);
    border: 1px solid oklch(0.945 0.129 101.54);
    color: oklch(0.554 0.135 66.442);
  }

  .tag-blue {
    background-color: oklch(0.932 0.032 255.585);
    border: 1px solid oklch(0.882 0.059 254.128);
    color: oklch(0.488 0.243 264.376);
  }

  .tag-green {
    background-color: oklch(0.962 0.044 156.743);
    border: 1px solid oklch(0.925 0.084 155.995);
    color: oklch(0.527 0.154 150.069);
  }

  .tag-purple {
    background-color: oklch(0.946 0.033 307.174);
    border: 1px solid oklch(0.902 0.063 306.703);
    color: oklch(0.496 0.265 301.924);
  }
}
</style>
