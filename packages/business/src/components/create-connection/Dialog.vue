<template>
  <ElDialog
    :title="title"
    :visible="visible"
    :append-to-body="true"
    width="80%"
    top="10vh"
    custom-class="connection-dialog ldp-conection-dialog flex flex-column"
    destroy-on-close
    @open="handleOpen"
    @close="handleClose"
  >
    <div slot="title" class="text-center font-color-dark fs-2 fw-bold">
      {{ showForm ? 'Configure Source' : title }}
    </div>
    <div v-if="!showForm" class="px-7 text-center">
      <div class="mb-4 font-color-light">{{ $t('packages_business_create_connection_dialog_neirongCho') }}</div>
      <ConnectionSelector v-bind="$attrs" :visible.sync="visible" @select="handleSelect"></ConnectionSelector>
    </div>
    <div v-else class="form__content flex flex-column">
      <ServeForm v-if="['apiServices'].includes(activeTab)" :params="formParams" class="flex-fill"></ServeForm>
      <ConnectionForm
        v-else
        :params="formParams"
        class="flex-fill"
        @back="init"
        @success="handleSuccess"
        @saveAndMore="handleSaveAndMore"
      ></ConnectionForm>
    </div>
  </ElDialog>
</template>

<script>
import i18n from '@tap/i18n'

import ConnectionSelector from './Selector'
import ConnectionForm from './Form'
import ServeForm from './ServeForm'

export default {
  name: 'Dialog',
  components: {
    ConnectionSelector,
    ConnectionForm,
    ServeForm
  },
  props: {
    title: {
      type: String,
      default: () => {
        return i18n.t('packages_business_create_connection_dialog_xuanzeshujuyuan')
      }
    },
    visible: {
      required: true,
      value: Boolean
    }
  },
  data() {
    return {
      formParams: {},
      showForm: false,
      timer: null,
      activeTab: ''
    }
  },
  methods: {
    init() {
      this.showForm = false
      this.formParams = {}
      this.activeTab = ''
    },

    handleOpen() {
      this.init()
    },

    handleClose() {
      this.$emit('visible', false)
      this.$emit('update:visible', false)
    },

    handleSelect(item) {
      this.activeTab = item.activeTab
      switch (this.activeTab) {
        case 'apiServices':
          // TODO apiServices
          break
        default:
          this.formParams = { pdkHash: item.pdkHash }
          break
      }
      this.showForm = true
    },

    handleSuccess() {
      this.$emit('success', ...arguments)
      this.init()
      this.handleClose()
    },

    handleSaveAndMore() {
      this.$emit('saveAndMore', ...arguments)
      this.init()
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep {
  .ldp-conection-dialog {
    border-radius: 4px;
    .el-dialog__body {
      flex: 1;
      height: 0;
    }
    .el-dialog__body {
      padding: 0;
    }
  }
}
.form__content {
  height: 640px;
}
</style>
