<template>
  <div class="schema-progress-wrapper flex align-items-center">
    <i
      class="connections-schema-status__icon mr-1"
      :class="'el-icon-' + schemaInfo.icon + ' color-' + schemaInfo.color"
    ></i>
    <ElLink v-if="schemaInfo.icon === 'error'" type="danger" @click="showErrorMsg">{{ schemaInfo.text }}</ElLink>
    <span v-else :class="'color-' + schemaInfo.color">{{ schemaInfo.text }}</span>
  </div>
</template>

<script>
export default {
  props: {
    data: Object
  },
  computed: {
    schemaInfo() {
      let data = this.data
      let schemaInfo = {}
      if (data.loadFieldsStatus === 'loading') {
        let process = (data.loadCount * 100) / data.tableCount || 0
        schemaInfo = {
          text: Math.floor(process) + '%',
          icon: 'warning',
          color: 'warning'
        }
      } else if (data.loadFieldsStatus === 'finished') {
        schemaInfo = {
          text: this.$t('schema_progress_status_success'),
          icon: 'success',
          color: 'success'
        }
      } else {
        schemaInfo = {
          text: this.$t('schema_progress_status_error'),
          icon: 'error',
          color: 'danger'
        }
      }
      return schemaInfo
    }
  },
  methods: {
    showErrorMsg() {
      const h = this.$createElement
      this.$alert(
        h(
          'pre',
          {
            class: 'pb-5 overflow-auto'
          },
          [this.data.loadFieldErrMsg]
        ),
        this.$t('schema_progress_dialog_error_title'),
        {
          type: 'error',
          customClass: 'schema-error-dialog',
          confirmButtonText: this.$t('dialog_button_close')
        }
      )
    }
  }
}
</script>

<style lang="scss">
.schema-error-dialog {
  width: 80%;
}
.schema-progress-wrapper .connections-schema-status__icon {
  font-size: 14px;
}
</style>
