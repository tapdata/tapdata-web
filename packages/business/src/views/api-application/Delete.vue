<template>
  <ElDialog
    :visible="visible"
    :append-to-body="true"
    width="800px"
    top="10vh"
    class="connection-dialog ldp-conection-dialog flex flex-column"
    @close="handleClose"
  >
    <template #header>
      <div class="flex align-items-center">
        <VIcon class="color-warning mr-2">warning</VIcon>
        <span>{{ $t('packages_business_application_delete_shanchuyingyong') }}</span>
      </div>
    </template>
    <div>
      <div v-html="desc"></div>
      <ListSelect
        v-model:value="form.appValue"
        v-model:label="form.appLabel"
        :format="handleFormat"
        class="my-3"
      ></ListSelect>
      <div>
        {{ $t('packages_business_application_delete_shifouquerenshan') }}
      </div>
    </div>
    <template v-slot:footer>
      <span class="dialog-footer">
        <ElButton @click="handleClose">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton type="primary" :loading="saveLoading" @click="handleSave">{{ $t('public_button_confirm') }}</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import i18n from '@tap/i18n'

import { appApi, modulesApi } from '@tap/api'
import ListSelect from './ListSelect'

export default {
  name: 'Delete',
  components: { ListSelect },
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
      return i18n.t('packages_business_application_delete_ninzhengzaishanchu2', { val1: this.details.value })
    },
  },
  methods: {
    init(row = {}) {
      modulesApi
        .get({
          filter: JSON.stringify({
            where: {
              'listtags.id': row.id,
            },
          }),
        })
        .then((data) => {
          if (data.total) {
            this.details.id = row.id
            this.details.value = row.value
            this.loadData()
            return
          }
          this.$confirm(
            i18n.t('packages_business_application_delete_ninzhengzaishanchu', {
              val1: row.value,
            }),
            i18n.t('packages_business_application_delete_shanchuyingyong'),
            {
              type: 'warning',
              dangerouslyUseHTMLString: true,
            },
          ).then((resFlag) => {
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
          readOnly: true,
        },
      }
      appApi
        .get({
          filter: JSON.stringify(params),
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
      appApi
        .move(this.details.id, this.form.appValue)
        .then((dd) => {
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
          $emit(this, 'success')
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
  emits: ['success'],
}
</script>
