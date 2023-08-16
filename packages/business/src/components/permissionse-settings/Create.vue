<template>
  <ElDialog
    :title="title"
    :visible="visible"
    :append-to-body="true"
    width="800px"
    top="10vh"
    custom-class="connection-dialog ldp-conection-dialog flex flex-column"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm ref="form" label-position="left" label-width="150px" :model="form" class="my-n6">
      <ElFormItem size="mini" label="选择授权角色" prop="roleId">
        <ElSelect v-model="form.roleId" size="mini" @change="getData">
          <ElOption v-for="item in roleList" :label="item.label" :value="item.value" :key="item.value"></ElOption>
        </ElSelect>
      </ElFormItem>
      <ElFormItem size="mini" label="设置权限" prop="checked">
        <ElCheckboxGroup v-model="form.checked" size="mini" class="inline-flex ml-4">
          <ElCheckbox v-for="item in items" :label="item.value" :key="item.value">{{ item.label }}</ElCheckbox>
        </ElCheckboxGroup>
      </ElFormItem>
    </ElForm>

    <span class="dialog-footer" slot="footer">
      <ElButton @click="handleClose" size="mini">{{ $t('public_button_cancel') }}</ElButton>
      <ElButton :disabled="!form.roleId" size="mini" type="primary" :loading="saveLoading" @click="handleSave">{{
        $t('public_button_save')
      }}</ElButton>
    </span>
  </ElDialog>
</template>

<script>
import i18n from '@tap/i18n'
import { usersApi, dataPermissionApi } from '@tap/api'

export default {
  name: 'Create',

  props: {
    title: {
      type: String,
      default: () => {
        return '权限设置'
      }
    }
  },

  data() {
    return {
      visible: false,
      type: 'Connections',
      form: {
        checked: [],
        roleId: ''
      },
      roleList: [],
      dataList: [],
      saveLoading: false
    }
  },

  computed: {
    items() {
      const MAP = {
        Task: [
          {
            label: '查看',
            value: 'View'
          },
          {
            label: '编辑',
            value: 'Edit'
          },
          {
            label: '删除',
            value: 'Delete'
          },
          {
            label: '重置',
            value: 'Reset'
          },
          {
            label: '启动',
            value: 'Start'
          },
          {
            label: '停止',
            value: 'Stop'
          }
        ]
      }

      return (
        MAP[this.type] || [
          {
            label: '查看',
            value: 'View'
          },
          {
            label: '编辑',
            value: 'Edit'
          },
          {
            label: '删除',
            value: 'Delete'
          }
        ]
      )
    }
  },

  created() {
    this.getRoleList()
  },

  methods: {
    init() {
      this.form.roleId = ''
      this.form.checked = []
    },

    getData(val) {
      let params = {
        typeId: val,
        dataType: this.type,
        dataIds: this.dataList.map(t => t.id).join()
      }
      dataPermissionApi.roleActions(params).then(data => {
        this.form.checked = data
      })
    },

    getRoleList() {
      let filter = {
        order: 'name',
        limit: 500
      }
      usersApi
        .role({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          this.roleList =
            data.items?.map(t => {
              return {
                label: t.name,
                value: t.id
              }
            }) || []
          return {
            total: data?.total || 0,
            data: data?.items || []
          }
        })
    },

    handleClose() {
      this.visible = false
    },

    open(data = [], type = 'Connections') {
      this.init()
      this.type = type
      this.dataList = data
      this.visible = true
    },

    close() {
      this.visible = false
    },

    handleSave() {
      let params = {
        type: 'Role',
        typeIds: [this.form.roleId],
        dataType: this.type,
        dataIds: this.dataList.map(t => t.id),
        actions: this.form.checked
      }

      this.saveLoading = true
      dataPermissionApi
        .dataAuth(params)
        .then(() => {
          this.$message.success(this.$t('public_message_save_ok'))
          this.close()
        })
        .finally(() => {
          this.saveLoading = false
        })
    }
  }
}
</script>

<style scoped></style>
