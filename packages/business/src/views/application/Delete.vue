<template>
  <ElDialog
    :visible="visible"
    :append-to-body="true"
    width="800px"
    top="10vh"
    custom-class="connection-dialog ldp-conection-dialog flex flex-column"
    @close="handleClose"
  >
    <div class="flex align-items-center" slot="title">
      <VIcon class="color-warning mr-2">warning</VIcon>
      <span>删除应用</span>
    </div>
    <div>
      <div v-html="desc"></div>
      <ListSelect
        :value.sync="form.appValue"
        :label.sync="form.appLabel"
        :format="handleFormat"
        type="app"
        item-label="value"
        item-value="id"
        class="my-3"
      ></ListSelect>
      <div>是否确认删除</div>
    </div>
    <span class="dialog-footer" slot="footer">
      <ElButton @click="handleClose" size="mini">{{ $t('public_button_cancel') }}</ElButton>
      <ElButton size="mini" type="primary" :loading="saveLoading" @click="handleSave">{{
        $t('public_button_save')
      }}</ElButton>
    </span>
  </ElDialog>
</template>

<script>
import { appApi, modulesApi } from '@tap/api'
import ListSelect from '@tap/business/src/components/ListSelect'

export default {
  name: 'Delete',
  components: { ListSelect },
  data() {
    return {
      visible: false,
      details: {
        id: '',
        value: ''
      },
      loading: false,
      saveLoading: false,
      rulesEdit: {
        value: [{ required: true, message: '应用名称不能为空', trigger: 'blur' }],
        desc: [{ required: true, message: '应用描述不能为空', trigger: 'blur' }]
      },
      form: {
        appValue: '',
        appLabel: ''
      }
    }
  },

  computed: {
    desc() {
      return `您正在删除应用<span class="fw-bolder font-color-dark">${this.details.value}</span>，该应用下的API将移动到`
    }
  },

  methods: {
    init(row = {}) {
      modulesApi
        .get({
          filter: JSON.stringify({
            where: {
              'listtags.id': row.id
            }
          })
        })
        .then(data => {
          if (!data.total) {
            this.details.id = row.id
            this.details.value = row.value
            this.loadData()
            return
          }
          this.$confirm(
            `您正在删除应用<span class="fw-bolder font-color-dark">${row.value}</span>，是否确认删除`,
            '删除应用',
            {
              type: 'warning',
              dangerouslyUseHTMLString: true
            }
          ).then(resFlag => {
            if (!resFlag) return
            this.saveLoading = true
            this.handleDelete(row.id)
          })
        })
    },

    async loadData() {
      let params = {
        where: {
          item_type: 'app',
          readOnly: true
        }
      }
      appApi
        .get({
          filter: JSON.stringify(params)
        })
        .then(data => {
          const item = data.items?.[0] || {}
          this.form = {
            appValue: item.id,
            appLabel: item.value
          }
        })
        .finally(() => {
          this.visible = true
        })
    },

    handleClose() {
      this.visible = false
    },

    handleSave() {
      this.saveLoading = true
      appApi
        .move(this.details.id, this.form.appValue)
        .then(dd => {
          this.handleDelete(this.details.id)
        })
        .catch(() => {
          this.saveLoading = false
        })
    },

    handleDelete(id) {
      appApi
        .delete(id)
        .then(() => {
          this.$emit('success')
          this.$message.success(this.$t('public_message_delete_ok'))
        })
        .finally(() => {
          this.saveLoading = false
        })
    },

    handleFormat(data) {
      return data.filter(t => t.id !== this.details.id)
    }
  }
}
</script>
