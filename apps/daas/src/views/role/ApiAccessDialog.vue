<script>
import { isEqual } from 'lodash'
import { modulesApi } from '@tap/api'

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
      loading: false
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

      const mapApi = item => {
        const pathJoin = []
        item.apiVersion && pathJoin.push(item.apiVersion)
        item.prefix && pathJoin.push(item.prefix)
        item.basePath && pathJoin.push(item.basePath)

        return {
          label: item.name,
          id: item.id,
          baseUrl: `/${pathJoin.join('/')}`
        }
      }
      const { items: apis } = await modulesApi
        .get({
          filter: JSON.stringify({
            limit: 1000000
          })
        })
        .finally(() => {
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
              children: []
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
              children: []
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
          children
        }
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
        const flag = await this.$confirm(this.$t('role_list_setting_api_empty_confirm'), {
          type: 'warning',
          customClass: 'text-break',
          zIndex: 3000
        })
        if (!flag) {
          return
        }
      }

      this.loading = true

      await modulesApi
        .updatePermissions({
          moduleIds: this.checkedKeys,
          aclName: this.roleName
        })
        .finally(() => {
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
    }
  }
}
</script>

<template>
  <el-dialog
    :visible="visible"
    @update:visible="visible = $event"
    width="600px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template #title>
      <div class="flex align-center gap-2">
        <span>{{ $t('role_list_setting_api') }}</span>
        <span class="font-color-light bg-color-main rounded-4 p-1 fs-8">{{ roleName }}</span>
      </div>
    </template>
    <div>
      <div class="bg-light rounded-xl overflow-hidden w-100 lh-base p-2" v-loading="apiLoading">
        <div class="px-1 pt-1 pb-3 font-color-dark">{{ $t('role_list_setting_select_api') }}</div>

        <div class="bg-white p-1 rounded-xl" style="border: 1px solid #f2f4f7">
          <div class="p-2">
            <el-input class="api-access-dialog-input" v-model="filterText" clearable @input="handleFilter">
              <template #prefix>
                <VIcon size="14" class="h-100 ml-1">magnify</VIcon>
              </template>
            </el-input>
          </div>

          <div class="overflow-y-auto" style="max-height: 400px">
            <el-tree
              ref="tree"
              show-checkbox
              :data="apiTree"
              :props="{ label: 'label' }"
              node-key="id"
              default-expand-all
              check-on-click-node
              :filter-node-method="filterNode"
              @check="handleCheckApi"
            >
              <template #default="{ node, data }">
                <div class="flex align-center gap-1">
                  <VIcon v-if="!node.isLeaf" size="16">{{ node.expanded ? 'folder-open' : 'folder-close' }}</VIcon>
                  <span>{{ node.label || '--' }}</span>

                  <span v-if="node.isLeaf" class="font-color-slight ml-2">{{ data.baseUrl }}</span>
                </div>
              </template>
            </el-tree>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex align-center">
        <span class="font-color-light">{{ $t('role_list_setting_api_selected', [checkedKeys.length]) }}</span>
        <div class="flex-1"></div>
        <el-button @click="visible = false">{{ $t('public_button_cancel') }}</el-button>
        <el-button :loading="loading" type="primary" @click="handleConfirm">{{
          $t('public_button_confirm')
        }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.api-access-dialog-input {
  .el-input__inner {
    border: 0;
    border-radius: 8px;
    background-color: #f5f5f5;
  }
}

.el-message-box.text-break .el-message-box__message {
  word-break: break-word !important;
}
</style>
