<script>
import { fetchApiModules, updateApiModulePermissions } from '@tap/api'
import { isEqual } from 'lodash'

export default {
  name: 'ApiAccessDialog',
  data() {
    return {
      visible: false,
      apiTree: [],
      filterText: '',
      roleId: '',
      roleName: '',
      checkedKeys: [],
      apiLoading: false,
      loading: false,
    }
  },
  methods: {
    open(roleId, roleName) {
      this.visible = true
      this.roleId = roleId
      this.roleName = roleName

      this.fetchApiData()
    },
    async fetchApiData() {
      this.apiLoading = true

      const mapApi = (item) => {
        const pathJoin = []
        item.apiVersion && pathJoin.push(item.apiVersion)
        item.prefix && pathJoin.push(item.prefix)
        item.basePath && pathJoin.push(item.basePath)

        return {
          label: item.name,
          id: item.id,
          baseUrl: `/${pathJoin.join('/')}`,
        }
      }
      const { items: apis } = await fetchApiModules({
        limit: 1000000,
      }).finally(() => {
        this.apiLoading = false
      })
      const checkedKeys = []

      const group = apis.reduce((tree, item) => {
        // 获取第一个应用标签
        const firstTag = item.listtags?.[0]

        if (item.paths[0]?.acl?.includes(this.roleName)) {
          checkedKeys.push(item.id)
        }

        if (!firstTag) {
          // 如果没有应用标签，放到"未分组"中
          const ungroupedKey = 'ungrouped'
          if (!tree[ungroupedKey]) {
            tree[ungroupedKey] = {
              id: ungroupedKey,
              label: 'Ungrouped',
              value: ungroupedKey,
              children: [],
            }
          }
          tree[ungroupedKey].children.push(mapApi(item))
        } else {
          // 按应用分组
          const appKey = firstTag.id

          if (!tree[appKey]) {
            tree[appKey] = {
              id: firstTag.id,
              label: firstTag.value,
              value: firstTag.id,
              children: [],
            }
          } else {
            tree[appKey].label = tree[appKey].label || firstTag.value
          }

          tree[appKey].children.push(mapApi(item))
        }

        return tree
      }, {})

      const children = Object.values(group)

      this.apiTree = [
        {
          id: 'ROOT',
          label: this.$t('public_all'),
          children,
        },
      ]

      this.originalCheckedKeys = checkedKeys

      this.checkedKeys = checkedKeys.concat([])

      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys(checkedKeys)
      })
    },
    handleFilter() {
      this.$refs.tree.filter(this.filterText)
    },
    async handleConfirm() {
      if (isEqual(this.originalCheckedKeys, this.checkedKeys)) {
        this.visible = false
        return
      }

      if (this.checkedKeys.length === 0) {
        const flag = await this.$confirm(
          this.$t('role_list_setting_api_empty_confirm'),
          {
            type: 'warning',
            customClass: 'text-break',
            zIndex: 3000,
          },
        )
        if (!flag) {
          return
        }
      }

      this.loading = true

      await updateApiModulePermissions({
        moduleIds: this.checkedKeys,
        aclName: this.roleName,
      }).finally(() => {
        this.loading = false
      })
      this.$message.success(this.$t('public_message_operation_success'))
      this.visible = false
    },
    filterNode(value, data) {
      if (!value) return true
      const val = value.toLowerCase()
      return data.label?.toLowerCase().includes(val)
    },
    handleCheckApi() {
      this.checkedKeys = this.$refs.tree.getCheckedKeys(true)
    },
  },
}
</script>

<template>
  <el-dialog
    v-model="visible"
    width="600px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template #title>
      <div class="flex align-center gap-2">
        <span>{{ $t('role_list_setting_api') }}</span>
        <el-tag type="primary" size="small">{{ roleName }}</el-tag>
      </div>
    </template>
    <div>
      <div
        v-loading="apiLoading"
        class="bg-light rounded-xl overflow-hidden w-100 lh-base p-2"
      >
        <div class="px-1 pt-1 pb-3 font-color-dark">
          {{ $t('role_list_setting_select_api') }}
        </div>

        <div class="bg-white p-1 rounded-xl" style="border: 1px solid #f2f4f7">
          <div class="p-2">
            <el-input
              v-model="filterText"
              class="is-borderless"
              clearable
              :placeholder="$t('public_search_api')"
              :style="{
                '--el-input-bg-color': 'var(--el-fill-color-light)',
              }"
              @input="handleFilter"
            >
              <template #prefix>
                <el-icon><i-mingcute:search-line /></el-icon>
              </template>
            </el-input>
          </div>

          <el-tree-v2
            ref="tree"
            :height="400"
            show-checkbox
            :data="apiTree"
            :props="{ label: 'label' }"
            node-key="id"
            :default-expanded-keys="['ROOT']"
            :filter-method="filterNode"
            @check="handleCheckApi"
          >
            <template #default="{ node, data }">
              <div class="flex align-center gap-1">
                <VIcon v-if="!node.isLeaf" size="16">{{
                  node.expanded ? 'folder-open' : 'folder-close'
                }}</VIcon>
                <span>{{ node.label || '--' }}</span>

                <span v-if="node.isLeaf" class="font-color-slight ml-2">{{
                  data.baseUrl
                }}</span>
              </div>
            </template>
          </el-tree-v2>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex align-center">
        <span class="font-color-light">{{
          $t('role_list_setting_api_selected', [checkedKeys.length])
        }}</span>
        <div class="flex-1" />
        <el-button @click="visible = false">{{
          $t('public_button_cancel')
        }}</el-button>
        <el-button :loading="loading" type="primary" @click="handleConfirm">{{
          $t('public_button_confirm')
        }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>
