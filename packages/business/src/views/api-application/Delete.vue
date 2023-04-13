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
      <span>{{ $t('packages_business_application_delete_shanchuyingyong') }}</span>
    </div>
    <div>
      <div v-html="desc"></div>
      <ListSelect
        :value.sync="form.appValue"
        :label.sync="form.appLabel"
        :format="handleFormat"
        item-label="value"
        item-value="id"
        class="my-3"
      ></ListSelect>
      <div>{{ $t('packages_business_application_delete_shifouquerenshan') }}</div>
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
        value: ''
      },
      loading: false,
      saveLoading: false,
      rulesEdit: {
        value: [
          {
            required: true,
            message: i18n.t('packages_business_application_delete_yingyongmingchengbu'),
            trigger: 'blur'
          }
        ],
        desc: [
          { required: true, message: i18n.t('packages_business_application_delete_yingyongmiaoshubu'), trigger: 'blur' }
        ]
      },
      form: {
        appValue: '',
        appLabel: ''
      }
    }
  },

  computed: {
    desc() {
      return i18n.t('packages_business_application_delete_ninzhengzaishanchu2', { val1: this.details.value })
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
          if (data.total) {
            this.details.id = row.id
            this.details.value = row.value
            this.loadData()
            return
          }
          this.$confirm(
            i18n.t('packages_business_application_delete_ninzhengzaishanchu', { val1: row.value }),
            i18n.t('packages_business_application_delete_shanchuyingyong'),
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
          this.handleClose()
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
