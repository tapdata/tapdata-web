<script>
import { deleteApp, fetchApiModules, fetchApps, moveApp } from '@tap/api'
import i18n from '@tap/i18n'
import ListSelect from './ListSelect'

export default {
  name: 'Delete',
  components: { ListSelect },
  emits: ['success'],
  data() {
    return {
      visible: false,
      details: {
        id: '',
        value: '',
      },
      loading: false,
      saveLoading: false,
      form: {
        appValue: '',
        appLabel: '',
      },
    }
  },
  computed: {
    desc() {
      return i18n.t(
        'packages_business_application_delete_ninzhengzaishanchu2',
        { val1: this.details.value },
      )
    },
  },
  methods: {
    init(row = {}) {
      fetchApiModules({
        where: {
          'listtags.id': row.id,
        },
      }).then((data) => {
        if (data.total) {
          this.details.id = row.id
          this.details.value = row.value
          this.loadData()
          return
        }
        this.$confirm(
          i18n.t('packages_business_application_delete_shanchuyingyong'),
          i18n.t('packages_business_application_delete_ninzhengzaishanchu', {
            val1: row.value,
          }),
          {
            dangerouslyUseHTMLString: true,
          },
        ).then((resFlag) => {
          if (!resFlag) return
          this.saveLoading = true
          this.handleDelete(row.id)
        })
      })
    },

    loadData() {
      return fetchApps({
        where: {
          item_type: 'app',
          readOnly: true,
        },
      })
        .then((data) => {
          const item = data.items?.[0] || {}
          this.form = {
            appValue: item.id,
            appLabel: item.value,
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
      moveApp(this.details.id, this.form.appValue)
        .then(() => {
          this.handleDelete(this.details.id)
        })
        .catch(() => {
          this.saveLoading = false
        })
    },

    handleDelete(id) {
      deleteApp(id)
        .then(() => {
          this.$emit('success')
          this.$message.success(this.$t('public_message_delete_ok'))
          this.handleClose()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },

    handleFormat(data) {
      return data.filter((t) => t.value !== this.details.id)
    },
  },
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    :append-to-body="true"
    width="800px"
    top="10vh"
    :show-close="false"
    class="connection-dialog ldp-conection-dialog flex flex-column"
    @close="handleClose"
  >
    <template #header="{ titleClass }">
      <div class="flex align-items-center">
        <el-icon size="20" class="color-warning mr-4">
          <i-mingcute:warning-fill />
        </el-icon>
        <span :class="titleClass">{{
          $t('packages_business_application_delete_shanchuyingyong')
        }}</span>
      </div>
    </template>
    <div>
      <div v-html="desc" />
      <ListSelect
        v-model:value="form.appValue"
        v-model:label="form.appLabel"
        :format="handleFormat"
        class="my-3"
      />
      <div>
        {{ $t('packages_business_application_delete_shifouquerenshan') }}
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleClose">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton type="primary" :loading="saveLoading" @click="handleSave">{{
          $t('public_button_confirm')
        }}</ElButton>
      </span>
    </template>
  </ElDialog>
</template>
